#!/usr/bin/env python3
"""Gerador de conteúdo de candidatura.

Exemplos:
  python gerar.py listar --top 20
  python gerar.py gerar --id 1 5 12
  python gerar.py gerar --empresa "Alantra" --motivo "Segui o vosso trabalho em ..."
  python gerar.py gerar --prioridades --lingua pt
  python gerar.py gerar --top 10
  python gerar.py verificar-texto minha_carta.txt --lingua pt
  python gerar.py registo --id 12 --estado enviada --data 2026-10-20
  python gerar.py registo --em-atraso
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from candidatura import humanizador, perfil as P, registo, vagas as V
from candidatura.contexto import Contexto, escolher_lingua
from candidatura.pacote import escrever

RAIZ = Path(__file__).resolve().parent


def _selecionar(args, todas):
    return V.filtrar(todas, ids=args.id, empresa=args.empresa, top=args.top,
                     prioridades=args.prioridades, pais=args.pais, area=args.area,
                     incluir_inativas=args.incluir_inativas)


def cmd_listar(args):
    sel = _selecionar(args, V.carregar(args.xlsx))
    print(f"{len(sel)} vagas\n")
    for v in sel:
        print(f"{v.id:>3} | rank {v.rank:>3} | {v.veredicto:<18} | {v.empresa[:34]:<34} | {v.role[:52]:<52} | {v.cidade}")


def cmd_gerar(args):
    todas = V.carregar(args.xlsx)
    sel = _selecionar(args, todas)
    if not sel:
        sys.exit("Nenhuma vaga selecionada. Usa --id, --empresa, --top, --prioridades ou --pais.")
    perfil = P.carregar(args.perfil)
    extras = P.carregar_extras()
    saida = Path(args.saida)
    indice = ["# Pacotes gerados", ""]
    avisos_total = 0
    for v in sel:
        c = Contexto(vaga=v, perfil=perfil, lingua=escolher_lingua(v, args.lingua), extras=extras,
                     motivo=args.motivo, contacto=args.contacto, saudacao=args.saudacao,
                     tema=args.tema, data_envio=args.data_envio, data_entrevista=args.data_entrevista,
                     novidade=args.novidade, ligacao=args.ligacao)
        pasta, avisos = escrever(c, saida)
        indice.append(f"- {pasta.name}: {v.empresa}, {v.role} ({c.lingua.upper()})")
        print(f"[{v.id:>3}] {v.empresa} -> {pasta}")
        for a in avisos:
            print(f"      AVISO {a}")
        avisos_total += len(avisos)
        if args.registar:
            registo.atualizar(v, "por enviar", dias=perfil.get("dias_para_followup", 8))
    saida.mkdir(parents=True, exist_ok=True)
    (saida / "INDICE.md").write_text("\n".join(indice) + "\n", encoding="utf-8")
    print(f"\n{len(sel)} pacotes em {saida} | {avisos_total} avisos de estilo")


def cmd_verificar(args):
    texto = Path(args.ficheiro).read_text(encoding="utf-8")
    avisos = humanizador.verificar(texto, args.lingua)
    if avisos:
        print("Avisos:")
        for a in avisos:
            print(f"- {a}")
        if args.corrigir:
            Path(args.ficheiro).write_text(humanizador.corrigir(texto, args.lingua), encoding="utf-8")
            print("Correções automáticas aplicadas (travessões e grafia). O resto é para rever à mão.")
    else:
        print("Sem avisos.")


def cmd_registo(args):
    if args.em_atraso:
        for r in registo.seguimentos_em_atraso():
            print(f"{r['id']:>3} | {r['empresa']} | {r['role']} | seguimento previsto {r['seguimento_previsto']}")
        return
    if args.id:
        todas = V.carregar(args.xlsx)
        v = next((x for x in todas if x.id == args.id[0]), None)
        if not v:
            sys.exit("ID não encontrado.")
        perfil = P.carregar(args.perfil)
        linha = registo.atualizar(v, args.estado, args.data, args.notas or "", perfil.get("dias_para_followup", 8))
        print(linha)
        return
    for r in registo.listar():
        print(f"{r['id']:>3} | {r['estado']:<18} | {r['empresa']} | {r['role']} | envio {r['data_envio'] or '-'} | seguimento {r['seguimento_previsto'] or '-'}")


def main():
    pai = argparse.ArgumentParser(add_help=False)
    pai.add_argument("--xlsx", default=None, help="caminho do Excel das vagas (por omissão: ../Estagios_Janeiro2027.xlsx)")
    pai.add_argument("--perfil", default=None, help="caminho do perfil.json")
    sel = argparse.ArgumentParser(add_help=False)
    sel.add_argument("--id", type=int, nargs="+")
    sel.add_argument("--empresa")
    sel.add_argument("--top", type=int, help="as N melhores vagas ativas pelo ranking do Excel")
    sel.add_argument("--prioridades", action="store_true", help="só as vagas com veredicto Prioridade")
    sel.add_argument("--pais")
    sel.add_argument("--area")
    sel.add_argument("--incluir-inativas", action="store_true")

    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("listar", parents=[pai, sel])
    s.set_defaults(f=cmd_listar)

    s = sub.add_parser("gerar", parents=[pai, sel])
    s.add_argument("--lingua", choices=["auto", "pt", "en"], default="auto")
    s.add_argument("--saida", default=str(RAIZ / "saidas"))
    s.add_argument("--motivo", help="1 ou 2 frases verdadeiras sobre o que te atrai na empresa")
    s.add_argument("--contacto", help="nome de quem recebe o email")
    s.add_argument("--saudacao", help="substitui a saudação por omissão")
    s.add_argument("--tema", help="tema da entrevista, para o email de agradecimento")
    s.add_argument("--data-envio", help="data em que te candidataste, para o seguimento")
    s.add_argument("--data-entrevista", help="data proposta, para confirmar a entrevista")
    s.add_argument("--novidade", help="algo novo a acrescentar no seguimento")
    s.add_argument("--ligacao", help="ponto em comum com o contacto, para o pedido de conversa")
    s.add_argument("--registar", action="store_true", help="regista as vagas no CSV como 'por enviar'")
    s.set_defaults(f=cmd_gerar)

    s = sub.add_parser("verificar-texto")
    s.add_argument("ficheiro")
    s.add_argument("--lingua", choices=["pt", "en"], default="pt")
    s.add_argument("--corrigir", action="store_true")
    s.set_defaults(f=cmd_verificar)

    s = sub.add_parser("registo", parents=[pai])
    s.add_argument("--id", type=int, nargs=1)
    s.add_argument("--estado", default="enviada", choices=registo.ESTADOS)
    s.add_argument("--data", help="AAAA-MM-DD")
    s.add_argument("--notas")
    s.add_argument("--em-atraso", action="store_true", help="mostra seguimentos por enviar")
    s.set_defaults(f=cmd_registo)

    args = ap.parse_args()
    args.f(args)


if __name__ == "__main__":
    main()
