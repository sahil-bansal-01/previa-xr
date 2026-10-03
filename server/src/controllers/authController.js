import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: true, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
    });

    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Convenient Demo Login endpoint for instant hackathon evaluation
export async function demoLogin(req, res, next) {
  try {
    let demoUser = await UserModel.findOne({ email: 'demo@previa.xr' });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('previa2026', 10);
      demoUser = await UserModel.create({
        name: 'PREVIA Demo Operator',
        email: 'demo@previa.xr',
        passwordHash,
        role: 'operator',
      });
    }

    const token = generateToken({
      id: demoUser._id || demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
    });

    res.json({
      success: true,
      message: 'Logged in as PREVIA XR Demo Operator.',
      token,
      user: {
        id: demoUser._id || demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}
