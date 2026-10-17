"""Verificação e correção automática de vícios de texto gerado (humanização).

Regras aplicadas: sem travessões, sem a fórmula "não X mas Y", sem enumerações de
três elementos por efeito, sem palavras típicas de texto gerado, ortografia do
Acordo Ortográfico de 1990 e vocabulário de Portugal.
"""
from __future__ import annotations

import re

TRAVESSOES = re.compile(r"\s*(—|–|\s--\s)\s*")

# Pré-AO90 -> AO90 (radicais; a capitalização é preservada).
AO90 = {
    r"\bacç(ão|ões)\b": r"aç\1", r"\bdirecç(ão|ões)\b": r"direç\1",
    r"\bdirecto(s?)\b": r"direto\1", r"\bdirecta(s?)\b": r"direta\1",
    r"\bprojecto(s?)\b": r"projeto\1", r"\bsector(es)?\b": r"setor\1",
    r"\bobjectivo(s?)\b": r"objetivo\1", r"\bactividade(s?)\b": r"atividade\1",
    r"\bactiv(o|a|os|as)\b": r"ativ\1", r"\bactual(is)?\b": r"atual\1",
    r"\bperspectiva(s?)\b": r"perspetiva\1", r"\brespectiv(o|a|os|as)\b": r"respetiv\1",
    r"\brecepç(ão|ões)\b": r"receç\1", r"\bexcepç(ão|ões)\b": r"exceç\1",
    r"\bóptim(o|a|os|as)\b": r"ótim\1", r"\belectrónic(o|a|os|as)\b": r"eletrónic\1",
    r"\boptimiz(ar|ação)\b": r"otimiz\1", r"\badopç(ão|ões)\b": r"adoç\1",
    r"\baspecto(s?)\b": r"aspeto\1", r"\bselecç(ão|ões)\b": r"seleç\1",
    r"\befectiv(o|a|os|as)\b": r"efetiv\1", r"\bafect(ar|a|ado|ada)\b": r"afet\1",
    r"\bcolectiv(o|a|os|as)\b": r"coletiv\1", r"\bprotecç(ão|ões)\b": r"proteç\1",
    r"\bcontracto(s?)\b": r"contrato\1", r"\bfacturação\b": "faturação",
}

BRASILEIRISMOS = [
    r"\bvocê(s?)\b", r"\bequipe(s?)\b", r"\bcelular\b", r"\bgerenciar\b",
    r"\bpra\b", r"\bônibus\b", r"\bcafé da manhã\b", r"\bdeletar\b",
    r"\bestágiário\b", r"\bfeedbacks?\b(?=\s+do\s+gestor)",
]
# "estou a fazer" é PT-PT; "estou fazendo" é brasileiro.
GERUNDIO_BR = re.compile(r"\b(estou|estás|está|estamos|estão|estava|estavam)\s+\w+(ando|endo|indo)\b", re.I)

PALAVRAS_IA_PT = [
    r"\bapaixonad(o|a|os|as)\b", r"\bdinâmic(o|a|os|as)\b", r"\bsinergias?\b",
    r"\bcrucial\b", r"\bfundamental\b", r"\bmergulh(ar|o)\b", r"\bpanorama\b",
    r"\btestemunho\b", r"\bvibrante\b", r"\bvenho por este meio\b",
    r"\bem constante mudança\b", r"\bdesempenha um papel\b", r"\bpapel crucial\b",
    r"\bno mundo atual\b", r"\bpilar(es)?\b", r"\balavancar\b",
]
PALAVRAS_IA_EN = [
    r"\bdelve\b", r"\bpivotal\b", r"\bcrucial\b", r"\btestament\b", r"\btapestry\b",
    r"\blandscape\b", r"\bvibrant\b", r"\bshowcase\b", r"\bunderscore\b",
    r"\bmeticulous\w*\b", r"\bpassionate\b", r"\bthrilled\b", r"\bleverag\w+\b",
    r"\bsynerg\w+\b", r"\bfast-paced\b", r"\bdynamic\b", r"\bcutting-edge\b",
    r"\beager to\b", r"\bexcited to\b", r"\bI am writing to express\b",
    r"\bin today'?s\b", r"\bhighly motivated\b", r"\bteam player\b",
]

CONTRASTE_PT = re.compile(
    r"\bnão (é|são|foi|se trata|apenas|só|somente|se limita)\b[^.!?]{0,80}?(\bmas\b|\be sim\b|, é\b|\bmas sim\b)", re.I)
CONTRASTE_PT2 = re.compile(r"\bnão (só|apenas)\b", re.I)
CONTRASTE_EN = re.compile(
    r"\bnot (just|only|merely|simply)\b|\bnot [^.,;]{1,40}, but\b|\bit('| i)s not\b[^.]{0,60}\bit('| i)s\b|\bthis is not\b[^.]{0,60}\bit is\b",
    re.I)

# Três itens curtos numa só frase: "A, B e C" ou "A, B, and C".
_PAL = r"[\w\-áéíóúâêôãõçàÁÉÍÓÚÂÊÔÃÕÇÀ]+"
_DET = r"(?:o|a|os|as|um|uma|the|an|my|i|we|to|de|em|para|com|sempre|que|se|me|nos|por|no|na|with|from|in|at|of|and|e|or|ou)"
_ITEM = rf"(?!{_DET}\b){_PAL}(?:\s(?!(?:e|ou|and|or)\b){_PAL})?"
_ITEM1 = rf"{_PAL}(?:\s(?!(?:e|ou|and|or)\b){_PAL})?"
TRIADE = re.compile(rf"(?<![\w,] ){_ITEM1}, {_ITEM},? (?:e|ou|and|or) {_ITEM}\b", re.I)


def _mascarar(texto: str, entidades: list[str]):
    mapa = {}
    for i, e in enumerate(sorted({x for x in entidades if x}, key=len, reverse=True)):
        marca = f"ENT{i}Z"
        if e in texto:
            texto = texto.replace(e, marca)
            mapa[marca] = e
    return texto, mapa


def _repor(texto: str, mapa: dict) -> str:
    for marca, e in mapa.items():
        texto = texto.replace(marca, e)
    return texto


def _preservar_caso(m: re.Match, novo: str) -> str:
    s = m.group(0)
    return novo[0].upper() + novo[1:] if s[:1].isupper() else novo


def corrigir(texto: str, lingua: str, entidades=None) -> str:
    """Aplica correções seguras: travessões e grafias pré-AO90."""
    texto, mapa = _mascarar(texto, entidades or [])
    texto = TRAVESSOES.sub(", ", texto)
    if lingua == "pt":
        for padrao, subst in AO90.items():
            texto = re.sub(padrao, lambda m, s=subst: _preservar_caso(m, m.expand(s)), texto, flags=re.I)
    return _repor(texto, mapa)


def verificar(texto: str, lingua: str, entidades=None, modo: str = "estrito") -> list[str]:
    """Devolve a lista de avisos. Lista vazia significa texto limpo.

    modo 'estrito': cartas, emails e mensagens (todas as regras).
    modo 'notas': apontamentos internos (só ortografia, travessões e restos).
    """
    avisos = []
    t, _ = _mascarar(texto, entidades or [])
    if re.search(r"—|–|\s--\s", t):
        avisos.append("travessão no texto")
    if re.search(r"\{[^}]*\}|\[\s*\]|\bTODO\b|\bXXX\b", t):
        avisos.append("marcador por preencher")
    if "**" in t and modo == "estrito":
        avisos.append("negrito decorativo")
    if lingua == "pt":
        for padrao, subst in AO90.items():
            if re.search(padrao, t, flags=re.I):
                avisos.append(f"grafia anterior ao AO90: {padrao}")
        for padrao in BRASILEIRISMOS:
            if re.search(padrao, t, flags=re.I):
                avisos.append(f"brasileirismo: {padrao}")
        if GERUNDIO_BR.search(t):
            avisos.append("gerúndio brasileiro (usa 'estar a + infinitivo')")
    if modo != "estrito":
        return avisos
    if "!" in t:
        avisos.append("ponto de exclamação")
    listas = PALAVRAS_IA_PT if lingua == "pt" else PALAVRAS_IA_EN
    for padrao in listas:
        if re.search(padrao, t, flags=re.I):
            avisos.append(f"palavra típica de texto gerado: {padrao}")
    contrastes = [CONTRASTE_PT, CONTRASTE_PT2] if lingua == "pt" else [CONTRASTE_EN]
    for c in contrastes:
        if c.search(t):
            avisos.append("fórmula de contraste 'não X mas Y'")
    if TRIADE.search(t):
        avisos.append("enumeração de três elementos (confirma se são mesmo três ideias)")
    for par in re.split(r"\n\s*\n", t):
        frases = [f.strip() for f in re.split(r"(?<=[.?])\s+", par) if f.strip()]
        ini = [f.split()[0].lower() for f in frases if f.split()]
        for i in range(len(ini) - 2):
            if ini[i] == ini[i + 1] == ini[i + 2]:
                avisos.append(f"três frases seguidas a começar por '{ini[i]}'")
                break
    return avisos
