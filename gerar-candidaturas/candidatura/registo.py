"""Registo simples das candidaturas num CSV (registo/candidaturas.csv)."""
from __future__ import annotations

import csv
from datetime import date, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CAMINHO = RAIZ / "registo" / "candidaturas.csv"
CAMPOS = ["id", "empresa", "role", "link", "estado", "data_envio", "seguimento_previsto", "notas"]
ESTADOS = ["por enviar", "enviada", "seguimento enviado", "entrevista", "oferta", "recusada", "desistida"]


def _ler() -> dict:
    if not CAMINHO.exists():
        return {}
    with open(CAMINHO, encoding="utf-8", newline="") as f:
        return {int(r["id"]): r for r in csv.DictReader(f)}


def _escrever(d: dict) -> None:
    CAMINHO.parent.mkdir(parents=True, exist_ok=True)
    with open(CAMINHO, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS)
        w.writeheader()
        for k in sorted(d):
            w.writerow(d[k])


def atualizar(vaga, estado: str, data_envio: str | None = None, notas: str = "", dias: int = 8) -> dict:
    if estado not in ESTADOS:
        raise ValueError(f"Estado inválido. Usa um destes: {', '.join(ESTADOS)}")
    d = _ler()
    linha = d.get(vaga.id, {c: "" for c in CAMPOS})
    linha.update(id=vaga.id, empresa=vaga.empresa, role=vaga.role, link=vaga.link, estado=estado)
    if notas:
        linha["notas"] = notas
    if estado == "enviada":
        env = date.fromisoformat(data_envio) if data_envio else date.today()
        linha["data_envio"] = env.isoformat()
        linha["seguimento_previsto"] = (env + timedelta(days=dias)).isoformat()
    d[vaga.id] = linha
    _escrever(d)
    return linha


def listar() -> list[dict]:
    return [v for _, v in sorted(_ler().items())]


def seguimentos_em_atraso(hoje: date | None = None) -> list[dict]:
    hoje = hoje or date.today()
    return [r for r in listar()
            if r["estado"] == "enviada" and r["seguimento_previsto"]
            and date.fromisoformat(r["seguimento_previsto"]) <= hoje]
