import { Notification } from '../models/index.js';
import { ok, message } from '../utils/response.js';
import { asyncHandler } from '../utils/apiError.js';

// GET /notifications/mine
export const myNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user.id };
  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const unread = await Notification.countDocuments({ userId: req.user.id, read: false });
  return ok(res, { notifications, unread }, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
});

// GET /notifications/unread-count
export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, read: false });
  return ok(res, { count });
});

// PUT /notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const result = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true, readAt: new Date() },
    { new: true }
  );
  if (!result) return ok(res, { notification: null });
  return ok(res, { notification: result });
});

// PUT /notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true, readAt: new Date() }
  );
  return message(res, 'All notifications marked as read');
});