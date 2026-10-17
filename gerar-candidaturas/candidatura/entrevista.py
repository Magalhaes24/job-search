"""Ficha de preparação de entrevista: pitch, respostas-base, perguntas técnicas e perguntas a fazer."""
from __future__ import annotations

from .contexto import Contexto

# Perguntas técnicas por família (em inglês, a língua habitual das entrevistas) com pistas de resposta.
TECNICAS = {
    "PE": [
        ("Walk me through the three financial statements and how they connect.",
         "Net income flows into retained earnings and starts the cash flow statement. Capex and depreciation move PP&E. The ending cash from the cash flow statement closes the balance sheet."),
        ("What is the difference between enterprise value and equity value?",
         "Enterprise value is the value of the operating business. Equity value equals enterprise value minus net debt and other claims such as minorities and preferred equity."),
        ("How does a leveraged buyout create returns?",
         "Through EBITDA growth, multiple expansion and debt paydown. In practice most of the return comes from growth and deleveraging, and entry price decides how much room is left."),
        ("What makes a good LBO candidate?",
         "Stable and predictable cash flows, low capex needs, a defensible market position, room for operational improvement, a reasonable entry price and real debt capacity."),
        ("Paper LBO: buy at 8x EBITDA of 100 with 50% debt, exit after five years at 8x with EBITDA of 140 and 40 of debt repaid. What are the MOIC and IRR?",
         "Entry EV is 800, debt 400, equity 400. Exit EV is 1,120 and net debt 360, so exit equity is 760. MOIC is 1.9x and IRR is about 14% (1.9 to the power of 1/5). Fees and interest are ignored."),
        ("Pitch me a company you would invest in.",
         "Prepare two minutes: business model, why it is attractive, valuation, main risks and what would make you change your mind."),
    ],
    "IB": [
        ("Walk me through a DCF.",
         "Project free cash flow, estimate a terminal value, discount both at the WACC to get enterprise value, then bridge to equity value by subtracting net debt."),
        ("Name the main valuation methods and when each one applies.",
         "DCF for companies with forecastable cash flows, trading comparables for a market view, precedent transactions for a control view including a premium."),
        ("If depreciation rises by 10, what happens to cash?",
         "Pre-tax income falls by 10, taxes fall by 10 times the tax rate, net income falls by 10 times one minus the tax rate, and adding back the 10 of depreciation leaves cash higher by 10 times the tax rate."),
        ("How do you tell if a deal is accretive or dilutive?",
         "Compare the acquirer's standalone EPS with pro forma EPS. In a stock deal it depends on the relative P/E ratios, in a cash deal on the after-tax cost of financing against the target's earnings yield."),
        ("Tell me about a recent deal and why it made sense.",
         "Prepare one recent transaction in the sector of the role: rationale, price, financing and how the market reacted."),
    ],
    "AM": [
        ("Pitch me a stock or an asset.",
         "Thesis, valuation, catalysts, risks and exit conditions, in two minutes."),
        ("What happens to bond prices when interest rates rise?",
         "They fall, and longer duration means a larger fall for the same change in rates."),
        ("What is beta and what does the Sharpe ratio measure?",
         "Beta measures sensitivity to the market. The Sharpe ratio is excess return per unit of volatility."),
        ("What is your view on the current market?",
         "Prepare a short and honest view on rates, inflation and one sector, with the data behind it."),
    ],
    "MKT": [
        ("What is the expected value of a fair die roll, and how much would you pay to play for the face value?",
         "The expected value is 3.5, so a fair price is 3.5."),
        ("Explain duration and convexity in simple terms.",
         "Duration is the first-order sensitivity of price to yield. Convexity captures the curvature that duration misses."),
        ("State put-call parity.",
         "Call minus put equals spot minus the present value of the strike, ignoring dividends."),
        ("Mental arithmetic: practise percentages, fractions and quick multiplications.",
         "Many desks test speed. Practise ten minutes a day before the interview."),
    ],
    "BANK": [
        ("How does a bank make money?",
         "Mainly from net interest margin, plus fees and commissions. Costs and impairments come out of that."),
        ("What would you look at when assessing a corporate loan?",
         "Capacity to repay (cash flow and leverage), capital, collateral, track record and the conditions of the sector."),
        ("What does a rise in interest rates do to a bank?",
         "It can widen the net interest margin but it also raises credit risk and can reduce loan demand. It depends on the balance sheet."),
    ],
    "ADV": [
        ("What is the order of repayment in a capital structure?",
         "Senior secured debt, senior unsecured, subordinated debt, preferred equity and then common equity."),
        ("What are common ways to restructure a company in distress?",
         "Amend and extend, debt for equity swaps, asset sales and new money with priority."),
        ("Which ratios tell you a company is under pressure?",
         "Interest coverage, net debt to EBITDA, liquidity runway and covenant headroom."),
    ],
    "FUND": [
        ("Explain NAV, capital calls and distributions.",
         "NAV is the value of the fund's holdings. Capital calls are drawdowns from investors and distributions are cash returned to them."),
        ("What do DPI, RVPI and TVPI mean?",
         "DPI is distributions over paid-in capital, RVPI is remaining NAV over paid-in capital, and TVPI is their sum."),
        ("What is the J-curve?",
         "Early fund returns are negative because of fees and unrealised investments, and improve as holdings mature and exits happen."),
        ("IRR versus MOIC: when do they disagree?",
         "A quick small win can show a high IRR with a low MOIC, while a long hold can show a high MOIC with a modest IRR."),
    ],
    "VC": [
        ("How would you value a startup with no revenue?",
         "Comparable rounds, a view on the size of the market and the share the company can win, plus the dilution expected until exit."),
        ("What are the main points of a term sheet?",
         "Valuation, amount, liquidation preference, anti-dilution, pro-rata rights, board seats and the option pool."),
        ("What are burn rate and runway?",
         "Burn is the monthly cash outflow and runway is cash divided by burn."),
        ("Pitch me a startup you admire.",
         "Problem, solution, market, team, traction and the main risk."),
    ],
    "CF": [
        ("How would you assess the financial health of a company?",
         "Liquidity, leverage, profitability and cash conversion, always compared with peers and over time."),
        ("Walk me through a DCF.",
         "Project free cash flow, estimate a terminal value, discount at the WACC and bridge to equity value."),
        ("What drives a company's valuation multiple?",
         "Growth, margins, return on capital, risk and the cycle of the sector."),
    ],
    "CONS": [
        ("Estimate the size of a market, for example coffee consumed in Portugal in a year.",
         "Structure first: population, share of drinkers, cups per day, price per cup. State assumptions aloud and sanity check the result."),
        ("A client's profits are falling. How do you approach it?",
         "Split profit into revenue and cost, then break each into drivers, and test hypotheses with data."),
        ("Why consulting or audit and why now?",
         "Tie it to learning speed, structured thinking and your wish to test several sectors before specialising."),
    ],
    "RISK": [
        ("What does Value at Risk tell you and what are its limits?",
         "It gives a loss threshold at a confidence level over a horizon. It says nothing about losses beyond the threshold and depends on the model."),
        ("What is the difference between probability of default and loss given default?",
         "The first is how likely a default is and the second is how much is lost if it happens. Expected loss multiplies them by exposure."),
        ("Why do correlations matter in a portfolio?",
         "Lower correlation reduces portfolio volatility, but correlations tend to rise in a crisis."),
    ],
    "CORP": [
        ("Why this company and this programme?",
         "Link the rotations or areas of the programme to what you want to learn, with one concrete detail from the company."),
        ("Describe a time you worked under pressure with a team.",
         "Use the logistics team of ten: situation, your role, what you decided, the result."),
        ("How comfortable are you with Excel?",
         "Be ready for a short test: lookups, pivot tables, conditional formulas. Mention your certification."),
    ],
    "GEN": [
        ("Why this area and why this company?",
         "One concrete reason for the area and one for the company, in thirty seconds each."),
        ("Describe a time you worked under pressure with a team.",
         "Use the logistics team of ten: situation, your role, what you decided, the result."),
    ],
}

PERGUNTAS_A_FAZER_EN = [
    "What does a typical week look like for an intern on this team?",
    "How is the work of an intern evaluated, and what would a strong six months look like?",
    "What do previous interns tend to go on to do?",
    "Which skills would you advise me to strengthen before January?",
    "What are the next steps in the process and the expected timeline?",
]
PERGUNTAS_A_FAZER_PT = [
    "Como é uma semana típica de um estagiário nesta equipa?",
    "Como é avaliado o trabalho do estagiário e o que seria um bom semestre?",
    "Que percurso costumam seguir os estagiários anteriores?",
    "Que competências me aconselha a reforçar até janeiro?",
    "Quais são os próximos passos do processo e o prazo previsto?",
]


def _pitch(c: Contexto, lingua: str) -> str:
    cu, comp, d = c.curso, c.perfil["competencias"], c.disp
    area = c.bloco[f"area_{lingua}"]
    org = c.perfil["experiencias"].get("logistica_organizacao")
    if lingua == "pt":
        marca = f" na {org}" if org else ""
        return (f"Sou a {c.nome.split()[0]} e concluo a {cu['grau_pt']} em {cu['area_pt']} na {cu['escola']} em {cu['conclusao_pt']}. "
                f"Gosto de matemática e de finanças, e por isso procuro uma experiência em {area}. "
                f"Fora das aulas, fui Head of Logistics{marca}, com uma equipa de 10 pessoas, e organizei iniciativas de angariação de fundos e eventos. "
                f"Tenho {comp['excel_pt']} e {comp['python_pt']}. "
                f"{c.fecho_pitch('pt')}")
    marca = f" at {org}" if org else ""
    return (f"I am {c.nome.split()[0]} and I complete my {cu['area_en']} {cu['grau_en']} at {cu['escola']} in {cu['conclusao_en']}. "
            f"I enjoy mathematics and finance, which is why I am looking for an experience in {area}. "
            f"Outside the classroom I served as Head of Logistics{marca}, leading a team of ten people, and organised fundraising initiatives and events. "
            f"I hold {comp['excel_en']} and {comp['python_en']}. "
            f"{c.fecho_pitch('en')}")


def gerar(c: Contexto) -> str:
    v = c.vaga
    tec = TECNICAS.get(c.fam, TECNICAS["GEN"])
    L = [f"# Preparação de entrevista: {v.empresa}, {v.role}", "",
         f"Área: {c.bloco['area_pt']} | Língua-chave da vaga: {v.lingua} | Cidade: {v.cidade or 'por confirmar'}", "",
         "## 1. Apresentação de 60 segundos", "",
         "Português:", "", _pitch(c, "pt"), "", "English:", "", _pitch(c, "en"), "",
         "## 2. Respostas-base (completa com exemplos reais)", "",
         "- Porquê esta área? Usa a frase de interesse da carta e acrescenta um exemplo teu em que a matemática ou as finanças te agarraram.",
         f"- Porquê a {v.empresa}? Uma razão concreta e verdadeira (um deal, um produto, uma pessoa com quem falaste). Se não tiveres, pesquisa antes da entrevista.",
         "- Porque é que ainda não tens experiência em finanças? Responde com franqueza: estás a terminar o curso, já construíste a base (Excel certificado, Python, matemática) e queres aprender com a prática. Dá um exemplo concreto de aprendizagem rápida.",
         "- Liderança: método STAR com a equipa de logística de 10 pessoas. Situação, a tua função, o que decidiste, o resultado com números se os tiveres.",
         "- Falha ou dificuldade: escolhe um caso real, o que aprendeste e o que mudaste desde então.",
         "- Ponto fraco: um ponto real e trabalhado, nunca um defeito disfarçado de qualidade.", "",
         "## 3. Perguntas técnicas prováveis (em inglês)", ""]
    for q, a in tec:
        L += [f"- {q}", f"  Pista: {a}"]
    L += ["", "## 4. Perguntas a fazer no fim", ""]
    L += [f"- {q}" for q in (PERGUNTAS_A_FAZER_PT if c.pt else PERGUNTAS_A_FAZER_EN)]
    L += ["", "## 5. Antes da entrevista", "",
          "- Lê a descrição da vaga e os requisitos outra vez.",
          "- Prepara dois exemplos para cada competência pedida.",
          "- Treina em voz alta com cronómetro.",
          f"- Confirma o formato, a hora e o nome do entrevistador. {v.modalidade}",
          f"- Link da vaga: {v.link}", ""]
    return "\n".join(L)
