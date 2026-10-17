# Resumo da conversa (17-10-2026)

## Pedidos, por ordem

1. Pesquisa exaustiva de estágios de 6 meses com início em janeiro (PE, M&A, banca de investimento, gestão de ativos, finanças), organizada num Excel com função, empresa, descrição, requisitos, prazo, salário bruto esperado, dificuldade, presencial ou híbrido, país e outras categorias. Três vistas: resumo, decisão vaga a vaga e dados completos.
2. Adicionar a probabilidade de seres aceite, com base no CV e em cada vaga, e uma análise estatística das melhores.
3. Subir para pelo menos 150 vagas, todas com link de candidatura.
4. Humanizar os textos, escrever em português de Portugal (AO90) e explicar cada parte, sobretudo gráficos, resumo e utilização.
5. Mais 50 vagas em Portugal, com empresas de tipos diferentes.
6. Guardar o Excel e os documentos em texto nesta pasta.
7. Criar uma pasta de scripts Python (`gerar-candidaturas`) que gerem cartas de apresentação por vaga e empresa, emails e outros textos de candidatura, em português de Portugal (AO90) ou inglês, formais, educados e humanizados.

## O que foi feito

- Excel com seis folhas: Como usar, Resumo, Decisão, Dados completos, Perfil e pressupostos, Análise de match.
- 224 vagas em 99 empresas, 73 em Portugal, todas com link.
- Coluna "Tipo de link" (direto, anúncio numa plataforma ou página de carreiras) e coluna "Tipo de empresa".
- Modelo de match e probabilidade descrito em [[match-model]].
- Pasta `gerar-candidaturas` com o gerador de textos de candidatura, testado nas 224 vagas nas duas línguas, e pacotes já gerados para as 31 vagas com veredicto Prioridade (em `saidas/`).

## Decisões e correções ao longo do caminho

- Probabilidades iniciais eram demasiado altas. Baixei as taxas base e juntei a correlação entre candidaturas.
- O ranking passou a usar probabilidade × fit/5, para vagas pouco relevantes não passarem à frente das de PE e M&A.
- Vagas por abrir ("Monitorizar") e expiradas saem dos rankings e das estatísticas.
- Retirei do Excel linhas que só tinham um link genérico de agregador e substitui-as por vagas específicas.
- Tirei o prazo de 30-11-2026 que tinha posto a uma vaga da Ardian sem o ter confirmado.

## Fontes principais

Páginas de carreiras das empresas (Workday, tal.net, Greenhouse, Personio, Oracle), offcycle.net, JobTeaser, eFinancialCareers, iagora, Talent Portugal, E2 Emprego e Estágios e Estagiar.pt. As páginas dinâmicas nem sempre abriram, por isso muitas vagas têm descrição e requisitos genéricos.

## Salários

Todos os valores são brutos mensais (antes de impostos e descontos). Só o EIB (1.500 €/mês; a fonte não diz se é bruto ou líquido) e o IEFP (1.181,69 € brutos, nível 6) são oficiais. Os restantes são estimativas de mercado por cidade, também em bruto.
