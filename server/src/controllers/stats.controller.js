import {
  User, Listing, ServiceProvider, ServiceBooking, ConciergeRequest,
  Payment, Review, Job, JobApplication, SupportTicket, Enquiry
} from '../models/index.js';
import { ok } from '../utils/response.js';
import { asyncHandler } from '../utils/apiError.js';

// GET /admin/stats/overview — headline numbers
export const statsOverview = asyncHandler(async (req, res) => {
  const [users, pendingUsers, listings, activeListings, providers, bookings, pendingBookings,
         concierge, payments, totalRevenue, reviews, jobs, applications, tickets, openTickets, enquiries] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'pending' }),
      Listing.countDocuments(),
      Listing.countDocuments({ state: 'active' }),
      ServiceProvider.countDocuments(),
      ServiceBooking.countDocuments(),
      ServiceBooking.countDocuments({ status: { $in: ['submitted', 'under_review', 'assigned'] } }),
      ConciergeRequest.countDocuments(),
      Payment.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Review.countDocuments(),
      Job.countDocuments(),
      JobApplication.countDocuments(),
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Enquiry.countDocuments()
    ]);

  return ok(res, {
    overview: {
      users, pendingUsers, listings, activeListings, providers, bookings, pendingBookings,
      concierge, payments,
      totalRevenueXaf: totalRevenue.length ? totalRevenue[0].total : 0,
      reviews, jobs, applications, tickets, openTickets, enquiries
    }
  });
});

// GET /admin/stats/revenue — revenue breakdown by provider and by month
export const revenueStats = asyncHandler(async (req, res) => {
  const [byProvider, byMonth] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: '$provider', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);
  return ok(res, { byProvider, byMonth });
});

// GET /admin/stats/listings — listings breakdown by status/type/city
export const listingStats = asyncHandler(async (req, res) => {
  const [byState, byStatus, byCity, topListings] = await Promise.all([
    Listing.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]),
    Listing.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Listing.aggregate([{ $group: { _id: '$city', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
    Listing.aggregate([{ $match: { state: 'active' } }, { $sort: { viewCount: -1 } }, { $limit: 10 }])
  ]);
  return ok(res, { byState, byStatus, byCity, topListings });
});