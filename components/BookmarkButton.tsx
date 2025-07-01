import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { addBookmark, removeBookmark } from '../services/bookmarks';

interface BookmarkButtonProps {
  recipeId: string;
  size?: number;
  color?: string;
  activeColor?: string;
}

export default function BookmarkButton({ 
  recipeId, 
  size = 24, 
  color = '#666',
  activeColor = '#fcf45a'
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmarkToggle = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      if (isBookmarked) {
        const success = await removeBookmark(user.id, recipeId);
        if (success) {
          setIsBookmarked(false);
        }
      } else {
        const success = await addBookmark(user.id, recipeId);
        if (success) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleBookmarkToggle}
      disabled={isLoading}
    >
      <Ionicons
        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={isBookmarked ? activeColor : color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
}); 