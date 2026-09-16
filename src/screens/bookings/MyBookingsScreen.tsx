import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { Booking } from '../../types/booking';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { TicketPassModal } from '../../components/TicketPassModal';

type BookingTab = 'active' | 'history';

export const MyBookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<BookingTab>('active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pass Modal state
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);

  // Cancellation Modal state
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const data = await api.getUserBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handlePromptCancel = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelling(true);
      await api.cancelBooking(bookingToCancel.id);
      setCancelModalVisible(false);
      showToast(`Booking ${bookingToCancel.referenceCode} cancelled. Seats released.`);
      // Refresh list
      await fetchBookings();
    } catch (err: any) {
      Alert.alert('Cancellation Failed', err?.message || 'Unable to cancel booking.');
    } finally {
      setCancelling(false);
      setBookingToCancel(null);
    }
  };

  // Filter lists
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const historyBookings = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'completed'
  );

  const displayedList = activeTab === 'active' ? activeBookings : historyBookings;

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

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const isConfirmed = item.status === 'confirmed';
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={styles.card}>
        {/* Top Card Row */}
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.eventImage }}
            style={styles.cardThumbnail}
            resizeMode="cover"
          />

          <View style={styles.cardHeaderInfo}>
            <View style={styles.cardBadgeRow}>
              <View style={styles.refCodeBadge}>
                <Ionicons name="barcode-outline" size={11} color={Colors.textSecondary} />
                <Text style={styles.refCodeText}>{item.referenceCode}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isConfirmed
                    ? styles.statusConfirmed
                    : isCancelled
                    ? styles.statusCancelled
                    : styles.statusCompleted,
                ]}
              >
                <Ionicons
                  name={
                    isConfirmed
                      ? 'checkmark-circle'
                      : isCancelled
                      ? 'close-circle'
                      : 'checkmark-done-circle'
                  }
                  size={11}
                  color={
                    isConfirmed
                      ? Colors.success
                      : isCancelled
                      ? Colors.error
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    isConfirmed
                      ? { color: Colors.success }
                      : isCancelled
                      ? { color: Colors.error }
                      : { color: Colors.textSecondary },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.eventTitle}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {formatDate(item.eventDate)} • {item.eventTime}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.eventLocation}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Pricing & Ticket Count Row */}
        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.ticketCountCol}>
            <Text style={styles.ticketCountLabel}>RESERVATION</Text>
            <Text style={styles.ticketCountValue}>
              {item.ticketsCount} {item.ticketsCount === 1 ? 'Ticket' : 'Tickets'}
            </Text>
          </View>

          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>TOTAL PAID</Text>
            <Text style={styles.priceValue}>
              {item.totalPrice === 0 ? 'FREE' : `$${item.totalPrice.toFixed(2)}`}
            </Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.viewPassBtn}
            onPress={() => setSelectedBookingForPass(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="ticket-outline" size={16} color={Colors.primary} />
            <Text style={styles.viewPassText}>View Ticket Pass</Text>
          </TouchableOpacity>

          {isConfirmed && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handlePromptCancel(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons
          name={activeTab === 'active' ? 'ticket-outline' : 'archive-outline'}
          size={48}
          color={Colors.primary}
        />
      </View>
      <Text style={styles.emptyHeading}>
        {activeTab === 'active' ? 'No Active Bookings' : 'No Past Bookings'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'active'
          ? "You don't have any upcoming event passes. Explore exciting local events and book your spot!"
          : 'Your completed or cancelled event passes will be archived here.'}
      </Text>
      {activeTab === 'active' && (
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Explore')}
          activeOpacity={0.85}
        >
          <Ionicons name="compass-outline" size={18} color={Colors.white} />
          <Text style={styles.exploreBtnText}>Browse Events</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>
            Manage digital passes, tickets & reservations
          </Text>
        </View>
      </View>

      {/* Segmented Tab Controls */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="ticket"
            size={16}
            color={activeTab === 'active' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}
          >
            Active Passes
          </Text>
          <View
            style={[
              styles.tabCountBadge,
              activeTab === 'active' && styles.tabCountBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabCountText,
                activeTab === 'active' && styles.tabCountTextActive,
              ]}
            >
              {activeBookings.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === 'history' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            Past & Cancelled
          </Text>
          <View
            style={[
              styles.tabCountBadge,
              activeTab === 'history' && styles.tabCountBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabCountText,
                activeTab === 'history' && styles.tabCountTextActive,
              ]}
            >
              {historyBookings.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your passes...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedList}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* Digital Ticket Pass Modal */}
      <TicketPassModal
        visible={!!selectedBookingForPass}
        booking={selectedBookingForPass}
        onClose={() => setSelectedBookingForPass(null)}
      />

      {/* Cancellation Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalCard}>
            <View style={styles.cancelIconCircle}>
              <Ionicons name="alert-circle" size={36} color={Colors.error} />
            </View>

            <Text style={styles.cancelModalTitle}>Cancel Booking?</Text>
            <Text style={styles.cancelModalDescription}>
              Are you sure you want to cancel reservation{' '}
              <Text style={styles.boldRef}>{bookingToCancel?.referenceCode}</Text> for{' '}
              <Text style={styles.boldTitle}>{bookingToCancel?.eventTitle}</Text>?
              {'\n\n'}
              Your {bookingToCancel?.ticketsCount} reserved seat(s) will immediately be
              returned to the event capacity pool.
            </Text>

            <View style={styles.cancelModalActions}>
              <TouchableOpacity
                style={styles.cancelKeepBtn}
                onPress={() => setCancelModalVisible(false)}
                disabled={cancelling}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelKeepText}>Keep Booking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelConfirmBtn}
                onPress={handleConfirmCancel}
                disabled={cancelling}
                activeOpacity={0.8}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.cancelConfirmText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toastBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: Colors.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabCountTextActive: {
    color: Colors.primary,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  cardThumbnail: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  refCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refCodeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketCountCol: {
    flex: 1,
  },
  ticketCountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  ticketCountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewPassText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cancelBtnText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cancelModalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  cancelIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cancelModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  cancelModalDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  boldRef: {
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'monospace',
  },
  boldTitle: {
    fontWeight: '700',
    color: Colors.text,
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelKeepBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelKeepText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.error,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelConfirmText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
