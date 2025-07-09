import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict, Any


def cluster_countries(series: List[Dict[str, Any]], k: int = 3) -> Dict[str, Any]:
    """
    Applique un clustering KMeans sur les séries temporelles des pays.
    Args:
        series: Liste de dicts {iso_code, country, values}
        k: Nombre de clusters
    Returns:
        Dict avec clusters et métadonnées
    """
    if not series or len(series) < k:
        return {
            "clusters": [],
            "meta": {"error": "Pas assez de pays pour le clustering", "count": len(series)}
        }
    # On aligne les longueurs
    min_len = min(len(s["values"]) for s in series)
    X = np.array([s["values"][:min_len] for s in series])
    # KMeans
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    clusters = []
    for cluster_id in range(k):
        group = [
            {"iso_code": s["iso_code"], "country": s["country"]}
            for s, label in zip(series, labels) if label == cluster_id
        ]
        clusters.append({"cluster": cluster_id + 1, "countries": group})
    return {
        "clusters": clusters,
        "meta": {
            "k": k,
            "count": len(series),
            "model": "KMeans",
            "inertia": float(kmeans.inertia_)
        }
    } 