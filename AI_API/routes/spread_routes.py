"""
Routes pour les prédictions de propagation géographique
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
import logging
from services.express_client import ExpressAPIClient
from models.clustering_model import cluster_countries
from fastapi.responses import JSONResponse
from fastapi import status

logger = logging.getLogger(__name__)

router = APIRouter()

express_client = ExpressAPIClient()

@router.get(
    "/predict",
    summary="Clustering géographique des pays (propagation)",
    tags=["Spread Predictions"],
    response_description="Groupes de pays similaires selon la dynamique de l'indicateur choisi",
    responses={
        200: {
            "description": "Clusters de pays similaires",
            "content": {
                "application/json": {
                    "example": {
                        "clusters": [
                            {
                                "cluster": 1,
                                "countries": [
                                    {"iso_code": "TCD", "country": "Chad"},
                                    {"iso_code": "KGZ", "country": "Kyrgyzstan"},
                                    {"iso_code": "PCN", "country": "Pitcairn"},
                                    {"iso_code": "TKL", "country": "Tokelau"},
                                    {"iso_code": "TKM", "country": "Turkmenistan"},
                                    {"iso_code": "TUV", "country": "Tuvalu"},
                                    {"iso_code": "VAT", "country": "Vatican"},
                                    {"iso_code": "ASM", "country": "American Samoa"},
                                    {"iso_code": "ARG", "country": "Argentina"},
                                    {"iso_code": "ABW", "country": "Aruba"},
                                    {"iso_code": "BHS", "country": "Bahamas"},
                                    {"iso_code": "BHR", "country": "Bahrain"},
                                    {"iso_code": "BRB", "country": "Barbados"},
                                    {"iso_code": "BTN", "country": "Bhutan"},
                                    {"iso_code": "BRA", "country": "Brazil"},
                                    {"iso_code": "VGB", "country": "British Virgin Islands"},
                                    {"iso_code": "CPV", "country": "Cape Verde"},
                                    {"iso_code": "NPL", "country": "Nepal"},
                                    {"iso_code": "RWA", "country": "Rwanda"}
                                ]
                            },
                            {
                                "cluster": 2,
                                "countries": [
                                    {"iso_code": "AGO", "country": "Angola"},
                                    {"iso_code": "BWA", "country": "Botswana"},
                                    {"iso_code": "BFA", "country": "Burkina Faso"},
                                    {"iso_code": "FLK", "country": "Falkland Islands"},
                                    {"iso_code": "PYF", "country": "French Polynesia"},
                                    {"iso_code": "PSE", "country": "Palestine"},
                                    {"iso_code": "ALB", "country": "Albania"},
                                    {"iso_code": "DZA", "country": "Algeria"},
                                    {"iso_code": "AND", "country": "Andorra"},
                                    {"iso_code": "AIA", "country": "Anguilla"},
                                    {"iso_code": "ARM", "country": "Armenia"},
                                    {"iso_code": "AUT", "country": "Austria"},
                                    {"iso_code": "AZE", "country": "Azerbaijan"},
                                    {"iso_code": "BLR", "country": "Belarus"},
                                    {"iso_code": "BEL", "country": "Belgium"},
                                    {"iso_code": "BLZ", "country": "Belize"},
                                    {"iso_code": "BMU", "country": "Bermuda"}
                                ]
                            },
                            {
                                "cluster": 3,
                                "countries": [
                                    {"iso_code": "GNB", "country": "Guinea-Bissau"},
                                    {"iso_code": "HTI", "country": "Haiti"},
                                    {"iso_code": "KAZ", "country": "Kazakhstan"},
                                    {"iso_code": "MDG", "country": "Madagascar"},
                                    {"iso_code": "AFG", "country": "Afghanistan"},
                                    {"iso_code": "ATG", "country": "Antigua and Barbuda"},
                                    {"iso_code": "AUS", "country": "Australia"},
                                    {"iso_code": "BEN", "country": "Benin"},
                                    {"iso_code": "BOL", "country": "Bolivia"},
                                    {"iso_code": "BDI", "country": "Burundi"},
                                    {"iso_code": "KHM", "country": "Cambodia"}
                                ]
                            }
                        ],
                        "meta": {
                            "indicator": "cases",
                            "source": "covid",
                            "k": 3,
                            "count": 234
                        }
                    }
                }
            }
        },
        400: {"description": "Paramètres manquants ou invalides"},
        500: {"description": "Erreur interne du serveur"},
        501: {"description": "Clustering déjà effectué côté Express.js"}
    }
)
async def predict_spread(
    indicator: str = Query(..., description="Indicateur à clusteriser (cases, deaths)", example="cases"),
    source: str = Query(..., description="Source des données (covid, mpox)", example="covid"),
    k: int = Query(3, description="Nombre de clusters à former (défaut: 3)", ge=2, le=20, example=3)
) -> Dict[str, Any]:
    """
    Prédit la propagation géographique par clustering KMeans.
    
    - Récupère les séries temporelles de chaque pays via l'API Express.js (/geographic-spread).
    - Applique un clustering KMeans sur les dynamiques temporelles de l'indicateur choisi (cases ou deaths).
    - Retourne les groupes de pays similaires, avec métadonnées et explications.
    
    **Exemples d'usage :**
    - `/api/spread/predict?indicator=cases&source=covid&k=3`
    - `/api/spread/predict?indicator=deaths&source=mpox&k=4`
    
    **Réponse :**
    - `clusters` : liste des groupes, chaque groupe contient les pays (code ISO, nom)
    - `meta` : informations sur le clustering, l'indicateur, la source, le modèle utilisé, etc.
    """
    if not source:
        raise HTTPException(status_code=400, detail="Le paramètre 'source' (ex: covid, mpox) est obligatoire.")
    try:
        data = await express_client.get_geographic_spread(indicator=indicator, source=source, k=k)
        series = []
        # On attend une clé 'series' ou 'clusters' selon l'API Express.js
        if "series" in data:
            series = data["series"]
        elif "clusters" in data and isinstance(data["clusters"], list):
            # Si déjà clusterisé côté Express, on recompose la liste
            for group in data["clusters"]:
                for country in group.get("countries", []):
                    # Pas de valeurs, donc on ne peut pas re-clusteriser
                    pass
            raise HTTPException(status_code=501, detail="L'API Express.js retourne déjà des clusters. Contactez l'équipe backend.")
        else:
            # Fallback : on tente d'utiliser 'data' comme liste
            if isinstance(data, list):
                series = data
            else:
                raise HTTPException(status_code=500, detail="Format inattendu des données de l'API Express.js.")
        # Clustering
        result = cluster_countries(series, k=k)
        # Ajout de doc et métadonnées
        result["meta"].update({
            "indicator": indicator,
            "source": source,
            "doc": "Clustering KMeans sur les séries temporelles de chaque pays. Les pays d'un même cluster présentent une dynamique similaire pour l'indicateur donné."
        })
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur clustering propagation: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur clustering propagation: {e}")

@router.get("/model-info")
async def get_spread_model_info() -> Dict[str, Any]:
    """Retourne les informations sur le modèle de propagation"""
    
    return {
        "model_type": "Clustering Avancé (en développement)",
        "description": "Modèle de prédiction de propagation géographique",
        "status": "en_development",
        "planned_features": [
            "clustering temporel",
            "analyse de similarité",
            "prédiction de clusters"
        ]
    } 