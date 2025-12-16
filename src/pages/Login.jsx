import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const role = JSON.parse(localStorage.getItem("user")).role;
      navigate(role === "admin" ? "/admin" : "/member");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-sm text-center">
        {/* Stylish Title */}
        <h1 className="text-3xl font-extrabold text-white mb-8 tracking-wide uppercase">
          Prayer Center Stage Group Savings
        </h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#4B2E2E] to-[#2C1F1F] text-white py-3 rounded font-semibold flex items-center justify-center gap-2 hover:from-[#3e2424] hover:to-[#1f1616] transition"
            >
              {loading ? <Spinner /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
