import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MemberDashboard from "./pages/MemberDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/member-dashboard" element={<MemberDashboard />} />
    </Routes>
  );
}

export default App;
