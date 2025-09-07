"""
Service d'accès direct à la base de données PostgreSQL (mode France)
Remplace les appels à l'API Express par des requêtes SQL directes
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import pandas as pd
import logging
from sqlalchemy import func, and_, or_, text
from sqlalchemy.orm import Session

from models.database_models import DonneeHistorique, Pays, Indicateur, db_manager

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service pour l'accès direct aux données via SQLAlchemy"""
    
    def __init__(self):
        self.db_manager = db_manager
        
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse une date string en objet datetime"""
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            try:
                return datetime.strptime(date_str, '%Y-%m-%d')
            except:
                return None
    
    async def test_connection(self) -> bool:
        """Teste la connexion à la base de données"""
        try:
            with self.db_manager.get_session() as db:
                # Test simple : compter le nombre de lignes
                count = db.query(DonneeHistorique).count()
                logger.info(f"✅ Connexion à la base PostgreSQL réussie - {count} enregistrements")
                return True
        except Exception as e:
            logger.error(f"❌ Échec de connexion à la base PostgreSQL: {e}")
            raise Exception(f"Impossible de se connecter à la base PostgreSQL: {str(e)}")
    
    async def get_ml_ready_data(self, pays: str, indicator: str, source: Optional[str] = None, 
                               date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                               features: Optional[str] = None, limit: int = 1000) -> Dict[str, Any]:
        """Récupère les données formatées pour le ML"""
        
        try:
            with self.db_manager.get_session() as db:
                query = db.query(DonneeHistorique)
                
                # Filtres
                if pays.lower() != 'all':
                    query = query.filter(DonneeHistorique.country.ilike(f'%{pays}%'))
                
                query = query.filter(DonneeHistorique.indicator.ilike(f'%{indicator}%'))
                
                if source:
                    query = query.filter(DonneeHistorique.source.ilike(f'%{source}%'))
                
                # Filtres de date
                if date_debut:
                    debut = self._parse_date(date_debut)
                    if debut:
                        query = query.filter(DonneeHistorique.date >= debut)
                
                if date_fin:
                    fin = self._parse_date(date_fin)
                    if fin:
                        query = query.filter(DonneeHistorique.date <= fin)
                
                # Tri par date et limitation
                query = query.order_by(DonneeHistorique.date.desc()).limit(limit)
                
                results = query.all()
                
                # Conversion en format compatible ML
                data = []
                for row in results:
                    data.append({
                        'date': row.date.isoformat(),
                        'country': row.country,
                        'indicator': row.indicator,
                        'value': row.value,
                        'source': row.source,
                        'iso_code': row.iso_code,
                        'population': row.population,
                        'cases_per_100k': row.cases_per_100k,
                        'deaths_per_100k': row.deaths_per_100k,
                        'incidence_7j': row.incidence_7j,
                        'growth_rate': row.growth_rate
                    })
                
                return {
                    'data': data,
                    'count': len(data),
                    'source': 'direct_database',
                    'country': pays,
                    'indicator': indicator
                }
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données ML: {e}")
            raise Exception(f"Erreur base de données: {str(e)}")
    
    async def get_mortality_rate(self, pays: str, source: Optional[str] = None,
                                date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                                window: int = 7) -> Dict[str, Any]:
        """Récupère le taux de mortalité avec calcul de moyenne mobile"""
        
        try:
            with self.db_manager.get_session() as db:
                query = db.query(DonneeHistorique)
                
                # Filtres pour mortalité
                query = query.filter(
                    and_(
                        DonneeHistorique.country.ilike(f'%{pays}%') if pays.lower() != 'all' else text('1=1'),
                        or_(
                            DonneeHistorique.indicator.ilike('%death%'),
                            DonneeHistorique.indicator.ilike('%mortality%'),
                            DonneeHistorique.deaths_per_100k.isnot(None)
                        )
                    )
                )
                
                if source:
                    query = query.filter(DonneeHistorique.source.ilike(f'%{source}%'))
                
                # Filtres de date
                if date_debut:
                    debut = self._parse_date(date_debut)
                    if debut:
                        query = query.filter(DonneeHistorique.date >= debut)
                
                if date_fin:
                    fin = self._parse_date(date_fin)
                    if fin:
                        query = query.filter(DonneeHistorique.date <= fin)
                
                results = query.order_by(DonneeHistorique.date).all()
                
                # Calcul de la moyenne mobile
                data = []
                for i, row in enumerate(results):
                    start_idx = max(0, i - window + 1)
                    window_data = results[start_idx:i+1]
                    
                    # Calcul moyenne des deaths_per_100k ou value
                    values = [r.deaths_per_100k or r.value for r in window_data if (r.deaths_per_100k is not None or r.value is not None)]
                    avg_mortality = sum(values) / len(values) if values else None
                    
                    data.append({
                        'date': row.date.isoformat(),
                        'country': row.country,
                        'mortality_rate': avg_mortality,
                        'raw_value': row.deaths_per_100k or row.value,
                        'window_size': len(values)
                    })
                
                return {
                    'data': data,
                    'count': len(data),
                    'window': window,
                    'source': 'direct_database'
                }
                
        except Exception as e:
            logger.error(f"Erreur lors du calcul du taux de mortalité: {e}")
            raise Exception(f"Erreur base de données: {str(e)}")
    
    async def get_rt_data(self, pays: str, indicator: str, source: Optional[str] = None,
                         date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                         window: int = 7) -> Dict[str, Any]:
        """Récupère les données Rt avec moyenne mobile"""
        
        try:
            with self.db_manager.get_session() as db:
                query = db.query(DonneeHistorique)
                
                # Filtres
                if pays.lower() != 'all':
                    query = query.filter(DonneeHistorique.country.ilike(f'%{pays}%'))
                
                query = query.filter(DonneeHistorique.indicator.ilike(f'%{indicator}%'))
                
                if source:
                    query = query.filter(DonneeHistorique.source.ilike(f'%{source}%'))
                
                # Filtres de date
                if date_debut:
                    debut = self._parse_date(date_debut)
                    if debut:
                        query = query.filter(DonneeHistorique.date >= debut)
                
                if date_fin:
                    fin = self._parse_date(date_fin)
                    if fin:
                        query = query.filter(DonneeHistorique.date <= fin)
                
                results = query.order_by(DonneeHistorique.date).all()
                
                # Calcul Rt avec moyenne mobile
                data = []
                for i, row in enumerate(results):
                    if i < window:
                        continue
                    
                    # Calcul du taux de reproduction sur la fenêtre
                    current_window = results[i-window+1:i+1]
                    prev_window = results[i-2*window+1:i-window+1] if i >= 2*window-1 else []
                    
                    current_sum = sum([r.value for r in current_window if r.value])
                    prev_sum = sum([r.value for r in prev_window if r.value]) if prev_window else 0
                    
                    rt_value = current_sum / prev_sum if prev_sum > 0 else None
                    
                    data.append({
                        'date': row.date.isoformat(),
                        'country': row.country,
                        'indicator': row.indicator,
                        'rt_value': rt_value,
                        'raw_value': row.value,
                        'growth_rate': row.growth_rate
                    })
                
                return {
                    'data': data,
                    'count': len(data),
                    'window': window,
                    'source': 'direct_database'
                }
                
        except Exception as e:
            logger.error(f"Erreur lors du calcul Rt: {e}")
            raise Exception(f"Erreur base de données: {str(e)}")
    
    async def get_geographic_spread(self, indicator: str, source: Optional[str] = None,
                                   date_debut: Optional[str] = None, date_fin: Optional[str] = None,
                                   k: int = 3) -> Dict[str, Any]:
        """Récupère les données de propagation géographique pour clustering"""
        
        try:
            with self.db_manager.get_session() as db:
                query = db.query(DonneeHistorique)
                
                query = query.filter(DonneeHistorique.indicator.ilike(f'%{indicator}%'))
                
                if source:
                    query = query.filter(DonneeHistorique.source.ilike(f'%{source}%'))
                
                # Filtres de date
                if date_debut:
                    debut = self._parse_date(date_debut)
                    if debut:
                        query = query.filter(DonneeHistorique.date >= debut)
                
                if date_fin:
                    fin = self._parse_date(date_fin)
                    if fin:
                        query = query.filter(DonneeHistorique.date <= fin)
                
                results = query.all()
                
                # Groupement par pays pour le clustering
                countries_data = {}
                for row in results:
                    country = row.country
                    if country not in countries_data:
                        countries_data[country] = {
                            'country': country,
                            'iso_code': row.iso_code,
                            'population': row.population,
                            'values': [],
                            'dates': [],
                            'avg_value': 0,
                            'max_value': 0,
                            'total_cases': 0
                        }
                    
                    if row.value is not None:
                        countries_data[country]['values'].append(row.value)
                        countries_data[country]['dates'].append(row.date.isoformat())
                
                # Calcul des statistiques pour le clustering
                for country, data in countries_data.items():
                    values = data['values']
                    if values:
                        data['avg_value'] = sum(values) / len(values)
                        data['max_value'] = max(values)
                        data['total_cases'] = sum(values)
                
                return {
                    'data': list(countries_data.values()),
                    'count': len(countries_data),
                    'k_clusters': k,
                    'indicator': indicator,
                    'source': 'direct_database'
                }
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données géographiques: {e}")
            raise Exception(f"Erreur base de données: {str(e)}")
    
    async def get_available_features(self) -> Dict[str, Any]:
        """Récupère la liste des features disponibles"""
        
        try:
            with self.db_manager.get_session() as db:
                # Récupération des indicateurs uniques
                indicators = db.query(DonneeHistorique.indicator).distinct().all()
                indicators_list = [ind[0] for ind in indicators]
                
                # Récupération des pays uniques
                countries = db.query(DonneeHistorique.country).distinct().all()
                countries_list = [country[0] for country in countries]
                
                # Récupération des sources uniques
                sources = db.query(DonneeHistorique.source).distinct().filter(DonneeHistorique.source.isnot(None)).all()
                sources_list = [source[0] for source in sources]
                
                return {
                    'indicators': indicators_list,
                    'countries': countries_list,
                    'sources': sources_list,
                    'total_records': db.query(DonneeHistorique).count(),
                    'source': 'direct_database'
                }
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des features: {e}")
            raise Exception(f"Erreur base de données: {str(e)}")

# Instance globale du service
database_service = DatabaseService()