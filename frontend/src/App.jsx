import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import EsewaCallbackPage from "./pages/EsewaCallbackPage";
import KhaltiCallbackPage from "./pages/KhaltiCallbackPage";

const PrivateRoute = ({ children, roles }) => {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <PrivateRoute>
              <OrderConfirmationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard"
          element={
            <PrivateRoute roles={["vendor"]}>
              <VendorDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={["admin"]}>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminPage />
            </PrivateRoute>
          }
        />
        {/* Payment callbacks — public so gateway can redirect without auth headers */}
        <Route
          path="/payment/esewa/success"
          element={<EsewaCallbackPage type="success" />}
        />
        <Route
          path="/payment/esewa/failure"
          element={<EsewaCallbackPage type="failure" />}
        />
        <Route path="/payment/khalti/verify" element={<KhaltiCallbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
