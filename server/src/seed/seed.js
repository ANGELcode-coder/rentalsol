import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  Listing,
  ServiceProvider,
  ServiceBooking,
  ConciergeRequest,
  Payment,
  Job,
  JobApplication,
  Review,
  Notification,
  Enquiry,
  SupportTicket
} from '../models/index.js';

const { MONGODB_URI = 'mongodb://127.0.0.1:27017/smooth' } = process.env;

const passwordHash = bcrypt.hashSync('Password123!', 10);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Clear existing data (dev only)
  const models = [
    User, Listing, ServiceProvider, ServiceBooking, ConciergeRequest,
    Payment, Job, JobApplication, Review, Notification, Enquiry, SupportTicket
  ];
  await Promise.all(models.map((m) => m.deleteMany({})));
  console.log('Cleared existing data.');

  // --- Users ---
  const [admin, owner, owner2, agent, client, client2, janitor, caregiver, chef, employer, seeker] =
    await User.create([
      { name: 'Admin SMOOTH', email: 'admin@smooth.cm', phone: '+237600000001', passwordHash, role: 'admin', verified: true },
      { name: 'Jean Mbarga', email: 'jean@smooth.cm', phone: '+237677000001', passwordHash, role: 'owner', verified: true, verificationBadge: 'property' },
      { name: 'Claire Etoa', email: 'claire@smooth.cm', phone: '+237677000002', passwordHash, role: 'owner', verified: true, verificationBadge: 'property' },
      { name: 'Agent Kouam', email: 'agent@smooth.cm', phone: '+237677000003', passwordHash, role: 'agent', verified: true, verificationBadge: 'agent' },
      { name: 'Pauline Ngo', email: 'pauline@smooth.cm', phone: '+237699000001', passwordHash, role: 'client' },
      { name: 'Marc Tchana', email: 'marc@smooth.cm', phone: '+237699000002', passwordHash, role: 'client' },
      { name: 'Martine Fossi', email: 'martine@smooth.cm', phone: '+237699000003', passwordHash, role: 'provider', verified: true, verificationBadge: 'provider' },
      { name: 'Etienne Bello', email: 'etienne@smooth.cm', phone: '+237699000004', passwordHash, role: 'provider', verified: true, verificationBadge: 'provider' },
      { name: 'Chef Amadou', email: 'amadou@smooth.cm', phone: '+237699000005', passwordHash, role: 'provider', verified: true, verificationBadge: 'provider' },
      { name: 'Kamga Industries', email: 'hr@kamga.cm', phone: '+237699000006', passwordHash, role: 'employer', verified: true, verificationBadge: 'employer' },
      { name: 'Sonia Abena', email: 'sonia@smooth.cm', phone: '+237699000007', passwordHash, role: 'client' }
    ]);

  // --- Listings ---
  const [l1, l2, l3, l4] = await Listing.create([
    {
      ownerId: owner._id, title: '2-bedroom apartment in Bonapriso',
      description: 'Modern furnished apartment near Akwa, ideal for families.',
      category: 'apartment', status: 'rent', address: 'Rue Bonapriso, Douala',
      city: 'Douala', neighbourhood: 'Bonapriso', size: 85, bedrooms: 2, bathrooms: 2,
      furnished: true, amenities: ['furnished', 'parking', 'security', 'water', 'electricity', 'internet'],
      price: 250000, photos: ['https://placehold.co/800x600'], verified: true, state: 'active'
    },
    {
      ownerId: owner2._id, title: 'Studio in Bastos',
      description: 'Cosy studio close to university, ideal for students.',
      category: 'studio', status: 'rent', address: 'Quartier Bastos, Yaoundé',
      city: 'Yaoundé', neighbourhood: 'Bastos', size: 40, bedrooms: 1, bathrooms: 1,
      furnished: true, amenities: ['furnished', 'electricity', 'water'],
      price: 80000, photos: ['https://placehold.co/800x600'], verified: true, state: 'active'
    },
    {
      ownerId: agent._id, title: 'Commercial office space in Akwa',
      description: 'Open-plan office for lease in business district.',
      category: 'commercial', status: 'long', address: 'Akwa, Douala',
      city: 'Douala', neighbourhood: 'Akwa', size: 200, bedrooms: 0, bathrooms: 2,
      furnished: false, amenities: ['security', 'parking', 'electricity', 'internet'],
      price: 600000, photos: ['https://placehold.co/800x600'], verified: true, state: 'active'
    },
    {
      ownerId: owner._id, title: '3-bedroom house in Buea',
      description: 'Standalone house with garden, near University of Buea.',
      category: 'house', status: 'rent', address: 'Bokwango, Buea',
      city: 'Buea', neighbourhood: 'Bokwango', size: 150, bedrooms: 3, bathrooms: 2,
      furnished: false, amenities: ['security', 'water', 'electricity', 'parking'],
      price: 200000, photos: ['https://placehold.co/800x600'], verified: false, state: 'pending'
    }
  ]);

  // --- Service providers ---
  const [pJanitor, pCaregiver, pChef] = await ServiceProvider.create([
    {
      userId: janitor._id, type: 'janitor', bio: 'Professional cleaning services in Douala.',
      skills: ['house_cleaning', 'deep_cleaning', 'offce_cleaning'], experienceYears: 4,
      availability: [{ day: 'monday', start: '08:00', end: '17:00' }],
      serviceAreas: ['Douala'], languages: ['en', 'fr'],
      pricing: { hourly: 5000, daily: 20000 }, verified: true
    },
    {
      userId: caregiver._id, type: 'caregiver', bio: 'Trusted elderly and childcare.',
      skills: ['elderly_care', 'childcare'], experienceYears: 6,
      availability: [{ day: 'tuesday', start: '08:00', end: '18:00' }],
      serviceAreas: ['Yaoundé'], languages: ['fr', 'en'],
      pricing: { hourly: 6000, monthly: 150000 }, verified: true
    },
    {
      userId: chef._id, type: 'chef', bio: 'Cameroonian & continental cuisine.',
      skills: ['family_meals', 'events', 'weddings'], experienceYears: 8,
      availability: [{ day: 'saturday', start: '10:00', end: '20:00' }],
      serviceAreas: ['Douala', 'Yaoundé'], languages: ['fr', 'en'],
      pricing: { daily: 30000 }, verified: true
    }
  ]);

  // --- Bookings ---
  await ServiceBooking.create([
    {
      ref: 'BOK-SEED-001', serviceType: 'cleaning', customerId: client._id, providerId: pJanitor._id,
      location: 'Bonapriso, Douala', city: 'Douala', date: new Date('2026-09-20'), time: '09:00',
      duration: '4h', frequency: 'weekly', requirements: 'Focus on kitchen and bathrooms',
      price: 20000, status: 'completed', paymentStatus: 'paid'
    },
    {
      ref: 'BOK-SEED-002', serviceType: 'caregiving', customerId: client2._id, providerId: pCaregiver._id,
      location: 'Bastos, Yaoundé', city: 'Yaoundé', date: new Date('2026-09-22'), time: '08:00',
      duration: '8h', requirements: 'Elderly care, medication reminders', price: 48000,
      status: 'confirmed', paymentStatus: 'pending'
    }
  ]);

  // --- Concierge requests ---
  await ConciergeRequest.create([
    {
      ref: 'CON-SEED-001', userId: client._id, type: 'airport',
      details: 'Pickup at Douala International Airport, flight AF123 at 14:35.',
      location: 'DLA Airport', city: 'Douala', date: new Date('2026-09-25'), time: '14:00',
      cost: 15000, status: 'submitted'
    },
    {
      ref: 'CON-SEED-002', userId: client2._id, type: 'bill',
      details: 'Pay my ENEO electricity bill, customer ID 993445.',
      city: 'Yaoundé', cost: 25000, status: 'under_review'
    }
  ]);

  // --- Jobs ---
  const [job1, job2] = await Job.create([
    {
      employerId: employer._id, title: 'Residential Cleaner', category: 'domestic',
      location: 'Douala', city: 'Douala', type: 'full_time',
      description: 'Clean residential apartments in Akwa. Experience preferred.',
      requirements: 'Attention to detail, references required.', salary: '60,000 - 80,000 XAF',
      status: 'active', featured: true
    },
    {
      employerId: employer._id, title: 'Receptionist (Bilingual)', category: 'customer_service',
      location: 'Yaoundé', city: 'Yaoundé', type: 'full_time',
      description: 'Welcome clients and manage appointments in English and French.',
      requirements: 'Fluency in EN + FR, MS Office basics.', salary: '100,000 - 150,000 XAF',
      status: 'active'
    }
  ]);

  const [cvUrl] = ['https://private.bucket.smooth.cm/cv/sonia.pdf'];
  await JobApplication.create([
    {
      jobId: job1._id, seekerId: seeker._id, cvUrl,
      coverLetter: 'I have 3 years of cleaning experience in Douala.', status: 'pending'
    }
  ]);

  // --- Payments ---
  await Payment.create([
    {
      ref: 'PAY-SEED-001', userId: client._id, provider: 'mtn', amount: 20000,
      bookingRef: 'BOK-SEED-001', description: 'Cleaning service', phone: '+237699000001',
      status: 'success', transactionId: 'MTN-TX-001'
    }
  ]);

  // --- Reviews ---
  await Review.create([
    {
      targetType: 'listing', targetId: l1._id, targetModel: 'Listing',
      userId: client._id, rating: 5, comment: 'Clean, secure and spacious.', verifiedBooking: true
    },
    {
      targetType: 'provider', targetId: pJanitor._id, targetModel: 'ServiceProvider',
      userId: client._id, rating: 5, comment: 'Thorough and punctual.', verifiedBooking: true
    }
  ]);

  // --- Notifications ---
  await Notification.create([
    {
      userId: client._id, type: 'payment', channel: 'in_app',
      title: 'Payment confirmed', message: 'Your payment of FCFA 20,000 was successful.'
    },
    {
      userId: client._id, type: 'booking', channel: 'in_app',
      title: 'Booking received', message: 'Your cleaning booking BOK-SEED-002 is confirmed.'
    }
  ]);

  // --- Enquiries ---
  await Enquiry.create([
    {
      listingId: l2._id, userId: client._id, channel: 'whatsapp',
      whatsappNumber: '+237699000001', message: 'Is the studio still available?', status: 'new'
    }
  ]);

  // --- Support tickets ---
  await SupportTicket.create([
    {
      ref: 'TCK-SEED-001', userId: client._id, category: 'question',
      subject: 'How do I pay?', message: 'Which providers are supported?',
      status: 'resolved', resolution: 'MTN Mobile Money and Orange Money are supported.'
    }
  ]);

  console.log('Seed complete. Sample accounts:');
  console.log('  admin-admin@smooth.cm / owner-owner@smooth.cm / client-client@smooth.cm');
  console.log('  (all passwords: Password123!)');
  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error('Seed failed:', e);
  await mongoose.disconnect();
  process.exit(1);
});