import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';  // ← changed from 'import dotenv from 'dotenv''

dotenv.config();

const app = express();
const port = process.env.PATIENT_SERVICE_PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: '✅ok', service: 'patient-service' });
});

app.listen(port, () => {
  console.log(`✅Patient service running on port ${port}`);
});