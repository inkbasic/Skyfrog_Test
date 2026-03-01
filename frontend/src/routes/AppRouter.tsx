import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VehicleListPage from '../pages/VehicleListPage';
import VehicleDetailPage from '../pages/VehicleDetailPage';
import VehicleFormPage from '../pages/VehicleFormPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

          {/* Protected routes */}
          <Route
            path="/vehicles/create"
            element={
              <ProtectedRoute>
                <VehicleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <ProtectedRoute>
                <VehicleFormPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
