import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/db.js';
import { startWorker } from './queue/queue.js';
import { processRoundUpJob } from './services/roundUpService.js';
import apiRouter from './routes/api.js';

const app = express();
const port = process.env.PORT || 5000;

// Frontend entegrasyonu için CORS'u etkinleştir
app.use(cors());
app.use(express.json());

// Ana yönlendirici bağlama noktası
app.use('/api', apiRouter);

// Sağlık kontrolü uç noktası
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Uygulama başlatma rutini
async function bootstrap() {
  try {
    // 1. Veritabanını başlat ve örnek veri yükle (Postgres)
    await initDatabase();

    // 2. Kuyruk-Worker'ı arka planda başlat
    // startWorker asenkron olduğu ve sonsuz BLPOP döngüsü çalıştırdığı için,
    // Express olay döngüsüne paralel olarak HTTP dinlemeyi engellemeden çalışır.
    startWorker(processRoundUpJob).catch(err => {
      console.error('Queue worker failed to start:', err);
    });

    // 3. HTTP isteklerini dinle
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
