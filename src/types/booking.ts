export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  referenceCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  ticketsCount: number;
  unitPrice: number;
  totalPrice: number;
  bookingDate: string;
  status: BookingStatus;
  notes?: string;
}

export interface BookingRequest {
  eventId: string;
  ticketsCount: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  notes?: string;
}
