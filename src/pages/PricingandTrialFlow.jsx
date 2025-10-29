import React, { useState, useEffect } from "react";

// PricingAndTrialFlow.jsx
// Single-file React component (default export) to handle:
// - Role selection (Architect / Interior Designer / Homeowner)
// - 5-day trial tracking UI
// - Role-based trial restrictions display
// - Plan cards, Upgrade modal & mock payment handler
// 
// Notes:
// - Uses Tailwind CSS for styling (ensure Tailwind is configured in your project)
// - Replace mocked API calls with real endpoints: /api/user, /api/subscribe
// - This component is UI-only; backend must enforce the actual restrictions

export default function PricingAndTrialFlow() {
  const [role, setRole] = useState("homeowner");
  const [user, setUser] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock user fetch on mount - in real app replace with fetch('/api/user')
  useEffect(() => {
    // Example: user signs up and gets a 5-day trial from today
    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(expiry.getDate() + 5);

    const mockUser = {
      id: "u_123",
      role: "homeowner", // initial role saved on signup
      trial_start_date: today.toISOString(),
      trial_expiry_date: expiry.toISOString(),
      is_trial: true,
      is_premium: false,
      subscription_type: null,
      subscription_expiry_date: null,
    };

    setUser(mockUser);
    setRole(mockUser.role);
  }, []);

  function isTrialActive(u = user) {
    if (!u) return false;
    if (u.is_premium) return false; // premium users aren't 'trialing'
    const now = new Date();
    const expiry = new Date(u.trial_expiry_date);
    return now <= expiry;
  }

  function daysLeft(u = user) {
    if (!u) return 0;
    const now = new Date();
    const expiry = new Date(u.trial_expiry_date);
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Role-based restriction mapping
  const restrictionsByRole = {
    architect: [
      "Upload max 2 plans",
      "AI-generated previews are watermarked",
      "No exports (PDF/CAD/3D)",
      "No AR placement",
    ],
    "interior-designer": [
      "Design 1 room only",
      "Limited furniture & themes",
      "Watermarked exports",
      "No client sharing link",
    ],
    homeowner: [
      "Basic 2D + simple 3D only",
      "No furnishing recommendations",
      "No panorama / walkthrough / AR",
      "Only 1 design allowed",
    ],
  };

  // Plans per role (UI suggested prices). Update as needed.
  const plans = {
    architect: [
      {
        id: "arch_individual",
        title: "Individual",
        price: "₹5,999/mo",
        features: [
          "Unlimited plan uploads",
          "Full AI designs & exports",
          "AR placement & civil checks",
        ],
      },
      {
        id: "arch_firm",
        title: "Firm (5-10 seats)",
        price: "₹14,999/mo",
        features: ["All Individual features", "Team seats & admin controls"],
      },
    ],
    "interior-designer": [
      {
        id: "designer_starter",
        title: "Starter",
        price: "₹2,499/mo",
        features: ["5 projects / month", "Basic export & portfolio"],
      },
      {
        id: "designer_pro",
        title: "Pro",
        price: "₹6,999/mo",
        features: ["Unlimited projects", "Client-sharing & high-res exports"],
      },
      { id: "designer_ppp", title: "Pay-per-project", price: "₹499/project", features: ["Single project purchase"] },
    ],
    homeowner: [
      { id: "home_basic", title: "Basic", price: "₹999/project", features: ["1 design + panorama"] },
      { id: "home_premium", title: "Premium", price: "₹2,499/project", features: ["Multiple layouts + interiors"] },
      { id: "home_pro", title: "Pro", price: "₹4,999/project", features: ["Full furnishing + AR + exports"] },
    ],
  };

  async function handleUpgrade(plan) {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  }

  // Mock payment flow - replace with Razorpay / Stripe integration
  async function confirmPayment() {
    setLoading(true);
    try {
      // Example payload you should POST to your backend
      const payload = {
        userId: user.id,
        planId: selectedPlan.id,
        role: role,
        // server should handle payment verification & subscription dates
      };

      // Log payload for debugging (remove in production)
      console.log('Payment payload:', payload);

      // Mock network delay
      await new Promise((res) => setTimeout(res, 1200));

      // In a real app: const res = await fetch('/api/subscribe', { method:'POST', body: JSON.stringify(payload) })
      // then validate response.

      // Mock success update to user state
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 1); // 1 month subscription example

      setUser((prev) => ({
        ...prev,
        is_trial: false,
        is_premium: true,
        subscription_type: selectedPlan.id,
        subscription_expiry_date: expiry.toISOString(),
      }));

      setShowUpgradeModal(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      alert("Payment failed (mock). Replace with real gateway flow.");
    } finally {
      setLoading(false);
    }
  }

  // simple change-role handler to preview role based UI (in real app role comes from DB)
  function changeRole(r) {
    setRole(r);
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse text-center text-gray-500">Loading user...</div>
      </div>
    );
  }

  const trialActive = isTrialActive();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">DreamDwell.AI — Trial & Pricing</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Signed in as:</div>
          <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm">{user.id}</div>
        </div>
      </header>

      {/* Role selector (quick preview in UI) */}
      <section className="mb-6">
        <div className="flex gap-2">
          {[
            { key: "architect", label: "Architect" },
            { key: "interior-designer", label: "Interior Designer" },
            { key: "homeowner", label: "Homeowner" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => changeRole(r.key)}
              className={`px-3 py-1 rounded-md border ${role === r.key ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* Trial banner */}
      <section className="mb-6">
        <div className="p-4 rounded-lg border flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Trial status</div>
            {user.is_premium ? (
              <div className="text-green-600 font-medium">Premium active — Expires: {new Date(user.subscription_expiry_date).toLocaleDateString()}</div>
            ) : trialActive ? (
              <div className="text-yellow-700 font-medium">Free trial active — {daysLeft()} day(s) left</div>
            ) : (
              <div className="text-red-600 font-medium">Trial expired — Upgrade to unlock full features</div>
            )}
          </div>

          <div>
            {!user.is_premium && (
              <button onClick={() => setShowUpgradeModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                See Plans & Upgrade
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Restrictions card */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Role: {role === 'interior-designer' ? 'Interior Designer' : role.charAt(0).toUpperCase() + role.slice(1)}</h2>
          <p className="text-sm text-gray-600 mb-3">{trialActive ? "You are in trial mode. The following restrictions apply:" : "Trial expired / limited access. The following restrictions apply:"}</p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {(restrictionsByRole[role] || []).map((r, i) => (
              <li key={i} className="mb-1">{r}</li>
            ))}
          </ul>
        </div>

        {/* Quick action & sample features */}
        <div className="p-4 border rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">What you can try during trial</h3>
            <ul className="text-sm text-gray-700 list-disc pl-5 mb-4">
              <li>Get a feel for the AI-generated layouts.</li>
              <li>Preview 3D models (watermarked/low-res).</li>
              <li>Experiment with materials & basic themes.</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => alert('This is a demo. Backend endpoints required for real actions.')}
              className="px-3 py-2 border rounded-md"
            >
              Try Sample AI Generate
            </button>

            <button onClick={() => setShowUpgradeModal(true)} className="px-3 py-2 bg-indigo-600 text-white rounded-md">
              Upgrade Now
            </button>
          </div>
        </div>
      </section>

      {/* Plans listing */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Plans for {role === 'interior-designer' ? 'Interior Designers' : role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(plans[role] || []).map((p) => (
            <div key={p.id} className="p-4 border rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-500">{p.title}</div>
                <div className="text-2xl font-bold my-2">{p.price}</div>
                <ul className="text-sm text-gray-700 list-disc pl-5 mb-3">
                  {p.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpgrade(p)} className="px-3 py-2 border rounded-md">Choose</button>
                <button
                  onClick={() => alert('Replace with open pricing/checkout flow')}
                  className="px-3 py-2 bg-gray-100 rounded-md"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Confirm Purchase</h3>
            <div className="mb-3">
              <div className="text-sm text-gray-500">Plan</div>
              <div className="font-medium">{selectedPlan.title} — {selectedPlan.price}</div>
              <ul className="text-sm text-gray-700 list-disc pl-5 mt-2">
                {selectedPlan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowUpgradeModal(false); setSelectedPlan(null); }} className="px-3 py-2 border rounded-md">Cancel</button>
              <button onClick={confirmPayment} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                {loading ? 'Processing...' : 'Pay & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If user clicked "See Plans" without selecting - show full modal */}
      {showUpgradeModal && !selectedPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Plans & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(plans[role] || []).map((p) => (
                <div key={p.id} className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500">{p.title}</div>
                  <div className="text-2xl font-bold my-2">{p.price}</div>
                  <ul className="text-sm text-gray-700 list-disc pl-5 mb-3">
                    {p.features.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpgrade(p)} className="px-3 py-2 border rounded-md">Choose</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowUpgradeModal(false)} className="px-3 py-2 border rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
