import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StorageService } from '../../services/storage';
import { Event, EventCategory } from '../../types/event';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { SearchBar } from '../../components/SearchBar';
import { CategoryChipBar } from '../../components/CategoryChipBar';
import { EventCard } from '../../components/EventCard';
import { EmptyState } from '../../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, activeRole } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load events from REST API
  const loadEvents = useCallback(async () => {
    try {
      const data = await api.getEvents({
        category: selectedCategory,
        searchQuery: searchQuery,
      });
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Load favorites from local storage
  const loadFavorites = useCallback(async () => {
    const favs = await StorageService.getFavorites();
    setFavorites(favs);
  }, []);

  // Reload when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadEvents();
    }, [loadFavorites, loadEvents])
  );

  // Debounced/responsive search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, loadEvents]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
    loadFavorites();
  };

  const handleToggleFavorite = async (eventId: string) => {
    const updated = await StorageService.toggleFavorite(eventId);
    setFavorites(updated);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>EventHub</Text>
          <Text style={styles.appSubtitle}>
            Explore & Book Experiences
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Active Mode Pill */}
          <View style={styles.roleChip}>
            <Ionicons
              name={activeRole === 'organizer' ? 'briefcase' : 'person'}
              size={12}
              color={activeRole === 'organizer' ? Colors.secondary : Colors.primary}
            />
            <Text
              style={[
                styles.roleChipText,
                activeRole === 'organizer' && { color: Colors.secondary },
              ]}
            >
              {activeRole === 'organizer' ? 'Organizer' : 'Attendee'}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search events, topics, or venues..."
        />
      </View>

      {/* Category Pills Filter */}
      <CategoryChipBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Events List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding best events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isFavorite={favorites.includes(item.id)}
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
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            events.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'All' ? 'Upcoming Events' : `${selectedCategory} Events`}
                </Text>
                <Text style={styles.sectionCount}>
                  {events.length} {events.length === 1 ? 'event' : 'events'} found
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No Events Found"
              message={
                searchQuery.length > 0
                  ? `No events matching "${searchQuery}". Try different keywords or reset filters.`
                  : `No ${selectedCategory} events scheduled currently. Try selecting another category.`
              }
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
