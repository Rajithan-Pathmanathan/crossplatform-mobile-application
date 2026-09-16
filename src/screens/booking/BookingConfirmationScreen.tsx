import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { Colors } from '../../constants/colors';

export const BookingConfirmationScreen: React.FC<
  RootStackScreenProps<'BookingConfirmation'>
> = ({ route, navigation }) => {
  const { booking } = route.params;
  const insets = useSafeAreaInsets();

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleGoToBookings = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: { screen: 'MyBookings' },
        },
      ],
    });
  };

  const handleGoToExplore = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: { screen: 'Explore' },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header Animation / Badge */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={44} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your digital pass has been issued and added to your wallet.
          </Text>
        </View>

        {/* Digital Ticket Pass */}
        <View style={styles.ticketCard}>
          {/* Cover Header */}
          <View style={styles.ticketBanner}>
            <Image
              source={{ uri: booking.eventImage }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay} />
            <View style={styles.bannerBadgeRow}>
              <View style={styles.confirmedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
                <Text style={styles.confirmedText}>CONFIRMED</Text>
              </View>
              <View style={styles.passCountBadge}>
                <Text style={styles.passCountText}>
                  {booking.ticketsCount} {booking.ticketsCount === 1 ? 'TICKET' : 'TICKETS'}
                </Text>
              </View>
            </View>
            <Text style={styles.ticketTitle} numberOfLines={2}>
              {booking.eventTitle}
            </Text>
          </View>

          {/* Ticket Details */}
          <View style={styles.ticketBody}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>DATE</Text>
                <Text style={styles.metaVal}>{formatDate(booking.eventDate)}</Text>
                <Text style={styles.metaSub}>{booking.eventTime}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>VENUE</Text>
                <Text style={styles.metaVal} numberOfLines={1}>
                  {booking.eventLocation}
                </Text>
                <Text style={styles.metaSub}>Admit {booking.ticketsCount}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>RESERVED FOR</Text>
                <Text style={styles.metaVal} numberOfLines={1}>
                  {booking.userName}
                </Text>
                <Text style={styles.metaSub} numberOfLines={1}>
                  {booking.userEmail}
                </Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>TOTAL PAID</Text>
                <Text style={styles.priceVal}>
                  {booking.totalPrice === 0 ? 'FREE' : `$${booking.totalPrice.toFixed(2)}`}
                </Text>
                <Text style={styles.metaSub}>
                  ${booking.unitPrice.toFixed(2)} / ticket
                </Text>
              </View>
            </View>
          </View>

          {/* Perforated Notches */}
          <View style={styles.perforatedRow}>
            <View style={styles.notchLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchRight} />
          </View>

          {/* Verification Barcode Stub */}
          <View style={styles.ticketStub}>
            <Text style={styles.refCodeLabel}>BOOKING REFERENCE CODE</Text>
            <Text style={styles.refCodeValue}>{booking.referenceCode}</Text>

            {/* Barcode Lines */}
            <View style={styles.barcodeBox}>
              {Array.from({ length: 42 }).map((_, i) => {
                const thick = (i * 11) % 4 === 0;
                const med = (i * 3) % 2 === 0;
                return (
                  <View
                    key={i}
                    style={[
                      styles.barcodeBar,
                      {
                        width: thick ? 4 : med ? 2.5 : 1.5,
                        marginRight: thick ? 3 : 2,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Text style={styles.stubInstructions}>
              Show this digital pass or mention code at entrance for quick entry.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleGoToBookings}
            activeOpacity={0.85}
          >
            <Ionicons name="ticket" size={20} color={Colors.white} />
            <Text style={styles.primaryBtnText}>View in My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleGoToExplore}
            activeOpacity={0.85}
          >
            <Ionicons name="compass-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Discover More Events</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  ticketCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  ticketBanner: {
    height: 130,
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
    backgroundColor: Colors.primary,
  },
  bannerImage: {
    ...StyleSheet.absoluteFill,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confirmedText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passCountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  ticketBody: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  metaSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    backgroundColor: Colors.white,
  },
  notchLeft: {
    width: 20,
    height: 22,
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
    backgroundColor: Colors.background,
    marginLeft: -1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  notchRight: {
    width: 20,
    height: 22,
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
    backgroundColor: Colors.background,
    marginRight: -1,
  },
  ticketStub: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  refCodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  refCodeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 12,
  },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    marginBottom: 10,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  stubInstructions: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
