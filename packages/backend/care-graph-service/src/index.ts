import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv'; 

dotenv.config();

const app = express();
const port = process.env.CARE_GRAPH_SERVICE_PORT || 3011;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: '✅ok', service: 'care-graph-service' });
});

app.listen(port, () => {
  console.log(`✅Care-graph service running on port ${port}`);
});