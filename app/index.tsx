import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledTitle from '../components/StyledTitle';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const handleGetStarted = () => {
    router.push('/generate');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Header */}
      <View style={styles.header}>
        <StyledTitle 
          title="Mise" 
          subtitle="(meez)" 
          size="large"
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Discover the Joy of{' '}
            <Text style={styles.highlight}>Cooking</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Generate delicious recipes from ingredients you have, explore new cuisines, and create amazing meals with confidence.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="bulb" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Smart Recipe Generation</Text>
              <Text style={styles.featureDescription}>
                Get personalized recipes based on your available ingredients
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Save Favorites</Text>
              <Text style={styles.featureDescription}>
                Keep your favorite recipes organized
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Join thousands of home cooks creating amazing meals
        </Text>
      </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  highlight: {
    color: '#fcf45a',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  featuresContainer: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#fcf45a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  getStartedText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.7,
  },
});
