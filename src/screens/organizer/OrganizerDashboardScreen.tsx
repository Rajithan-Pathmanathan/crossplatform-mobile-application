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
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Event } from '../../types/event';
import { EventAnalyticsModal } from '../../components/EventAnalyticsModal';
import { Colors } from '../../constants/colors';

export const OrganizerDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Analytics Modal State
  const [analyticsModalVisible, setAnalyticsModalVisible] =
    useState<boolean>(false);
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] =
    useState<Event | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadOrganizerEvents = async () => {
    if (!user) return;
    try {
      // In this demo environment, if the user is an organizer (or switched to organizer),
      // we fetch events published by them (or all demo events for Nexus Events organizer)
      const allEvents = await api.getEvents();
      // Filter by organizerId or match current user's organization name
      const myEvents = allEvents.filter(
        (e) =>
          e.organizerId === user.id ||
          e.organizerName.toLowerCase() === user.name.toLowerCase() ||
          user.role === 'organizer' // Show company events for organizer mode
      );
      setEvents(myEvents);
    } catch (err) {
      console.error('Failed to load organizer events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrganizerEvents();
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrganizerEvents();
  };

  const handleOpenAnalytics = (event: Event) => {
    setSelectedEventForAnalytics(event);
    setAnalyticsModalVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    navigation.navigate('CreateEditEvent', { eventId: event.id });
  };

  const handlePromptDelete = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setDeleting(true);
      await api.deleteEvent(eventToDelete.id);
      setDeleteModalVisible(false);
      setEventToDelete(null);
      await loadOrganizerEvents();
      Alert.alert(
        'Event Deleted',
        'The event has been permanently removed from EventHub.'
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  // KPIs Calculation
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.availableSeats > 0).length;
  const totalTicketsSold = events.reduce(
    (sum, e) => sum + (e.totalSeats - e.availableSeats),
    0
  );
  const totalRevenue = events
    .reduce(
      (sum, e) => sum + (e.totalSeats - e.availableSeats) * e.price,
      0
    )
    .toFixed(2);

  const renderEventItem = ({ item }: { item: Event }) => {
    const booked = item.totalSeats - item.availableSeats;
    const occupancyPercent = Math.min(
      100,
      Math.round((booked / Math.max(1, item.totalSeats)) * 100)
    );
    const eventRevenue = (booked * item.price).toFixed(2);
    const isSoldOut = item.availableSeats <= 0;

    return (
      <View style={styles.eventCard}>
        {/* Card Header Info */}
        <View style={styles.cardTopRow}>
          <Image
            source={{ uri: item.image }}
            style={styles.cardThumb}
            resizeMode="cover"
          />

          <View style={styles.cardHeaderInfo}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  isSoldOut
                    ? styles.statusSoldOutBadge
                    : styles.statusActiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isSoldOut
                      ? styles.statusSoldOutText
                      : styles.statusActiveText,
                  ]}
                >
                  {isSoldOut ? 'Sold Out' : 'Active'}
                </Text>
              </View>
            </View>

            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.eventMetaRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={Colors.textSecondary}
              />
              <Text style={styles.eventMetaText}>
                {item.date} • {item.time}
              </Text>
            </View>
          </View>
        </View>

        {/* Capacity & Sales Meter */}
        <View style={styles.meterContainer}>
          <View style={styles.meterHeader}>
            <Text style={styles.meterLabel}>Capacity & Sales</Text>
            <Text style={styles.meterValue}>
              {booked} / {item.totalSeats} seats ({occupancyPercent}%)
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${occupancyPercent}%`,
                  backgroundColor: isSoldOut ? Colors.error : Colors.secondary,
                },
              ]}
            />
          </View>

          <View style={styles.meterFooter}>
            <Text style={styles.revenueText}>
              Revenue: <Text style={styles.revenueValue}>${eventRevenue}</Text>
            </Text>
            <Text style={styles.priceTag}>${item.price.toFixed(2)} / ticket</Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          {/* Edit */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditEvent(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={15} color={Colors.text} />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>

          {/* Analytics / Attendees */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.analyticsBtn]}
            onPress={() => handleOpenAnalytics(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="stats-chart" size={15} color={Colors.secondary} />
            <Text style={[styles.actionBtnText, { color: Colors.secondary }]}>
              Analytics
            </Text>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handlePromptDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={15} color={Colors.error} />
            <Text style={[styles.actionBtnText, { color: Colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.orgTag}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.secondary} />
            <Text style={styles.orgTagText}>
              {user?.name || 'Nexus Events'} Studio
            </Text>
          </View>
          <Text style={styles.title}>Organizer Hub</Text>
        </View>

        <TouchableOpacity
          style={styles.publishBtn}
          onPress={() => navigation.navigate('CreateEditEvent', {})}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={Colors.white} />
          <Text style={styles.publishBtnText}>New Event</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Syncing Studio dashboard...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.secondary]}
              tintColor={Colors.secondary}
            />
          }
          ListHeaderComponent={
            <View style={styles.kpiContainer}>
              {/* KPIs 2x2 Grid */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <View style={styles.kpiIconBox}>
                    <Ionicons name="calendar" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.kpiLabel}>Total Events</Text>
                  <Text style={styles.kpiNumber}>{totalEvents}</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View
                    style={[
                      styles.kpiIconBox,
                      { backgroundColor: Colors.successLight },
                    ]}
                  >
                    <Ionicons
                      name="radio-button-on"
                      size={18}
                      color={Colors.success}
                    />
                  </View>
                  <Text style={styles.kpiLabel}>Active Events</Text>
                  <Text style={styles.kpiNumber}>{activeEvents}</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View
                    style={[
                      styles.kpiIconBox,
                      { backgroundColor: Colors.secondaryLight },
                    ]}
                  >
                    <Ionicons name="ticket" size={18} color={Colors.secondary} />
                  </View>
                  <Text style={styles.kpiLabel}>Tickets Sold</Text>
                  <Text style={styles.kpiNumber}>{totalTicketsSold}</Text>
                </View>

                <View style={styles.kpiCard}>
                  <View
                    style={[
                      styles.kpiIconBox,
                      { backgroundColor: Colors.infoLight },
                    ]}
                  >
                    <Ionicons name="cash" size={18} color={Colors.info} />
                  </View>
                  <Text style={styles.kpiLabel}>Gross Revenue</Text>
                  <Text style={styles.kpiNumber}>${totalRevenue}</Text>
                </View>
              </View>

              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Manage Hosted Events</Text>
                <Text style={styles.sectionSubtitle}>
                  {events.length} {events.length === 1 ? 'event' : 'events'} live
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={48}
                  color={Colors.secondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Hosted Events Yet</Text>
              <Text style={styles.emptyText}>
                Publish your first event to start accepting ticket reservations, managing seat availability, and tracking attendee check-ins.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation.navigate('CreateEditEvent', {})}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={18} color={Colors.white} />
                <Text style={styles.emptyActionText}>Publish First Event</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Event Analytics Modal */}
      <EventAnalyticsModal
        visible={analyticsModalVisible}
        event={selectedEventForAnalytics}
        onClose={() => {
          setAnalyticsModalVisible(false);
          setSelectedEventForAnalytics(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="alert-circle" size={32} color={Colors.error} />
            </View>

            <Text style={styles.deleteModalTitle}>Delete Event?</Text>
            <Text style={styles.deleteModalDesc}>
              Are you sure you want to permanently delete{' '}
              <Text style={{ fontWeight: '700', color: Colors.text }}>
                "{eventToDelete?.title}"
              </Text>
              ? This will remove the event from EventHub and cancel upcoming reservations.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.7}
                disabled={deleting}
              >
                <Text style={styles.deleteCancelText}>Keep Event</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmDelete}
                activeOpacity={0.85}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.deleteConfirmText}>Yes, Delete</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  orgTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  orgTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  publishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  listContent: {
    padding: 18,
    gap: 16,
    paddingBottom: 28,
  },
  kpiContainer: {
    marginBottom: 6,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  cardThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusActiveBadge: {
    backgroundColor: Colors.successLight,
  },
  statusActiveText: {
    color: Colors.success,
  },
  statusSoldOutBadge: {
    backgroundColor: Colors.errorLight,
  },
  statusSoldOutText: {
    color: Colors.error,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  meterContainer: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  meterValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  meterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  revenueValue: {
    fontWeight: '700',
    color: Colors.text,
  },
  priceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    gap: 5,
  },
  analyticsBtn: {
    backgroundColor: Colors.secondaryLight,
  },
  deleteBtn: {
    backgroundColor: Colors.errorLight,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  deleteModalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  deleteModalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
