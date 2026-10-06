"""
Conecta o seu Instagram à central (uma vez a cada ~60 dias).

    python configurar_instagram.py

Troca o token curto do Graph API Explorer por um de ~60 dias, descobre o ID
do @soubarbarotti, testa a validação e grava tudo no .env.
O passo a passo para conseguir o token está no README.
"""
import getpass
import os
import re
from datetime import date, timedelta

import requests

VERSAO = os.getenv("GRAPH_VERSION", "v25.0")
BASE = f"https://graph.facebook.com/{VERSAO}"


def gravar_env(valores: dict):
    caminho = ".env"
    linhas = open(caminho, encoding="utf-8").read().splitlines() if os.path.exists(caminho) else []
    for chave, valor in valores.items():
        nova = f"{chave}={valor}"
        for i, l in enumerate(linhas):
            if re.match(rf"^{chave}=", l):
                linhas[i] = nova
                break
        else:
            linhas.append(nova)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")


def erro(j) -> str:
    return (j.get("error") or {}).get("message", "") if isinstance(j, dict) else ""


def main():
    print("\nConectar o Instagram à central\n")
    app_id = input("App ID (developers.facebook.com, no painel do app): ").strip()
    app_secret = getpass.getpass("App Secret (não aparece enquanto digita): ").strip()
    curto = getpass.getpass("Token do Graph API Explorer: ").strip()

    r = requests.get(f"{BASE}/oauth/access_token", params={
        "grant_type": "fb_exchange_token", "client_id": app_id,
        "client_secret": app_secret, "fb_exchange_token": curto}, timeout=30).json()
    if "access_token" not in r:
        raise SystemExit(f"\nNão consegui trocar o token: {erro(r)}\nConfira o App ID, o Secret e se o token é novo.")
    token = r["access_token"]
    expira = date.today() + timedelta(seconds=int(r.get("expires_in") or 60 * 86400))

    paginas = requests.get(f"{BASE}/me/accounts", params={
        "fields": "name,instagram_business_account{id,username}", "access_token": token}, timeout=30).json()
    contas = [p["instagram_business_account"] for p in paginas.get("data", []) if p.get("instagram_business_account")]
    if not contas:
        raise SystemExit("\nNenhuma conta do Instagram ligada às suas páginas do Facebook.\n"
                         "O @ precisa ser profissional (comercial ou criador) e estar ligado a uma Página. "
                         f"{erro(paginas)}")
    if len(contas) > 1:
        for i, c in enumerate(contas, 1):
            print(f"  {i}. @{c.get('username')}")
        conta = contas[int(input("Qual usar? ")) - 1]
    else:
        conta = contas[0]

    teste = requests.get(f"{BASE}/{conta['id']}", params={
        "fields": f"business_discovery.username({conta.get('username')}){{followers_count,media_count}}",
        "access_token": token}, timeout=30).json()
    if "business_discovery" not in teste:
        raise SystemExit(f"\nConectou, mas a Business Discovery falhou: {erro(teste)}\n"
                         "Confira se o token tem instagram_basic e pages_read_engagement.")

    gravar_env({"META_TOKEN": token, "IG_USER_ID": conta["id"], "TOKEN_EXPIRA": expira.isoformat()})
    bd = teste["business_discovery"]
    print(f"\nPronto. @{conta.get('username')} conectado ({bd.get('followers_count')} seguidores).")
    print(f"O acesso vale até {expira:%d/%m/%Y}. A central avisa quando estiver perto de vencer.")
    print("Reinicie a central (python app.py) para usar.\n")


if __name__ == "__main__":
    main()
