# job-search

Pesquisa de estágios de 6 meses a começar em janeiro de 2027 (private equity, finanças), com quatro partes:

| Pasta | O que tem |
|---|---|
| `Estagios_Janeiro2027.xlsx` | 224 vagas, com análise de match, probabilidades e salários brutos estimados |
| `knowledge-base/` | Resumos, prioridades, prazos e um ficheiro por empresa |
| `gerar-candidaturas/` | Gerador em Python de cartas, emails e preparação de entrevistas (PT-PT AO90 ou inglês) |
| `swipe-vagas/` | Site React com Firebase para decidir vaga a vaga (gosto, passo, prioridade) |

## Site

O site é publicado no GitHub Pages por `.github/workflows/deploy.yml` a cada push para `main` que mexa em `swipe-vagas/`. O endereço aparece no resumo da execução e em Settings, Pages.

As palavras-passe não estão no repositório. Na versão publicada o site pede a palavra-passe uma vez e guarda-a no dispositivo. Para trabalhar em local, cria `swipe-vagas/.env.local` com:

```
VITE_SENHA_CHANCHA=...
VITE_SENHA_TESTE=...
```

Detalhes (perfis de teste e da Chancha, regras do Firestore) em [`swipe-vagas/README.md`](swipe-vagas/README.md).

## Workflows

- `ci.yml`: em branches e pull requests, compila o site e corre os testes do gerador.
- `deploy.yml`: compila o site e publica-o no GitHub Pages.

## Dados pessoais

O repositório é público, por isso `gerar-candidaturas/dados/perfil.json`, as candidaturas geradas (`saidas/`) e o registo ficam fora do Git. Há um `perfil.exemplo.json` para começar.
