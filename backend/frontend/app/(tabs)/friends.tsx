import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { apiService } from '@/services/apiService';
import { UserAvatar } from '@/components/UserAvatar';
import { MessageCircle, Users, Trash2 } from 'lucide-react-native';

interface Friend {
  id: string;
  username: string;
  nickname: string;
  profilePictureUrl: string | null;
  isOnline: boolean;
  lastSeen: string;
  conversationId: string | null;
  lastMessageText: string;
  lastMessageAt: string | null;
}

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await apiService.get('/friends/list');
      setFriends(response.friends || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends list');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleChatPress = async (friend: Friend) => {
    try {
      let conversationId = friend.conversationId;
      
      if (!conversationId) {
        const response = await apiService.post('/messages/conversation', {
          friendId: friend.id,
        });
        conversationId = response.conversation.id;
      }

      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId,
          friendId: friend.id,
          friendName: friend.nickname || friend.username,
          friendAvatar: friend.profilePictureUrl || '',
          friendOnline: friend.isOnline.toString(),
        },
      });
    } catch (error) {
      console.error('Error opening chat:', error);
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.nickname || friend.username} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`/friends/remove/${friend.id}`);
              setFriends(prev => prev.filter(f => f.id !== friend.id));
              Alert.alert('Success', 'Friend removed successfully');
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const formatLastSeen = (lastSeen: string, isOnline: boolean) => {
    if (isOnline) return 'Online now';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={[styles.friendItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.avatarContainer}>
        <UserAvatar
          uri={item.profilePictureUrl}
          name={item.nickname || item.username}
          size={56}
        />
        {item.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />}
      </View>
      
      <View style={styles.friendInfo}>
        <View style={styles.friendHeader}>
          <Text style={[styles.friendName, { color: colors.text }]}>
            {item.nickname || item.username}
          </Text>
          <Text style={[styles.friendUsername, { color: colors.textSecondary }]}>
            @{item.username}
          </Text>
        </View>
        
        <Text style={[styles.lastSeen, { color: item.isOnline ? colors.success : colors.textSecondary }]}>
          {formatLastSeen(item.lastSeen, item.isOnline)}
        </Text>
        
        {item.lastMessageText && (
          <Text style={[styles.lastMessage, { color: colors.textSecondary }]}>
            {item.lastMessageText.substring(0, 40)}
            {item.lastMessageText.length > 40 ? '...' : ''}
          </Text>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleChatPress(item)}
        >
          <MessageCircle size={16} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleRemoveFriend(item)}
        >
          <Trash2 size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingTop: 48,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Friends</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          {friends.length} friends • {friends.filter(f => f.isOnline).length} online
        </Text>
      </View>

      {friends.length === 0 ? (
        <View style={dynamicStyles.emptyContainer}>
          <Users size={64} color={colors.textSecondary} />
          <Text style={dynamicStyles.emptyText}>No friends yet</Text>
          <Text style={dynamicStyles.emptySubText}>
            Search for users and send friend requests to start building your network
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendUsername: {
    fontSize: 14,
  },
  lastSeen: {
    fontSize: 12,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});