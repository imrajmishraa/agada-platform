import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { AshaDashboard } from '@/pages/AshaDashboard';
import { PatientsListPage } from '@/pages/PatientsListPage';
import { NewPatientPage } from '@/pages/NewPatientPage';
import { PatientProfilePage } from '@/pages/PatientProfilePage';
import { EncounterDetailPage } from '@/pages/EncounterDetailPage';
import { ReferralsListPage } from '@/pages/ReferralsListPage';
import { ReferralDetailPage } from '@/pages/ReferralDetailPage';
import { DoctorDashboard } from '@/pages/DoctorDashboard';
import { DoctorReferralDetailPage } from '@/pages/DoctorReferralDetailPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={['HEALTH_WORKER']} />}>
          <Route path="/asha" element={<AshaDashboard />} />
          <Route path="/asha/patients" element={<PatientsListPage />} />
          <Route path="/asha/patients/new" element={<NewPatientPage />} />
          <Route path="/asha/patients/:id" element={<PatientProfilePage />} />
          <Route path="/asha/encounters/:id" element={<EncounterDetailPage />} />
          <Route path="/asha/referrals" element={<ReferralsListPage />} />
          <Route path="/asha/referrals/:id" element={<ReferralDetailPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/referrals/:id" element={<DoctorReferralDetailPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
