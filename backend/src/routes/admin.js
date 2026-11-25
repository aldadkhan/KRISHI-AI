import express from 'express';
import { auth } from '../middleware/auth.js';
import { getFarmerCount, queryRecords, users } from '../services/demoStore.js';
const router = express.Router();

router.get('/stats', auth, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' });
  const farmers = [...users.values()].filter(user => user.role === 'farmer').map(({ passwordHash, ...farmer }) => farmer);
  const districts = Object.values(queryRecords.reduce((counts, record) => {
    const district = record.district || 'Unknown';
    counts[district] ||= { district, count: 0 };
    counts[district].count += 1;
    return counts;
  }, {})).sort((a, b) => b.count - a.count);
  res.json({
    farmers: getFarmerCount(),
    farmerAccounts: farmers,
    queries: queryRecords.length,
    answered: queryRecords.filter(record => record.status === 'answered').length,
    escalated: queryRecords.filter(record => record.status !== 'answered').length,
    languages: Object.entries(queryRecords.reduce((counts, record) => {
      counts[record.language] = (counts[record.language] || 0) + 1;
      return counts;
    }, {})).map(([language, count]) => ({ language, count })),
    districts,
    queryRecords
  });
});
export default router;
