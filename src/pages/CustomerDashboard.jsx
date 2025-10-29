import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function CustomerDashboard() {
  const { user, logout, isCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCustomer()) {
      navigate("/");
    }
  }, [isCustomer, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Customer Portal
          </h2>
          <p className="text-gray-600 mb-6">
            You are logged in as a Customer. Here you can view your projects and track progress.
          </p>

          {/* Customer Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                My Projects
              </h3>
              <p className="text-gray-600">
                View your ongoing projects and their status
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Track the progress of your projects in real-time
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Contact Engineer
              </h3>
              <p className="text-gray-600">
                Message your assigned engineer directly
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <p className="font-semibold bg-green-600 text-white px-3 py-1 rounded inline-block">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

