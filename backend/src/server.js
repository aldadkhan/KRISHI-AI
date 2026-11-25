import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.resolve('uploads')));

fs.mkdirSync('uploads', { recursive: true });

import authRoutes from './routes/auth.js';
import farmerRoutes from './routes/farmer.js';
import aiRoutes from './routes/ai.js';
import schemeRoutes from './routes/schemes.js';
import weatherRoutes from './routes/weather.js';
import adminRoutes from './routes/admin.js';
import { getFarmerCount } from './services/demoStore.js';

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'KRISHI AI Backend' }));
app.get('/api/public/stats', (_, res) => res.json({ registeredFarmers: getFarmerCount(), scope: 'Krishi AI platform accounts, not a statewide census' }));
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`KRISHI AI backend running on http://localhost:${port}`));
