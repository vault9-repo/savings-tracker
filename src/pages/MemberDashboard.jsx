import { useState } from "react";
import { useSavings } from "../context/SavingsContext";
import { useAuth } from "../context/AuthContext";

export default function MemberDashboard() {
  const { records } = useSavings();
  const { user } = useAuth();

  const [loadingLogout, setLoadingLogout] = useState(false);

  // Logout handler
  const handleLogout = () => {
    setLoadingLogout(true);
    localStorage.removeItem("user");
    setTimeout(() => {
      window.location.href = "https://savings-tracker-zqly.onrender.com";
    }, 500); // slight delay to show spinner
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-black text-white p-6 pt-12">
        <p className="text-lg">Please log in to view your dashboard.</p>
      </div>
    );
  }

  // Filter savings for the logged-in member
  const myRecords = records.filter(
    (r) => r.member?._id === user._id || r.member === user._id
  );

  // Group by date for logged-in member
  const groupedMyRecords = myRecords.reduce((acc, r) => {
    const date = new Date(r.date).toLocaleDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date] += r.amount;
    return acc;
  }, {});

  // My total contributions
  const myTotal = Object.values(groupedMyRecords).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Utility to format without decimal
  const formatAmount = (amt) => Math.floor(amt);

  const Spinner = () => (
    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-black p-6 pt-8">
      <div className="w-full max-w-3xl">
        {/* Header with Logout */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <h1 className="text-2xl font-semibold text-white">Welcome,</h1>
            <h2 className="text-3xl font-bold text-yellow-400">{user.name}</h2>
          </div>
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2"
          >
            {loadingLogout ? <Spinner /> : "Logout"}
          </button>
        </div>

        {/* Member Total */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg mb-4 text-center">
          <h2 className="text-xl font-semibold text-white">My Total Savings</h2>
          <p className="text-2xl mt-2 text-green-400">
            Ksh {formatAmount(myTotal)}
          </p>
        </div>

        {/* My Savings Table */}
        <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedMyRecords).length > 0 ? (
              Object.entries(groupedMyRecords).map(([date, amount]) => (
                <tr key={date} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-2 px-4">{date}</td>
                  <td className="py-2 px-4 text-green-400">
                    Ksh {formatAmount(amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-4 px-4 text-center text-gray-400">
                  No savings recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
