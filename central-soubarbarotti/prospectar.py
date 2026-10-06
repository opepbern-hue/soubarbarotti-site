"""
PROSPECTAR
Busca negócios no Google Maps usando a Places API (New), que é o jeito oficial
e permitido de puxar esses dados. Nada de scraping do Maps.
"""
import time
import requests

import config

URL = "https://places.googleapis.com/v1/places:searchText"
CAMPOS = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.googleMapsUri",
    "places.primaryTypeDisplayName",
    "places.businessStatus",
    "nextPageToken",
])


def buscar(termo: str, cidade: str, max_paginas: int = 3) -> list[dict]:
    """Uma busca retorna até 20 por página, até 3 páginas (60 resultados)."""
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": config.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": CAMPOS,
    }
    corpo = {
        "textQuery": f"{termo} em {cidade}",
        "languageCode": "pt-BR",
        "regionCode": "BR",
        "pageSize": 20,
    }
    resultados = []
    for _ in range(max_paginas):
        r = requests.post(URL, headers=headers, json=corpo, timeout=30)
        if r.status_code != 200:
            print(f"   ! erro Places ({r.status_code}): {r.text[:200]}")
            break
        dados = r.json()
        resultados.extend(dados.get("places", []))
        token = dados.get("nextPageToken")
        if not token:
            break
        corpo["pageToken"] = token
        time.sleep(2)  # o token demora um pouco a ficar válido
    return resultados


def normalizar(p: dict, nicho: str, cidade: str) -> dict:
    return {
        "id": p.get("id"),
        "nome": (p.get("displayName") or {}).get("text", ""),
        "nicho": nicho,
        "cidade_busca": cidade,
        "endereco": p.get("formattedAddress", ""),
        "site": p.get("websiteUri", ""),
        "telefone": p.get("nationalPhoneNumber", ""),
        "telefone_intl": p.get("internationalPhoneNumber", ""),
        "nota_google": p.get("rating"),
        "avaliacoes": p.get("userRatingCount", 0),
        "faixa_preco": p.get("priceLevel", ""),
        "tipo": (p.get("primaryTypeDisplayName") or {}).get("text", ""),
        "status": p.get("businessStatus", ""),
        "maps": p.get("googleMapsUri", ""),
    }
