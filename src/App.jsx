import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/member-dashboard" element={<MemberDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      {/* Redirect unknown paths to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
