"""Famílias de funções e blocos de texto por área (PT e EN)."""
from __future__ import annotations


def familia(area: str, tipo_empresa: str = "") -> str:
    a = area.lower()
    t = tipo_empresa.lower()
    if "venture" in a:
        return "VC"
    if any(k in a for k in ("investor relations", "fund finance", "contabilidade de fundos")):
        return "FUND"
    if any(k in a for k in ("advisory", "private debt", "reestrutura")):
        return "ADV"
    if "private equity" in a or a.startswith("pe ") or a.startswith("pe(") or "pe (" in a:
        return "PE"
    if a in ("ib / m&a", "m&a") or a.startswith("ib "):
        return "IB"
    if any(k in a for k in ("corporate finance", "transações")):
        return "CF"
    if any(k in a for k in ("asset management", "research", "esg", "gestora")):
        return "AM"
    if any(k in a for k in ("capital markets", "mercados", "quant")):
        return "MKT"
    if any(k in a for k in ("risco", "seguros")):
        return "RISK"
    if any(k in a for k in ("banca", "instituição financeira")):
        return "BANK"
    if any(k in a for k in ("auditoria", "consultoria", "big 4", "graduate", "consultora")):
        return "CONS"
    if any(k in a for k in ("trainee", "emprego júnior", "via de acesso")):
        return "CORP"
    if "private equity" in t or "vc" in t:
        return "PE"
    return "GEN"


# area: nome da área numa frase; interesse: porquê; aplica: como as competências ajudam.
BLOCOS = {
    "PE": {
        "area_pt": "private equity", "area_en": "private equity",
        "interesse_pt": "Gosto de matemática e de finanças, e o private equity junta as duas com uma visão de longo prazo sobre como as empresas crescem. A componente quantitativa atrai-me, da avaliação de empresas à análise de retornos, e quero perceber como se tomam decisões de investimento na prática.",
        "interesse_en": "I enjoy mathematics and finance, and private equity combines both with a long-term view of how businesses grow. The quantitative side of the work appeals to me, from valuation to returns analysis, and I want to learn how investment decisions are made in practice.",
        "aplica_pt": "Sei que o trabalho de um estagiário assenta em modelação financeira e pesquisa setorial, e são tarefas em que as minhas competências em Excel e Python me permitem contribuir desde cedo.",
        "aplica_en": "I understand that an intern's work centres on financial modelling and sector research, and these are tasks where my Excel and Python skills let me contribute early.",
    },
    "IB": {
        "area_pt": "banca de investimento e M&A", "area_en": "investment banking and M&A",
        "interesse_pt": "A banca de investimento e o M&A atraem-me pelo ritmo e pela exigência. Cada operação pede análise rigorosa e capacidade de síntese, e é feita em equipa, com prazos curtos.",
        "interesse_en": "Investment banking and M&A appeal to me for their pace and their standards. Every transaction calls for rigorous analysis and clear synthesis, and it is delivered by a team against short deadlines.",
        "aplica_pt": "Sei que um estágio nesta área assenta em modelos de avaliação e em apresentações para clientes, e as minhas bases de Excel e PowerPoint ajudam-me a ser útil desde as primeiras semanas.",
        "aplica_en": "I understand that an internship in this area rests on valuation models and client presentations, and my Excel and PowerPoint skills should help me be useful from the first weeks.",
    },
    "CF": {
        "area_pt": "corporate finance e transações", "area_en": "corporate finance and transactions",
        "interesse_pt": "A área de corporate finance e transações interessa-me porque obriga a perceber o negócio por trás dos números e a traduzir essa análise em recomendações claras para quem decide.",
        "interesse_en": "Corporate finance and transactions interest me because they require understanding the business behind the numbers and turning that analysis into clear recommendations for decision makers.",
        "aplica_pt": "O Excel e o Python permitem-me trabalhar com rapidez e com cuidado nos detalhes, em avaliação e em análise financeira.",
        "aplica_en": "Excel and Python let me work quickly and carefully on valuation and financial analysis.",
    },
    "AM": {
        "area_pt": "gestão de ativos", "area_en": "asset management",
        "interesse_pt": "A gestão de ativos interessa-me pela forma como liga os mercados à disciplina de investimento. Quero aprender como se constrói uma tese de investimento e como se acompanha uma carteira ao longo do tempo.",
        "interesse_en": "Asset management interests me for the way it links markets to investment discipline. I want to learn how an investment thesis is built and how a portfolio is followed over time.",
        "aplica_pt": "A formação em Economia dá-me base para a análise macroeconómica e setorial, e o Python permite-me tratar dados de mercado com autonomia.",
        "aplica_en": "My Economics training gives me a base for macroeconomic and sector analysis, and Python lets me handle market data on my own.",
    },
    "MKT": {
        "area_pt": "mercados de capitais", "area_en": "capital markets",
        "interesse_pt": "Os mercados de capitais atraem-me porque a matemática e a economia se aplicam aqui de forma imediata, com decisões que dependem de números e de rapidez de raciocínio.",
        "interesse_en": "Capital markets attract me because mathematics and economics apply here directly, with decisions that depend on numbers and quick reasoning.",
        "aplica_pt": "O gosto pela matemática e a certificação em Python são a base com que quero contribuir para a equipa.",
        "aplica_en": "My liking for mathematics and my Python certification are the foundation I would bring to the team.",
    },
    "BANK": {
        "area_pt": "banca", "area_en": "banking",
        "interesse_pt": "A banca interessa-me por ser o lugar onde a economia real e o sistema financeiro se encontram, sobretudo na forma como o crédito e o risco são avaliados.",
        "interesse_en": "Banking interests me because it is where the real economy and the financial system meet, especially in how credit and risk are assessed.",
        "aplica_pt": "Quero contribuir com rigor analítico e com a organização que aprendi a pôr em prática noutros contextos.",
        "aplica_en": "I would like to contribute analytical rigour and the organisation I have learned to apply in other settings.",
    },
    "ADV": {
        "area_pt": "dívida e reestruturação", "area_en": "debt and restructuring",
        "interesse_pt": "O trabalho com dívida e reestruturação interessa-me porque exige perceber a estrutura de capital de uma empresa e encontrar soluções concretas quando as condições mudam.",
        "interesse_en": "Work on debt and restructuring interests me because it requires understanding a company's capital structure and finding practical solutions when conditions change.",
        "aplica_pt": "Para esse tipo de análise, o Excel e a base em Economia são o que posso oferecer de imediato.",
        "aplica_en": "For this kind of analysis, Excel and my Economics background are what I can offer straight away.",
    },
    "FUND": {
        "area_pt": "gestão e operações de fundos", "area_en": "fund management and operations",
        "interesse_pt": "Quero perceber como funciona um fundo por dentro, do reporte aos investidores ao controlo das operações, porque é aí que se constrói a confiança de quem investe.",
        "interesse_en": "I want to understand how a fund works from the inside, from investor reporting to the control of operations, because that is where investor confidence is built.",
        "aplica_pt": "Coordenar logística e eventos habituou-me a trabalhar com processos e prazos, e tenho certificação em Excel.",
        "aplica_en": "Coordinating logistics and events has accustomed me to working with processes and deadlines, and I am certified in Excel.",
    },
    "VC": {
        "area_pt": "venture capital", "area_en": "venture capital",
        "interesse_pt": "O venture capital interessa-me pela proximidade a empresas em fase inicial e pela forma como a análise tem de lidar com muita incerteza.",
        "interesse_en": "Venture capital interests me for its closeness to early-stage companies and for the way analysis has to cope with a great deal of uncertainty.",
        "aplica_pt": "Posso contribuir com pesquisa e análise de dados em Excel e Python, com a organização de quem já coordenou uma equipa.",
        "aplica_en": "I can contribute research and data analysis in Excel and Python, with the organisation of someone who has already coordinated a team.",
    },
    "CONS": {
        "area_pt": "consultoria e auditoria", "area_en": "consulting and audit",
        "interesse_pt": "A consultoria e a auditoria atraem-me porque permitem aprender depressa, com projetos e setores diferentes, e desenvolver um raciocínio estruturado perante problemas concretos de clientes.",
        "interesse_en": "Consulting and audit attract me because they allow fast learning across different projects and sectors, and they build structured thinking on real client problems.",
        "aplica_pt": "Habituei-me a organizar pessoas e prazos e a comunicar com clareza, e trabalho com à vontade em Excel e PowerPoint.",
        "aplica_en": "I am used to organising people and deadlines and to communicating clearly, and I am comfortable in Excel and PowerPoint.",
    },
    "RISK": {
        "area_pt": "gestão de risco", "area_en": "risk management",
        "interesse_pt": "A gestão de risco interessa-me por aplicar matemática e economia à decisão, medindo a incerteza para decidir melhor.",
        "interesse_en": "Risk management interests me because it applies mathematics and economics to decision making, measuring uncertainty in order to decide better.",
        "aplica_pt": "O gosto por matemática, o Excel certificado e o Python dão-me uma base para trabalhar com modelos e dados desde cedo.",
        "aplica_en": "My liking for mathematics, my certified Excel and my Python give me a base to work with models and data early on.",
    },
    "CORP": {
        "area_pt": "contexto empresarial", "area_en": "a corporate setting",
        "interesse_pt": "O programa permite conhecer uma organização por dentro e aprender com equipas de áreas diferentes, algo que valorizo para escolher bem o meu caminho.",
        "interesse_en": "The programme lets me see an organisation from the inside and learn from teams in different areas, which I value in order to choose my path well.",
        "aplica_pt": "Trago capacidade de organização e gosto pela análise quantitativa, com Excel e Python como ferramentas.",
        "aplica_en": "I bring strong organisation and a taste for quantitative analysis, with Excel and Python as tools.",
    },
    "GEN": {
        "area_pt": "finanças", "area_en": "finance",
        "interesse_pt": "A área financeira interessa-me porque aplica a matemática e a economia a decisões com impacto real.",
        "interesse_en": "Finance interests me because it applies mathematics and economics to decisions with real impact.",
        "aplica_pt": "Posso contribuir com competências em Excel e Python e com a disciplina de quem já coordenou uma equipa.",
        "aplica_en": "I can contribute Excel and Python skills and the discipline of someone who has already coordinated a team.",
    },
}

# Frase sobre a empresa quando não há motivo específico (sem factos sobre a empresa).
LINHA_EMPRESA = {
    "VC / private equity": (
        "Gostaria de aprender na {empresa}, junto de uma equipa de investimento, o rigor que cada decisão exige.",
        "At {empresa}, I would like to learn, alongside an investment team, the rigour that each decision demands."),
    "Banca de investimento": (
        "Gostaria de aprender na {empresa}, junto de uma equipa de execução, como se conduz uma operação do início ao fim.",
        "At {empresa}, I would like to learn, alongside an execution team, how a transaction is run from start to finish."),
    "Banca de investimento / boutique": (
        "Gostaria de aprender na {empresa}, junto de uma equipa de execução, como se conduz uma operação do início ao fim.",
        "At {empresa}, I would like to learn, alongside an execution team, how a transaction is run from start to finish."),
    "Big 4 / consultoria": (
        "Gostaria de trabalhar desde cedo, na {empresa}, com equipas e clientes diferentes.",
        "At {empresa}, I would like to work with different teams and clients from an early stage."),
    "Banca comercial": (
        "Gostaria de aprender na {empresa} como uma instituição bancária analisa o risco e apoia os seus clientes.",
        "At {empresa}, I would like to learn how a bank analyses risk and supports its clients."),
    "Serviços financeiros": (
        "Gostaria de aprender na {empresa} como se organiza uma operação financeira no dia a dia.",
        "At {empresa}, I would like to learn how a financial operation is organised day to day."),
    "Big corporate": (
        "Interessa-me a diversidade de áreas e a escala de uma organização como a {empresa}.",
        "The range of areas and the scale of an organisation such as {empresa} interest me."),
    "Gestão de ativos": (
        "Gostaria de aprender na {empresa} como se constrói e se acompanha uma carteira de investimento.",
        "At {empresa}, I would like to learn how an investment portfolio is built and followed."),
    "Setor público / instituição": (
        "Interessa-me trabalhar numa instituição pública com impacto na economia, como a {empresa}.",
        "Working at a public institution with an impact on the economy, such as {empresa}, interests me."),
    "Seguradora": (
        "Gostaria de aprender na {empresa} como uma seguradora avalia e gere o risco.",
        "At {empresa}, I would like to learn how an insurer assesses and manages risk."),
    "Startup / scale-up": (
        "Interessa-me o ritmo e a autonomia de uma empresa em crescimento como a {empresa}.",
        "The pace and autonomy of a growing company such as {empresa} interest me."),
}
LINHA_EMPRESA_PADRAO = (
    "Gostaria de aprender na {empresa}, ao lado de uma equipa experiente.",
    "At {empresa}, I would like to learn alongside an experienced team.",
)
