import React from 'react';
import { AlertTriangle, X, Package } from 'lucide-react';

const Alert = ({ 
  type = 'warning', 
  title, 
  message, 
  onClose, 
  showCloseButton = true,
  className = '',
  icon: CustomIcon 
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700'
        };
      case 'warning':
      default:
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        };
    }
  };

  const styles = getAlertStyles();
  const IconComponent = CustomIcon || AlertTriangle;

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`mt-1 text-sm ${styles.message}`}>
              {message}
            </div>
          )}
        </div>
        {showCloseButton && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${styles.icon} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized Low Stock Alert Component
export const LowStockAlert = ({ materials, onClose, onViewDetails }) => {
  if (!materials || materials.length === 0) return null;

  const formatMaterialList = () => {
    if (materials.length === 1) {
      const material = materials[0];
      return `${material.name} (${material.stock} ${material.unit} remaining)`;
    }
    
    if (materials.length <= 3) {
      return materials.map(m => `${m.name} (${m.stock} ${m.unit})`).join(', ');
    }
    
    return `${materials.slice(0, 2).map(m => `${m.name} (${m.stock} ${m.unit})`).join(', ')} and ${materials.length - 2} more`;
  };

  return (
    <Alert
      type="warning"
      title={`Low Stock Alert - ${materials.length} Material${materials.length > 1 ? 's' : ''} Need Reordering`}
      message={`The following materials are below their reorder level: ${formatMaterialList()}`}
      onClose={onClose}
      icon={Package}
      className="mb-4"
    >
      {materials.length > 0 && (
        <div className="mt-3">
          <button
            onClick={onViewDetails}
            className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
          >
            View all low stock materials →
          </button>
        </div>
      )}
    </Alert>
  );
};

export default Alert;
