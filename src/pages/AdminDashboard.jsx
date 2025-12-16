import { useState, useEffect } from "react";
import { useSavings } from "../context/SavingsContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const {
    members,
    records,
    fetchMembers,
    fetchRecords,
  } = useSavings();

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

  // Date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // UI
  const [message, setMessage] = useState("");

  // Loading states
  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchRecords();
  }, []);

  // Spinner
  const Spinner = () => (
    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
  );

  // Totals
  const grandTotalSavings = records.reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );

  const membersWithTotals = members.map((m) => {
    const total = records
      .filter((r) => r.member === m._id)
      .reduce((sum, r) => sum + Number(r.amount), 0);
    return { ...m, total };
  });

  const rangeTotal = records
    .filter((r) => {
      if (!startDate || !endDate) return false;
      return r.date >= startDate && r.date <= endDate;
    })
    .reduce((sum, r) => sum + Number(r.amount), 0);

  // Handlers
  const handleLogout = async () => {
    setLoadingLogout(true);
    localStorage.removeItem("token");
    navigate("/");
    setLoadingLogout(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoadingAddMember(true);

    try {
      await api.post("/users", { name, email, password });
      setName("");
      setEmail("");
      setPassword("");
      setMessage("Member added successfully");
      fetchMembers();
    } catch (err) {
      alert("Failed to add member");
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

    try {
      await api.post("/savings", {
        memberId,
        amount,
        date,
      });

      setMemberId("");
      setAmount("");
      setConfirmAmount("");
      setDate("");
      setMessage("Savings recorded successfully");
      fetchRecords();
    } catch (err) {
      alert("Failed to record savings");
    } finally {
      setLoadingSavings(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Prayer Centre 2026 Savings
          </h1>

          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition w-full sm:w-auto flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {loadingLogout ? <Spinner /> : "Logout"}
          </button>
        </div>

        {message && (
          <p className="text-center text-green-400 mb-4">{message}</p>
        )}

        {/* Date Range */}
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

          <div className="text-center">
            <label className="text-sm">Total in Range (Ksh)</label>
            <p className="text-2xl text-green-400 font-bold">
              {rangeTotal}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <h2>Total Members</h2>
            <p className="text-2xl">{members.length}</p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <h2>Total Records</h2>
            <p className="text-2xl">{records.length}</p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <h2>Grand Total (Ksh)</h2>
            <p className="text-2xl text-green-400">
              {grandTotalSavings}
            </p>
          </div>
        </div>

        {/* Add Member */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Add Member</h2>

          <form onSubmit={handleAddMember} className="flex flex-col gap-3">
            <input
              className="p-2 rounded bg-gray-800"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="p-2 rounded bg-gray-800"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="p-2 rounded bg-gray-800"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              disabled={loadingAddMember}
              className="bg-primary p-2 rounded flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {loadingAddMember ? <Spinner /> : "Add Member"}
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-gray-900 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Members List</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Total (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {membersWithTotals.map((m) => (
                  <tr key={m._id} className="border-b border-gray-700">
                    <td className="py-2 px-4">{m.name}</td>
                    <td className="py-2 px-4 text-green-400">
                      {m.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Savings */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Record Daily Savings</h2>

          <form onSubmit={handleAddSavings} className="flex flex-col gap-3">
            <select
              className="p-2 rounded bg-gray-800"
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
              className="p-2 rounded bg-gray-800"
              type="number"
              placeholder="Amount Saved"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <input
              className="p-2 rounded bg-gray-800"
              type="number"
              placeholder="Confirm Amount"
              value={confirmAmount}
              onChange={(e) => setConfirmAmount(e.target.value)}
              required
            />

            <input
              className="p-2 rounded bg-gray-800"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <button
              disabled={loadingSavings}
              className="bg-accent p-2 rounded flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {loadingSavings ? <Spinner /> : "Add Savings"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
