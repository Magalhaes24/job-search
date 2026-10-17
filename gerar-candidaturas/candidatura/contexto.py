"""Contexto partilhado por todos os geradores de texto."""
from __future__ import annotations

import zlib
from dataclasses import dataclass, field

from . import areas, perfil as P
from .vagas import Vaga


CIDADES_EN = {
    "Londres": "London", "Milão": "Milan", "Zurique": "Zurich", "Amesterdão": "Amsterdam",
    "Estocolmo": "Stockholm", "Luxemburgo": "Luxembourg", "Bruxelas": "Brussels",
    "Varsóvia": "Warsaw", "Munique": "Munich", "Lisboa": "Lisbon", "Genebra": "Geneva",
    "Roma": "Rome", "Viena": "Vienna", "Copenhaga": "Copenhagen", "Dublin": "Dublin",
}


def escolher_lingua(vaga: Vaga, pedida: str = "auto") -> str:
    if pedida in ("pt", "en"):
        return pedida
    return "pt" if vaga.lingua == "PT" else "en"


@dataclass
class Contexto:
    vaga: Vaga
    perfil: dict
    lingua: str
    extras: dict = field(default_factory=dict)
    motivo: str | None = None
    contacto: str | None = None
    saudacao: str | None = None
    tema: str | None = None
    data_envio: str | None = None
    data_entrevista: str | None = None
    novidade: str | None = None
    ligacao: str | None = None

    def __post_init__(self):
        self.fam = areas.familia(self.vaga.area, self.vaga.tipo_empresa)
        self.bloco = areas.BLOCOS[self.fam]
        extra = P.extra_da_empresa(self.extras, self.vaga.empresa)
        if not self.motivo:
            self.motivo = extra.get(f"motivo_{self.lingua}") or None
        if not self.contacto:
            self.contacto = extra.get("contacto") or None

    # ---- atalhos ----
    @property
    def pt(self) -> bool:
        return self.lingua == "pt"

    @property
    def area(self) -> str:
        return self.bloco[f"area_{self.lingua}"]

    @property
    def empresa(self) -> str:
        return self.vaga.empresa

    @property
    def role(self) -> str:
        return self.vaga.role

    @property
    def nome(self) -> str:
        return self.perfil["nome"]

    @property
    def cidade(self) -> str | None:
        return self.vaga.cidade if self.vaga.cidade_valida else None

    @property
    def assinatura(self) -> str:
        return P.assinatura(self.perfil)

    @property
    def variante(self) -> int:
        return zlib.crc32(f"{self.vaga.id}|{self.vaga.empresa}".encode()) % 3

    @property
    def curso(self) -> dict:
        return self.perfil["curso"]

    @property
    def disp(self) -> dict:
        return self.perfil["disponibilidade"]

    def entidades(self) -> list[str]:
        """Textos fornecidos por dados externos, que o verificador não deve alterar."""
        return [self.vaga.empresa, self.vaga.role, self.vaga.cidade, self.motivo,
                self.contacto, self.tema, self.novidade, self.ligacao, self.saudacao,
                self.data_envio, self.data_entrevista, self.perfil["nome"],
                self.perfil["email"], self.perfil["telemovel"],
                self.perfil.get("linkedin"), self.perfil.get("media"),
                *self.perfil.get("cadeiras_destaque", []),
                *[p.get(self.lingua, "") for p in self.perfil.get("projetos_financas", [])],
                self.perfil["experiencias"].get("logistica_organizacao")]

    # ---- peças de texto ----
    def saudar(self) -> str:
        if self.saudacao:
            return self.saudacao
        if self.contacto:
            return f"Exmo(a). Sr(a). {self.contacto}," if self.pt else f"Dear {self.contacto},"
        return "Exmos. Senhores," if self.pt else "Dear Hiring Team,"

    def cidade_txt(self) -> str | None:
        if not self.cidade:
            return None
        if self.pt:
            return self.cidade
        return CIDADES_EN.get(self.cidade, self.cidade)

    def local(self) -> str:
        cid = self.cidade_txt()
        if not cid:
            return ""
        return f", em {cid}" if self.pt else f" in {cid}"

    def experiencia(self) -> str:
        e = self.perfil["experiencias"]
        org = e.get("logistica_organizacao")
        marca = ""
        if org:
            marca = f" na {org}" if self.pt else f" at {org}"
        logis = e[f"logistica_{self.lingua}"].replace("{org}", marca)
        fund = e[f"fundraising_{self.lingua}"]
        return f"{logis}, e {fund}" if self.pt else f"{logis}, and {fund}"

    def linha_empresa(self) -> str:
        if self.motivo:
            return self.motivo.strip()
        chave = "VC / private equity" if self.fam in ("PE", "VC") else self.vaga.tipo_empresa
        pt, en = areas.LINHA_EMPRESA.get(chave, areas.LINHA_EMPRESA_PADRAO)
        return (pt if self.pt else en).format(empresa=self.empresa)

    def fecho_pitch(self, lingua: str) -> str:
        area = self.bloco[f"area_{lingua}"]
        if self.motivo and lingua == self.lingua:
            return self.motivo.strip()
        if lingua == "pt":
            return f"Quero este estágio na {self.empresa} para aprender {area} na prática, junto de uma equipa experiente."
        return f"I want this internship at {self.empresa} to learn {area} in practice, alongside an experienced team."
