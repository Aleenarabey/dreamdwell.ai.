import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { LowStockAlert } from "../components/Alert";

const API_BASE = "http://localhost:5000/api";

export default function MaterialsManagement() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState(null);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    unit: "bag",
    unitPrice: 0,
    co2PerUnit: 0,
    supplier: "",
    stock: 0,
    reorderLevel: 10,
    description: "",
  });
  const [supplierFormData, setSupplierFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    rating: 5,
  });

  useEffect(() => {
    const checkAdminAccess = () => {
      const savedUser = localStorage.getItem("user");
      let isAdminUser = isAdmin();
      
      if (!isAdminUser && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          isAdminUser = userData?.role === "admin";
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
      
      if (!isAdminUser) {
        navigate("/admin-dashboard");
        return false;
      }
      return true;
    };
    
    if (checkAdminAccess()) {
      fetchMaterials();
      fetchTotalValue();
      fetchLowStock();
      fetchLowStockAlerts();
      fetchSuppliers();
    }
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_BASE}/materials`);
      setMaterials(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setLoading(false);
    }
  };

  const fetchTotalValue = async () => {
    try {
      const response = await axios.get(`${API_BASE}/materials/inventory/total-value`);
      setTotalValue(response.data.totalValue || 0);
    } catch (error) {
      console.error("Error fetching total value:", error);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await axios.get(`${API_BASE}/materials/low-stock/check`);
      setLowStockMaterials(response.data);
    } catch (error) {
      console.error("Error fetching low stock:", error);
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/materials/low-stock/alerts`);
      setLowStockAlerts(response.data);
    } catch (error) {
      console.error("Error fetching low stock alerts:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_BASE}/materials`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowAddModal(false);
      resetForm();
      fetchMaterials();
      fetchTotalValue();
      fetchLowStock();
      fetchLowStockAlerts();
    } catch (error) {
      alert("Error adding material: " + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_BASE}/materials/${editingMaterial._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditingMaterial(null);
      resetForm();
      fetchMaterials();
      fetchTotalValue();
      fetchLowStock();
      fetchLowStockAlerts();
    } catch (error) {
      alert("Error updating material: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE}/materials/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchMaterials();
      fetchTotalValue();
      fetchLowStock();
      fetchLowStockAlerts();
    } catch (error) {
      alert("Error deleting material: " + (error.response?.data?.error || error.message));
    }
  };

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      unitPrice: material.unitPrice,
      co2PerUnit: material.co2PerUnit || 0,
      supplier: material.supplier?._id || "",
      stock: material.stock,
      reorderLevel: material.reorderLevel,
      description: material.description || "",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      unit: "bag",
      unitPrice: 0,
      co2PerUnit: 0,
      supplier: "",
      stock: 0,
      reorderLevel: 10,
      description: "",
    });
  };

  const resetSupplierForm = () => {
    setSupplierFormData({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      rating: 5,
    });
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await axios.post(`${API_BASE}/suppliers`, supplierFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowAddSupplierModal(false);
      resetSupplierForm();
      fetchSuppliers();
      alert("Supplier added successfully!");
    } catch (error) {
      alert("Error adding supplier: " + (error.response?.data?.error || error.message));
    }
  };

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-4">Loading materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">Materials Management</h1>
                {lowStockAlerts && lowStockAlerts.count > 0 && (
                  <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    <AlertTriangle size={16} />
                    {lowStockAlerts.count} Low Stock Alert{lowStockAlerts.count > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">Manage your construction materials inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetSupplierForm();
                setShowAddSupplierModal(true);
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={18} />
              Add Supplier
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Material
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Low Stock Alert */}
        {showLowStockAlert && lowStockAlerts && lowStockAlerts.count > 0 && (
          <LowStockAlert
            materials={lowStockAlerts.alerts}
            onClose={() => setShowLowStockAlert(false)}
            onViewDetails={() => {
              // Scroll to low stock section or highlight low stock materials
              const lowStockSection = document.getElementById('low-stock-section');
              if (lowStockSection) {
                lowStockSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 hover:bg-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Total Materials</p>
                <p className="text-3xl font-bold text-blue-800">{materials.length}</p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <Package className="text-blue-600" size={28} />
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 hover:bg-emerald-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-bold text-emerald-800">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <DollarSign className="text-emerald-600" size={28} />
              </div>
            </div>
          </div>
          <div className="bg-orange-50 hover:bg-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-orange-800">{lowStockMaterials.length}</p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <AlertTriangle className="text-orange-600" size={28} />
              </div>
            </div>
          </div>
          <div className="bg-cyan-50 hover:bg-cyan-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Avg. Stock Level</p>
                <p className="text-3xl font-bold text-cyan-800">
                  {materials.length > 0
                    ? formatNumber(
                        Math.round(
                          materials.reduce((sum, m) => sum + m.stock, 0) / materials.length
                        )
                      )
                    : 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <TrendingUp className="text-cyan-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockAlerts && lowStockAlerts.count > 0 && (
          <div id="low-stock-section" className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                <h3 className="font-semibold text-red-800">Low Stock Alerts</h3>
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {lowStockAlerts.count} Alert{lowStockAlerts.count > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-red-700">
                {lowStockAlerts.criticalCount > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    {lowStockAlerts.criticalCount} Critical
                  </span>
                )}
                {lowStockAlerts.highCount > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {lowStockAlerts.highCount} High
                  </span>
                )}
                {lowStockAlerts.mediumCount > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    {lowStockAlerts.mediumCount} Medium
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockAlerts.alerts.map((alert) => {
                const getUrgencyStyles = () => {
                  switch (alert.urgency) {
                    case 'critical':
                      return {
                        card: 'bg-red-100 border-red-400',
                        badge: 'bg-red-600 text-white',
                        text: 'text-red-800'
                      };
                    case 'high':
                      return {
                        card: 'bg-orange-100 border-orange-400',
                        badge: 'bg-orange-500 text-white',
                        text: 'text-orange-800'
                      };
                    case 'medium':
                      return {
                        card: 'bg-yellow-100 border-yellow-400',
                        badge: 'bg-yellow-500 text-white',
                        text: 'text-yellow-800'
                      };
                    default:
                      return {
                        card: 'bg-gray-100 border-gray-400',
                        badge: 'bg-gray-500 text-white',
                        text: 'text-gray-800'
                      };
                  }
                };

                const styles = getUrgencyStyles();

                return (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-xl p-4 border-2 ${styles.card} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{alert.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles.badge}`}>
                        {alert.urgency.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className={`font-semibold ${styles.text}`}>
                          {alert.stock} {alert.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Reorder Level:</span>
                        <span className="text-gray-800 font-medium">
                          {alert.reorderLevel} {alert.unit}
                        </span>
                      </div>

                      {alert.supplier && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Supplier:</span> {alert.supplier.name}
                          </div>
                          {alert.supplier.contact && (
                            <div className="text-xs text-gray-500">
                              Contact: {alert.supplier.contact}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2">
                        <p className={`text-xs ${styles.text} font-medium`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {lowStockAlerts.count > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-red-700">
                    <strong>Action Required:</strong> Please reorder these materials to maintain adequate stock levels.
                  </p>
                  <button
                    onClick={() => {
                      // Scroll to add material form or open add material modal
                      setShowAddModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Add New Material
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:font-light"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Materials Horizontal Scroll */}
        <div className="-mx-6 px-6">
          <div className="overflow-x-auto pb-4 scroll-smooth workers-horizontal-scroll">
            <div className="flex gap-6 min-w-max">
              {filteredMaterials.length === 0 ? (
                <div className="text-center text-gray-500 w-full py-8">
                  No materials found. Add your first material to get started.
                </div>
              ) : (
                filteredMaterials.map((material) => {
                  const isLowStock = material.stock < material.reorderLevel;
                  const totalValue = material.unitPrice * material.stock;
                  return (
                    <div key={material._id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow w-96 flex-shrink-0 ${isLowStock ? 'border-l-4 border-red-500 bg-red-50' : 'border-l-4 border-green-500'}`}>
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{material.name}</h3>
                          {material.description && (
                            <p className="text-xs text-gray-500">{material.description}</p>
                          )}
                        </div>
                        <div>
                          {isLowStock ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit</span>
                          <span className="text-gray-800 font-medium">{material.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit Price</span>
                          <span className="text-gray-800 font-medium">{formatCurrency(material.unitPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier</span>
                          <span className="text-gray-800 font-medium">
                            {material.supplier ? (
                              <div className="text-right">
                                <div className="font-medium">{material.supplier.name}</div>
                                {material.supplier.contactPerson && (
                                  <div className="text-xs text-gray-500">{material.supplier.contactPerson}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No supplier</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock</span>
                          <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-800'} flex items-center gap-1`}>
                            {isLowStock && <AlertTriangle size={14} />}
                            {formatNumber(material.stock)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reorder Level</span>
                          <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatNumber(material.reorderLevel)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-600 font-semibold">Total Value</span>
                          <span className="text-green-600 font-bold">{formatCurrency(totalValue)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditClick(material)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material._id)}
                          className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingMaterial) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMaterial(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bag">Bag</option>
                    <option value="kg">Kg</option>
                    <option value="m3">M³</option>
                    <option value="piece">Piece</option>
                    <option value="litre">Litre</option>
                    <option value="tonne">Tonne</option>
                    <option value="unit">Unit</option>
                    <option value="sqft">Sqft</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CO₂ per Unit
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.co2PerUnit}
                    onChange={(e) => setFormData({ ...formData, co2PerUnit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a supplier (optional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMaterial(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingMaterial ? "Update" : "Add"} Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Add New Supplier</h2>
              <button
                onClick={() => {
                  setShowAddSupplierModal(false);
                  resetSupplierForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierFormData.name}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:font-light"
                    placeholder="Enter supplier company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.contact}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:font-light"
                    placeholder="Contact person name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:font-light"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={supplierFormData.email}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:font-light"
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={supplierFormData.address}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:font-light"
                  placeholder="Enter supplier address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={supplierFormData.rating}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Average)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSupplierModal(false);
                    resetSupplierForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

