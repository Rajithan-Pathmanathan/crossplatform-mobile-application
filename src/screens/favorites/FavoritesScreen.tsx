import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import { StorageService } from '../../services/storage';
import { Event } from '../../types/event';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { EventCard } from '../../components/EventCard';
import { EmptyState } from '../../components/EmptyState';

type FavoritesNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Favorites'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesNavProp>();
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const ids = await StorageService.getFavorites();
      setFavoriteIds(ids);

      if (ids.length === 0) {
        setFavoriteEvents([]);
        return;
      }

      // Fetch all events and filter by favorite IDs
      const allEvents = await api.getEvents();
      const favs = allEvents.filter((e) => ids.includes(e.id));
      setFavoriteEvents(favs);
    } catch (error) {
      console.error('Error loading favorite events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleToggleFavorite = async (eventId: string) => {
    const updated = await StorageService.toggleFavorite(eventId);
    setFavoriteIds(updated);
    setFavoriteEvents((prev) => prev.filter((e) => updated.includes(e.id)));
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleExplorePress = () => {
    navigation.navigate('Explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Events</Text>
          <Text style={styles.subtitle}>
            Offline bookmarks stored on your device
          </Text>
        </View>
        {favoriteEvents.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{favoriteEvents.length}</Text>
          </View>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your bookmarks...</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isFavorite={favoriteIds.includes(item.id)}
              onPress={() => handleEventPress(item)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="No Saved Events Yet"
              message="Tap the heart icon on any event card to save it here for quick access."
              actionLabel="Explore Events"
              onAction={handleExplorePress}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  countBadgeText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
