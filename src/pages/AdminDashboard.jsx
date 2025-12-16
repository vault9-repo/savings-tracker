import { useState, useEffect } from "react";
import { useSavings } from "../context/SavingsContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const { members, records, fetchMembers, fetchRecords } = useSavings();
  const navigate = useNavigate();

  // Add Member state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Record Savings state
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const [message, setMessage] = useState("");

  // Date range for total
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeTotal, setRangeTotal] = useState(0);

  useEffect(() => {
    fetchMembers();
    fetchRecords();
  }, []);

  useEffect(() => {
    calculateRangeTotal();
  }, [records, startDate, endDate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password, role: "member" });
      setMessage("Member added successfully!");
      setName(""); setEmail(""); setPassword("");
      fetchMembers();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error adding member");
    }
  };

  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!memberId || !amount || !date) return;

    try {
      await api.post("/savings", {
        member: memberId,
        amount: parseFloat(amount),
        date,
      });
      setAmount(""); setDate(""); setMemberId("");
      setMessage("Savings recorded successfully!");
      fetchRecords();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error recording savings");
    }
  };

  // Calculate total for selected range
  const calculateRangeTotal = () => {
    if (!startDate || !endDate) {
      setRangeTotal(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let total = 0;

    records.forEach((r) => {
      const recordDate = new Date(r.date);
      if (recordDate >= start && recordDate <= end) {
        total += r.amount;
      }
    });

    setRangeTotal(total);
  };

  // Members total
  const membersWithTotals = members.map((m) => {
    const total = records
      .filter((r) => r.member?._id === m._id || r.member === m._id)
      .reduce((sum, r) => sum + r.amount, 0);
    return { ...m, total };
  });

  const grandTotalSavings = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-white p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">Prayer Centre 2026 Savings</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            Logout
          </button>
        </div>

        {message && <p className="text-center text-green-400 mb-4">{message}</p>}

        {/* Date Range Selector */}
        <div className="flex flex-wrap justify-around mb-6 gap-2 bg-gray-900 p-4 rounded-lg shadow-lg">
          <div className="flex flex-col w-1/3">
            <label className="mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div className="flex flex-col w-1/3">
            <label className="mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div className="flex flex-col w-1/3 text-center justify-center">
            <label className="mb-1">Total in Range (Ksh)</label>
            <p className="text-2xl text-green-400">{rangeTotal}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around mb-6">
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center w-1/3 mr-2">
            <h2 className="text-xl font-semibold">Total Members</h2>
            <p className="text-2xl">{members.length}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center w-1/3 mx-2">
            <h2 className="text-xl font-semibold">Total Records</h2>
            <p className="text-2xl">{records.length}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center w-1/3 ml-2">
            <h2 className="text-xl font-semibold">Grand Total Savings (Ksh)</h2>
            <p className="text-2xl text-green-400">{grandTotalSavings}</p>
          </div>
        </div>

        {/* Add Member */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Member</h2>
          <form className="flex flex-col gap-3" onSubmit={handleAddMember}>
            <input className="p-2 rounded bg-gray-800 text-white" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="p-2 rounded bg-gray-800 text-white" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="p-2 rounded bg-gray-800 text-white" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="bg-primary text-white p-2 rounded hover:bg-indigo-600 transition">Add Member</button>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Members List</h2>
          <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Total Savings (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              {membersWithTotals.map((m) => (
                <tr key={m._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-2 px-4">{m.name}</td>
                  <td className="py-2 px-4">{m.email}</td>
                  <td className="py-2 px-4 text-green-400">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Record Savings */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Record Daily Savings</h2>
          <form className="flex flex-col gap-3" onSubmit={handleAddSavings}>
            <select className="p-2 rounded bg-gray-800 text-white" value={memberId} onChange={e => setMemberId(e.target.value)} required>
              <option value="">Select Member</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
            </select>
            <input className="p-2 rounded bg-gray-800 text-white" type="number" placeholder="Amount Saved" value={amount} onChange={e => setAmount(e.target.value)} required />
            <input className="p-2 rounded bg-gray-800 text-white" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <button className="bg-accent text-white p-2 rounded hover:bg-green-600 transition">Add Savings</button>
          </form>
        </div>
      </div>
    </div>
  );
}
