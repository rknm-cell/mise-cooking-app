import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export default function SignupScreen() {
  const { signup } = useAuth();
  const [form, setForm] = useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateForm = (field: keyof SignupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return 'Name is required';
    }
    if (!form.email.trim()) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return 'Please enter a valid email address';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSignup = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(form.name, form.email, form.password);
      
      if (success) {
        Alert.alert(
          'Success!',
          'Account created successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fcf45a" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Mise Cooking and start creating amazing recipes
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(value) => updateForm('name', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(value) => updateForm('email', value)}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={form.password}
                  onChangeText={(value) => updateForm('password', value)}
                  placeholder="Create a password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={form.confirmPassword}
                  onChangeText={(value) => updateForm('confirmPassword', value)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#1d7b86',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1d7b86',
  },
  eyeButton: {
    padding: 16,
  },
  signupButton: {
    backgroundColor: '#fcf45a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  loginButton: {
    alignItems: 'center',
    padding: 16,
  },
  loginButtonText: {
    color: '#fcf45a',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  buttonText: {
    color: '#1d7b86',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: '#fcf45a',
    fontSize: 16,
    fontWeight: '600',
  },
});
