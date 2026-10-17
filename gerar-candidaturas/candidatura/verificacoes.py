"""Lista de verificações a fazer antes de enviar cada candidatura."""
from __future__ import annotations

from . import perfil as P
from .contexto import Contexto

PALAVRAS_ELEGIBILIDADE = ("exige", "convenção", "penúltimo", "mestrado", "matriculad", "não elegível", "nao elegivel")


def avisos(c: Contexto) -> list[str]:
    v, p = c.vaga, c.perfil
    out = []
    if v.ativa != 1:
        out.append(f"Estado da vaga: {v.estado}. Não está aberta para candidatura neste momento.")
    if v.qualidade != "Verificada na página":
        out.append(f"Informação da vaga: {v.qualidade}. Abre o link e confirma título, prazo, requisitos e data de início.")
    if v.lingua in ("FR", "DE", "NL") and P.nivel_lingua(p, v.lingua) < 0.5:
        out.append(f"A vaga pede {P.nome_lingua(p, v.lingua, 'pt')} e o teu perfil não tem essa língua. Lê o requisito na oferta: se for obrigatório, as hipóteses são muito baixas.")
    elif v.lingua in ("ES", "IT") and P.nivel_lingua(p, v.lingua) < 0.7:
        out.append(f"A vaga pede {P.nome_lingua(p, v.lingua, 'pt')} e o teu nível é básico. Confirma se a língua é obrigatória.")
    if any(k in v.elegibilidade.lower() for k in PALAVRAS_ELEGIBILIDADE):
        out.append(f"Elegibilidade: {v.elegibilidade}. Acabas o curso em janeiro, por isso confirma se podes candidatar-te.")
    if v.pais and v.pais != "Portugal":
        out.append(f"A vaga é em {v.cidade or 'cidade por confirmar'} ({v.pais}). Confirma que tens disponibilidade para mudar de país durante seis meses.")
    if not c.motivo:
        out.append(f"Sem motivo específico para a {v.empresa}. Acrescenta uma ou duas frases verdadeiras em dados/empresas_extra.json ou usa --motivo.")
    if not p.get("media"):
        out.append("Sem média no perfil. Para finanças, acrescentar a média e as cadeiras de finanças e matemática reforça a carta.")
    if not p["experiencias"].get("logistica_organizacao"):
        out.append("Sem o nome da organização onde foste Head of Logistics. Acrescenta-o em dados/perfil.json (logistica_organizacao).")
    if not p.get("projetos_financas"):
        out.append("Sem projetos de finanças no perfil. Um modelo DCF ou LBO simples, ou uma case competition, é o que mais ajuda nestas vagas.")
    if v.deadline and v.deadline.lower() not in ("não indicado", "nao indicado"):
        out.append(f"Prazo: {v.deadline}.")
    return out


def gerar(c: Contexto) -> str:
    v = c.vaga
    L = [f"# Verificações antes de enviar: {v.empresa}, {v.role}", "",
         f"- ID no Excel: {v.id}",
         f"- País e cidade: {v.pais}, {v.cidade}",
         f"- Modalidade: {v.modalidade}",
         f"- Início: {v.inicio} | Duração: {v.duracao}",
         f"- Estado: {v.estado} | Veredicto: {v.veredicto}",
         f"- Match com o CV: {v.match:.0f}/100 | Probabilidade estimada: {v.prob * 100:.1f}% ({v.chance})",
         f"- Língua dos textos gerados: {'português' if c.pt else 'inglês'}",
         f"- Link de candidatura ({v.tipo_link}): {v.link}", "",
         "## O que confirmar", ""]
    a = avisos(c)
    L += [f"- {x}" for x in a] if a else ["- Nada a assinalar."]
    L += ["", "## Ordem de envio sugerida", "",
          "1. Rever a carta e acrescentar o motivo específico da empresa.",
          "2. Ajustar o CV à vaga (destacar Excel, Python, liderança e o que a vaga pede).",
          "3. Candidatar pelo link acima. Se houver email, usar o ficheiro de email de candidatura.",
          "4. Registar a data de envio com o comando de registo, que calcula a data do seguimento.",
          f"5. Enviar o seguimento {c.perfil.get('dias_para_followup', 8)} dias depois, se não houver resposta.", ""]
    return "\n".join(L)
