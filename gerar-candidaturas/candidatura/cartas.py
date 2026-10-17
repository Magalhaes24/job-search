"""Carta de apresentação, adaptada à vaga, à empresa e à área."""
from __future__ import annotations

from . import perfil as P
from .contexto import Contexto


def _abertura(c: Contexto) -> str:
    cu, d = c.curso, c.disp
    if c.pt:
        base = [
            "Escrevo para me candidatar a «{role}» na {empresa}{local}, para um estágio de {dur} com início em {ini}. Concluo a {grau} em {curso} na {escola} em {fim} e procuro uma experiência em {area}.",
            "Candidato-me a «{role}» na {empresa}{local}, um estágio de {dur} com início em {ini}. Termino a {grau} em {curso} na {escola} em {fim} e quero começar o meu percurso profissional em {area}.",
            "Gostaria de me candidatar a «{role}» na {empresa}{local}, para um estágio de {dur} a partir de {ini}. Concluo a {grau} em {curso} na {escola} em {fim}, e {area} é a área em que quero dar os primeiros passos.",
        ][c.variante]
        return base.format(role=c.role, empresa=c.empresa, local=c.local(), dur=d["duracao_pt"],
                           ini=d["inicio_pt"], grau=cu["grau_pt"], curso=cu["area_pt"],
                           escola=cu["escola"], fim=cu["conclusao_pt"], area=c.area)
    base = [
        "I am applying for the {role} position at {empresa}{local}, a {dur} internship starting in {ini}. I complete my {curso} {grau} at {escola} in {fim} and I am looking for an experience in {area}.",
        "Please accept my application for {role} at {empresa}{local}, a {dur} internship starting in {ini}. I finish my {curso} {grau} at {escola} in {fim} and I want to begin my career in {area}.",
        "I would like to apply for {role} at {empresa}{local}, a {dur} internship starting in {ini}. I complete my {curso} {grau} at {escola} in {fim}, and {area} is where I want to take my first steps.",
    ][c.variante]
    return base.format(role=c.role, empresa=c.empresa, local=c.local(), dur=d["duracao_en"],
                       ini=d["inicio_en"], grau=cu["grau_en"], curso=cu["area_en"],
                       escola=cu["escola"], fim=cu["conclusao_en"], area=c.area)


def _motivacao(c: Contexto) -> str:
    return f'{c.bloco["interesse_" + c.lingua]} {c.linha_empresa()}'


def _provas(c: Contexto) -> str:
    p = c.perfil
    comp = p["competencias"]
    cu = c.curso
    media = p.get("media")
    cadeiras = p.get("cadeiras_destaque") or []
    projetos = p.get("projetos_financas") or []
    if c.pt:
        base = f"O meu curso de {cu['area_pt']} na {cu['escola']} deu-me uma base sólida em matemática e finanças"
        if media:
            base += f", com média atual de {media} valores"
        if cadeiras:
            base += f", incluindo cadeiras como {' e '.join(cadeiras[:2])}"
        base += f". Tenho {comp['excel_pt']} e {comp['python_pt']}, e utilizo {comp['powerpoint_pt']}."
        if projetos:
            base += f" Destaco ainda {projetos[0]['pt']}."
        base += f" Fora da sala de aula, {c.experiencia()}. Estas funções ensinaram-me a planear com prazos apertados e a assumir a responsabilidade pelo resultado."
        return base + " " + c.bloco["aplica_pt"]
    base = f"My {cu['area_en']} {cu['grau_en']} at {cu['escola']} has given me a solid grounding in mathematics and finance"
    if media:
        base += f", with a current average of {media}"
    if cadeiras:
        base += f", including courses such as {' and '.join(cadeiras[:2])}"
    base += f". I hold {comp['excel_en']} and {comp['python_en']}, and I use {comp['powerpoint_en']}."
    if projetos:
        base += f" I would also highlight {projetos[0]['en']}."
    base += f" Outside the classroom, {c.experiencia()}. These roles taught me to plan against tight deadlines and to take responsibility for results."
    return base + " " + c.bloco["aplica_en"]


def _linguas_e_fecho(c: Contexto) -> str:
    p, d = c.perfil, c.disp
    chave = c.vaga.lingua
    if c.pt:
        txt = f"Falo português como língua materna e inglês com nível C1 (Cambridge)"
        extra = ""
        if chave in ("ES", "IT") and P.nivel_lingua(p, chave) > 0:
            extra = f", e tenho noções básicas de {P.nome_lingua(p, chave, 'pt')}"
        for cod in p.get("a_aprender", []):
            if cod == chave:
                extra += f"; estou a aprender {P.nome_lingua(p, cod, 'pt')}"
        txt += extra + f". Estou disponível para começar em {d['inicio_pt']}."
        fechos = [
            "Teria muito gosto em conversar sobre a vaga e sobre a forma como posso contribuir para a equipa. Fico disponível para uma entrevista na data que for mais conveniente.",
            "Agradeço a atenção dedicada à minha candidatura e fico disponível para uma conversa presencial ou online, quando for mais conveniente.",
            "Obrigada pelo tempo dedicado à leitura desta carta. Terei muito gosto em aprofundar a minha candidatura numa conversa.",
        ][c.variante]
        return txt + "\n\n" + fechos + "\n\nCom os melhores cumprimentos,"
    txt = "Portuguese is my native language and my English is at Cambridge C1 level"
    extra = ""
    if chave in ("ES", "IT") and P.nivel_lingua(p, chave) > 0:
        extra = f", and I have basic {P.nome_lingua(p, chave, 'en')}"
    for cod in p.get("a_aprender", []):
        if cod == chave:
            extra += f"; I am currently learning {P.nome_lingua(p, cod, 'en')}"
    txt += extra + f". I am available to start in {d['inicio_en']}."
    fechos = [
        "I would be glad to discuss the role and how I can contribute to the team, and I am available for an interview at whatever time suits you best.",
        "Thank you for considering my application. I am available for a conversation in person or online whenever it suits you.",
        "Thank you for the time you have given to this letter. I would welcome the chance to talk about my application in more detail.",
    ][c.variante]
    return txt + "\n\n" + fechos + "\n\nKind regards,"


def gerar(c: Contexto) -> str:
    partes = [c.saudar(), _abertura(c), _motivacao(c), _provas(c), _linguas_e_fecho(c), c.assinatura]
    return "\n\n".join(partes) + "\n"
