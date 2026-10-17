"""Emails e mensagens: candidatura, candidatura espontânea, seguimento, agradecimento,
confirmação de entrevista, pedido de conversa, nota de LinkedIn e pedido de feedback."""
from __future__ import annotations

from .contexto import Contexto


def _fecho(c: Contexto) -> str:
    return ("Com os melhores cumprimentos," if c.pt else "Kind regards,") + "\n" + c.assinatura


def _montar(c: Contexto, assunto: str, paragrafos: list[str]) -> str:
    corpo = "\n\n".join([c.saudar(), *paragrafos, _fecho(c)])
    rotulo = "Assunto" if c.pt else "Subject"
    return f"{rotulo}: {assunto}\n\n{corpo}\n"


def candidatura(c: Contexto) -> str:
    d, cu = c.disp, c.curso
    if c.pt:
        return _montar(c, f"Candidatura a «{c.role}» | {c.nome}", [
            f"Envio em anexo o meu CV e a carta de apresentação para a vaga de «{c.role}» na {c.empresa}{c.local()}, com início em {d['inicio_pt']}.",
            f"Concluo a {cu['grau_pt']} em {cu['area_pt']} na {cu['escola']} em {cu['conclusao_pt']} e tenho um interesse particular em {c.area}. A carta explica o que posso trazer à equipa e porque quero trabalhar na {c.empresa}.",
            "Terei todo o gosto em esclarecer qualquer ponto ou em marcar uma conversa.",
        ])
    return _montar(c, f"Application for {c.role} | {c.nome}", [
        f"Please find attached my CV and cover letter for the {c.role} position at {c.empresa}{c.local()}, starting in {d['inicio_en']}.",
        f"I complete my {cu['area_en']} {cu['grau_en']} at {cu['escola']} in {cu['conclusao_en']} and have a particular interest in {c.area}. The letter explains what I can bring to the team and why I want to work at {c.empresa}.",
        "I would be glad to clarify any point or to arrange a conversation.",
    ])


def candidatura_espontanea(c: Contexto) -> str:
    d, cu, comp = c.disp, c.curso, c.perfil["competencias"]
    if c.pt:
        return _montar(c, f"Candidatura espontânea a estágio de seis meses (janeiro de 2027) | {c.nome}", [
            f"Chamo-me {c.nome}, concluo a {cu['grau_pt']} em {cu['area_pt']} na {cu['escola']} em {cu['conclusao_pt']} e gostaria de realizar um estágio de {d['duracao_pt']} na {c.empresa}, com início em {d['inicio_pt']}.",
            f"Gosto de matemática e de finanças e procuro uma experiência em {c.area}. Tenho {comp['excel_pt']} e {comp['python_pt']} e, fora da sala de aula, {c.experiencia()}.",
            c.linha_empresa(),
            "Envio o meu CV em anexo. Se não houver uma vaga aberta neste momento, agradeço que o guardem para futuras oportunidades. Terei todo o gosto em falar com quem considerarem útil.",
        ])
    return _montar(c, f"Unsolicited application: six-month internship (January 2027) | {c.nome}", [
        f"My name is {c.nome}. I complete my {cu['area_en']} {cu['grau_en']} at {cu['escola']} in {cu['conclusao_en']} and I would like to apply for a {d['duracao_en']} internship at {c.empresa}, starting in {d['inicio_en']}.",
        f"I enjoy mathematics and finance and I am looking for an experience in {c.area}. I hold {comp['excel_en']} and {comp['python_en']} and, outside the classroom, {c.experiencia()}.",
        c.linha_empresa(),
        "My CV is attached. If there is no open position at the moment, I would be grateful if you could keep my application on file for future opportunities. I would be glad to speak with whoever you think is best placed.",
    ])


def seguimento(c: Contexto) -> str:
    quando_pt = f"no dia {c.data_envio}" if c.data_envio else "há alguns dias"
    quando_en = f"on {c.data_envio}" if c.data_envio else "a few days ago"
    nov_pt = f" Entretanto, {c.novidade.rstrip('.')}." if c.novidade else ""
    nov_en = f" In the meantime, {c.novidade.rstrip('.')}." if c.novidade else ""
    if c.pt:
        return _montar(c, f"Seguimento da candidatura a «{c.role}» | {c.nome}", [
            f"Candidatei-me {quando_pt} à vaga de «{c.role}» e escrevo para saber se a candidatura foi recebida e se existe alguma novidade sobre o processo.",
            f"Mantenho um grande interesse na vaga.{nov_pt} Se precisarem de algum documento ou informação adicional, envio-os de imediato.",
            "Obrigada pela atenção.",
        ])
    return _montar(c, f"Following up on my application for {c.role} | {c.nome}", [
        f"I applied {quando_en} for the {c.role} position and I am writing to check that my application was received and whether there is any news on the process.",
        f"I remain very interested in the role.{nov_en} If you need any further document or information, I will send it straight away.",
        "Thank you for your time.",
    ])


def agradecimento(c: Contexto) -> str:
    tema_pt = f"A conversa sobre {c.tema} reforçou o meu interesse na função. " if c.tema else ""
    tema_en = f"Our conversation about {c.tema} strengthened my interest in the role. " if c.tema else ""
    if c.pt:
        return _montar(c, f"Obrigada pela conversa | {c.nome}", [
            f"Obrigada pelo tempo que dedicou à nossa conversa sobre «{c.role}». {tema_pt}Fiquei com ainda mais vontade de integrar a equipa da {c.empresa}.",
            "Se for útil, envio qualquer informação adicional. Aguardo com interesse os próximos passos.",
        ])
    return _montar(c, f"Thank you for your time | {c.nome}", [
        f"Thank you for the time you gave to our conversation about the {c.role} position. {tema_en}I came away even more keen to join the team at {c.empresa}.",
        "If it is useful, I can send any additional information. I look forward to the next steps.",
    ])


def confirmar_entrevista(c: Contexto) -> str:
    data_pt = c.data_entrevista or "a data indicada"
    data_en = c.data_entrevista or "the proposed date"
    if c.pt:
        return _montar(c, f"Confirmação de entrevista | {c.nome}", [
            f"Obrigada pelo convite para a entrevista relativa a «{c.role}». Confirmo a minha disponibilidade para {data_pt}. Caso seja necessário, posso propor alternativas.",
            "Se possível, agradeço que me indiquem o formato da entrevista e o nome de quem a conduzirá, para me preparar melhor.",
        ])
    return _montar(c, f"Interview confirmation | {c.nome}", [
        f"Thank you for the invitation to interview for the {c.role} position. I confirm my availability for {data_en}. If needed, I can suggest alternatives.",
        "If possible, I would appreciate knowing the format of the interview and the name of the interviewer, so that I can prepare properly.",
    ])


def pedido_conversa(c: Contexto) -> str:
    lig_pt = f" {c.ligacao.rstrip('.')}." if c.ligacao else ""
    lig_en = f" {c.ligacao.rstrip('.')}." if c.ligacao else ""
    cu = c.curso
    if c.pt:
        return _montar(c, f"Pedido de conversa breve sobre {c.area} na {c.empresa}", [
            f"Chamo-me {c.nome} e sou estudante finalista de {cu['area_pt']} na {cu['escola']}. Estou a candidatar-me a estágios em {c.area} para {c.disp['inicio_pt']} e gostava muito de ouvir a sua experiência na {c.empresa}.{lig_pt}",
            "Teria 15 minutos para uma breve chamada ou videochamada? Compreendo perfeitamente se não for possível.",
            "Obrigada desde já pelo seu tempo.",
        ])
    return _montar(c, f"Request for a short conversation about {c.area} at {c.empresa}", [
        f"My name is {c.nome} and I am a final-year {cu['area_en']} student at {cu['escola']}. I am applying for internships in {c.area} for {c.disp['inicio_en']} and I would very much like to hear about your experience at {c.empresa}.{lig_en}",
        "Would you have 15 minutes for a short call or video call? I completely understand if that is not possible.",
        "Thank you in advance for your time.",
    ])


def nota_linkedin(c: Contexto) -> str:
    cu = c.curso
    if c.pt:
        nome = c.contacto.split()[0] if c.contacto else ""
        ola = f"Olá {nome}," if nome else "Olá,"
        t = f"{ola} sou estudante finalista de {cu['area_pt']} na {cu['escola']} e estou a candidatar-me a estágios em {c.area}. Gostava de me ligar a si e, se tiver disponibilidade, ouvir a sua experiência na {c.empresa}. Obrigada."
    else:
        nome = c.contacto.split()[0] if c.contacto else ""
        hi = f"Hello {nome}," if nome else "Hello,"
        t = f"{hi} I am a final-year {cu['area_en']} student at {cu['escola']} applying for internships in {c.area}. I would like to connect and, if you have a moment, hear about your experience at {c.empresa}. Thank you."
    return t + f"\n\n({len(t)}/300 caracteres)\n" if len(t) <= 300 else t + f"\n\n(AVISO: {len(t)} caracteres, o limite do LinkedIn é 300)\n"


def pedido_feedback(c: Contexto) -> str:
    if c.pt:
        return _montar(c, f"Agradecimento e pedido de feedback | {c.nome}", [
            f"Obrigada por me terem informado da decisão sobre «{c.role}» e pelo tempo dedicado à minha candidatura. Compreendo a decisão.",
            f"Se tiverem disponibilidade, agradecia um breve feedback sobre a minha candidatura, que me ajudaria a melhorar. Gostaria também de manter o contacto e de ficar atenta a futuras oportunidades na {c.empresa}.",
        ])
    return _montar(c, f"Thank you and request for feedback | {c.nome}", [
        f"Thank you for letting me know the decision on the {c.role} position and for the time given to my application. I understand the decision.",
        f"If you have a moment, I would appreciate brief feedback on my application, which would help me improve. I would also like to keep in touch and stay alert to future opportunities at {c.empresa}.",
    ])
