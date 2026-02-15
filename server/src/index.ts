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

// CORS configuration - allow frontend origins
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://evaluator.deckster.pro', // Production domain
  /\.vercel\.app$/, // Vercel preview deployments
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/evaluate', evaluateRouter);
app.use('/api/recommendations', recommendationsRouter);

app.listen(PORT, () => {
  console.log(`Deckster server running on http://localhost:${PORT}`);
});
