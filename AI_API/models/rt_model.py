import numpy as np
import pandas as pd
from typing import List, Optional
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import logging

logger = logging.getLogger(__name__)

class RtLSTMPredictor:
    """
    Modèle LSTM pour la prédiction du taux de transmission (Rt)
    """
    def __init__(self, window_size: int = 14, n_units: int = 64, dropout: float = 0.2, patience: int = 10):
        self.window_size = window_size
        self.n_units = n_units
        self.dropout = dropout
        self.patience = patience
        self.scaler_X = StandardScaler()
        self.scaler_y = StandardScaler()
        self.model = None
        self.is_trained = False
        self.feature_names = []
        self.accuracy_metrics = {}

    def _create_model(self, input_shape):
        model = Sequential()
        model.add(LSTM(self.n_units, input_shape=input_shape, return_sequences=False))
        model.add(Dropout(self.dropout))
        model.add(Dense(1))
        model.compile(optimizer='adam', loss='mse')
        return model

    def _prepare_sequences(self, X, y):
        X_seq, y_seq = [], []
        for i in range(len(X) - self.window_size):
            X_seq.append(X[i:i+self.window_size])
            y_seq.append(y[i+self.window_size])
        return np.array(X_seq), np.array(y_seq)

    def train_and_predict(self, X: np.ndarray, y: np.ndarray, horizon: int = 7, feature_names: Optional[List[str]] = None):
        """
        Entraîne le modèle LSTM et prédit Rt pour l'horizon demandé.
        Args:
            X: Features d'entraînement (2D)
            y: Target (Rt)
            horizon: Nombre de jours à prédire
            feature_names: Noms des features
        Returns:
            Prédictions pour les prochains jours (array)
        """
        if len(X) != len(y):
            raise ValueError("X et y doivent avoir la même longueur")
        if len(X) < self.window_size + 20:
            raise ValueError(f"Au moins {self.window_size + 20} échantillons requis pour l'entraînement")
        if horizon <= 0:
            raise ValueError("L'horizon de prédiction doit être positif")
        if feature_names:
            self.feature_names = feature_names

        # Scaling
        X_scaled = self.scaler_X.fit_transform(X)
        y_scaled = self.scaler_y.fit_transform(y.reshape(-1, 1)).flatten()

        # Séquences pour LSTM
        X_seq, y_seq = self._prepare_sequences(X_scaled, y_scaled)
        X_seq = X_seq.astype(np.float32)
        y_seq = y_seq.astype(np.float32)

        # Split train/test (80/20, pas shuffle)
        split_idx = int(0.8 * len(X_seq))
        X_train, X_test = X_seq[:split_idx], X_seq[split_idx:]
        y_train, y_test = y_seq[:split_idx], y_seq[split_idx:]

        # Création du modèle
        self.model = self._create_model(input_shape=(self.window_size, X.shape[1]))

        # Early stopping
        early_stop = EarlyStopping(monitor='val_loss', patience=self.patience, restore_best_weights=True)

        # Entraînement
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=100,
            batch_size=16,
            callbacks=[early_stop],
            verbose=0
        )

        # Évaluation
        y_pred_test = self.model.predict(X_test)
        y_pred_test_inv = self.scaler_y.inverse_transform(y_pred_test.reshape(-1, 1)).flatten()
        y_test_inv = self.scaler_y.inverse_transform(y_test.reshape(-1, 1)).flatten()
        self.accuracy_metrics = {
            'mae': float(mean_absolute_error(y_test_inv, y_pred_test_inv)),
            'rmse': float(np.sqrt(mean_squared_error(y_test_inv, y_pred_test_inv))),
            'r2': float(r2_score(y_test_inv, y_pred_test_inv)),
            'training_samples': int(len(X_train)),
            'test_samples': int(len(X_test))
        }

        logger.info(f"📊 LSTM Rt - MAE={self.accuracy_metrics['mae']:.4f}, RMSE={self.accuracy_metrics['rmse']:.4f}, R²={self.accuracy_metrics['r2']:.3f}")

        # Prédiction future (rolling forecast)
        last_seq = X_scaled[-self.window_size:].copy()
        preds_scaled = []
        for _ in range(horizon):
            input_seq = last_seq.reshape(1, self.window_size, X.shape[1])
            pred_scaled = self.model.predict(input_seq)[0, 0]
            preds_scaled.append(pred_scaled)
            # Rolling window : on ajoute la prédiction, on décale
            new_row = last_seq[-1].copy()
            new_row[0] = pred_scaled  # On peut raffiner selon la feature cible
            last_seq = np.vstack([last_seq[1:], new_row])
        preds = self.scaler_y.inverse_transform(np.array(preds_scaled).reshape(-1, 1)).flatten()
        self.is_trained = True
        return preds

    def get_accuracy(self):
        """Retourne les métriques de précision du modèle"""
        return self.accuracy_metrics

    def get_model_info(self):
        """Retourne les informations du modèle"""
        return {
            "model_type": "LSTM",
            "window_size": self.window_size,
            "n_units": self.n_units,
            "dropout": self.dropout,
            "patience": self.patience,
            "is_trained": self.is_trained,
            "feature_names": self.feature_names,
            "accuracy": self.accuracy_metrics if self.is_trained else None
        } 