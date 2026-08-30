import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';  // ← changed from 'import dotenv from 'dotenv''

dotenv.config();

const app = express();
const port = process.env.TELEMED_SERVICE_PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: '✅ok', service: 'telemed-service' });
});

app.listen(port, () => {
  console.log(`✅Telemed service running on port ${port}`);
});