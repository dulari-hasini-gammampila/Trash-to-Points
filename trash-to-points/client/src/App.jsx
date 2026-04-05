/**
 * Here's what this is for:
 * Lists every page in the app and which address (URL) opens it—home, login, resident area, admin area.
 * Also wraps everything with the top bar and footer.
 *
 * How it fits in:
 * When you add a new screen, you wire it up here so the browser knows how to open it.
 *
 * Why it matters:
 * This is the map of the whole website; a mistake here sends people to the wrong page or skips login checks.
 */
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ResidentLayout from "./layouts/ResidentLayout";
import AdminLayout from "./layouts/AdminLayout";

/* Public pages */
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import EventsPage from "./pages/public/EventsPage";
import EventDetails from "./pages/public/EventDetails";
import RewardsPublic from "./pages/public/RewardsPublic";
import Budget from "./pages/public/Budget";
import Login from "./pages/public/Login";
import StaffLogin from "./pages/public/StaffLogin";
import Register from "./pages/public/Register";

/* Resident */
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import NewSubmission from "./pages/resident/NewSubmission";
import Profile from "./pages/resident/Profile";
import PointsPage from "./pages/resident/PointsPage";
import MySubmissions from "./pages/resident/MySubmissions";
import MyRedemptions from "./pages/resident/MyRedemptions";

/* Admin */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStatistics from "./pages/admin/AdminStatistics";
import ManageResidents from "./pages/admin/ManageResidents";
import ManageSubmissions from "./pages/admin/ManageSubmissions";
import ManageBins from "./pages/admin/ManageBins";
import ManageRewards from "./pages/admin/ManageRewards";
import ManageRedemptions from "./pages/admin/ManageRedemptions";
import ManageEvents from "./pages/admin/ManageEvents";

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("ttp_dark") === "1");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("ttp_dark", dark ? "1" : "0");
  }, [dark]);

  return (
    <div className="app-shell">
      <Navbar onToggleDark={() => setDark((d) => !d)} />
      <Routes>
        <Route path="/" element={<div className="main-pad"><Home /></div>} />
        <Route path="/about" element={<div className="main-pad"><About /></div>} />
        <Route path="/events" element={<div className="main-pad"><EventsPage /></div>} />
        <Route path="/event-details" element={<div className="main-pad"><EventDetails /></div>} />
        <Route path="/rewards" element={<div className="main-pad"><RewardsPublic /></div>} />
        <Route path="/budget" element={<div className="main-pad"><Budget /></div>} />
        <Route path="/login" element={<div className="main-pad"><Login /></div>} />
        <Route path="/staff/login" element={<div className="main-pad"><StaffLogin /></div>} />
        <Route path="/register" element={<div className="main-pad"><Register /></div>} />

        <Route
          path="/resident"
          element={
            <ProtectedRoute role="resident">
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="submit" element={<NewSubmission />} />
          <Route path="profile" element={<Profile />} />
          <Route path="points" element={<PointsPage />} />
          <Route path="submissions" element={<MySubmissions />} />
          <Route path="redemptions" element={<MyRedemptions />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="residents" element={<ManageResidents />} />
          <Route path="submissions" element={<ManageSubmissions />} />
          <Route path="bins" element={<ManageBins />} />
          <Route path="rewards" element={<ManageRewards />} />
          <Route path="redemptions" element={<ManageRedemptions />} />
          <Route path="events" element={<ManageEvents />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
