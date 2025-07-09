"""
Configuration du logging pour l'API IA
"""

import logging
import os
from datetime import datetime
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

def setup_logger(name: str = "api_ia") -> logging.Logger:
    """Configure et retourne un logger"""
    
    # Configuration du niveau de log
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Création du logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level))
    
    # Éviter les handlers multiples
    if logger.handlers:
        return logger
    
    # Handler pour la console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, log_level))
    
    # Format du log
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    
    # Ajout du handler
    logger.addHandler(console_handler)
    
    # Handler pour fichier (optionnel)
    log_file = os.getenv("LOG_FILE")
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, log_level))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger 