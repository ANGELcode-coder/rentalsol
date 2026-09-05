import { SupportTicket } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created } from '../utils/response.js';
import { generateRef } from '../utils/generateRef.js';
import { TICKET_STATUSES } from '../config/constants.js';

const TICKET_CATEGORIES = ['complaint', 'question', 'report_listing', 'report_provider', 'refund', 'other'];

// POST /tickets
export const createTicket = asyncHandler(async (req, res) => {
  const { category, subject, message } = req.body;
  if (!subject || !message) throw errors.validation('subject and message are required');
  if (category && !TICKET_CATEGORIES.includes(category)) {
    throw errors.validation('Invalid ticket category', { category: 'invalid' });
  }

  const ticket = await SupportTicket.create({
    ref: generateRef('TCK'),
    userId: req.user.id,
    category: category || 'other',
    subject,
    message,
    status: 'open'
  });

  return created(res, { ticket });
});

// GET /tickets/mine
export const myTickets = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  const total = await SupportTicket.countDocuments(filter);
  const tickets = await SupportTicket.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-messages');
  return ok(res, { tickets }, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
});

// GET /tickets/:ref
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ ref: req.params.ref });
  if (!ticket) throw errors.notFound('Ticket not found');
  const isOwner = ticket.userId.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') throw errors.forbidden('Not your ticket');
  return ok(res, { ticket });
});

// POST /tickets/:ref/messages — reply (client or admin)
export const replyTicket = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body) throw errors.validation('message body is required');

  const ticket = await SupportTicket.findOne({ ref: req.params.ref });
  if (!ticket) throw errors.notFound('Ticket not found');
  const isOwner = ticket.userId.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') throw errors.forbidden('Not your ticket');
  if (['resolved', 'closed'].includes(ticket.status)) {
    throw errors.conflict('Ticket is already resolved or closed');
  }

  ticket.messages.push({ authorId: req.user.id, body, isAdmin: req.user.role === 'admin' });
  ticket.status = ticket.status === 'open' ? 'in_progress' : ticket.status;
  await ticket.save();

  return ok(res, { ticket });
});