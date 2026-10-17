"""Carrega o perfil da candidata a partir de dados/perfil.json."""
from __future__ import annotations

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def carregar(caminho=None) -> dict:
    p = Path(caminho) if caminho else RAIZ / "dados" / "perfil.json"
    if not p.exists() and not caminho:
        p = RAIZ / "dados" / "perfil.exemplo.json"  # sem perfil real (por exemplo no CI)
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def nivel_lingua(perfil: dict, codigo: str) -> float:
    return float(perfil.get("linguas", {}).get(codigo, {}).get("nivel", 0.0))


def nome_lingua(perfil: dict, codigo: str, lingua: str) -> str:
    return perfil["linguas"].get(codigo, {}).get(f"nome_{lingua}", codigo)


def assinatura(perfil: dict) -> str:
    linhas = [perfil["nome"], f'{perfil["telemovel"]} | {perfil["email"]}']
    if perfil.get("linkedin"):
        linhas.append(perfil["linkedin"])
    return "\n".join(linhas)


def carregar_extras(caminho=None) -> dict:
    p = Path(caminho) if caminho else RAIZ / "dados" / "empresas_extra.json"
    if not p.exists():
        return {}
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    return {k: v for k, v in d.items() if not k.startswith("_")}


def extra_da_empresa(extras: dict, empresa: str) -> dict:
    e = empresa.lower()
    for chave, valor in extras.items():
        if chave.lower() in e or e in chave.lower():
            return valor
    return {}
