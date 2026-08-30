import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv'; 

dotenv.config();

const app = express();
const port = process.env.QUEUE_SERVICE_PORT || 3008;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: '✅ok', service: 'queue-service' });
});

app.listen(port, () => {
  console.log(`✅Queue service running on port ${port}`);
});