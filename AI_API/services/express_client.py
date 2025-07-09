"""
Client HTTP pour communiquer avec l'API Express.js
"""

import httpx
import asyncio
from typing import Dict, List, Optional, Any
import os
from dotenv import load_dotenv
import logging

# Chargement des variables d'environnement
load_dotenv()

logger = logging.getLogger(__name__)

class ExpressAPIClient:
    """Client pour communiquer avec l'API Express.js"""
    
    def __init__(self):
        self.base_url = os.getenv("API_EXPRESS_URL", "http://localhost:3000")
        self.timeout = 180
        self.max_retries = 3
        self.retry_delay = 1  # secondes
        
    async def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Effectue une requête HTTP avec retry logic"""
        
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    if method.upper() == "GET":
                        response = await client.get(url, params=params)
                    elif method.upper() == "POST":
                        response = await client.post(url, json=data, params=params)
                    else:
                        raise ValueError(f"Méthode HTTP non supportée: {method}")
                    
                    response.raise_for_status()
                    return response.json()
                    
            except httpx.TimeoutException:
                logger.warning(f"Timeout sur {url} (tentative {attempt + 1}/{self.max_retries})")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    raise Exception(f"Timeout après {self.max_retries} tentatives")
                    
            except httpx.HTTPStatusError as e:
                logger.error(f"Erreur HTTP {e.response.status_code} sur {url}: {e.response.text}")
                raise Exception(f"Erreur API Express.js: {e.response.status_code} - {e.response.text}")
                
            except Exception as e:
                logger.error(f"Erreur de communication avec l'API Express.js: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    raise Exception(f"Erreur de communication: {str(e)}")
        
        raise Exception("Nombre maximum de tentatives atteint")
    
    async def test_connection(self) -> bool:
        """Teste la connexion avec l'API Express.js"""
        try:
            response = await self._make_request("GET", "/api/donnees-historiques/features")
            logger.info("✅ Connexion à l'API Express.js réussie")
            return True
        except Exception as e:
            logger.error(f"❌ Échec de connexion à l'API Express.js: {e}")
            raise Exception(f"Impossible de se connecter à l'API Express.js: {str(e)}")
    
    async def get_ml_ready_data(self, pays: str, indicator: str, source: Optional[str] = None, 
                               date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                               features: Optional[str] = None, limit: int = 1000) -> Dict[str, Any]:
        """Récupère les données formatées pour le ML"""
        
        params = {
            "pays": pays,
            "indicator": indicator,
            "limit": limit
        }
        
        if source:
            params["source"] = source
        if date_debut:
            params["dateDebut"] = date_debut
        if date_fin:
            params["dateFin"] = date_fin
        if features:
            params["features"] = features
            
        return await self._make_request("GET", "/api/donnees-historiques/ml-ready", params=params)
    
    async def get_mortality_rate(self, pays: str, source: Optional[str] = None,
                                date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                                window: int = 7) -> Dict[str, Any]:
        """Récupère le taux de mortalité"""
        
        params = {
            "pays": pays,
            "window": window
        }
        
        if source:
            params["source"] = source
        if date_debut:
            params["dateDebut"] = date_debut
        if date_fin:
            params["dateFin"] = date_fin
            
        return await self._make_request("GET", "/api/donnees-historiques/mortality-rate", params=params)
    
    async def get_rt_data(self, pays: str, indicator: str, source: Optional[str] = None,
                         date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                         window: int = 7) -> Dict[str, Any]:
        """Récupère les données Rt"""
        
        params = {
            "pays": pays,
            "indicator": indicator,
            "window": window
        }
        
        if source:
            params["source"] = source
        if date_debut:
            params["dateDebut"] = date_debut
        if date_fin:
            params["dateFin"] = date_fin
            
        return await self._make_request("GET", "/api/donnees-historiques/rt", params=params)
    
    async def get_aggregation_data(self, pays: str, indicator: str, operation: str, 
                                  source: Optional[str] = None, date_debut: Optional[str] = None,
                                  date_fin: Optional[str] = None, window: int = 7) -> Dict[str, Any]:
        """Récupère les données agrégées"""
        
        params = {
            "pays": pays,
            "indicator": indicator,
            "operation": operation,
            "window": window
        }
        
        if source:
            params["source"] = source
        if date_debut:
            params["dateDebut"] = date_debut
        if date_fin:
            params["dateFin"] = date_fin
            
        return await self._make_request("GET", "/api/donnees-historiques/aggregation", params=params)
    
    async def get_stats(self, pays: str, indicator: str, source: Optional[str] = None,
                       date_debut: Optional[str] = None, date_fin: Optional[str] = None) -> Dict[str, Any]:
        """Récupère les statistiques descriptives"""
        
        params = {
            "pays": pays,
            "indicator": indicator
        }
        
        if source:
            params["source"] = source
        if date_debut:
            params["dateDebut"] = date_debut
        if date_fin:
            params["dateFin"] = date_fin
            
        return await self._make_request("GET", "/api/donnees-historiques/stats", params=params)
    
    async def get_geographic_spread(self, indicator: str, source: Optional[str] = None,
                                   date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                                   k: int = 3) -> Dict[str, Any]:
        """Récupère les données de propagation géographique"""
        
        params = {
            "indicator": indicator,
            "k": k
        }
        
        if source:
            params["source"] = source
        if date_debut:
            params["dateDebut"] = date_debut
        if date_fin:
            params["dateFin"] = date_fin
            
        return await self._make_request("GET", "/api/donnees-historiques/geographic-spread", params=params)
    
    async def get_available_features(self) -> Dict[str, Any]:
        """Récupère la liste des features disponibles"""
        return await self._make_request("GET", "/api/donnees-historiques/features") 