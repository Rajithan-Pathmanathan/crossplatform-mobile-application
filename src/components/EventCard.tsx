import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types/event';
import { Colors } from '../constants/colors';

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: (eventId: string) => void;
  containerStyle?: ViewStyle;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isFavorite,
  onPress,
  onToggleFavorite,
  containerStyle,
}) => {
  const isSoldOut = event.availableSeats <= 0;
  const isLimited = event.availableSeats > 0 && event.availableSeats <= 15;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, containerStyle]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Event Image & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(event.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? Colors.secondary : Colors.white}
          />
        </TouchableOpacity>

        {/* Price Tag on Image Bottom */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Date & Time */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
          <Text style={styles.dateText}>
            {formatDate(event.date)} • {event.time}
          </Text>
        </View>

        {/* Event Title */}
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {event.title}
        </Text>

        {/* Venue Location */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Footer with Seat Status */}
        <View style={styles.footer}>
          {isSoldOut ? (
            <View style={[styles.seatBadge, styles.seatBadgeSoldOut]}>
              <Ionicons name="close-circle-outline" size={13} color={Colors.error} />
              <Text style={styles.seatTextSoldOut}>Sold Out</Text>
            </View>
          ) : isLimited ? (
            <View style={[styles.seatBadge, styles.seatBadgeLimited]}>
              <Ionicons name="flame-outline" size={13} color={Colors.warning} />
              <Text style={styles.seatTextLimited}>
                Only {event.availableSeats} seats left!
              </Text>
            </View>
          ) : (
            <View style={[styles.seatBadge, styles.seatBadgeAvailable]}>
              <Ionicons name="checkmark-circle-outline" size={13} color={Colors.success} />
              <Text style={styles.seatTextAvailable}>
                {event.availableSeats} seats available
              </Text>
            </View>
          )}

          <Text style={styles.organizerText} numberOfLines={1}>
            By {event.organizerName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  seatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatBadgeAvailable: {
    backgroundColor: Colors.successLight,
  },
  seatBadgeLimited: {
    backgroundColor: Colors.warningLight,
  },
  seatBadgeSoldOut: {
    backgroundColor: Colors.errorLight,
  },
  seatTextAvailable: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  seatTextLimited: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 4,
  },
  seatTextSoldOut: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 4,
  },
  organizerText: {
    fontSize: 12,
    color: Colors.textMuted,
    maxWidth: '45%',
  },
});
