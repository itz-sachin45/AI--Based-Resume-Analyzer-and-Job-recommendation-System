import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import CareerGuidance from "./pages/CareerGuidance";
import JobRecommendations from "./pages/JobRecommendations";
import SkillGap from "./pages/SkillGap";
import LearningRoadmap from "./pages/LearningRoadmap";
import PerformancePredictor from "./pages/PerformancePredictor";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="resume" element={<ResumeAnalyzer />} />
        <Route path="careers" element={<CareerGuidance />} />
        <Route path="jobs" element={<JobRecommendations />} />
        <Route path="skill-gap" element={<SkillGap />} />
        <Route path="roadmap" element={<LearningRoadmap />} />
        <Route path="performance" element={<PerformancePredictor />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
