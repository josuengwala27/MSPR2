"""
Modèles SQLAlchemy pour l'accès direct à la base de données (mode France)
Basé sur le schéma Prisma existant
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, BigInteger, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.types import CHAR, VARCHAR
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class Pays(Base):
    """Modèle pour la table pays"""
    __tablename__ = 'pays'
    
    id_pays = Column(Integer, primary_key=True, autoincrement=True)
    country = Column(VARCHAR(100), nullable=False)
    iso_code = Column(CHAR(3), unique=True, nullable=False)
    population = Column(BigInteger)

class Indicateur(Base):
    """Modèle pour la table indicateur"""
    __tablename__ = 'indicateur'
    
    id_indicateur = Column(Integer, primary_key=True, autoincrement=True)
    indicator_name = Column(VARCHAR(50), unique=True, nullable=False)
    description = Column(String)

class DonneeHistorique(Base):
    """Modèle pour la table donnee_historique"""
    __tablename__ = 'donnee_historique'
    
    id_donnee = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, nullable=False)
    country = Column(VARCHAR(200), nullable=False)
    value = Column(Float)
    indicator = Column(VARCHAR(200), nullable=False)
    source = Column(VARCHAR(200))
    iso_code = Column(CHAR(3))
    population = Column(BigInteger)
    unit = Column(VARCHAR(200))
    cases_per_100k = Column(Float)
    deaths_per_100k = Column(Float)
    incidence_7j = Column(Float)
    growth_rate = Column(Float)
    
    # Index pour performance (définis dans la métadonnées)
    __table_args__ = (
        Index('ix_donnee_historique_date', 'date'),
        Index('ix_donnee_historique_country', 'country'),
        Index('ix_donnee_historique_indicator', 'indicator'),
        Index('ix_donnee_historique_source', 'source'),
        Index('ix_donnee_historique_iso_code', 'iso_code'),
    )

class DatabaseManager:
    """Gestionnaire de base de données pour l'accès direct PostgreSQL"""
    
    def __init__(self):
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL non définie dans les variables d'environnement")
        
        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_session(self):
        """Obtenir une session de base de données"""
        return self.SessionLocal()
    
    def create_tables(self):
        """Créer les tables (pour les tests uniquement)"""
        Base.metadata.create_all(bind=self.engine)
    
    def close(self):
        """Fermer la connexion"""
        self.engine.dispose()

# Instance globale du gestionnaire de base de données
db_manager = DatabaseManager()