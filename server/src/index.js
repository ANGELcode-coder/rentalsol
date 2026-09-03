import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

const { MONGODB_URI = 'mongodb://127.0.0.1:27017/smooth', PORT = 5000 } = process.env;

async function bootstrap() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
  app.listen(PORT, () => console.log(`SMOOTH API running on port ${PORT}`));
}

bootstrap();

export default app;
