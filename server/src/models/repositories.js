import { User } from '../models/index.js';
import { generateRef } from '../utils/generateRef.js';

export const UserRepository = {
  create(data) {
    return User.create(data);
  },

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  },

  findById(id) {
    return User.findById(id);
  },

  findByIdWithPassword(id) {
    return User.findById(id).select('+passwordHash');
  },

  update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  updatePasswordHash(id, passwordHash) {
    return User.findByIdAndUpdate(id, { passwordHash }, { new: true });
  },

  async generateUniqueEmail() {
    throw new Error('Not used — emails must be unique per user');
  }
};

export const ReferenceGenerator = {
  booking: () => generateRef('BOK'),
  concierge: () => generateRef('CON'),
  payment: () => generateRef('PAY'),
  ticket: () => generateRef('TCK')
};