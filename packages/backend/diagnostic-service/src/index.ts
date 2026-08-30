import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv'; 

dotenv.config();

const app = express();
const port = process.env.DIAGNOSTIC_SERVICE_PORT || 3007;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: '✅ok', service: 'diagnostic-service' });
});

app.listen(port, () => {
  console.log(`✅Diagnostic service running on port ${port}`);
});