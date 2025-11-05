"""
Train Linear Regression Models for Financial Predictions
This script trains models and saves them for use in predictions
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
from datetime import datetime
import json
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier

class FinancialPredictor:
    def __init__(self, model_dir="trained_models"):
        # Make path absolute relative to this file's directory
        if not os.path.isabs(model_dir):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.model_dir = os.path.join(base_dir, model_dir)
        else:
            self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
    
    def train_budget_overrun_model(self, data, model_type="linear"):
        """
        Train model to predict budget overrun probability/amount
        model_type: "linear" (default) or "knn"
        Features: project_budget, current_spent, progress_percentage, days_elapsed, project_duration
        Target: final_cost (or overrun_amount)
        """
        try:
            df = pd.DataFrame(data)
            
            # Feature engineering
            features = ['project_budget', 'current_spent', 'progress_percentage', 
                       'days_elapsed', 'project_duration']
            
            # Calculate target (estimated final cost)
            if 'final_cost' not in df.columns:
                # Estimate final cost based on current spending and progress
                df['final_cost'] = df['current_spent'] / (df['progress_percentage'] / 100 + 0.01)
            
            X = df[features].fillna(0)
            y = df['final_cost'].fillna(df['project_budget'])
            
            # Remove any infinite or invalid values
            mask = np.isfinite(X).all(axis=1) & np.isfinite(y)
            X = X[mask]
            y = y[mask]
            
            if len(X) < 5:
                raise ValueError("Insufficient data for training. Need at least 5 samples.")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            if model_type == "knn":
                model = KNeighborsRegressor(n_neighbors=5)
            else:
                model = LinearRegression()
            model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            # Save model
            if model_type == "knn":
                model_path = os.path.join(self.model_dir, 'budget_overrun_knn_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "knn"
                }
            else:
                model_path = os.path.join(self.model_dir, 'budget_overrun_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "linear"
                }
            
            # Save feature names
            with open(os.path.join(self.model_dir, 'budget_overrun_metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Budget Overrun Model trained. R² Score: {r2:.4f}, MAE: {mae:.2f}")
            return model, metadata
            
        except Exception as e:
            print(f"Error training budget overrun model: {str(e)}")
            raise
    
    def train_cash_flow_model(self, data, model_type="linear"):
        """
        Train model to predict future cash flow
        model_type: "linear" (default) or "knn"
        Features: historical_cash_flow, pending_payments, pending_expenses, month
        Target: next_month_cash_flow
        """
        try:
            df = pd.DataFrame(data)
            
            features = ['historical_cash_flow', 'pending_payments', 'pending_expenses', 
                       'month', 'revenue', 'expenses']
            
            if 'next_cash_flow' not in df.columns:
                df['next_cash_flow'] = df['historical_cash_flow'] + df.get('revenue', 0) - df.get('expenses', 0)
            
            X = df[features].fillna(0)
            y = df['next_cash_flow'].fillna(0)
            
            mask = np.isfinite(X).all(axis=1) & np.isfinite(y)
            X = X[mask]
            y = y[mask]
            
            if len(X) < 5:
                raise ValueError("Insufficient data for training.")
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            if model_type == "knn":
                model = KNeighborsRegressor(n_neighbors=5)
            else:
                model = LinearRegression()
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            if model_type == "knn":
                model_path = os.path.join(self.model_dir, 'cash_flow_knn_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "knn"
                }
            else:
                model_path = os.path.join(self.model_dir, 'cash_flow_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "linear"
                }
            
            with open(os.path.join(self.model_dir, 'cash_flow_metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Cash Flow Model trained. R² Score: {r2:.4f}, MAE: {mae:.2f}")
            return model, metadata
            
        except Exception as e:
            print(f"Error training cash flow model: {str(e)}")
            raise
    
    def train_project_cost_model(self, data, model_type="linear"):
        """
        Train model to predict total project cost
        model_type: "linear" (default) or "knn"
        Features: budget, material_costs, labor_costs, project_size, duration
        Target: total_cost
        """
        try:
            df = pd.DataFrame(data)
            
            features = ['budget', 'material_costs', 'labor_costs', 
                       'project_size', 'duration', 'complexity_score']
            
            if 'total_cost' not in df.columns:
                df['total_cost'] = df['material_costs'] + df['labor_costs']
            
            X = df[features].fillna(0)
            y = df['total_cost'].fillna(df['budget'])
            
            mask = np.isfinite(X).all(axis=1) & np.isfinite(y)
            X = X[mask]
            y = y[mask]
            
            if len(X) < 5:
                raise ValueError("Insufficient data for training.")
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            if model_type == "knn":
                model = KNeighborsRegressor(n_neighbors=5)
            else:
                model = LinearRegression()
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            if model_type == "knn":
                model_path = os.path.join(self.model_dir, 'project_cost_knn_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "knn"
                }
            else:
                model_path = os.path.join(self.model_dir, 'project_cost_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "linear"
                }
            
            with open(os.path.join(self.model_dir, 'project_cost_metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Project Cost Model trained. R² Score: {r2:.4f}, MAE: {mae:.2f}")
            return model, metadata
            
        except Exception as e:
            print(f"Error training project cost model: {str(e)}")
            raise
    
    def train_material_cost_model(self, data, model_type="linear"):
        """
        Train model to predict material cost
        model_type: "linear" (default) or "knn"
        Features: quantity, historical_price, supplier_id_encoded, month
        Target: predicted_price
        """
        try:
            df = pd.DataFrame(data)
            
            features = ['quantity', 'historical_price', 'supplier_id_encoded', 
                       'month', 'material_type_encoded']
            
            if 'predicted_price' not in df.columns:
                df['predicted_price'] = df['historical_price']
            
            X = df[features].fillna(0)
            y = df['predicted_price'].fillna(0)
            
            mask = np.isfinite(X).all(axis=1) & np.isfinite(y)
            X = X[mask]
            y = y[mask]
            
            if len(X) < 5:
                raise ValueError("Insufficient data for training.")
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            if model_type == "knn":
                model = KNeighborsRegressor(n_neighbors=5)
            else:
                model = LinearRegression()
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            if model_type == "knn":
                model_path = os.path.join(self.model_dir, 'material_cost_knn_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "knn"
                }
            else:
                model_path = os.path.join(self.model_dir, 'material_cost_model.joblib')
                metadata = {
                    'features': features,
                    'mse': float(mse),
                    'r2_score': float(r2),
                    'mae': float(mae),
                    'trained_at': datetime.now().isoformat(),
                    'training_samples': len(X_train),
                    'model_type': "linear"
                }
            
            with open(os.path.join(self.model_dir, 'material_cost_metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Material Cost Model trained. R² Score: {r2:.4f}, MAE: {mae:.2f}")
            return model, metadata
            
        except Exception as e:
            print(f"Error training material cost model: {str(e)}")
            raise

    def train_supplier_risk_model(self, data, model_type="decision_tree"):
        """
        Train a decision tree classifier to predict supplier risk level
        model_type: Only 'decision_tree' supported for now
        Features: Any numeric/categorical features present in supplier
        Target: risk_level (class label: e.g., 'High', 'Medium', 'Low')
        """
        try:
            df = pd.DataFrame(data)
            features = [col for col in df.columns if col not in ["risk_level"]]
            X = df[features].fillna(0)
            y = df["risk_level"].fillna("Unknown")
            # Remove bad samples
            mask = np.isfinite(X.select_dtypes(include=[float, int])).all(axis=1)
            X = X[mask]
            y = y[mask]
            if len(X) < 5:
                raise ValueError("Insufficient data for supplier risk training. Need at least 5 samples.")
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            model = DecisionTreeClassifier(random_state=42)
            model.fit(X_train, y_train)
            accuracy = model.score(X_test, y_test)
            from sklearn.metrics import classification_report
            y_pred = model.predict(X_test)
            report = classification_report(y_test, y_pred, output_dict=True)
            model_path = os.path.join(self.model_dir, 'supplier_risk_dt_model.joblib')
            joblib.dump(model, model_path)
            metadata = {
                'features': features,
                'accuracy': accuracy,
                'report': report,
                'trained_at': datetime.now().isoformat(),
                'training_samples': len(X_train),
                'model_type': "decision_tree"
            }
            with open(os.path.join(self.model_dir, 'supplier_risk_metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2)
            print(f"Supplier Risk Decision Tree trained. Accuracy: {accuracy:.3f}")
            return model, metadata
        except Exception as e:
            print(f"Error training supplier risk model: {str(e)}")
            raise

if __name__ == "__main__":
    print("Financial Predictor Training Script")
    print("Models should be trained using the API endpoint /ml/train")

