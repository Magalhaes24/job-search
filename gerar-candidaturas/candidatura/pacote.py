"""Monta o pacote de ficheiros de uma vaga e escreve-o em disco."""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

from . import cartas, emails, entrevista, humanizador, verificacoes
from .contexto import Contexto


def slug(txt: str) -> str:
    t = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t[:50] or "vaga"


def _limpar(c: Contexto, texto: str, modo="estrito"):
    texto = humanizador.corrigir(texto, c.lingua, c.entidades())
    return texto, humanizador.verificar(texto, c.lingua, c.entidades(), modo)


def documentos(c: Contexto) -> dict:
    """Devolve {nome_do_ficheiro: (texto, avisos)}."""
    docs = {}
    docs["01_carta.txt"] = _limpar(c, cartas.gerar(c))
    if c.vaga.espontanea:
        docs["02_email_candidatura_espontanea.txt"] = _limpar(c, emails.candidatura_espontanea(c))
    else:
        docs["02_email_candidatura.txt"] = _limpar(c, emails.candidatura(c))
    docs["03_email_seguimento.txt"] = _limpar(c, emails.seguimento(c))
    docs["04_email_agradecimento_entrevista.txt"] = _limpar(c, emails.agradecimento(c))
    docs["05_email_confirmar_entrevista.txt"] = _limpar(c, emails.confirmar_entrevista(c))
    docs["06_email_pedido_conversa.txt"] = _limpar(c, emails.pedido_conversa(c))
    docs["07_linkedin_nota_ligacao.txt"] = _limpar(c, emails.nota_linkedin(c))
    docs["08_email_pedido_feedback.txt"] = _limpar(c, emails.pedido_feedback(c))
    docs["09_preparacao_entrevista.md"] = _limpar(c, entrevista.gerar(c), modo="notas")
    docs["00_verificacoes.md"] = _limpar(c, verificacoes.gerar(c), modo="notas")
    return dict(sorted(docs.items()))


def escrever(c: Contexto, pasta_saida: Path) -> tuple[Path, list[str]]:
    v = c.vaga
    pasta = Path(pasta_saida) / f"{v.id:03d}_{slug(v.empresa)}_{slug(v.role)[:30]}"
    pasta.mkdir(parents=True, exist_ok=True)
    todos = []
    for nome, (texto, av) in documentos(c).items():
        (pasta / nome).write_text(texto, encoding="utf-8")
        todos += [f"{nome}: {a}" for a in av]
    return pasta, todos
