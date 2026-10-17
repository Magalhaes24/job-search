# Modelo de match e probabilidade

Tudo isto está no Excel (folha "Perfil e pressupostos") e recalcula quando mudas os valores azuis.

## Match com o CV (0 a 100)

Média ponderada de quatro fatores, cada um de 0 a 1:

| Fator | Peso | Como se mede |
|---|---|---|
| Idioma | 30% | 1 − exigência × (1 − proficiência na língua-chave da vaga) |
| Experiência relevante | 30% | O que a vaga pede de experiência prévia face ao teu CV |
| Elegibilidade | 25% | Se aceita recém-licenciadas ou exige estar inscrita |
| Perfil e skills | 15% | Excel, Python, liderança face ao que a vaga pede |

Proficiência assumida: português 1, inglês 0,95, espanhol 0,3, italiano 0,3, francês 0,05, alemão 0,05, neerlandês 0.

## Probabilidade estimada de aceitação

Probabilidade = taxa base da dificuldade × (0,4 + 1,2 × match/100) × redutor se for inelegível, com teto de 50%.

Taxas base (pressuposto meu, não há estatísticas públicas fiáveis): Muito alta 1%, Alta 3%, Média-alta 8%, Média 12%.

Chance: Boa se a probabilidade for 8% ou mais, Média entre 3% e 8%, Baixa abaixo de 3%.

## Veredicto

Score = 0,6 × fit com PE e finanças + 0,4 × facilidade. Prioridade com 3,5 ou mais, Candidatar (reach) entre 3 e 3,4, Reserva abaixo de 3. "Monitorizar" para vagas ainda por abrir e "Prazo passado" para as fechadas.

## Ranking

Ordena por probabilidade × fit/5. As vagas "Monitorizar" e as expiradas ficam fora do ranking e das estatísticas.

## Várias candidaturas

A probabilidade de receber pelo menos uma oferta com N candidaturas é 1 − (Π(1−p))^(1−ρ), com ρ = 0,5 de correlação entre candidaturas (o mesmo CV é lido em todas).

## Limites

- As probabilidades servem para comparar vagas. Não são estatísticas oficiais.
- Dificuldade, fit, facilidade e os fatores do match são julgamento meu.
- Os resultados mudam bastante com as taxas base. A secção 6 da "Análise de match" testa taxas de 0,5 a 2 vezes as assumidas.
