export const ROLES = ['client', 'owner', 'agent', 'provider', 'employer', 'admin'];

export const USER_STATUSES = ['active', 'suspended', 'pending'];

export const USER_LANGUAGES = ['en', 'fr'];

export const LISTING_STATUSES = ['rent', 'sale', 'short', 'long'];

export const LISTING_TYPES = [
  'apartment',
  'flat',
  'studio',
  'house',
  'villa',
  'duplex',
  'furnished',
  'guest_house',
  'commercial',
  'office',
  'shop',
  'land',
  'other'
];

export const LISTING_STATES = ['pending', 'active', 'suspended', 'removed'];

export const AMENITIES = [
  'furnished',
  'parking',
  'security',
  'water',
  'electricity',
  'generator',
  'internet',
  'pool',
  'air_conditioning',
  'kitchen',
  'bathroom',
  'waste_collection'
];

export const PROVIDER_TYPES = [
  'janitor',
  'caregiver',
  'chef',
  'driver',
  'errand',
  'travel',
  'administrative',
  'bills'
];

// Unified booking/request status lifecycle
export const REQUEST_STATUSES = [
  'submitted',
  'under_review',
  'assigned',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
];

export const CONCIERGE_TYPES = ['errand', 'delivery', 'airport', 'admin', 'travel', 'bill'];

export const JOB_TYPES = ['full_time', 'part_time', 'contract', 'temporary', 'internship', 'remote'];

export const JOB_CATEGORIES = [
  'hospitality',
  'administration',
  'sales',
  'information_technology',
  'construction',
  'healthcare',
  'domestic',
  'security',
  'transportation',
  'customer_service',
  'other'
];

export const JOB_STATUSES = ['active', 'closed'];

export const APPLICATION_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

export const PAYMENT_PROVIDERS = ['mtn', 'orange'];

export const PAYMENT_STATUSES = ['pending', 'processing', 'success', 'failed', 'refunded'];

export const REVIEW_TARGETS = ['listing', 'agent', 'provider', 'employer'];

export const REVIEW_STATUSES = ['active', 'hidden'];

export const NOTIFICATION_CHANNELS = ['in_app', 'email', 'sms', 'whatsapp'];

export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

// Bilingual display: uses labels keyed by language
export const SERVICE_CATEGORIES = [
  { key: 'cleaning', labelEn: 'Cleaning', labelFr: 'Nettoyage', icon: 'cleaning' },
  { key: 'caregiving', labelEn: 'Caregiving', labelFr: 'Soins à domicile', icon: 'caregiving' },
  { key: 'chef', labelEn: 'House Chef', labelFr: 'Cuisinier', icon: 'chef' },
  { key: 'driver', labelEn: 'Driver', labelFr: 'Chauffeur', icon: 'driver' },
  { key: 'errand', labelEn: 'Errands', labelFr: 'Courses', icon: 'errand' },
  { key: 'travel', labelEn: 'Travel Assistance', labelFr: 'Assistance voyage', icon: 'travel' },
  { key: 'administrative', labelEn: 'Administrative', labelFr: 'Administratif', icon: 'admin' },
  { key: 'bills', labelEn: 'Bill Payment', labelFr: 'Paiement de factures', icon: 'bills' }
];