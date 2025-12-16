import { useState, useEffect, useMemo } from "react";
import { useSavings } from "../context/SavingsContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const { members, records, fetchMembers, fetchRecords } = useSavings();
  const navigate = useNavigate();

  // Add Member
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Savings
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmAmount, setConfirmAmount] = useState("");
  const [date, setDate] = useState("");

  // Date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // UI
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Loading
  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchRecords();
  }, []);

  const Spinner = () => (
    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
  );

  const getSecondNameInitial = (fullName = "") => {
    const parts = fullName.trim().split(" ");
    return parts.length > 1
      ? parts[1][0].toUpperCase()
      : parts[0]?.[0]?.toUpperCase() || "";
  };

  // Calculate totals per member
  const membersWithTotals = useMemo(() => {
    return members.map((m) => {
      const total = records
        .filter((r) => r.member === m._id)
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      return { ...m, total };
    });
  }, [members, records]);

  const grandTotalSavings = useMemo(
    () => membersWithTotals.reduce((sum, m) => sum + m.total, 0),
    [membersWithTotals]
  );

  const rangeTotal = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return records
      .filter((r) => r.date >= startDate && r.date <= endDate)
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [records, startDate, endDate]);

  const handleLogout = () => {
    setLoadingLogout(true);
    localStorage.removeItem("token");
    navigate("/");
    setLoadingLogout(false);
  };

  // ✅ Add Member Fix
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoadingAddMember(true);
    setError("");
    setMessage("");

    try {
      // Optional: include token if your backend requires auth
      const token = localStorage.getItem("token");

      await api.post(
        "/users", // or "/users/register" depending on your backend
        { name: name.trim(), email: email.trim(), password, role: "member" },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      await fetchMembers();
      setName("");
      setEmail("");
      setPassword("");
      setMessage("Member added successfully ✅");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoadingAddMember(false);
    }
  };

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
      await api.post("/savings", { member: memberId, amount: Number(amount), date });
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

  return (
    <div className="min-h-screen bg-bg text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Prayer Centre 2026 Savings</h1>
          <button onClick={handleLogout} disabled={loadingLogout} className="bg-red-600 px-4 py-2 rounded flex items-center gap-2">
            {loadingLogout ? <Spinner /> : "Logout"}
          </button>
        </div>

        {message && <p className="text-green-400 mb-4">{message}</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-900 p-4 rounded-lg">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 bg-gray-800 rounded" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 bg-gray-800 rounded" />
          <div className="text-center">
            <p>Total in Range</p>
            <p className="text-2xl text-green-400 font-bold">{rangeTotal}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded text-center">
            <p>Total Members</p>
            <p className="text-2xl">{members.length}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <p>Total Records</p>
            <p className="text-2xl">{records.length}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <p>Grand Total</p>
            <p className="text-2xl text-green-400">{grandTotalSavings}</p>
          </div>
        </div>

        {/* Add Member */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Add Member</h2>
          <form onSubmit={handleAddMember} className="flex flex-col gap-3">
            <input className="p-2 bg-gray-800 rounded" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="p-2 bg-gray-800 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="p-2 bg-gray-800 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button disabled={loadingAddMember} className="bg-primary p-2 rounded flex justify-center gap-2">
              {loadingAddMember ? <Spinner /> : "Add Member"}
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Members List</h2>
          <table className="w-full bg-gray-800 rounded">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4 text-left">Member</th>
                <th className="py-2 px-4 text-left">Total (Ksh)</th>
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
                  <td className="py-2 px-4 text-green-400 font-bold">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Record Savings */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Record Daily Savings</h2>
          <form onSubmit={handleAddSavings} className="flex flex-col gap-3">
            <select className="p-2 bg-gray-800 rounded" value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            <input className="p-2 bg-gray-800 rounded" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input className="p-2 bg-gray-800 rounded" type="number" placeholder="Confirm Amount" value={confirmAmount} onChange={(e) => setConfirmAmount(e.target.value)} required />
            <input className="p-2 bg-gray-800 rounded" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <button disabled={loadingSavings} className="bg-accent p-2 rounded flex justify-center gap-2">
              {loadingSavings ? <Spinner /> : "Add Savings"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
