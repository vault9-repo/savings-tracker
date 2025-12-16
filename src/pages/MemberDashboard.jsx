import { useSavings } from "../context/SavingsContext";
import { useAuth } from "../context/AuthContext";

export default function MemberDashboard() {
  const { records } = useSavings();
  const { user } = useAuth();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // Refresh page to show login form
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <p className="text-xl">Please log in to view your dashboard.</p>
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

  // Utility to format without decimal .00
  const formatAmount = (amt) => Math.floor(amt);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-3xl">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white text-center">
            Welcome, {user.name}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            Logout
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
