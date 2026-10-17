# Gerar candidaturas

Scripts em Python que preparam, para cada vaga do Excel `Estagios_Janeiro2027.xlsx`, a carta de apresentação, os emails, a nota de LinkedIn e a ficha de entrevista. Não precisam de internet nem de nenhuma conta. Lêem as vagas e o teu perfil e escrevem ficheiros de texto.

Os textos saem em português de Portugal (AO90) quando a língua-chave da vaga é o português, e em inglês nos outros casos. O tom é formal, educado e direto. Cada texto passa por um verificador de estilo antes de ser guardado.

## Instalação

```
pip install -r requirements.txt
```

Precisas de Python 3.9 ou superior. A única dependência é o `openpyxl`.

## Começar em três passos

1. Abre `dados/perfil.json` e confirma os teus dados. Acrescenta a média, as cadeiras de finanças e matemática, os projetos e o nome da organização onde foste Head of Logistics. Campos vazios são ignorados.
2. Para as vagas que te interessam, escreve em `dados/empresas_extra.json` uma ou duas frases verdadeiras sobre o que te atrai na empresa. É o que mais separa uma carta genérica de uma boa carta.
3. Gera os pacotes:

```
python gerar.py gerar --prioridades
```

Cada vaga fica numa pasta própria dentro de `saidas/`.

## Comandos

| Comando | O que faz |
|---|---|
| `python gerar.py listar --top 20` | Mostra as 20 melhores vagas ativas, pelo ranking do Excel. |
| `python gerar.py gerar --id 12 35` | Gera os pacotes das vagas com esses números (coluna ID do Excel). |
| `python gerar.py gerar --empresa "Alantra"` | Gera os pacotes de todas as vagas dessa empresa. |
| `python gerar.py gerar --prioridades` | Gera para todas as vagas com veredicto Prioridade. |
| `python gerar.py gerar --top 10 --pais Portugal` | Combina filtros. Também existem `--area` e `--incluir-inativas`. |
| `python gerar.py verificar-texto carta.txt --lingua pt` | Verifica um texto teu. Com `--corrigir`, emenda travessões e grafias antigas. |
| `python gerar.py registo --id 12 --estado enviada --data 2026-10-20` | Regista o envio e calcula a data do seguimento. |
| `python gerar.py registo --em-atraso` | Mostra as candidaturas cujo seguimento já devia ter sido enviado. |
| `python gerar.py registo` | Lista o registo completo (`registo/candidaturas.csv`). |

Opções úteis do comando `gerar`:

- `--motivo "..."`: o que te atrai na empresa (substitui a frase genérica).
- `--contacto "Nome"`: muda a saudação para esse nome.
- `--lingua pt|en`: força a língua dos textos.
- `--data-envio`, `--data-entrevista`, `--tema`, `--novidade`, `--ligacao`: preenchem o seguimento, a confirmação, o agradecimento e o pedido de conversa.
- `--registar`: marca as vagas como "por enviar" no registo.

## O que sai para cada vaga

| Ficheiro | Para que serve |
|---|---|
| `00_verificacoes.md` | O que confirmar antes de enviar: estado da vaga, línguas, elegibilidade, país, lacunas do perfil. |
| `01_carta.txt` | Carta de apresentação adaptada à vaga, à empresa e à área. |
| `02_email_candidatura.txt` | Email curto para acompanhar o CV e a carta. Nas candidaturas espontâneas sai a versão espontânea. |
| `03_email_seguimento.txt` | Seguimento a enviar uns dias depois, se não houver resposta. |
| `04_email_agradecimento_entrevista.txt` | Agradecimento a enviar depois da entrevista. |
| `05_email_confirmar_entrevista.txt` | Resposta a um convite para entrevista. |
| `06_email_pedido_conversa.txt` | Pedido de 15 minutos a alguém da empresa. |
| `07_linkedin_nota_ligacao.txt` | Nota de ligação no LinkedIn, com o limite de 300 caracteres verificado. |
| `08_email_pedido_feedback.txt` | Agradecimento e pedido de feedback depois de uma recusa. |
| `09_preparacao_entrevista.md` | Apresentação de 60 segundos em português e inglês, respostas-base, perguntas técnicas da área com pistas e perguntas a fazer. |

## Como estão organizados os ficheiros

- `gerar.py`: o comando principal.
- `candidatura/vagas.py`: lê o Excel (folha "Dados completos") e filtra.
- `candidatura/areas.py`: classifica cada vaga numa família (private equity, banca de investimento, gestão de ativos, banca, consultoria, e assim por diante) e guarda os textos de cada área.
- `candidatura/cartas.py` e `candidatura/emails.py`: montam os textos. Há três variantes de abertura e de fecho, escolhidas de forma fixa por vaga, para as cartas não ficarem todas iguais.
- `candidatura/entrevista.py`: ficha de preparação.
- `candidatura/humanizador.py`: verificador e corretor de estilo.
- `candidatura/verificacoes.py`: avisos por vaga.
- `candidatura/registo.py`: registo das candidaturas.
- `testes/test_geral.py`: gera tudo para as 224 vagas, nas duas línguas, e falha se o verificador apontar alguma coisa. Corre com `python testes/test_geral.py`.

## Regras de estilo que o verificador aplica

- Sem travessões. São substituídos por vírgulas.
- Sem a fórmula "não X mas Y" nem variantes.
- Sem enumerações de três elementos feitas por efeito.
- Sem palavras típicas de texto gerado (por exemplo "apaixonada", "crucial", "dinâmico", "passionate", "leverage").
- Sem pontos de exclamação.
- Grafia do Acordo Ortográfico de 1990 e vocabulário de Portugal (sem "você", "equipe", "estou fazendo").
- Sem marcadores por preencher.
- Sem três frases seguidas a começar pela mesma palavra.

O verificador é um filtro automático. Lê sempre o texto final antes de enviar.

## Limites a ter presentes

- Os textos só usam factos que estão em `dados/perfil.json`. Se acrescentares algo falso, aparece nas cartas.
- Sem `empresas_extra.json`, a carta usa uma frase genérica sobre o tipo de empresa. O ficheiro `00_verificacoes.md` avisa quando isso acontece.
- Para vagas que pedem francês ou alemão, a carta não esconde nem inventa nada. O aviso fica nas verificações.
- Se atualizares o Excel, os pacotes já gerados não mudam. Volta a correr o comando.
- A cidade em inglês usa uma tabela pequena (Londres, Milão, Zurique, Amesterdão, Estocolmo, Luxemburgo e outras). Se faltar uma, o nome fica em português.
