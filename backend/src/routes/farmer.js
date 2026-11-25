import express from 'express';
import { isDatabaseConfigured, pool } from '../config/db.js';
import { auth } from '../middleware/auth.js';
import { getUser, getUserById, updateUserProfile } from '../services/demoStore.js';

const router = express.Router();

function demoProfile(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    identifier: user.identifier,
    mobile: null,
    email: user.email,
    district: user.district,
    panchayat: null,
    preferred_language: user.preferred_language,
    main_crop: user.main_crop,
    land_area: null,
    created_at: user.created_at
  };
}

function getSignedInUser(req) {
  return getUserById(req.user.id) || getUser(req.user.identifier);
}

async function withDatabaseFallback(req, operation, fallbackValue) {
  if (!isDatabaseConfigured() || !pool) {
    return fallbackValue;
  }

  try {
    return await operation();
  } catch (error) {
    return fallbackValue;
  }
}

router.get('/profile', auth, async (req, res) => {
  const demoUser = getSignedInUser(req);
  const profile = await withDatabaseFallback(req, async () => {
    const { rows } = await pool.query(
      `SELECT id, name, identifier, mobile, email, district, panchayat,
              preferred_language, main_crop, land_area, created_at
       FROM farmers WHERE id=$1`,
      [req.user.id]
    );
    return rows[0] || demoProfile(demoUser);
  }, demoProfile(demoUser));

  return res.json(profile);
});

router.put('/profile', auth, async (req, res) => {
  const { name, district, panchayat, preferred_language, main_crop, land_area, mobile, email } = req.body;
  const demoUser = getSignedInUser(req);
  const profile = await withDatabaseFallback(req, async () => {
    const { rows } = await pool.query(
      `UPDATE farmers SET name=$1,district=$2,panchayat=$3,preferred_language=$4,
       main_crop=$5,land_area=$6,mobile=$7,email=$8,identifier=COALESCE($8,identifier) WHERE id=$9
       RETURNING id, name, identifier, mobile, email, district, panchayat,
                 preferred_language, main_crop, land_area, created_at`,
      [name, district, panchayat, preferred_language, main_crop, land_area || null, mobile || null, email || null, req.user.id]
    );
    return rows[0];
  }, demoProfile(updateUserProfile(req.user.id, {
    name,
    district,
    email: email || demoUser?.email || req.user.identifier,
    preferred_language: preferred_language || demoUser?.preferred_language || 'en',
    main_crop,
    identifier: email || demoUser?.identifier || req.user.identifier
  })));

  return res.json(profile);
});

export default router;
