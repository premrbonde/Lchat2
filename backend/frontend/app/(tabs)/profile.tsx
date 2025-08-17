import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiService } from '@/services/apiService';
import { UserAvatar } from '@/components/UserAvatar';
import { Settings, Moon, Sun, Monitor, Camera, Globe, Bell, LogOut, User, CreditCard as Edit3 } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme, colors, isDark } = useTheme();
  const [uploading, setUploading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadProfilePicture = async (asset: any) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileType = asset.uri.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileType}`;

      await apiService.uploadFile(`/users/profile/${user.id}/avatar`, {
        uri: asset.uri,
        name: fileName,
        type: `image/${fileType}`,
      });

      // Refresh user data to get new profile picture URL
      const response = await apiService.get('/auth/me');
      updateProfile(response.user);

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLanguageChange = async (language: 'en' | 'mr' | 'te' | 'ta') => {
    if (!user) return;

    try {
      await updateProfile({
        preferences: {
          ...user.preferences,
          defaultTranslateLanguage: language,
        },
      });
      Alert.alert('Success', 'Default language updated');
    } catch (error) {
      console.error('Language update error:', error);
      Alert.alert('Error', 'Failed to update language preference');
    }
  };

  const handleNotificationToggle = async (type: 'messages' | 'friendRequests' | 'mentions', value: boolean) => {
    if (!user) return;

    try {
      await updateProfile({
        preferences: {
          ...user.preferences,
          notifications: {
            ...user.preferences.notifications,
            [type]: value,
          },
        },
      });
    } catch (error) {
      console.error('Notification update error:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={20} color={colors.textSecondary} />;
      case 'dark': return <Moon size={20} color={colors.textSecondary} />;
      case 'system': return <Monitor size={20} color={colors.textSecondary} />;
    }
  };

  const getLanguageName = (code: string) => {
    const languages = {
      'en': 'English',
      'mr': 'मराठी (Marathi)',
      'te': 'తెలుగు (Telugu)',
      'ta': 'தமிழ் (Tamil)',
    };
    return languages[code] || code;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingTop: 48,
      paddingHorizontal: 20,
      paddingBottom: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 16,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    userInfo: {
      alignItems: 'center',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    userUsername: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    section: {
      backgroundColor: colors.surface,
      marginTop: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      marginHorizontal: 20,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      color: colors.text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    themeOptions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    themeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeThemeButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeButtonText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activeThemeButtonText: {
      color: 'white',
    },
    languageOptions: {
      gap: 4,
      marginTop: 8,
    },
    languageButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    activeLanguageButton: {
      backgroundColor: colors.primary + '20',
    },
    languageButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    activeLanguageButtonText: {
      color: colors.primary,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: colors.error,
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    logoutButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!user) return null;

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.avatarContainer}>
          <UserAvatar
            uri={user.profilePictureUrl}
            name={user.nickname || user.username}
            size={100}
          />
          <TouchableOpacity
            style={dynamicStyles.cameraButton}
            onPress={handleImagePicker}
            disabled={uploading}
          >
            <Camera size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={dynamicStyles.userInfo}>
          <Text style={dynamicStyles.userName}>
            {user.nickname || user.username}
          </Text>
          <Text style={dynamicStyles.userEmail}>{user.email}</Text>
          <Text style={dynamicStyles.userUsername}>@{user.username}</Text>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
        
        <View style={dynamicStyles.settingItem}>
          <View style={dynamicStyles.settingIcon}>
            {getThemeIcon()}
          </View>
          <View style={dynamicStyles.settingContent}>
            <Text style={dynamicStyles.settingTitle}>Theme</Text>
            <Text style={dynamicStyles.settingSubtitle}>
              Choose your preferred theme
            </Text>
            <View style={dynamicStyles.themeOptions}>
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <TouchableOpacity
                  key={themeOption}
                  style={[
                    dynamicStyles.themeButton,
                    theme === themeOption && dynamicStyles.activeThemeButton,
                  ]}
                  onPress={() => handleThemeChange(themeOption)}
                >
                  <Text
                    style={[
                      dynamicStyles.themeButtonText,
                      theme === themeOption && dynamicStyles.activeThemeButtonText,
                    ]}
                  >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Translation Section */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Translation</Text>
        
        <View style={dynamicStyles.settingItem}>
          <Globe size={20} color={colors.textSecondary} style={dynamicStyles.settingIcon} />
          <View style={dynamicStyles.settingContent}>
            <Text style={dynamicStyles.settingTitle}>Default Language</Text>
            <Text style={dynamicStyles.settingSubtitle}>
              Messages will be translated to this language
            </Text>
            <View style={dynamicStyles.languageOptions}>
              {(['en', 'mr', 'te', 'ta'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    dynamicStyles.languageButton,
                    user.preferences.defaultTranslateLanguage === lang && dynamicStyles.activeLanguageButton,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text
                    style={[
                      dynamicStyles.languageButtonText,
                      user.preferences.defaultTranslateLanguage === lang && dynamicStyles.activeLanguageButtonText,
                    ]}
                  >
                    {getLanguageName(lang)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Notifications</Text>
        
        <View style={dynamicStyles.settingItem}>
          <Bell size={20} color={colors.textSecondary} style={dynamicStyles.settingIcon} />
          <View style={dynamicStyles.settingContent}>
            <Text style={dynamicStyles.settingTitle}>Messages</Text>
            <Text style={dynamicStyles.settingSubtitle}>
              Get notified about new messages
            </Text>
          </View>
          <Switch
            value={user.preferences.notifications.messages}
            onValueChange={(value) => handleNotificationToggle('messages', value)}
            trackColor={{ false: colors.disabled, true: colors.primary + '40' }}
            thumbColor={user.preferences.notifications.messages ? colors.primary : colors.textSecondary}
          />
        </View>
        
        <View style={dynamicStyles.settingItem}>
          <User size={20} color={colors.textSecondary} style={dynamicStyles.settingIcon} />
          <View style={dynamicStyles.settingContent}>
            <Text style={dynamicStyles.settingTitle}>Friend Requests</Text>
            <Text style={dynamicStyles.settingSubtitle}>
              Get notified about friend requests
            </Text>
          </View>
          <Switch
            value={user.preferences.notifications.friendRequests}
            onValueChange={(value) => handleNotificationToggle('friendRequests', value)}
            trackColor={{ false: colors.disabled, true: colors.primary + '40' }}
            thumbColor={user.preferences.notifications.friendRequests ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>

      {/* Account Section */}
      <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout}>
        <View style={dynamicStyles.logoutButtonContent}>
          <LogOut size={20} color="white" />
          <Text style={dynamicStyles.logoutButtonText}>Sign Out</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}