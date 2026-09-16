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
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EventCategory } from '../../types/event';
import { Colors } from '../../constants/colors';

const CATEGORIES: EventCategory[] = [
  'Music',
  'Technology',
  'Sports',
  'Food & Drink',
  'Workshop',
  'Arts & Theatre',
];

const PRESET_IMAGES = [
  {
    category: 'Music' as EventCategory,
    label: 'Concert & DJ',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Technology' as EventCategory,
    label: 'Tech Summit',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Food & Drink' as EventCategory,
    label: 'Food Festival',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Sports' as EventCategory,
    label: 'Marathon & Fitness',
    url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Workshop' as EventCategory,
    label: 'Masterclass',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Arts & Theatre' as EventCategory,
    label: 'Art Exhibition',
    url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CreateEditEventScreen: React.FC<
  RootStackScreenProps<'CreateEditEvent'>
> = ({ route, navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const eventId = route.params?.eventId;
  const isEditMode = Boolean(eventId);

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditMode);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Music');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && eventId) {
      loadExistingEvent(eventId);
    }
  }, [eventId]);

  const loadExistingEvent = async (id: string) => {
    try {
      setLoadingInitial(true);
      const ev = await api.getEventById(id);
      if (ev) {
        setTitle(ev.title);
        setDescription(ev.description);
        setCategory(ev.category);
        setDate(ev.date);
        setTime(ev.time);
        setLocation(ev.location);
        setPrice(String(ev.price));
        setTotalSeats(String(ev.totalSeats));
        setImageUrl(ev.image);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Unable to load event for editing.');
      navigation.goBack();
    } finally {
      setLoadingInitial(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    if (!description.trim() || description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters.';
    }

    if (!date.trim()) {
      newErrors.date = 'Please provide an event date (e.g. 2026-11-20).';
    }

    if (!time.trim()) {
      newErrors.time = 'Please provide an event time (e.g. 18:00 - 22:00).';
    }

    if (!location.trim()) {
      newErrors.location = 'Venue or location address is required.';
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      newErrors.price = 'Enter a valid price ($0 or greater).';
    }

    const parsedSeats = parseInt(totalSeats, 10);
    if (isNaN(parsedSeats) || parsedSeats < 1) {
      newErrors.totalSeats = 'Capacity must be at least 1 seat.';
    }

    if (!imageUrl.trim()) {
      newErrors.image = 'Select a cover image or enter a valid URL.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('Auth Required', 'Please log in as an organizer.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        address: location.trim(),
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats, 10),
        image: imageUrl.trim(),
      };

      if (isEditMode && eventId) {
        await api.updateEvent(eventId, payload);
        Alert.alert(
          'Event Updated',
          'Your event details have been successfully updated.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        await api.createEvent(payload, user);
        Alert.alert(
          'Event Published!',
          'Your new event is now live and discoverable on EventHub.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert('Operation Failed', err?.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Event' : 'Publish New Event'}
          </Text>
          <Text style={styles.headerSub}>
            {isEditMode
              ? 'Update event metadata & capacity'
              : 'Launch your experience on EventHub'}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Details</Text>

            {/* Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Neon Nights: Summer Festival"
                placeholderTextColor={Colors.textMuted}
              />
              {errors.title ? (
                <Text style={styles.errorText}>{errors.title}</Text>
              ) : null}
            </View>

            {/* Category Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Describe what attendees can expect, highlights, and schedule..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}
            </View>
          </View>

          {/* Section 2: Date, Time & Venue */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Schedule & Venue</Text>

            <View style={styles.twoColumnRow}>
              {/* Date */}
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  value={date}
                  onChangeText={(t) => {
                    setDate(t);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  placeholder="e.g. 2026-11-20"
                  placeholderTextColor={Colors.textMuted}
                />
                {errors.date ? (
                  <Text style={styles.errorText}>{errors.date}</Text>
                ) : null}
              </View>

              {/* Time */}
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Time Range *</Text>
                <TextInput
                  style={[styles.input, errors.time && styles.inputError]}
                  value={time}
                  onChangeText={(t) => {
                    setTime(t);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  placeholder="e.g. 18:00 - 23:00"
                  placeholderTextColor={Colors.textMuted}
                />
                {errors.time ? (
                  <Text style={styles.errorText}>{errors.time}</Text>
                ) : null}
              </View>
            </View>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Venue / Address *</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                value={location}
                onChangeText={(t) => {
                  setLocation(t);
                  if (errors.location)
                    setErrors((prev) => ({ ...prev, location: '' }));
                }}
                placeholder="e.g. Bayfront Pavilion, 450 Harbor Blvd"
                placeholderTextColor={Colors.textMuted}
              />
              {errors.location ? (
                <Text style={styles.errorText}>{errors.location}</Text>
              ) : null}
            </View>
          </View>

          {/* Section 3: Pricing & Capacity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tickets & Capacity</Text>

            <View style={styles.twoColumnRow}>
              {/* Price */}
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Ticket Price ($) *</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  value={price}
                  onChangeText={(t) => {
                    setPrice(t);
                    if (errors.price)
                      setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
                {errors.price ? (
                  <Text style={styles.errorText}>{errors.price}</Text>
                ) : null}
              </View>

              {/* Total Seats */}
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Total Capacity *</Text>
                <TextInput
                  style={[styles.input, errors.totalSeats && styles.inputError]}
                  value={totalSeats}
                  onChangeText={(t) => {
                    setTotalSeats(t);
                    if (errors.totalSeats)
                      setErrors((prev) => ({ ...prev, totalSeats: '' }));
                  }}
                  placeholder="e.g. 150"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
                {errors.totalSeats ? (
                  <Text style={styles.errorText}>{errors.totalSeats}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Section 4: Cover Image Selection */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cover Image</Text>
            <Text style={styles.sectionSubtitle}>
              Choose from our curated photography presets or paste a custom URL:
            </Text>

            {/* Preview Banner */}
            {imageUrl ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.white} />
                  <Text style={styles.imageBadgeText}>Active Image</Text>
                </View>
              </View>
            ) : null}

            {/* Presets Grid */}
            <View style={styles.presetsGrid}>
              {PRESET_IMAGES.map((preset, idx) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetItem,
                      isSelected && styles.presetItemActive,
                    ]}
                    onPress={() => setImageUrl(preset.url)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: preset.url }}
                      style={styles.presetThumb}
                      resizeMode="cover"
                    />
                    <Text
                      style={[
                        styles.presetLabel,
                        isSelected && styles.presetLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom URL Input */}
            <View style={[styles.fieldGroup, { marginTop: 12 }]}>
              <Text style={styles.label}>Or Custom Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/photo.jpg"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(16, insets.bottom + 8) },
        ]}
      >
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons
                name={isEditMode ? 'checkmark-done' : 'cloud-upload'}
                size={18}
                color={Colors.white}
              />
              <Text style={styles.submitBtnText}>
                {isEditMode ? 'Save Changes' : 'Publish Event'}
              </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePreviewContainer: {
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetItem: {
    width: '31%',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingBottom: 6,
    alignItems: 'center',
  },
  presetItemActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryLight,
  },
  presetThumb: {
    width: '100%',
    height: 52,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  presetLabelActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
    elevation: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
