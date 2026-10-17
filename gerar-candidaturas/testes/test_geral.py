"""Testes: todos os textos gerados, para todas as vagas e nas duas línguas, passam no verificador."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from candidatura import humanizador, pacote, perfil as P, vagas as V
from candidatura.contexto import Contexto

VAGAS = V.carregar()
PERFIL = P.carregar()


class TestGeral(unittest.TestCase):
    def test_todas_as_vagas_e_linguas(self):
        problemas = []
        for v in VAGAS:
            for lingua in ("pt", "en"):
                c = Contexto(vaga=v, perfil=PERFIL, lingua=lingua)
                for nome, (texto, avisos) in pacote.documentos(c).items():
                    for a in avisos:
                        problemas.append(f"vaga {v.id} {lingua} {nome}: {a}")
        self.assertEqual(problemas[:25], [], f"{len(problemas)} avisos")

    def test_cartas_tamanho(self):
        for v in VAGAS:
            for lingua in ("pt", "en"):
                c = Contexto(vaga=v, perfil=PERFIL, lingua=lingua)
                texto = pacote.documentos(c)["01_carta.txt"][0]
                n = len(texto.split())
                self.assertTrue(200 <= n <= 380, f"vaga {v.id} {lingua}: {n} palavras")

    def test_linkedin_300(self):
        for v in VAGAS:
            for lingua in ("pt", "en"):
                c = Contexto(vaga=v, perfil=PERFIL, lingua=lingua)
                texto = pacote.documentos(c)["07_linkedin_nota_ligacao.txt"][0]
                self.assertNotIn("AVISO", texto, f"vaga {v.id} {lingua}")

    def test_verificador_apanha_vicios(self):
        self.assertTrue(humanizador.verificar("Isto não é apenas um estágio, mas uma oportunidade.", "pt"))
        self.assertTrue(humanizador.verificar("It is not just a job, it is a calling.", "en"))
        self.assertTrue(humanizador.verificar("O projecto é óptimo — mesmo.", "pt"))
        self.assertTrue(humanizador.verificar("Estou fazendo o projeto.", "pt"))
        self.assertEqual(humanizador.verificar("Gosto de matemática e quero aprender.", "pt"), [])

    def test_correcao(self):
        self.assertEqual(humanizador.corrigir("O projecto — actual.", "pt"), "O projeto, atual.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
