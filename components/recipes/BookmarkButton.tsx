import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { addBookmark, isBookmarked as checkIsBookmarked, removeBookmark } from '../../services/bookmarks';

interface BookmarkButtonProps {
  recipeId: string;
  size?: number;
  color?: string;
  activeColor?: string;
  initialIsBookmarked?: boolean;
}

export default function BookmarkButton({ 
  recipeId, 
  size = 24, 
  color = '#666',
  activeColor = '#fcf45a',
  initialIsBookmarked = false
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIsBookmarked(user.id, recipeId).then(setIsBookmarked);
    }
  }, [user, recipeId]);

  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsBookmarked]);

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