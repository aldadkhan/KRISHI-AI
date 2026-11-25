import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { getAdvisory } from '../services/ai.js';
import { addQuery, getUser, queryRecords } from '../services/demoStore.js';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  }
});
const router = express.Router();

router.post('/query', auth, upload.single('image'), async (req, res) => {
  const { question, language='en', crop='', district='' } = req.body;
  if (!String(question || '').trim()) return res.status(400).json({ message: 'Question is required.' });

  const advisory = await getAdvisory({ question, language, crop, district });
  const farmer = getUser(req.user.identifier);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const record = addQuery({
    farmer_id: req.user.id,
    farmer_name: farmer?.name || 'OTP farmer',
    identifier: farmer?.identifier || req.user.identifier,
    query_text: String(question).trim(),
    language,
    crop,
    district,
    image_url: imageUrl,
    ai_response: advisory.answer,
    confidence: advisory.confidence,
    status: advisory.needsOfficer ? 'escalation_recommended' : 'answered'
  });
  res.json({ ...advisory, queryId: record.id, imageUrl, imageNote: imageUrl ? 'The image is attached to this request, but this demo advisory engine does not analyze images.' : null });
});

router.post('/image', auth, upload.single('image'), async (req, res) => {
  res.json({
    message: 'Image received. Connect a verified crop-disease vision model here.',
    file: req.file?.filename || null,
    confidence: 0,
    needsOfficer: true
  });
});

router.get('/history', auth, async (req, res) => {
  res.json(queryRecords.filter(record => record.farmer_id === req.user.id).slice(0, 50));
});

export default router;
