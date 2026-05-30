import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/db.js';
import { startWorker } from './queue/queue.js';
import { processRoundUpJob } from './services/roundUpService.js';
import apiRouter from './routes/api.js';

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());
app.use(express.json());

// Main router mount
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// App startup routine
async function bootstrap() {
  try {
    // 1. Initialize and Seed DB (Postgres)
    await initDatabase();

    // 2. Start the Queue-Worker in the background
    // Since startWorker is asynchronous and runs an infinite BLPOP loop, 
    // it will execute in parallel to the Express event loop without blocking HTTP listening.
    startWorker(processRoundUpJob).catch(err => {
      console.error('Queue worker failed to start:', err);
    });

    // 3. Listen for HTTP requests
    app.listen(port, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 FinUp Backend is running on http://localhost:${port}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

bootstrap();
