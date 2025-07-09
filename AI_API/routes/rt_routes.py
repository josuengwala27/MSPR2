"""
Routes pour les prédictions Rt (nombre de reproduction)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta

from services.express_client import ExpressAPIClient
from models.rt_model import RtLSTMPredictor

logger = logging.getLogger(__name__)

router = APIRouter()
express_client = ExpressAPIClient()
rt_predictor = RtLSTMPredictor()

@router.get("/predict")
async def predict_rt(
    pays: str = Query(..., description="Nom du pays ou code ISO"),
    indicator: str = Query(..., description="Indicateur (cases, deaths)"),
    source: str = Query(..., description="Source des données (covid, mpox)"),
    horizon: int = Query(7, description="Horizon de prédiction en jours (défaut: 7)"),
    reference_date: Optional[str] = Query(None, description="Date de référence pour les prédictions (YYYY-MM-DD). Défaut = aujourd'hui")
) -> Dict[str, Any]:
    """
    Prédit le taux de transmission (Rt) pour les prochains jours à partir de la date de référence (ou aujourd'hui).
    Utilise toutes les données historiques disponibles pour entraîner le modèle LSTM.
    """
    if not source:
        raise HTTPException(status_code=400, detail="Le paramètre 'source' (ex: covid, mpox) est obligatoire.")
    if not indicator:
        raise HTTPException(status_code=400, detail="Le paramètre 'indicator' (cases, deaths) est obligatoire.")
    # Détermination de la date de référence
    if reference_date:
        try:
            reference_date_obj = datetime.strptime(reference_date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez YYYY-MM-DD")
    else:
        reference_date_obj = datetime.now().replace(tzinfo=None)
    date_debut = '2020-01-01'
    date_fin = reference_date_obj.strftime('%Y-%m-%d')
    try:
        logger.info(f"🔮 Prédiction Rt pour {pays} (source: {source}, indicator: {indicator}, horizon: {horizon}j)")
        # 1. Récupération des données
        rt_data = await express_client.get_rt_data(
            pays=pays,
            indicator=indicator,
            source=source,
            date_debut=date_debut,
            date_fin=date_fin,
            window=7
        )
        if not rt_data.get("data") or len(rt_data["data"]) < 30:
            raise HTTPException(
                status_code=400,
                detail=f"Données Rt insuffisantes pour {pays}. Minimum 30 jours requis."
            )
        # 2. Préparation des données
        df = pd.DataFrame(rt_data["data"])
        df['date'] = pd.to_datetime(df['date'])
        df['date'] = df['date'].dt.tz_localize(None)
        df = df.sort_values('date').reset_index(drop=True)
        df = df.dropna(subset=['Rt'])
        if len(df) < 30:
            raise HTTPException(
                status_code=400,
                detail=f"Données Rt insuffisantes après nettoyage pour {pays}"
            )
        # 3. Création des features temporelles
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_year'] = df['date'].dt.dayofyear
        # Lags et moyennes mobiles
        df['rt_lag1'] = df['Rt'].shift(1)
        df['rt_lag7'] = df['Rt'].shift(7)
        df['rt_ma7'] = df['Rt'].rolling(window=7).mean()
        df['rt_ma14'] = df['Rt'].rolling(window=14).mean()
        df['rt_std7'] = df['Rt'].rolling(window=7).std()
        df = df.dropna()
        if len(df) < 20:
            raise HTTPException(
                status_code=400,
                detail=f"Données Rt insuffisantes après création des features pour {pays}"
            )
        feature_columns = [
            'day_of_week', 'month', 'day_of_year',
            'rt_lag1', 'rt_lag7', 'rt_ma7', 'rt_ma14', 'rt_std7'
        ]
        X = df[feature_columns].values
        y = df['Rt'].values
        # 4. Entraînement du modèle LSTM
        predictions = rt_predictor.train_and_predict(
            X=X,
            y=y,
            horizon=horizon,
            feature_names=feature_columns
        )
        # 5. Détection de l'extrapolation
        last_data_date = df['date'].iloc[-1]
        if last_data_date.tzinfo is not None:
            last_data_date = last_data_date.replace(tzinfo=None)
        is_extrapolation = reference_date_obj > last_data_date
        extrapolation_warning = None
        if is_extrapolation:
            extrapolation_days = (reference_date_obj - last_data_date).days
            extrapolation_warning = {
                "warning": True,
                "message": f"La date de prédiction demandée ({reference_date_obj.strftime('%Y-%m-%d')}) est postérieure à la dernière donnée disponible ({last_data_date.strftime('%Y-%m-%d')}). La prédiction est une extrapolation et peut être peu fiable.",
                "last_data_date": last_data_date.strftime('%Y-%m-%d'),
                "extrapolation_days": extrapolation_days,
                "confidence_level": "low" if extrapolation_days > 30 else "medium"
            }
            logger.warning(f"⚠️ Extrapolation détectée: {extrapolation_days} jours au-delà des données")
        # 6. Préparation des dates de prédiction
        prediction_dates = [
            (reference_date_obj + timedelta(days=i+1)).strftime('%Y-%m-%d')
            for i in range(horizon)
        ]
        # 7. Formatage de la réponse
        prediction_data = [
            {
                "date": date,
                "predicted_rt": float(pred),
                "confidence_interval": {
                    "lower": float(max(0, pred - 0.05)),
                    "upper": float(pred + 0.05)
                }
            }
            for date, pred in zip(prediction_dates, predictions)
        ]
        # 8. Métadonnées du modèle
        model_metadata = {
            "model_type": "LSTM",
            "features_used": feature_columns,
            "training_samples": len(X),
            "last_training_date": last_data_date.strftime('%Y-%m-%d'),
            "prediction_horizon": horizon,
            "model_accuracy": rt_predictor.get_accuracy(),
            "reference_date": reference_date_obj.strftime('%Y-%m-%d'),
            "reference_source": "user_specified",
            "data_quality": {
                "total_points": len(df),
                "non_null_points": len(df.dropna(subset=['Rt'])),
                "quality_score": round((len(df.dropna(subset=['Rt'])) / len(df)) * 100, 2)
            }
        }
        logger.info(f"✅ Prédiction Rt terminée pour {pays}")
        response = {
            "predictions": prediction_data,
            "metadata": {
                "pays": pays,
                "source": source,
                "indicator": indicator,
                "request_date": datetime.now().replace(tzinfo=None).isoformat(),
                "model": model_metadata
            }
        }
        if extrapolation_warning:
            response["extrapolation_warning"] = extrapolation_warning
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors de la prédiction Rt: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la prédiction Rt: {str(e)}"
        )

@router.get("/model-info")
async def get_rt_model_info() -> Dict[str, Any]:
    """Retourne les informations sur le modèle Rt (LSTM)"""
    return rt_predictor.get_model_info()

@router.get("/data-quality")
async def check_rt_data_quality(
    pays: str = Query(..., description="Nom du pays ou code ISO"),
    indicator: str = Query(..., description="Indicateur (cases, deaths)"),
    source: str = Query(..., description="Source des données (covid, mpox)")
) -> Dict[str, Any]:
    """Vérifie la qualité des données pour la prédiction Rt"""
    if not source:
        raise HTTPException(status_code=400, detail="Le paramètre 'source' (ex: covid, mpox) est obligatoire.")
    if not indicator:
        raise HTTPException(status_code=400, detail="Le paramètre 'indicator' (cases, deaths) est obligatoire.")
    try:
        rt_data = await express_client.get_rt_data(
            pays=pays,
            indicator=indicator,
            source=source
        )
        if not rt_data.get("data"):
            return {
                "pays": pays,
                "source": source,
                "indicator": indicator,
                "quality": "insufficient",
                "message": "Aucune donnée disponible",
                "data_points": 0
            }
        df = pd.DataFrame(rt_data["data"])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        total_points = len(df)
        non_null_points = len(df.dropna(subset=['Rt']))
        date_range = (df['date'].max() - df['date'].min()).days
        quality_score = min(100, (non_null_points / max(1, total_points)) * 100)
        quality_level = "excellent" if quality_score >= 90 else \
                       "good" if quality_score >= 65 else \
                       "fair" if quality_score >= 50 else "poor"
        return {
            "pays": pays,
            "source": source,
            "indicator": indicator,
            "quality": quality_level,
            "quality_score": round(quality_score, 2),
            "data_points": {
                "total": total_points,
                "non_null": non_null_points,
                "null_percentage": round((total_points - non_null_points) / total_points * 100, 2)
            },
            "date_range": {
                "start": df['date'].min().strftime('%Y-%m-%d'),
                "end": df['date'].max().strftime('%Y-%m-%d'),
                "days": date_range
            },
            "recommendation": "ready" if quality_score >= 65 else "needs_more_data"
        }
    except Exception as e:
        logger.error(f"❌ Erreur lors de la vérification de qualité Rt: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la vérification de qualité Rt: {str(e)}"
        ) 