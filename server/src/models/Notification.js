import mongoose from 'mongoose';
import { NOTIFICATION_CHANNELS } from '../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: { type: String, required: true }, // registration, booking, payment, job_application, new_message, status_update...
    channel: { type: String, enum: NOTIFICATION_CHANNELS, default: 'in_app' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;