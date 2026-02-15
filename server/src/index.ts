import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import { evaluateRouter } from './routes/evaluate.js';
import { recommendationsRouter } from './routes/recommendations.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/evaluate', evaluateRouter);
app.use('/api/recommendations', recommendationsRouter);

app.listen(PORT, () => {
  console.log(`Deckster server running on http://localhost:${PORT}`);
});
