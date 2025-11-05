import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function MaterialManager() {
  const [suppliers, setSuppliers] = useState([]);
  const [riskLabels, setRiskLabels] = useState({});
  const [trainStatus, setTrainStatus] = useState("");
  const [selectedPredictSupplier, setSelectedPredictSupplier] = useState("");
  const [manualRating, setManualRating] = useState(5);
  const [manualActive, setManualActive] = useState(true);
  const [predictResult, setPredictResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/suppliers`);
        setSuppliers(res.data || []);
      } catch (error) {
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  // Handler for training
  async function handleTrain() {
    setTrainStatus("Training...");
    const requestArr = Object.entries(riskLabels)
      .filter(([supplierId, risk_level]) => risk_level)
      .map(([supplierId, risk_level]) => ({ supplierId, risk_level }));
    if (requestArr.length < 5) {
      setTrainStatus("Please provide risk labels for at least 5 suppliers.");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/ml-finance/train/supplier-risk`, { suppliers: requestArr });
      setTrainStatus(res.data?.message || "Trained successfully!");
    } catch (e) {
      setTrainStatus("Training failed: " + (e.response?.data?.error || e.message));
    }
  }

  // Handler for prediction
  async function handlePredict() {
    setPredictResult(null);
    setLoading(true);
    let features = null;
    if (selectedPredictSupplier) {
      // Use supplierId
      try {
        const res = await axios.post(`${API_BASE}/ml-finance/predict/supplier-risk`, { supplierId: selectedPredictSupplier });
        setPredictResult(res.data?.prediction);
      } catch (e) {
        setPredictResult({ error: e.response?.data?.error || e.message });
      }
    } else {
      features = {
        rating: manualRating,
        active: manualActive ? 1 : 0,
      };
      try {
        const res = await axios.post(`${API_BASE}/ml-finance/predict/supplier-risk`, { features });
        setPredictResult(res.data?.prediction);
      } catch (e) {
        setPredictResult({ error: e.response?.data?.error || e.message });
      }
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Supplier Risk Management (ML)</h1>

      <div className="mb-10 bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-2">1. Label Suppliers for Training</h2>
        <p>Select risk level for at least 5 suppliers to train the decision tree model:</p>
        <table className="min-w-full divide-y divide-gray-300 my-4">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs uppercase">Supplier</th>
              <th className="px-4 py-2 text-left text-xs uppercase">Rating</th>
              <th className="px-4 py-2 text-left text-xs uppercase">Active</th>
              <th className="px-4 py-2 text-left text-xs uppercase">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.rating}</td>
                <td className="px-4 py-2">{s.active ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  <select
                    value={riskLabels[s._id] || ""}
                    onChange={e => setRiskLabels(l => ({ ...l, [s._id]: e.target.value }))}
                    className="border p-1 rounded"
                  >
                    <option value="">Select</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleTrain} className="bg-blue-600 text-white px-4 py-2 rounded">
          Train Supplier Risk Model
        </button>
        <div className="mt-2 text-sm text-gray-700">{trainStatus}</div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-2">2. Predict Supplier Risk</h2>
        <div className="mb-4">
          <label className="mr-2 font-medium">Choose existing supplier:</label>
          <select
            value={selectedPredictSupplier}
            onChange={e => setSelectedPredictSupplier(e.target.value)}
            className="border p-1 rounded w-64"
          >
            <option value="">-- None (manual input below) --</option>
            {suppliers.map(
              s => <option key={s._id} value={s._id}>{s.name}</option>
            )}
          </select>
        </div>
        <div className="mb-4 flex items-center gap-3">
          <label className="font-medium">Or manually specify:</label>
          <div>Rating: <input type="number" min={1} max={5} value={manualRating} onChange={e => setManualRating(+e.target.value)} className="border rounded p-1 w-16"/></div>
          <div>Active: <input type="checkbox" checked={manualActive} onChange={() => setManualActive(a => !a)} /></div>
        </div>
        <button onClick={handlePredict} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>Predict Risk Level</button>
        <div className="mt-4">
          {loading && <span>Predicting...</span>}
          {predictResult?.error && <div className="text-red-500">{predictResult.error}</div>}
          {predictResult && !predictResult.error && (
            <div className="bg-gray-50 p-3 rounded mt-2">
              <b>Result:</b> {predictResult.predicted_risk}
              <br />
              <b>Confidence:</b> {(predictResult.confidence*100).toFixed(1)}%
              <br />
              <b>Probabilities:</b> {Object.entries(predictResult.probabilities || {}).map(([k, v])=> `${k}: ${(v*100).toFixed(1)}%`).join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
