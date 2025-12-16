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

  // Record Savings
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmAmount, setConfirmAmount] = useState("");
  const [date, setDate] = useState("");

  // Date Range
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

  // Member totals
  const membersWithTotals = useMemo(
    () =>
      members.map((m) => {
        const total = records
          .filter((r) => r.member?._id === m._id || r.member === m._id)
          .reduce((sum, r) => sum + Number(r.amount || 0), 0);
        return { ...m, total };
      }),
    [members, records]
  );

  const grandTotalSavings = useMemo(
    () => membersWithTotals.reduce((sum, m) => sum + m.total, 0),
    [membersWithTotals]
  );

  // Date range total
  const rangeTotal = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return records
      .filter((r) => {
        const rDate = new Date(r.date);
        return rDate >= start && rDate <= end;
      })
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [startDate, endDate, records]);

  // Logout
  const handleLogout = () => {
    setLoadingLogout(true);
    localStorage.removeItem("user");
    window.location.reload();
    setLoadingLogout(false);
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoadingAddMember(true);
    setError("");
    setMessage("");
    try {
      await api.post("/auth/register", { name, email, password, role: "member" });
      setMessage("Member added successfully!");
      setName("");
      setEmail("");
      setPassword("");
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding member");
    } finally {
      setLoadingAddMember(false);
    }
  };

  // Record Savings
  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!memberId || !amount || !confirmAmount || !date) return;
    if (Number(amount) !== Number(confirmAmount)) {
      setError("Amounts do not match");
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
      setAmount("");
      setConfirmAmount("");
      setDate("");
      setMemberId("");
      setMessage("Savings recorded successfully!");
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || "Error recording savings");
    } finally {
      setLoadingSavings(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-bg text-white p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-center sm:text-left">Prayer Centre 2026 Savings</h1>
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2"
          >
            {loadingLogout ? <Spinner /> : "Logout"}
          </button>
        </div>

        {message && <p className="text-center text-green-400 mb-4">{message}</p>}
        {error && <p className="text-center text-red-400 mb-4">{error}</p>}

        {/* Date Range Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-900 p-4 rounded-lg shadow-lg">
          <div className="flex flex-col">
            <label className="mb-1 text-sm">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div className="flex flex-col justify-center text-center">
            <label className="mb-1 text-sm">Total in Range (Ksh)</label>
            <p className="text-2xl text-green-400 font-bold">{rangeTotal}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-around mb-6 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center flex-1">
            <h2 className="text-xl font-semibold">Total Members</h2>
            <p className="text-2xl">{members.length}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center flex-1">
            <h2 className="text-xl font-semibold">Total Records</h2>
            <p className="text-2xl">{records.length}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center flex-1">
            <h2 className="text-xl font-semibold">Grand Total Savings (Ksh)</h2>
            <p className="text-2xl text-green-400">{grandTotalSavings}</p>
          </div>
        </div>

        {/* Add Member */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Member</h2>
          <form className="flex flex-col gap-3" onSubmit={handleAddMember}>
            <input
              className="p-2 rounded bg-white text-black placeholder-gray-500"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="p-2 rounded bg-white text-black placeholder-gray-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="p-2 rounded bg-white text-black placeholder-gray-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              disabled={loadingAddMember}
              className="bg-white text-black hover:bg-green-500 hover:text-white p-2 rounded transition flex justify-center gap-2"
            >
              {loadingAddMember ? <Spinner /> : "Add Member"}
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Members List</h2>
          <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Total Savings (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              {membersWithTotals.map((m) => (
                <tr key={m._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-2 px-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {getSecondNameInitial(m.name)}
                    </div>
                    {m.name}
                  </td>
                  <td className="py-2 px-4 text-green-400">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Record Savings */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Record Daily Savings</h2>
          <form className="flex flex-col gap-3" onSubmit={handleAddSavings}>
            <select
              className="p-2 rounded bg-white text-black"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            <input
              className="p-2 rounded bg-white text-black placeholder-gray-500"
              type="number"
              placeholder="Amount Saved"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              className="p-2 rounded bg-white text-black placeholder-gray-500"
              type="number"
              placeholder="Confirm Amount"
              value={confirmAmount}
              onChange={(e) => setConfirmAmount(e.target.value)}
              required
            />
            <input
              className="p-2 rounded bg-white text-black"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <button
              disabled={loadingSavings}
              className="bg-white text-black hover:bg-green-500 hover:text-white p-2 rounded transition flex justify-center gap-2"
            >
              {loadingSavings ? <Spinner /> : "Add Savings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
