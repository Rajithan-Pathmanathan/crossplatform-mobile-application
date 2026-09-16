import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { api } from '../../services/api';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { Event } from '../../types/event';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EventDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { eventId } = route.params;
  const { user, activeRole } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadEventDetails();
    checkFavoriteStatus();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const data = await api.getEventById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Unable to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const fav = await StorageService.isFavorite(eventId);
    setIsFavorite(fav);
  };

  const handleToggleFavorite = async () => {
    const updated = await StorageService.toggleFavorite(eventId);
    setIsFavorite(updated.includes(eventId));
  };

  const handleBookPress = () => {
    if (!event) return;
    if (event.availableSeats <= 0) {
      Alert.alert('Sold Out', 'Sorry, there are no more tickets available for this event.');
      return;
    }
    navigation.navigate('Booking', { eventId: event.id });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  const isSoldOut = event.availableSeats <= 0;
  const bookedSeats = event.totalSeats - event.availableSeats;
  const fillPercentage = Math.min(100, Math.round((bookedSeats / event.totalSeats) * 100));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image & Overlays */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.imageGradientOverlay} />

          {/* Category Badge on Image */}
          <View style={styles.heroCategoryBadge}>
            <Text style={styles.heroCategoryText}>{event.category}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time Card */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconCircle, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="calendar" size={22} color={Colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{formatDate(event.date)}</Text>
              <Text style={styles.infoSubtitle}>{event.time} • Local Time</Text>
            </View>
          </View>

          {/* Venue & Location Card */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="location" size={22} color={Colors.warning} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{event.location}</Text>
              <Text style={styles.infoSubtitle}>{event.address}</Text>
            </View>
          </View>

          {/* Organizer Card */}
          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerAvatarText}>
                {event.organizerName.charAt(0)}
              </Text>
            </View>
            <View style={styles.organizerInfo}>
              <View style={styles.organizerHeaderRow}>
                <Text style={styles.organizerName}>{event.organizerName}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                  <Text style={styles.verifiedText}>Verified Host</Text>
                </View>
              </View>
              <Text style={styles.organizerRole}>Event Organizer</Text>
            </View>
          </View>

          {/* Seat Capacity & Availability Card */}
          <View style={styles.capacityCard}>
            <View style={styles.capacityHeader}>
              <View style={styles.capacityHeaderLeft}>
                <Ionicons
                  name={isSoldOut ? 'alert-circle' : 'ticket-outline'}
                  size={20}
                  color={isSoldOut ? Colors.error : Colors.primary}
                />
                <Text style={styles.capacityTitle}>Seat Availability</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  isSoldOut
                    ? styles.statusBadgeSoldOut
                    : event.availableSeats <= 15
                    ? styles.statusBadgeLimited
                    : styles.statusBadgeAvailable,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isSoldOut
                      ? styles.statusTextSoldOut
                      : event.availableSeats <= 15
                      ? styles.statusTextLimited
                      : styles.statusTextAvailable,
                  ]}
                >
                  {isSoldOut
                    ? 'Sold Out'
                    : event.availableSeats <= 15
                    ? `Only ${event.availableSeats} Left!`
                    : `${event.availableSeats} Available`}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${fillPercentage}%` },
                  isSoldOut && { backgroundColor: Colors.error },
                ]}
              />
            </View>

            {/* Capacity Stats */}
            <View style={styles.capacityStats}>
              <Text style={styles.capacityStatText}>
                <Text style={styles.statBold}>{bookedSeats}</Text> booked
              </Text>
              <Text style={styles.capacityStatText}>
                <Text style={styles.statBold}>{event.totalSeats}</Text> total capacity ({fillPercentage}%)
              </Text>
            </View>
          </View>

          {/* About Event Description */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>About This Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Fixed Top Bar Actions */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleToggleFavorite}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? Colors.secondary : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>
            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
            {event.price > 0 && <Text style={styles.priceUnit}> / ticket</Text>}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            isSoldOut && styles.bookButtonDisabled,
          ]}
          onPress={handleBookPress}
          disabled={isSoldOut}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isSoldOut ? 'close-circle' : 'ticket'}
            size={20}
            color={Colors.white}
            style={styles.bookButtonIcon}
          />
          <Text style={styles.bookButtonText}>
            {isSoldOut ? 'Sold Out' : 'Book Tickets'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroCategoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  organizerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  organizerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  organizerRole: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  capacityCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  capacityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeAvailable: {
    backgroundColor: Colors.successLight,
  },
  statusBadgeLimited: {
    backgroundColor: Colors.warningLight,
  },
  statusBadgeSoldOut: {
    backgroundColor: Colors.errorLight,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: Colors.success,
  },
  statusTextLimited: {
    color: Colors.warning,
  },
  statusTextSoldOut: {
    color: Colors.error,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  capacityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statBold: {
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonIcon: {
    marginRight: 8,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
