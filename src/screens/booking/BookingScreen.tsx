import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { api } from '../../services/api';
import { Event } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

export const BookingScreen: React.FC<RootStackScreenProps<'Booking'>> = ({
  route,
  navigation,
}) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [ticketsCount, setTicketsCount] = useState(1);
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  // Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await api.getEventById(eventId);
      setEvent(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Unable to load event details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Preparing booking details...</Text>
      </SafeAreaView>
    );
  }

  const maxTickets = Math.min(8, event.availableSeats);
  const unitPrice = event.price;
  const totalPrice = Number((unitPrice * ticketsCount).toFixed(2));

  const handleIncrement = () => {
    if (ticketsCount < maxTickets) {
      setTicketsCount((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (ticketsCount > 1) {
      setTicketsCount((prev) => prev - 1);
    }
  };

  const validate = () => {
    let isValid = true;

    if (!userName.trim()) {
      setNameError('Please enter attendee name.');
      isValid = false;
    } else {
      setNameError('');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail.trim() || !emailRegex.test(userEmail.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!userPhone.trim() || userPhone.trim().length < 7) {
      setPhoneError('Please enter a valid phone number.');
      isValid = false;
    } else {
      setPhoneError('');
    }

    return isValid;
  };

  const handleConfirmBooking = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to make a booking.');
      return;
    }

    try {
      setSubmitting(true);
      const booking = await api.createBooking(
        {
          eventId: event.id,
          ticketsCount,
          userName: userName.trim(),
          userEmail: userEmail.trim(),
          userPhone: userPhone.trim(),
          notes: notes.trim() || undefined,
        },
        user
      );

      // Navigate to confirmation screen
      navigation.replace('BookingConfirmation', { booking });
    } catch (err: any) {
      Alert.alert(
        'Booking Failed',
        err?.message || 'Something went wrong while processing your reservation.'
      );
    } finally {
      setSubmitting(false);
    }
  };

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
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Tickets</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Summary Card */}
          <View style={styles.eventCard}>
            <Image
              source={{ uri: event.image }}
              style={styles.eventThumbnail}
              resizeMode="cover"
            />
            <View style={styles.eventInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <View style={styles.eventMetaRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.eventMetaText}>
                  {formatDate(event.date)} • {event.time}
                </Text>
              </View>
              <View style={styles.eventMetaRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.eventMetaText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Ticket Quantity Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Number of Tickets</Text>
                <Text style={styles.sectionSubtitle}>
                  {event.availableSeats <= 10
                    ? `⚠️ Hurry! Only ${event.availableSeats} seats left`
                    : `${event.availableSeats} seats available`}
                </Text>
              </View>

              {/* Counter Buttons */}
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[
                    styles.counterBtn,
                    ticketsCount <= 1 && styles.counterBtnDisabled,
                  ]}
                  onPress={handleDecrement}
                  disabled={ticketsCount <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={ticketsCount <= 1 ? Colors.textTertiary : Colors.text}
                  />
                </TouchableOpacity>

                <View style={styles.counterDisplay}>
                  <Text style={styles.counterNumber}>{ticketsCount}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.counterBtn,
                    ticketsCount >= maxTickets && styles.counterBtnDisabled,
                  ]}
                  onPress={handleIncrement}
                  disabled={ticketsCount >= maxTickets}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={ticketsCount >= maxTickets ? Colors.textTertiary : Colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.limitInfo}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.textSecondary} />
              <Text style={styles.limitInfoText}>
                Standard limit of max {maxTickets} tickets per booking.
              </Text>
            </View>
          </View>

          {/* Pricing Breakdown Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {ticketsCount} × {unitPrice === 0 ? 'Free Ticket' : `$${unitPrice.toFixed(2)}`}
              </Text>
              <Text style={styles.priceNumber}>
                {totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Processing & Platform Fee</Text>
              <Text style={[styles.priceNumber, { color: Colors.success }]}>
                $0.00 (Free)
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRowTotal}>
              <Text style={styles.priceTotalLabel}>Total Amount</Text>
              <Text style={styles.priceTotalValue}>
                {totalPrice === 0 ? 'FREE' : `$${totalPrice.toFixed(2)}`}
              </Text>
            </View>
          </View>

          {/* Primary Attendee Form */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Attendee Information</Text>
            <Text style={styles.sectionSubtitle}>
              Ticket passes and booking reference codes will be linked to this person.
            </Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={[styles.inputWrapper, nameError ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userName}
                  onChangeText={(txt) => {
                    setUserName(txt);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Enter full name"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userEmail}
                  onChangeText={(txt) => {
                    setUserEmail(txt);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={[styles.inputWrapper, phoneError ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userPhone}
                  onChangeText={(txt) => {
                    setUserPhone(txt);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            {/* Special Instructions */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Special Requests or Notes (Optional)</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Dietary preferences, accessibility needs, questions..."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Terms Note */}
          <View style={styles.termsCard}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            <Text style={styles.termsText}>
              By completing this booking, you agree to EventHub's instant ticket reservation terms. You can cancel active reservations anytime from the My Bookings tab.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Booking Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>
            {totalPrice === 0 ? 'FREE' : `$${totalPrice.toFixed(2)}`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
          onPress={handleConfirmBooking}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexOne: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  eventThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
    borderColor: Colors.border,
  },
  counterDisplay: {
    minWidth: 32,
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  limitInfoText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  priceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  priceTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  textAreaWrapper: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textArea: {
    height: '100%',
  },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
  },
  termsCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primaryDark || '#1E40AF',
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
