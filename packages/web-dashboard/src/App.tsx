import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { AshaDashboard } from '@/pages/AshaDashboard';
import { PatientsListPage } from '@/pages/PatientsListPage';
import { NewPatientPage } from '@/pages/NewPatientPage';
import { PatientProfilePage } from '@/pages/PatientProfilePage';
import { DoctorDashboard } from '@/pages/DoctorDashboard';
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
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
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
