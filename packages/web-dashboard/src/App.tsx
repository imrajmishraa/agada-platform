import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { AshaDashboard } from '@/pages/AshaDashboard';
import { PatientsListPage } from '@/pages/PatientsListPage';
import { NewPatientPage } from '@/pages/NewPatientPage';
import { PatientProfilePage } from '@/pages/PatientProfilePage';
import { EncounterDetailPage } from '@/pages/EncounterDetailPage';
import { ReferralsListPage } from '@/pages/ReferralsListPage';
import { ReferralDetailPage } from '@/pages/ReferralDetailPage';
import { SyncPage } from '@/pages/SyncPage';
import { FacilityDashboard } from '@/pages/FacilityDashboard';
import { DoctorDashboard } from '@/pages/DoctorDashboard';
import { DoctorReferralDetailPage } from '@/pages/DoctorReferralDetailPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { OfflineProvider } from '@/lib/offline/online';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <OfflineProvider>
        <OfflineBanner />
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
          <Route path="/asha/sync" element={<SyncPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/referrals/:id" element={<DoctorReferralDetailPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/facility" element={<FacilityDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </OfflineProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
