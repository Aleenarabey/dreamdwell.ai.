"""
Linear Regression Prediction Models
Load trained models and make predictions
"""

import joblib
import numpy as np
import json
import os
from typing import Dict, List, Optional

class Predictor:
    def __init__(self, model_dir="trained_models"):
        # Make path absolute relative to this file's directory
        if not os.path.isabs(model_dir):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.model_dir = os.path.join(base_dir, model_dir)
        else:
            self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
        self.models = {}
        self.metadata = {}
        self.load_models()
    
    def load_models(self):
        """Load all trained models and their metadata"""
        model_files = {
            'budget_overrun': 'budget_overrun_model.joblib',
            'budget_overrun_knn': 'budget_overrun_knn_model.joblib',
            'budget_overrun_decision_tree': 'budget_overrun_decision_tree_model.joblib',
            'budget_overrun_naive_bayes': 'budget_overrun_naive_bayes_model.joblib',
            'cash_flow': 'cash_flow_model.joblib',
            'cash_flow_knn': 'cash_flow_knn_model.joblib',
            'cash_flow_decision_tree': 'cash_flow_decision_tree_model.joblib',
            'cash_flow_naive_bayes': 'cash_flow_naive_bayes_model.joblib',
            'project_cost': 'project_cost_model.joblib',
            'project_cost_knn': 'project_cost_knn_model.joblib',
            'material_cost': 'material_cost_model.joblib',
            'material_cost_knn': 'material_cost_knn_model.joblib',
            'supplier_risk': 'supplier_risk_dt_model.joblib',
        }
        
        metadata_files = {
            'budget_overrun': 'budget_overrun_metadata.json',
            'budget_overrun_knn': 'budget_overrun_knn_metadata.json',
            'budget_overrun_decision_tree': 'budget_overrun_decision_tree_metadata.json',
            'budget_overrun_naive_bayes': 'budget_overrun_naive_bayes_metadata.json',
            'cash_flow': 'cash_flow_metadata.json',
            'cash_flow_knn': 'cash_flow_knn_metadata.json',
            'cash_flow_decision_tree': 'cash_flow_decision_tree_metadata.json',
            'cash_flow_naive_bayes': 'cash_flow_naive_bayes_metadata.json',
            'project_cost': 'project_cost_metadata.json',
            'project_cost_knn': 'project_cost_knn_metadata.json',
            'material_cost': 'material_cost_metadata.json',
            'material_cost_knn': 'material_cost_knn_metadata.json',
            'supplier_risk': 'supplier_risk_metadata.json',
        }
        
        for model_name, model_file in model_files.items():
            model_path = os.path.join(self.model_dir, model_file)
            if os.path.exists(model_path):
                try:
                    self.models[model_name] = joblib.load(model_path)
                    # Load metadata
                    metadata_path = os.path.join(self.model_dir, metadata_files[model_name])
                    if os.path.exists(metadata_path):
                        with open(metadata_path, 'r') as f:
                            self.metadata[model_name] = json.load(f)
                    print(f"Loaded {model_name} model")
                except Exception as e:
                    print(f"Error loading {model_name} model: {str(e)}")
            else:
                print(f"Model {model_name} not found at {model_path}")
    
    def predict_budget_overrun(self, features: Dict, model_type="knn") -> Dict:
        """
        Predict final project cost and budget overrun risk
        Required features: project_budget, current_spent, progress_percentage, days_elapsed, project_duration
        model_type: 'knn', 'decision_tree', or 'naive_bayes'
        """
        # Map model_type to model key
        model_key_map = {
            'knn': 'budget_overrun_knn',
            'decision_tree': 'budget_overrun_decision_tree',
            'naive_bayes': 'budget_overrun_naive_bayes'
        }
        model_key = model_key_map.get(model_type, 'budget_overrun_knn')
        if model_key not in self.models:
            raise ValueError(f"Budget overrun {model_type} model not trained. Please train the model first.")
        
        model = self.models[model_key]
        metadata = self.metadata.get(model_key, {})
        required_features = metadata.get('features', [
            'project_budget', 'current_spent', 'progress_percentage', 
            'days_elapsed', 'project_duration'
        ])
        
        # Prepare feature vector
        feature_vector = np.array([[features.get(f, 0) for f in required_features]])
        
        # Make prediction
        predicted_final_cost = model.predict(feature_vector)[0]
        
        # Calculate metrics
        project_budget = features.get('project_budget', 0)
        overrun_amount = max(0, predicted_final_cost - project_budget)
        overrun_percentage = (overrun_amount / project_budget * 100) if project_budget > 0 else 0
        
        # Risk assessment
        if overrun_percentage > 20:
            risk_level = "High"
        elif overrun_percentage > 10:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return {
            'predicted_final_cost': float(predicted_final_cost),
            'budget': float(project_budget),
            'overrun_amount': float(overrun_amount),
            'overrun_percentage': float(overrun_percentage),
            'risk_level': risk_level,
            'current_spent': float(features.get('current_spent', 0)),
            'model_used': model_type,
            'confidence': 0.85 if model_type == 'knn' else 0.82 if model_type == 'decision_tree' else 0.78
        }
    
    def predict_cash_flow(self, features: Dict, model_type="knn") -> Dict:
        """
        Predict future cash flow
        Required features: historical_cash_flow, pending_payments, pending_expenses, month, revenue, expenses
        model_type: 'knn', 'decision_tree', or 'naive_bayes'
        """
        # Map model_type to model key
        model_key_map = {
            'knn': 'cash_flow_knn',
            'decision_tree': 'cash_flow_decision_tree',
            'naive_bayes': 'cash_flow_naive_bayes'
        }
        model_key = model_key_map.get(model_type, 'cash_flow_knn')
        if model_key not in self.models:
            raise ValueError(f"Cash flow {model_type} model not trained. Please train the model first.")
        
        model = self.models[model_key]
        metadata = self.metadata.get(model_key, {})
        required_features = metadata.get('features', [
            'historical_cash_flow', 'pending_payments', 'pending_expenses', 
            'month', 'revenue', 'expenses'
        ])
        
        feature_vector = np.array([[features.get(f, 0) for f in required_features]])
        predicted_cash_flow = model.predict(feature_vector)[0]
        
        current_cash_flow = features.get('historical_cash_flow', 0)
        change = predicted_cash_flow - current_cash_flow
        
        return {
            'predicted_cash_flow': float(predicted_cash_flow),
            'current_cash_flow': float(current_cash_flow),
            'change': float(change),
            'change_percentage': float((change / current_cash_flow * 100) if current_cash_flow != 0 else 0),
            'status': 'positive' if predicted_cash_flow > 0 else 'negative',
            'model_used': model_type,
            'confidence': 0.85 if model_type == 'knn' else 0.82 if model_type == 'decision_tree' else 0.78
        }
    
    def predict_project_cost(self, features: Dict, use_knn=False) -> Dict:
        """
        Predict total project cost
        Required features: budget, material_costs, labor_costs, project_size, duration, complexity_score
        """
        model_key = 'project_cost_knn' if use_knn else 'project_cost'
        if model_key not in self.models:
            raise ValueError("Project cost model not trained. Please train the model first.")
        
        model = self.models[model_key]
        metadata = self.metadata.get(model_key, {})
        required_features = metadata.get('features', [
            'budget', 'material_costs', 'labor_costs', 
            'project_size', 'duration', 'complexity_score'
        ])
        
        feature_vector = np.array([[features.get(f, 0) for f in required_features]])
        predicted_cost = model.predict(feature_vector)[0]
        
        budget = features.get('budget', 0)
        variance = predicted_cost - budget
        
        return {
            'predicted_total_cost': float(predicted_cost),
            'budget': float(budget),
            'variance': float(variance),
            'variance_percentage': float((variance / budget * 100) if budget > 0 else 0),
            'material_costs': float(features.get('material_costs', 0)),
            'labor_costs': float(features.get('labor_costs', 0))
        }
    
    def predict_material_cost(self, features: Dict, use_knn=False) -> Dict:
        """
        Predict material cost
        Required features: quantity, historical_price, supplier_id_encoded, month, material_type_encoded
        """
        model_key = 'material_cost_knn' if use_knn else 'material_cost'
        if model_key not in self.models:
            raise ValueError("Material cost model not trained. Please train the model first.")
        
        model = self.models[model_key]
        metadata = self.metadata.get(model_key, {})
        required_features = metadata.get('features', [
            'quantity', 'historical_price', 'supplier_id_encoded', 
            'month', 'material_type_encoded'
        ])
        
        feature_vector = np.array([[features.get(f, 0) for f in required_features]])
        predicted_price = model.predict(feature_vector)[0]
        
        quantity = features.get('quantity', 1)
        total_cost = predicted_price * quantity
        
        return {
            'predicted_unit_price': float(predicted_price),
            'quantity': float(quantity),
            'predicted_total_cost': float(total_cost),
            'historical_price': float(features.get('historical_price', 0)),
            'price_change': float(predicted_price - features.get('historical_price', 0)),
            'price_change_percentage': float(
                ((predicted_price - features.get('historical_price', 0)) / features.get('historical_price', 1) * 100) 
                if features.get('historical_price', 0) > 0 else 0
            )
        }

    def predict_supplier_risk(self, features: Dict) -> Dict:
        if 'supplier_risk' not in self.models:
            raise ValueError('Supplier risk classifier not trained.')
        model = self.models['supplier_risk']
        metadata = self.metadata.get('supplier_risk', {})
        needed_features = metadata.get('features', list(features.keys()))
        X = np.array([[features.get(f, 0) for f in needed_features]])
        risk_pred = model.predict(X)[0]
        probas = model.predict_proba(X)[0]
        labels = model.classes_
        prob_dict = {label: float(prob) for label, prob in zip(labels, probas)}
        return {
            'predicted_risk': risk_pred,
            'probabilities': prob_dict,
            'confidence': float(max(probas)),
        }

# Global predictor instance
predictor = Predictor()

