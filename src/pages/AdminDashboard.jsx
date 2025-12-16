import { useState, useEffect, useMemo } from "react";
import { useSavings } from "../context/SavingsContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const { members, records, fetchMembers, fetchRecords } = useSavings();
  const navigate = useNavigate();

  /* ===================== STATE ===================== */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmAmount, setConfirmAmount] = useState("");
  const [date, setDate] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    fetchMembers();
    fetchRecords();
  }, []);

  /* ===================== HELPERS ===================== */

  const Spinner = () => (
    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
  );

  const getSecondNameInitial = (fullName = "") => {
    const parts = fullName.trim().split(" ");
    return parts.length > 1
      ? parts[1][0].toUpperCase()
      : parts[0]?.[0]?.toUpperCase() || "";
  };

  /* ===================== TOTALS ===================== */

  const grandTotalSavings = useMemo(
    () => records.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [records]
  );

  const membersWithTotals = useMemo(() => {
    return members.map((m) => {
      const total = records
        .filter((r) => r.member === m._id)
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      return { ...m, total };
    });
  }, [members, records]);

  /* ===================== HANDLERS ===================== */

  const handleLogout = () => {
    setLoadingLogout(true);
    localStorage.removeItem("token");
    navigate("/");
    setLoadingLogout(false);
  };

  /* ===================== FIXED ADD MEMBER ===================== */

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoadingAddMember(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      await api.post(
        "/users", // ✅ change to /users/register IF your backend uses that
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role: "member", // ✅ IMPORTANT
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchMembers();

      setName("");
      setEmail("");
      setPassword("");
      setMessage("Member added successfully ✅");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add member. Check server."
      );
    } finally {
      setLoadingAddMember(false);
    }
  };

  /* ===================== ADD SAVINGS ===================== */

  const handleAddSavings = async (e) => {
    e.preventDefault();

    if (amount !== confirmAmount) {
      alert("Amounts do not match");
      return;
    }

    setLoadingSavings(true);
    setError("");
    setMessage("");

    try {
      await api.post("/savings", {
        member: memberId,
        amount: Number(amount),
        date,
      });

      await fetchRecords();

      setMemberId("");
      setAmount("");
      setConfirmAmount("");
      setDate("");
      setMessage("Savings recorded successfully ✅");
    } catch {
      setError("Failed to record savings");
    } finally {
      setLoadingSavings(false);
    }
  };

  /* ===================== JSX ===================== */

  return (
    <div className="min-h-screen bg-bg text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Prayer Centre 2026 Savings
          </h1>

          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="bg-red-600 px-4 py-2 rounded flex gap-2"
          >
            {loadingLogout ? <Spinner /> : "Logout"}
          </button>
        </div>

        {message && <p className="text-green-400 mb-4">{message}</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {/* ADD MEMBER */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Add Member</h2>

          <form onSubmit={handleAddMember} className="flex flex-col gap-3">
            <input
              className="p-2 bg-gray-800 rounded"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="p-2 bg-gray-800 rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="p-2 bg-gray-800 rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              disabled={loadingAddMember}
              className="bg-primary p-2 rounded flex justify-center gap-2"
            >
              {loadingAddMember ? <Spinner /> : "Add Member"}
            </button>
          </form>
        </div>

        {/* MEMBERS LIST */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Members List</h2>

          <table className="w-full bg-gray-800 rounded">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left py-2 px-4">Member</th>
                <th className="text-left py-2 px-4">Total (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              {membersWithTotals.map((m) => (
                <tr key={m._id} className="border-b border-gray-700">
                  <td className="py-2 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {getSecondNameInitial(m.name)}
                    </div>
                    {m.name}
                  </td>
                  <td className="py-2 px-4 text-green-400 font-bold">
                    {m.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
