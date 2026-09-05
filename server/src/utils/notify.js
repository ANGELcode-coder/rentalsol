// In-app notification helper — centralize creation so business logic can notify users.
export async function notifyUser(userId, { type, title, message = '', link = '', channel = 'in_app' }) {
  if (!userId) return null;
  try {
    const { Notification } = await import('../models/index.js');
    return await Notification.create({ userId, type, title, message, link, channel });
  } catch (err) {
    console.error('[notify] failed:', err.message);
    return null;
  }
}