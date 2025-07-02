import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderWithProfileProps {
  title: string;
  subtitle?: string;
}

export function HeaderWithProfile({ title, subtitle }: HeaderWithProfileProps) {
  const router = useRouter();

  const handleProfilePress = () => {
    router.push('/(modal)/profile');
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
        <Ionicons name="person-circle" size={32} color="#fcf45a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fcf45a',
    fontFamily: 'NanumPenScript-Regular',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fcf45a',
    opacity: 0.8,
    fontFamily: 'NanumPenScript-Regular',
  },
  profileButton: {
    padding: 4,
    borderRadius: 20,
  },
}); 