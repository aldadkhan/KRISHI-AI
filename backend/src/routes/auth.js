import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createOTP, verifyOTP } from '../services/otp.js';
import { addOtpUser, addUser, getUser, updateUserProfile } from '../services/demoStore.js';

const router = express.Router();

const normalizeEmail = value => String(value || '').trim().toLowerCase();
const publicUser = ({ passwordHash, ...user }) => user;

function issueToken(user) {
  return jwt.sign(
    { id: user.id, identifier: user.identifier, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'demo-secret-key',
    { expiresIn: '7d' }
  );
}

async function createAccount({ name, email, password, role = 'farmer' }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return addUser({ name, email, passwordHash, role });
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (name.length < 2 || !email.includes('@') || password.length < 8) {
      return res.status(400).json({ message: 'Enter your name, a valid email, and a password with at least 8 characters.' });
    }
    if (getUser(email)) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });

    const user = await createAccount({ name, email, password });
    res.status(201).json({ token: issueToken(user), farmer: publicUser(user) });
  } catch (err) {
    console.error('Error registering farmer:', err);
    res.status(500).json({ message: 'Unable to create the account right now.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@krishiai.local');
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    let user = getUser(email);

    if (adminPassword && email === adminEmail && password === adminPassword) {
      if (!user) {
        user = await createAccount({ name: 'Demo NGO Administrator', email, password, role: 'admin' });
      } else if (user.role !== 'admin' || !user.passwordHash || !(await bcrypt.compare(adminPassword, user.passwordHash))) {
        user = updateUserProfile(user.id, {
          role: 'admin',
          passwordHash: await bcrypt.hash(adminPassword, 10)
        });
      }
    } else if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    res.json({ token: issueToken(user), farmer: publicUser(user) });
  } catch (err) {
    console.error('Error signing in:', err);
    res.status(500).json({ message: 'Unable to sign in right now.' });
  }
});

router.post('/admin/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const registrationKey = String(req.body.registrationKey || '');
    const expectedKey = process.env.ADMIN_REGISTRATION_KEY || '';
    if (!expectedKey || registrationKey !== expectedKey) return res.status(403).json({ message: 'Admin registration key is incorrect or not configured.' });
    if (name.length < 2 || !email.includes('@') || password.length < 8) {
      return res.status(400).json({ message: 'Enter your name, a valid email, and a password with at least 8 characters.' });
    }
    if (getUser(email)) return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await createAccount({ name, email, password, role: 'admin' });
    res.status(201).json({ token: issueToken(user), farmer: publicUser(user) });
  } catch (err) {
    console.error('Error registering administrator:', err);
    res.status(500).json({ message: 'Unable to create the administrator account right now.' });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const identifier = String(req.body.identifier || '').trim().toLowerCase();
    if (!identifier || identifier.length < 5) {
      return res.status(400).json({ message: 'Enter a valid mobile number or email.' });
    }
    await createOTP(identifier);
    res.json({ success: true, message: 'OTP sent. In demo mode, check the backend terminal.' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP. Check backend logs.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const identifier = String(req.body.identifier || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!(await verifyOTP(identifier, otp))) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    const farmer = addOtpUser(identifier);
    res.json({ token: issueToken(farmer), farmer: publicUser(farmer) });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Failed to verify OTP. Check backend logs.' });
  }
});

export default router;
