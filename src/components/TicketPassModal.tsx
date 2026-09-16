import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface TicketPassModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  visible,
  booking,
  onClose,
}) => {
  if (!booking) return null;

  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBackdrop} />

        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="ticket" size={20} color={Colors.primary} />
              <Text style={styles.modalHeaderTitle}>Digital Event Pass</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* The Ticket Pass */}
            <View style={styles.ticketContainer}>
              {/* Top Banner with Image */}
              <View style={styles.ticketBanner}>
                <Image
                  source={{ uri: booking.eventImage }}
                  style={styles.ticketImage}
                  resizeMode="cover"
                />
                <View style={styles.ticketImageOverlay} />
                <View style={styles.bannerBadgeRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      isCancelled
                        ? styles.statusBadgeCancelled
                        : isCompleted
                        ? styles.statusBadgeCompleted
                        : styles.statusBadgeConfirmed,
                    ]}
                  >
                    <Ionicons
                      name={
                        isCancelled
                          ? 'close-circle'
                          : isCompleted
                          ? 'checkmark-done-circle'
                          : 'checkmark-circle'
                      }
                      size={12}
                      color={
                        isCancelled
                          ? Colors.error
                          : isCompleted
                          ? Colors.textSecondary
                          : Colors.success
                      }
                    />
                    <Text
                      style={[
                        styles.statusText,
                        isCancelled
                          ? { color: Colors.error }
                          : isCompleted
                          ? { color: Colors.textSecondary }
                          : { color: Colors.success },
                      ]}
                    >
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.ticketCountPill}>
                    <Text style={styles.ticketCountText}>
                      {booking.ticketsCount}{' '}
                      {booking.ticketsCount === 1 ? 'PASS' : 'PASSES'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketEventTitle} numberOfLines={2}>
                  {booking.eventTitle}
                </Text>
              </View>

              {/* Event & Venue Info */}
              <View style={styles.ticketBody}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>DATE & TIME</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(booking.eventDate)}
                    </Text>
                    <Text style={styles.infoSubvalue}>{booking.eventTime}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>LOCATION</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {booking.eventLocation}
                    </Text>
                    <Text style={styles.infoSubvalue}>Main Entrance</Text>
                  </View>
                </View>

                <View style={styles.infoRowDivider} />

                {/* Attendee Info */}
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>PRIMARY ATTENDEE</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {booking.userName}
                    </Text>
                    <Text style={styles.infoSubvalue} numberOfLines={1}>
                      {booking.userEmail}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>AMOUNT PAID</Text>
                    <Text style={styles.priceHighlight}>
                      {booking.totalPrice === 0
                        ? 'FREE'
                        : `$${booking.totalPrice.toFixed(2)}`}
                    </Text>
                    <Text style={styles.infoSubvalue}>
                      ${booking.unitPrice.toFixed(2)} / ticket
                    </Text>
                  </View>
                </View>

                {booking.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Special Requests:</Text>
                    <Text style={styles.notesContent}>{booking.notes}</Text>
                  </View>
                ) : null}
              </View>

              {/* Perforated Divider with Notches */}
              <View style={styles.perforatedRow}>
                <View style={styles.notchLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.notchRight} />
              </View>

              {/* Barcode & Verification Stub */}
              <View style={styles.ticketStub}>
                <Text style={styles.stubLabel}>VERIFICATION CODE</Text>
                <Text style={styles.refCodeText}>{booking.referenceCode}</Text>

                {/* Simulated Barcode Pattern */}
                <View style={styles.barcodeContainer}>
                  {Array.from({ length: 44 }).map((_, idx) => {
                    const isThick = (idx * 7) % 3 === 0;
                    const isMedium = (idx * 5) % 2 === 0;
                    const width = isThick ? 4 : isMedium ? 2.5 : 1.5;
                    const margin = isThick ? 3 : 2;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.barcodeLine,
                          {
                            width,
                            marginRight: margin,
                            opacity: isCancelled ? 0.35 : 0.9,
                          },
                        ]}
                      />
                    );
                  })}
                </View>

                <Text style={styles.stubFooter}>
                  {isCancelled
                    ? 'THIS TICKET HAS BEEN CANCELLED'
                    : 'Show this pass at venue check-in • EventHub Verified'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  ticketContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ticketBanner: {
    height: 140,
    backgroundColor: Colors.primary,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 16,
  },
  ticketImage: {
    ...StyleSheet.absoluteFill,
  },
  ticketImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgeCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketCountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketEventTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  ticketBody: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  infoSubvalue: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  infoRowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  notesBox: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  notesContent: {
    fontSize: 12,
    color: Colors.text,
    fontStyle: 'italic',
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    position: 'relative',
    backgroundColor: Colors.white,
  },
  notchLeft: {
    width: 20,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: Colors.overlay,
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
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: Colors.overlay,
    marginRight: -1,
  },
  ticketStub: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  stubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  refCodeText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 14,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  barcodeLine: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  stubFooter: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionRow: {
    marginTop: 16,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
