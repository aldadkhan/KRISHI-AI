import crypto from 'crypto';

const otpStore = new Map();

export async function createOTP(identifier) {
  const otp = String(crypto.randomInt(100000, 1000000));
  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    verified: false
  });

  console.log(`[KRISHI AI DEMO OTP] ${identifier}: ${otp}`);
  return otp;
}

export async function verifyOTP(identifier, otp) {
  const record = otpStore.get(identifier);
  if (!record || record.verified || Date.now() >= record.expiresAt || record.attempts >= 5) {
    return false;
  }

  record.attempts += 1;
  if (record.otp !== otp) return false;

  record.verified = true;
  return true;
}