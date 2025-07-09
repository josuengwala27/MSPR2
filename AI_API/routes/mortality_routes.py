"""
Routes pour les prédictions de mortalité
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta

from services.express_client import ExpressAPIClient
from models.mortality_model import MortalityPredictor

# Configuration du logger
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter()

# Initialisation du client Express API
express_client = ExpressAPIClient()

# Initialisation du modèle de prédiction
mortality_predictor = MortalityPredictor()

@router.get("/predict")
async def predict_mortality(
    pays: str = Query(..., description="Nom du pays ou code ISO"),
    source: str = Query(..., description="Source des données (covid, mpox)"),
    horizon: int = Query(7, description="Horizon de prédiction en jours (défaut: 7)"),
    reference_date: Optional[str] = Query(None, description="Date de référence pour les prédictions (YYYY-MM-DD). Défaut = aujourd'hui")
) -> Dict[str, Any]:
    """
    Prédit le taux de mortalité pour les prochains jours à partir de la date de référence (ou aujourd'hui).
    Utilise toutes les données historiques disponibles (de 2020-01-01 à la date de référence) pour entraîner le modèle.
    """
    if not source:
        raise HTTPException(status_code=400, detail="Le paramètre 'source' (ex: covid, mpox) est obligatoire.")
    # Détermination de la date de référence
    if reference_date:
        try:
            reference_date_obj = datetime.strptime(reference_date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez YYYY-MM-DD")
    else:
        reference_date_obj = datetime.now().replace(tzinfo=None)
    # Définir la période d'entraînement : 2020-01-01 à reference_date
    date_debut = '2020-01-01'
    date_fin = reference_date_obj.strftime('%Y-%m-%d')
    
    try:
        logger.info(f"🔮 Prédiction de mortalité pour {pays} (source: {source}, horizon: {horizon}j)")
        
        # 1. Récupération des données depuis l'API Express.js
        logger.info("📊 Récupération des données depuis l'API Express.js...")
        
        mortality_data = await express_client.get_mortality_rate(
            pays=pays,
            source=source,
            date_debut=date_debut,
            date_fin=date_fin,
            window=7
        )
        
        if not mortality_data.get("data") or len(mortality_data["data"]) < 30:
            raise HTTPException(
                status_code=400,
                detail=f"Données insuffisantes pour {pays}. Minimum 30 jours requis."
            )
        
        # 2. Préparation des données
        logger.info("🔧 Préparation des données...")
        
        df = pd.DataFrame(mortality_data["data"])
        df['date'] = pd.to_datetime(df['date'])
        # S'assurer que toutes les dates sont timezone-naive
        df['date'] = df['date'].dt.tz_localize(None)
        df = df.sort_values('date').reset_index(drop=True)
        
        # Suppression des valeurs nulles
        df = df.dropna(subset=['mortality_rate'])
        
        if len(df) < 30:
            raise HTTPException(
                status_code=400,
                detail=f"Données insuffisantes après nettoyage pour {pays}"
            )
        
        # 3. Création des features
        logger.info("🎯 Création des features...")
        
        # Features temporelles
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_year'] = df['date'].dt.dayofyear
        
        # Features de tendance
        df['mortality_rate_lag1'] = df['mortality_rate'].shift(1)
        df['mortality_rate_lag7'] = df['mortality_rate'].shift(7)
        df['mortality_rate_ma7'] = df['mortality_rate'].rolling(window=7).mean()
        df['mortality_rate_ma14'] = df['mortality_rate'].rolling(window=14).mean()
        
        # Features de volatilité
        df['mortality_rate_std7'] = df['mortality_rate'].rolling(window=7).std()
        
        # Suppression des lignes avec valeurs manquantes
        df = df.dropna()
        
        if len(df) < 20:
            raise HTTPException(
                status_code=400,
                detail=f"Données insuffisantes après création des features pour {pays}"
            )
        
        # 4. Préparation des features et target
        feature_columns = [
            'day_of_week', 'month', 'day_of_year',
            'mortality_rate_lag1', 'mortality_rate_lag7',
            'mortality_rate_ma7', 'mortality_rate_ma14',
            'mortality_rate_std7'
        ]
        
        X = df[feature_columns].values
        y = df['mortality_rate'].values
        
        # 5. Entraînement du modèle
        logger.info("🤖 Entraînement du modèle Random Forest...")
        
        predictions = mortality_predictor.train_and_predict(
            X=X,
            y=y,
            horizon=horizon,
            feature_names=feature_columns
        )
        
        # 6. Détection de l'extrapolation
        last_data_date = df['date'].iloc[-1]
        # S'assurer que last_data_date est timezone-naive pour la comparaison
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
        
        # 7. Préparation des dates de prédiction
        prediction_dates = [
            (reference_date_obj + timedelta(days=i+1)).strftime('%Y-%m-%d')
            for i in range(horizon)
        ]
        
        # 8. Formatage de la réponse
        prediction_data = [
            {
                "date": date,
                "predicted_mortality_rate": float(pred),
                "confidence_interval": {
                    "lower": float(max(0, pred - 0.001)),  # Pas de taux négatif
                    "upper": float(pred + 0.001)
                }
            }
            for date, pred in zip(prediction_dates, predictions)
        ]
        
        # 9. Métadonnées du modèle
        model_metadata = {
            "model_type": "Random Forest",
            "features_used": feature_columns,
            "training_samples": len(X),
            "last_training_date": last_data_date.strftime('%Y-%m-%d'),
            "prediction_horizon": horizon,
            "model_accuracy": mortality_predictor.get_accuracy(),
            "reference_date": reference_date_obj.strftime('%Y-%m-%d'),
            "reference_source": "user_specified",
            "data_quality": {
                "total_points": len(df),
                "non_null_points": len(df.dropna(subset=['mortality_rate'])),
                "quality_score": round((len(df.dropna(subset=['mortality_rate'])) / len(df)) * 100, 2)
            }
        }
        
        logger.info(f"✅ Prédiction terminée pour {pays}")
        
        response = {
            "predictions": prediction_data,
            "metadata": {
                "pays": pays,
                "source": source,
                "request_date": datetime.now().replace(tzinfo=None).isoformat(),
                "model": model_metadata
            }
        }
        
        # Ajouter l'avertissement d'extrapolation si nécessaire
        if extrapolation_warning:
            response["extrapolation_warning"] = extrapolation_warning
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors de la prédiction de mortalité: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la prédiction: {str(e)}"
        )

@router.get("/model-info")
async def get_mortality_model_info() -> Dict[str, Any]:
    """Retourne les informations sur le modèle de mortalité"""
    
    return {
        "model_type": "Random Forest",
        "description": "Modèle de prédiction du taux de mortalité basé sur les données historiques",
        "features": [
            "day_of_week",
            "month", 
            "day_of_year",
            "mortality_rate_lag1",
            "mortality_rate_lag7",
            "mortality_rate_ma7",
            "mortality_rate_ma14",
            "mortality_rate_std7"
        ],
        "parameters": {
            "n_estimators": 100,
            "max_depth": 10,
            "random_state": 42
        },
        "min_data_required": 30,
        "prediction_horizon_max": 30,
        "date_options": {
            "use_current_date": "Utiliser la date actuelle (défaut)",
            "reference_date": "Spécifier une date de référence personnalisée",
            "last_data_date": "Utiliser la dernière date des données d'entraînement"
        }
    }

@router.get("/data-quality")
async def check_data_quality(
    pays: str = Query(..., description="Nom du pays ou code ISO"),
    source: str = Query(..., description="Source des données (covid, mpox)")
) -> Dict[str, Any]:
    """Vérifie la qualité des données pour la prédiction de mortalité"""
    
    if not source:
        raise HTTPException(status_code=400, detail="Le paramètre 'source' (ex: covid, mpox) est obligatoire.")
    
    try:
        # Récupération des données
        mortality_data = await express_client.get_mortality_rate(
            pays=pays,
            source=source
        )
        
        if not mortality_data.get("data"):
            return {
                "pays": pays,
                "source": source,
                "quality": "insufficient",
                "message": "Aucune donnée disponible",
                "data_points": 0
            }
        
        df = pd.DataFrame(mortality_data["data"])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # Analyse de la qualité
        total_points = len(df)
        non_null_points = len(df.dropna(subset=['mortality_rate']))
        date_range = (df['date'].max() - df['date'].min()).days
        
        quality_score = min(100, (non_null_points / max(1, total_points)) * 100)
        
        quality_level = "excellent" if quality_score >= 90 else \
                       "good" if quality_score >= 65 else \
                       "fair" if quality_score >= 50 else "poor"
        
        return {
            "pays": pays,
            "source": source,
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
        logger.error(f"❌ Erreur lors de la vérification de qualité: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la vérification: {str(e)}"
        )

@router.get("/test-date-configurations")
async def test_date_configurations(
    pays: str = Query(..., description="Nom du pays ou code ISO"),
    source: str = Query(..., description="Source des données (covid, mpox)"),
    horizon: int = Query(7, description="Horizon de prédiction en jours (défaut: 7)")
) -> Dict[str, Any]:
    """
    Teste différentes configurations de dates pour les prédictions
    Retourne les prédictions avec différentes dates de référence pour comparaison
    """
    if not source:
        raise HTTPException(status_code=400, detail="Le paramètre 'source' (ex: covid, mpox) est obligatoire.")
    try:
        logger.info(f"🧪 Test des configurations de dates pour {pays}")
        configurations = [
            {
                "name": "Date actuelle",
                "params": {"reference_date": None}
            },
            {
                "name": "Date personnalisée (2025-01-01)",
                "params": {"reference_date": "2025-01-01"}
            },
            {
                "name": "Date personnalisée (2024-06-01)",
                "params": {"reference_date": "2024-06-01"}
            },
            {
                "name": "Dernière date des données",
                "params": {"reference_date": None}
            }
        ]
        results = {}
        for config in configurations:
            try:
                prediction_result = await predict_mortality(
                    pays=pays,
                    source=source,
                    horizon=horizon,
                    reference_date=config["params"]["reference_date"]
                )
                results[config["name"]] = {
                    "status": "success",
                    "reference_date": prediction_result["metadata"]["model"]["reference_date"],
                    "reference_source": prediction_result["metadata"]["model"]["reference_source"],
                    "first_prediction_date": prediction_result["predictions"][0]["date"],
                    "last_prediction_date": prediction_result["predictions"][-1]["date"],
                    "sample_prediction": prediction_result["predictions"][0]
                }
            except Exception as e:
                logger.error(f"❌ Erreur pour la configuration '{config['name']}' : {e}")
                results[config["name"]] = {
                    "status": "error",
                    "error": str(e)
                }
        return {
            "pays": pays,
            "source": source,
            "horizon": horizon,
            "test_date": datetime.now().replace(tzinfo=None).isoformat(),
            "configurations": results,
            "summary": {
                "total_configurations": len(configurations),
                "successful": len([r for r in results.values() if r["status"] == "success"]),
                "failed": len([r for r in results.values() if r["status"] == "error"])
            }
        }
    except Exception as e:
        logger.error(f"❌ Erreur lors du test des configurations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du test: {str(e)}"
        ) 