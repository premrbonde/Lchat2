import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff, MessageCircle, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, colors } = useTheme();

  const handleRegister = async () => {
    if (!formData.email || !formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname || formData.username,
      });
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    }
    setLoading(false);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 48,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoIcon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingRight: 16,
    },
    passwordInput: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 4,
    },
    registerButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 8,
    },
    registerButtonDisabled: {
      opacity: 0.5,
    },
    registerButtonContent: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    registerButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      marginTop: 24,
    },
    loginText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    loginLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.logoContainer}>
            <View style={dynamicStyles.logoIcon}>
              <User size={64} color={colors.primary} />
            </View>
            <Text style={dynamicStyles.title}>Create Account</Text>
            <Text style={dynamicStyles.subtitle}>
              Join LChat and start connecting with friends
            </Text>
          </View>

          <View style={dynamicStyles.form}>
            <View style={dynamicStyles.inputContainer}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Username"
                placeholderTextColor={colors.textSecondary}
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <Text style={dynamicStyles.helperText}>
                Letters, numbers, and underscores only
              </Text>
            </View>

            <View style={dynamicStyles.inputContainer}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Display Name (Optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.nickname}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                returnKeyType="next"
              />
              <Text style={dynamicStyles.helperText}>
                How others will see your name in chats
              </Text>
            </View>

            <View style={dynamicStyles.inputContainer}>
              <View style={dynamicStyles.passwordContainer}>
                <TextInput
                  style={dynamicStyles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={dynamicStyles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.helperText}>
                At least 6 characters
              </Text>
            </View>

            <View style={dynamicStyles.inputContainer}>
              <View style={dynamicStyles.passwordContainer}>
                <TextInput
                  style={dynamicStyles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  style={dynamicStyles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[dynamicStyles.registerButton, loading && dynamicStyles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={dynamicStyles.registerButtonContent}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={dynamicStyles.registerButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.footer}>
            <Text style={dynamicStyles.loginText}>
              Already have an account?{' '}
              <Link href="/(auth)/login" asChild>
                <Text style={dynamicStyles.loginLink}>Sign in</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}