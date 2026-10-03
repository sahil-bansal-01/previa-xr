import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isConnectedToMongo, memoryStore } from '../config/db.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'operator' },
  createdAt: { type: Date, default: Date.now },
});

// Password verification method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const MongooseUser = mongoose.model('User', UserSchema);

// Resilient Unified User Model
export const UserModel = {
  async findOne({ email }) {
    if (isConnectedToMongo) {
      return await MongooseUser.findOne({ email: email.toLowerCase() });
    }
    const user = memoryStore.collections.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return {
      ...user,
      comparePassword: async (pwd) => bcrypt.compare(pwd, user.passwordHash),
    };
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseUser.findById(id).select('-passwordHash');
    }
    const user = memoryStore.collections.users.find(u => u._id === id || u.id === id);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  },

  async create({ name, email, passwordHash, role = 'operator' }) {
    if (isConnectedToMongo) {
      const user = new MongooseUser({ name, email: email.toLowerCase(), passwordHash, role });
      await user.save();
      return user;
    }
    const newUser = {
      _id: memoryStore.generateId(),
      id: undefined,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: new Date(),
    };
    newUser.id = newUser._id;
    memoryStore.collections.users.push(newUser);
    return {
      ...newUser,
      comparePassword: async (pwd) => bcrypt.compare(pwd, newUser.passwordHash),
    };
  },

  async count() {
    if (isConnectedToMongo) {
      return await MongooseUser.countDocuments();
    }
    return memoryStore.collections.users.length;
  }
};

export default MongooseUser;
