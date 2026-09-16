import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types/event';
import { Booking } from '../types/booking';
import { api } from '../services/api';
import { Colors } from '../constants/colors';

interface EventAnalyticsModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
}

export const EventAnalyticsModal: React.FC<EventAnalyticsModalProps> = ({
  visible,
  event,
  onClose,
}) => {
  const [attendees, setAttendees] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (visible && event) {
      loadAttendees(event.id);
    }
  }, [visible, event]);

  const loadAttendees = async (eventId: string) => {
    try {
      setLoading(true);
      const list = await api.getEventAttendees(eventId);
      setAttendees(list);
    } catch (err) {
      console.error('Failed to load attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const bookedSeats = event.totalSeats - event.availableSeats;
  const occupancyPercent = Math.min(
    100,
    Math.round((bookedSeats / Math.max(1, event.totalSeats)) * 100)
  );
  const totalRevenue = (bookedSeats * event.price).toFixed(2);

  const renderAttendeeItem = ({ item }: { item: Booking }) => (
    <View style={styles.attendeeCard}>
      <View style={styles.attendeeAvatar}>
        <Text style={styles.avatarLetter}>
          {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
        </Text>
      </View>

      <View style={styles.attendeeInfo}>
        <View style={styles.attendeeTopRow}>
          <Text style={styles.attendeeName} numberOfLines={1}>
            {item.userName}
          </Text>
          <View style={styles.ticketBadge}>
            <Ionicons name="ticket" size={11} color={Colors.primary} />
            <Text style={styles.ticketBadgeText}>
              {item.ticketsCount} {item.ticketsCount === 1 ? 'pass' : 'passes'}
            </Text>
          </View>
        </View>

        <Text style={styles.attendeeEmail} numberOfLines={1}>
          {item.userEmail}
        </Text>

        <View style={styles.attendeeBottomRow}>
          <Text style={styles.refCode}>Ref: {item.referenceCode}</Text>
          <Text style={styles.paidAmount}>${item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleGroup}>
              <Ionicons name="stats-chart" size={20} color={Colors.secondary} />
              <Text style={styles.modalTitle}>Sales & Attendees</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Event Mini Banner */}
          <View style={styles.eventBanner}>
            <Image
              source={{ uri: event.image }}
              style={styles.eventThumb}
              resizeMode="cover"
            />
            <View style={styles.eventMeta}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{event.category}</Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.bannerDate}>
                {event.date} • {event.time}
              </Text>
            </View>
          </View>

          {/* KPI Summary Cards */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Revenue</Text>
              <Text style={styles.kpiValue}>${totalRevenue}</Text>
              <Text style={styles.kpiSub}>${event.price}/ticket</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tickets Sold</Text>
              <Text style={styles.kpiValue}>
                {bookedSeats}
                <Text style={styles.kpiDenominator}>/{event.totalSeats}</Text>
              </Text>
              <Text style={styles.kpiSub}>{event.availableSeats} remaining</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Occupancy</Text>
              <Text style={styles.kpiValue}>{occupancyPercent}%</Text>
              <View style={styles.miniProgressBar}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${occupancyPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Attendee Roster Section */}
          <View style={styles.rosterSection}>
            <View style={styles.rosterHeader}>
              <Text style={styles.rosterTitle}>Verified Attendees</Text>
              <View style={styles.rosterCountPill}>
                <Text style={styles.rosterCountText}>{attendees.length}</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={Colors.secondary} />
                <Text style={styles.loadingText}>Loading attendees...</Text>
              </View>
            ) : (
              <FlatList
                data={attendees}
                keyExtractor={(item) => item.id}
                renderItem={renderAttendeeItem}
                contentContainerStyle={styles.attendeesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyRoster}>
                    <Ionicons
                      name="people-outline"
                      size={40}
                      color={Colors.textTertiary}
                    />
                    <Text style={styles.emptyRosterTitle}>
                      No ticket reservations yet
                    </Text>
                    <Text style={styles.emptyRosterText}>
                      When attendees book passes for this event, their contact info and ticket counts will appear here.
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          {/* Close Action */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Close Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 16,
    gap: 12,
  },
  eventThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  eventMeta: {
    flex: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
  },
  bannerDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  kpiDenominator: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  kpiSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },
  rosterSection: {
    flex: 1,
    marginTop: 18,
    paddingHorizontal: 20,
    minHeight: 220,
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rosterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  rosterCountPill: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rosterCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attendeesList: {
    paddingBottom: 10,
    gap: 10,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ticketBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  attendeeEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attendeeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  refCode: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  paidAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  emptyRoster: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 6,
  },
  emptyRosterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 6,
  },
  emptyRosterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  doneBtn: {
    backgroundColor: Colors.secondary,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
