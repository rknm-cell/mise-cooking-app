import { HeaderWithProfile } from '@/components/HeaderWithProfile';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { fetchBookmarks } from '../../services/bookmarks';

interface BookmarkedRecipe {
  id: string;
  name: string;
  description: string;
  totalTime: string;
  servings: number;
  bookmarkedAt: string;
}

export default function BookmarksScreen() {
  const { user } = useAuth();
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<BookmarkedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch bookmarks
      const bookmarks = await fetchBookmarks(user.id);
      
      // For now, we'll need to fetch recipe details for each bookmark
      // In a real app, you might want to join this data on the backend
      const recipesWithDetails = await Promise.all(
        bookmarks.map(async (bookmark) => {
          try {
            const response = await fetch(`http://localhost:8080/api/recipes/${bookmark.recipeId}`);
            if (response.ok) {
              const recipe = await response.json();
              return {
                ...recipe,
                bookmarkedAt: bookmark.bookmarkedAt,
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching recipe ${bookmark.recipeId}:`, error);
            return null;
          }
        })
      );

      const validRecipes = recipesWithDetails.filter(recipe => recipe !== null);
      setBookmarkedRecipes(validRecipes);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeItem = ({ item }: { item: BookmarkedRecipe }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => router.push(`/(modal)/recipe/${item.id}`)}
    >
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle}>{item.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.recipeInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#fcf45a" />
            <Text style={styles.infoText}>{item.totalTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#fcf45a" />
            <Text style={styles.infoText}>{item.servings} servings</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#fcf45a" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fcf45a" />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#fcf45a" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBookmarks}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle" size={48} color="#fcf45a" />
          <Text style={styles.errorTitle}>Sign In Required</Text>
          <Text style={styles.errorText}>Please sign in to view your bookmarks</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <HeaderWithProfile 
        title="My Bookmarks" 
        subtitle={`${bookmarkedRecipes.length} saved recipe${bookmarkedRecipes.length !== 1 ? 's' : ''}`}
      />

      {bookmarkedRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#fcf45a" />
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyText}>
            Start exploring recipes and bookmark your favorites
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/recipes')}
          >
            <Text style={styles.exploreButtonText}>Explore Recipes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarkedRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d7b86',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#426b70',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: '#fcf45a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  exploreButton: {
    backgroundColor: '#fcf45a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#1d7b86',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d7b86',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeInfo: {
    flexDirection: 'row',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
}); 