"""
Modèle de prédiction de mortalité avec Random Forest
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import logging
from typing import List, Tuple, Optional

logger = logging.getLogger(__name__)

class MortalityPredictor:
    """Modèle de prédiction de mortalité"""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = []
        self.accuracy_metrics = {}
        
    def train_and_predict(self, X: np.ndarray, y: np.ndarray, 
                         horizon: int = 7, feature_names: Optional[List[str]] = None) -> np.ndarray:
        """
        Entraîne le modèle et fait des prédictions
        
        Args:
            X: Features d'entraînement
            y: Target d'entraînement
            horizon: Nombre de jours à prédire
            feature_names: Noms des features (optionnel)
            
        Returns:
            Prédictions pour les prochains jours
        """
        
        # Validation des données d'entrée
        if len(X) != len(y):
            raise ValueError("X et y doivent avoir la même longueur")
        
        if len(X) < 20:
            raise ValueError("Au moins 20 échantillons requis pour l'entraînement")
        
        if horizon <= 0:
            raise ValueError("L'horizon de prédiction doit être positif")
        
        if horizon > 30:
            logger.warning(f"Horizon de prédiction élevé ({horizon} jours) - précision peut diminuer")
        
        if feature_names:
            self.feature_names = feature_names
            
        logger.info(f"🤖 Entraînement du modèle Random Forest avec {len(X)} échantillons")
        
        # Division train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, shuffle=False
        )
        
        # Standardisation des features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entraînement du modèle
        self.model.fit(X_train_scaled, y_train)
        
        # Évaluation sur le test set
        y_pred_test = self.model.predict(X_test_scaled)
        
        # Calcul des métriques
        self.accuracy_metrics = {
            'mae': mean_absolute_error(y_test, y_pred_test),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred_test)),
            'r2': r2_score(y_test, y_pred_test),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
        logger.info(f"📊 Métriques du modèle: MAE={self.accuracy_metrics['mae']:.6f}, "
                   f"RMSE={self.accuracy_metrics['rmse']:.6f}, R²={self.accuracy_metrics['r2']:.3f}")
        
        # Prédictions futures
        predictions = self._predict_future(X, horizon)
        
        self.is_trained = True
        return predictions
    
    def _predict_future(self, X: np.ndarray, horizon: int) -> np.ndarray:
        """
        Prédit les valeurs futures en utilisant les dernières données
        
        Args:
            X: Dernières features disponibles
            horizon: Nombre de jours à prédire
            
        Returns:
            Prédictions pour les prochains jours
        """
        
        predictions = []
        last_features = X[-1:].copy()  # Dernière ligne de features
        
        for day in range(horizon):
            # Standardisation
            last_features_scaled = self.scaler.transform(last_features)
            
            # Prédiction
            pred = self.model.predict(last_features_scaled)[0]
            predictions.append(pred)
            
            # Mise à jour des features pour la prochaine prédiction
            # (simulation simple - en réalité il faudrait de vraies données futures)
            if day < horizon - 1:
                # On utilise la prédiction comme nouvelle valeur
                last_features[0, 3] = pred  # mortality_rate_lag1
                last_features[0, 4] = X[-7, 4] if len(X) >= 7 else pred  # mortality_rate_lag7
                
                # Mise à jour des moyennes mobiles (simplifiée)
                if len(X) >= 7:
                    last_features[0, 5] = np.mean(X[-7:, 3])  # mortality_rate_ma7
                if len(X) >= 14:
                    last_features[0, 6] = np.mean(X[-14:, 3])  # mortality_rate_ma14
                
                # Mise à jour de la volatilité
                if len(X) >= 7:
                    last_features[0, 7] = np.std(X[-7:, 3])  # mortality_rate_std7
        
        return np.array(predictions)
    
    def get_accuracy(self) -> dict:
        """Retourne les métriques de précision du modèle"""
        return self.accuracy_metrics
    
    def get_feature_importance(self) -> dict:
        """Retourne l'importance des features"""
        if not self.is_trained:
            return {}
        
        importance = self.model.feature_importances_
        feature_importance = {}
        
        for i, feature in enumerate(self.feature_names):
            feature_importance[feature] = float(importance[i])
        
        return feature_importance
    
    def predict_single(self, features: np.ndarray) -> float:
        """
        Prédit une seule valeur
        
        Args:
            features: Features pour la prédiction
            
        Returns:
            Prédiction
        """
        if not self.is_trained:
            raise ValueError("Le modèle doit être entraîné avant de faire des prédictions")
        
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        return float(self.model.predict(features_scaled)[0])
    
    def get_model_info(self) -> dict:
        """Retourne les informations du modèle"""
        return {
            "model_type": "Random Forest",
            "is_trained": self.is_trained,
            "feature_names": self.feature_names,
            "n_features": len(self.feature_names) if self.feature_names else 0,
            "parameters": {
                "n_estimators": self.model.n_estimators,
                "max_depth": self.model.max_depth,
                "random_state": self.model.random_state
            },
            "accuracy": self.accuracy_metrics if self.is_trained else None
        } 