import { User, UserRole } from '../types/user';
import { Event, EventFilter } from '../types/event';
import { Booking, BookingRequest } from '../types/booking';
import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_BOOKINGS } from '../constants/mockData';
import { StorageService } from './storage';

// Helper for realistic network latency
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiService {
  private users: User[] = [];
  private events: Event[] = [];
  private bookings: Booking[] = [];
  private initialized: boolean = false;

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    // Load or initialize events
    const storedEvents = await StorageService.getStoredEvents();
    if (storedEvents && storedEvents.length > 0) {
      this.events = storedEvents;
    } else {
      this.events = [...INITIAL_EVENTS];
      await StorageService.saveStoredEvents(this.events);
    }

    // Load or initialize bookings
    const storedBookings = await StorageService.getStoredBookings();
    if (storedBookings && storedBookings.length > 0) {
      this.bookings = storedBookings;
    } else {
      this.bookings = [...INITIAL_BOOKINGS];
      await StorageService.saveStoredBookings(this.bookings);
    }

    // Users
    this.users = [...INITIAL_USERS];
    this.initialized = true;
  }

  // ==================== AUTH ENDPOINTS ====================

  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    await this.initializeDatabase();
    await delay(350);

    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Save user session in local AsyncStorage
    await StorageService.saveUserSession(user);

    return {
      user,
      token: `jwt_token_${user.id}_${Date.now()}`,
    };
  }

  async register(
    name: string,
    email: string,
    phone: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> {
    await this.initializeDatabase();
    await delay(400);

    const cleanEmail = email.trim().toLowerCase();
    const existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    await StorageService.saveUserSession(newUser);

    return {
      user: newUser,
      token: `jwt_token_${newUser.id}_${Date.now()}`,
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; avatar?: string; role?: UserRole }
  ): Promise<User> {
    await this.initializeDatabase();
    await delay(300);

    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error('User not found.');
    }

    const updated = {
      ...this.users[index],
      ...data,
    };
    this.users[index] = updated;

    // Persist to session
    await StorageService.saveUserSession(updated);
    return updated;
  }

  // ==================== EVENTS ENDPOINTS ====================

  async getEvents(filter?: EventFilter): Promise<Event[]> {
    await this.initializeDatabase();
    await delay(250);

    let result = [...this.events];

    if (filter?.category && filter.category !== 'All') {
      result = result.filter((e) => e.category === filter.category);
    }

    if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    if (filter?.onlyAvailable) {
      result = result.filter((e) => e.availableSeats > 0);
    }

    return result;
  }

  async getEventById(id: string): Promise<Event> {
    await this.initializeDatabase();
    await delay(150);

    const event = this.events.find((e) => e.id === id);
    if (!event) {
      throw new Error('Event not found.');
    }
    return event;
  }

  async createEvent(
    eventData: Omit<
      Event,
      'id' | 'createdAt' | 'availableSeats' | 'organizerId' | 'organizerName'
    > & { address?: string },
    organizer: User
  ): Promise<Event> {
    await this.initializeDatabase();
    await delay(350);

    const newEvent: Event = {
      ...eventData,
      address: eventData.address || eventData.location,
      id: `evt_${Date.now()}`,
      organizerId: organizer.id,
      organizerName: organizer.name,
      availableSeats: eventData.totalSeats,
      createdAt: new Date().toISOString(),
    };

    this.events.unshift(newEvent);
    await StorageService.saveStoredEvents(this.events);
    return newEvent;
  }

  async updateEvent(id: string, updateData: Partial<Event>): Promise<Event> {
    await this.initializeDatabase();
    await delay(300);

    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Event not found.');
    }

    const updated = {
      ...this.events[index],
      ...updateData,
    };
    this.events[index] = updated;
    await StorageService.saveStoredEvents(this.events);
    return updated;
  }

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    await this.initializeDatabase();
    await delay(300);

    this.events = this.events.filter((e) => e.id !== id);
    await StorageService.saveStoredEvents(this.events);
    return { success: true };
  }

  // ==================== BOOKINGS ENDPOINTS ====================

  async createBooking(request: BookingRequest, user: User): Promise<Booking> {
    await this.initializeDatabase();
    await delay(400);

    const event = this.events.find((e) => e.id === request.eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    if (request.ticketsCount <= 0) {
      throw new Error('Please select at least 1 ticket.');
    }

    if (event.availableSeats < request.ticketsCount) {
      throw new Error(
        `Only ${event.availableSeats} tickets available for this event.`
      );
    }

    // Deduct seats
    event.availableSeats -= request.ticketsCount;
    await StorageService.saveStoredEvents(this.events);

    // Create booking record
    const refCode = `EVT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      referenceCode: refCode,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventImage: event.image,
      userId: user.id,
      userName: request.userName,
      userEmail: request.userEmail,
      userPhone: request.userPhone,
      ticketsCount: request.ticketsCount,
      unitPrice: event.price,
      totalPrice: Number((event.price * request.ticketsCount).toFixed(2)),
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      notes: request.notes,
    };

    this.bookings.unshift(newBooking);
    await StorageService.saveStoredBookings(this.bookings);
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    await this.initializeDatabase();
    await delay(200);

    return this.bookings.filter((b) => b.userId === userId);
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    await this.initializeDatabase();
    await delay(350);

    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.status === 'cancelled') {
      throw new Error('This booking is already cancelled.');
    }

    booking.status = 'cancelled';

    // Restore seats to the event
    const event = this.events.find((e) => e.id === booking.eventId);
    if (event) {
      event.availableSeats = Math.min(
        event.totalSeats,
        event.availableSeats + booking.ticketsCount
      );
      await StorageService.saveStoredEvents(this.events);
    }

    await StorageService.saveStoredBookings(this.bookings);
    return booking;
  }

  async getEventAttendees(eventId: string): Promise<Booking[]> {
    await this.initializeDatabase();
    await delay(200);

    return this.bookings.filter((b) => b.eventId === eventId && b.status === 'confirmed');
  }
}

export const api = new ApiService();
