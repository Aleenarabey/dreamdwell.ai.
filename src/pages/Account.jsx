import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Normalize API base to avoid double "/api" or trailing slashes issues
const RAW_API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");

// Debug: print API base to ensure it's valid at runtime
if (typeof window !== "undefined") {
  console.log("RAW_API_BASE =", RAW_API_BASE);
  console.log("API_BASE =", API_BASE);
}

export default function Account() {
  const token = localStorage.getItem("token");

  // Prefer server values; fall back to localStorage snapshot
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // India states (alphabetical, per request)
  const states = useMemo(
    () => [
      "Select State",
      ...[
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
      ].sort((a, b) => a.localeCompare(b))
    ],
    []
  );

  const [profile, setProfile] = useState({
    firstName: storedUser?.firstName || "",
    lastName: storedUser?.lastName || "",
    place: storedUser?.place || "",
    state: storedUser?.state || states[0],
    email: storedUser?.email || "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({ old: false, newer: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Load profile from API if token exists
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!token) return;
      setLoadingProfile(true);
      setProfileStatus({ type: "", message: "" });
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ignore) return;
        const u = res.data?.user || {};
        setProfile((prev) => ({
          ...prev,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || prev.email,
          place: u.place || "",
          state: u.state || states[0],
        }));
      } catch (err) {
        // Silent: user might not be logged in
      } finally {
        if (!ignore) setLoadingProfile(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [token, states]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profile.firstName?.trim()) errs.firstName = "First name is required";
    if (!profile.lastName?.trim()) errs.lastName = "Last name is required";
    if (profile.state === states[0]) errs.state = "Please select a state";
    return errs;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: "", message: "" });
    const errs = validateProfile();
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    if (!token) {
      // Persist locally if not logged in
      const updatedUser = { ...(storedUser || {}), ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfileStatus({ type: "success", message: "Profile saved locally" });
      return;
    }

    try {
      setLoadingProfile(true);
      const res = await axios.put(
        `${API_BASE}/api/auth/me`,
        {
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          place: profile.place?.trim() || "",
          state: profile.state,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const u = res.data?.user;
      // Sync localStorage user snapshot for UI consistency
      const merged = {
        ...(storedUser || {}),
        firstName: u?.firstName || profile.firstName,
        lastName: u?.lastName || profile.lastName,
        email: u?.email || profile.email,
        place: u?.place ?? profile.place,
        state: u?.state ?? profile.state,
      };
      localStorage.setItem("user", JSON.stringify(merged));
      setProfileStatus({ type: "success", message: "Profile updated" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      setProfileStatus({ type: "error", message: msg });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () => {
    const errs = {};
    if (!passwords.oldPassword) errs.oldPassword = "Old password is required";
    if (!passwords.newPassword) errs.newPassword = "New password is required";
    else if (passwords.newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters";
    if (passwords.confirmPassword !== passwords.newPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", message: "" });

    const errs = validatePasswords();
    setPasswordErrors(errs);
    if (Object.keys(errs).length) return;

    if (!token) {
      setPasswordStatus({ type: "error", message: "Please log in to change password" });
      return;
    }

    try {
      setLoadingPassword(true);
      // Inside handlePasswordSubmit just before axios.post
      console.log("POST to:", `${API_BASE}/api/auth/change-password`);
      await axios.post(
        `${API_BASE}/api/auth/change-password`,
        { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordStatus({ type: "success", message: "Password changed" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (err) {
      // Surface useful errors to the user (network, 401, validation, etc.)
      const msg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        (err?.message?.includes("Network") ? "Network error: cannot reach API" : err?.message) ||
        "Failed to change password";
      console.error("Change password error:", err);
      setPasswordStatus({ type: "error", message: msg });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold">Account Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your personal information</p>
          </div>

          {profileStatus.message && (
            <div
              className={`mx-6 mt-4 px-4 py-2 rounded-lg text-sm ${
                profileStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {profileStatus.message}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
                className={`w-full rounded-lg border ${
                  profileErrors.firstName ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                } bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {profileErrors.firstName && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
                className={`w-full rounded-lg border ${
                  profileErrors.lastName ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                } bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {profileErrors.lastName && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Place</label>
              <input
                type="text"
                name="place"
                value={profile.place}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City / Area"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">State</label>
              <select
                name="state"
                value={profile.state}
                onChange={handleProfileChange}
                className={`w-full rounded-lg border ${
                  profileErrors.state ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                } bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {profileErrors.state && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.state}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 px-3 py-2 focus:outline-none"
                disabled
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loadingProfile}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg"
              >
                {loadingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update your password for account security</p>
          </div>

          {passwordStatus.message && (
            <div
              className={`mx-6 mt-4 px-4 py-2 rounded-lg text-sm ${
                passwordStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {passwordStatus.message}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Old Password</label>
              <div className="relative">
                <input
                  type={showPwd.old ? "text" : "password"}
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChangeInput}
                  className={`w-full rounded-lg border ${
                    passwordErrors.oldPassword ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-900 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => ({ ...s, old: !s.old }))}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showPwd.old ? "Hide password" : "Show password"}
                >
                  {showPwd.old ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {passwordErrors.oldPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPwd.newer ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChangeInput}
                  className={`w-full rounded-lg border ${
                    passwordErrors.newPassword ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-900 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => ({ ...s, newer: !s.newer }))}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showPwd.newer ? "Hide password" : "Show password"}
                >
                  {showPwd.newer ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPwd.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChangeInput}
                  className={`w-full rounded-lg border ${
                    passwordErrors.confirmPassword ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-900 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showPwd.confirm ? "Hide password" : "Show password"}
                >
                  {showPwd.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loadingPassword}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg"
              >
                {loadingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}