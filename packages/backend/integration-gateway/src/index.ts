import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3013;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'integration-gateway' });
});

// TODO: Add FHIR adapters:
// POST /fhir/patient - Sync patient with ABDM
// POST /fhir/teleconsult - Integrate with eSanjeevani
// POST /fhir/maternal - Sync with RCH portal
// POST /fhir/facility - Sync with HMIS

app.listen(port, () => {
  console.log(`✅Integration Gateway running on port ${port}`);
});