"""
API IA - FastAPI
Consomme l'API Express.js et applique les modèles ML
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from dotenv import load_dotenv

# Import des routes
from routes import mortality_routes, rt_routes, spread_routes
from services.express_client import ExpressAPIClient
from utils.logger import setup_logger

# Chargement des variables d'environnement
load_dotenv()

# Configuration du logger
logger = setup_logger()

# Création de l'application FastAPI
app = FastAPI(
    title="API IA - Prédictions Pandémiques",
    description="API spécialisée dans les prédictions ML pour COVID et MPOX",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation du client Express API
express_client = ExpressAPIClient()

@app.on_event("startup")
async def startup_event():
    """Événement de démarrage de l'API"""
    logger.info("🚀 Démarrage de l'API IA...")
    
    # Test de connexion avec l'API Express.js
    try:
        await express_client.test_connection()
        logger.info("✅ Connexion à l'API Express.js établie")
    except Exception as e:
        logger.error(f"❌ Erreur de connexion à l'API Express.js: {e}")
        logger.warning("⚠️ L'API IA peut ne pas fonctionner correctement")

@app.on_event("shutdown")
async def shutdown_event():
    """Événement d'arrêt de l'API"""
    logger.info("🛑 Arrêt de l'API IA...")

# Routes de base
@app.get("/")
async def root():
    """Point d'entrée de l'API IA"""
    return {
        "message": "API IA - Prédictions Pandémiques",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état de santé de l'API"""
    try:
        # Test de connexion avec l'API Express.js
        await express_client.test_connection()
        return {
            "status": "healthy",
            "api_express": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unavailable: {str(e)}"
        )

@app.get("/test-connection")
async def test_express_connection():
    """Test spécifique de la connexion avec l'API Express.js"""
    try:
        await express_client.test_connection()
        return {
            "status": "success",
            "message": "Connexion à l'API Express.js réussie",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Échec de connexion à l'API Express.js: {str(e)}"
        )

# Inclusion des routes spécialisées
app.include_router(mortality_routes.router, prefix="/api/mortality", tags=["Mortality Predictions"])
app.include_router(rt_routes.router, prefix="/api/rt", tags=["Rt Predictions"])
app.include_router(spread_routes.router, prefix="/api/spread", tags=["Spread Predictions"])

# Gestionnaire d'erreurs global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Gestionnaire d'erreurs global"""
    logger.error(f"Erreur non gérée: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Erreur interne du serveur", "detail": str(exc)}
    )

if __name__ == "__main__":
    # Configuration du serveur
    host = os.getenv("API_IA_HOST", "0.0.0.0")
    port = int(os.getenv("API_IA_PORT", 8000))
    debug = os.getenv("API_IA_DEBUG", "false").lower() == "true"
    
    logger.info(f"🌐 Démarrage du serveur sur {host}:{port}")
    
    # Démarrage du serveur
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    ) 