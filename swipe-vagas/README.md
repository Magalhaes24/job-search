# Vagas, uma a uma

Site para a Chancha decidir as 224 vagas do Excel ao estilo Tinder (swipe), ler a análise toda e acompanhar as candidaturas. Feito em React (Vite), com Firebase Firestore para guardar tudo.

## Arrancar

1. Instala o Node.js (versão 18 ou superior) em nodejs.org.
2. Faz duplo clique em `iniciar.bat`, ou na pasta corre:

```
npm install
npm run dev
```

O site abre em http://localhost:5173.

## Firebase (uma vez)

O projeto Firebase é o `job-search-ce7e0`. Para as decisões ficarem guardadas na cloud:

1. No Firebase Console, Authentication, Sign-in method: ativa **Email/palavra-passe**. O site cria sozinho os utilizadores fixos que ainda não existirem.
2. Firestore Database: cria a base de dados, se ainda não existir.
3. Em Regras, cola o conteúdo de `firestore.rules` e publica. Só esse utilizador consegue ler e escrever.

Enquanto isto não estiver feito, o site funciona na mesma: guarda no browser e envia para o Firestore quando conseguir (o indicador "Offline" ou "Sincronizado" aparece no menu). Se ativares as regras de teste do Firestore em vez das regras acima, também funciona, mas ficam abertas a qualquer pessoa durante o período de teste.

Nota sobre segurança: a chave do Firebase e a palavra-passe do utilizador fixo estão no código do site, por isso servem de portão simples e não de segredo. Para dados realmente privados, publica o site só para ti (Firebase Hosting com acesso restrito) ou acrescenta um PIN.

## O site aprende o gosto dela

`src/lib/aprender.js` treina, no browser, uma regressão logística regularizada com as decisões guardadas (gostos, passos, prioridades e candidaturas). Cada vaga é descrita pela área, tipo de empresa, país, cidade, empresa, língua, dificuldade, salário bruto, interesse e palavras do título.

- Sem dados, a ordem do baralho é a do Excel. À medida que há decisões, a nota aprendida ganha peso (confiança = n / (n + 20), só com gostos e passos suficientes).
- Prioridade e candidaturas enviadas pesam mais. As decisões antigas pesam menos (meia-vida de 30 dias, contada a partir da última decisão).
- Exploração: o modelo estima a incerteza de cada previsão e, de cinco em cinco cartas, mostra a vaga mais diferente do que ela já viu, para aprender também o que ela não quer. A fila evita repetir a mesma empresa.
- Onde aparece: ordem do baralho (filtro «Aprendida com as tuas decisões», o padrão), «Afinidade» no cartão e no detalhe, a sugestão de por onde começar em «Gostei» e a secção «O que aprendi sobre o teu gosto» em Progresso, com os padrões e a validação cruzada.
- Tudo é recalculado a partir das decisões, por isso não há nada para sincronizar nem para repor.

`npm run testar` simula utilizadoras com gostos conhecidos e verifica que o modelo aprende (corre também no CI).

## Palavras-passe

Não estão no código. Em local, cria `.env.local` nesta pasta (está no `.gitignore`) com `VITE_SENHA_CHANCHA=...` e `VITE_SENHA_TESTE=...`. Na versão publicada o site mostra um ecrã de entrada e guarda a palavra-passe no dispositivo. Como é um site estático, quem tiver a palavra-passe entra nos dados desse perfil; as regras do Firestore garantem que cada conta só vê os seus.

## Dois utilizadores: teste e Chancha

Os dados de cada um ficam separados em `users/teste/...` e `users/chancha/...`, com contas próprias (`teste@job-search.app` e `chancha@job-search.app`). O utilizador de teste é criado sozinho na primeira abertura.

- `npm run dev` (ou `iniciar.bat`) abre por omissão o perfil de teste, com uma faixa laranja no topo e a etiqueta «teste» no menu. Em Progresso há o botão «Apagar dados de teste».
- A versão publicada (`npm run build` e Firebase Hosting) abre o perfil da Chancha.
- Para forçar um perfil, acrescenta ao endereço `?perfil=teste` ou `?perfil=chancha`.

As regras de `firestore.rules` tratam os dois separadamente: cada um só acede aos seus dados. As vagas são partilhadas, e só a Chancha as pode alterar. Tens de voltar a publicar as regras no Firebase (separador Regras) depois desta alteração.

## Como se usa

- **Descobrir**: baralho. Swipe para a direita (ou seta →) é gosto, para a esquerda (←) é passo, para cima (↑) é prioridade. Z desfaz. Toca no cartão (ou espaço) para ver os detalhes todos. O botão de filtros escolhe país, área, veredicto e ordem.
- **Gostei**: as vagas de que gostaste, ordenadas por recomendação, com sugestão de por onde começar. Cada uma abre com o detalhe completo e o acompanhamento da candidatura (enviada, entrevista, oferta, recusada, seguimento e notas). No fim do baralho este ecrã aparece automaticamente.
- **Histórico**: todas as decisões por dia. Podes passar um gosto a passo, um passo a gosto, ou devolver a vaga ao baralho.
- **Análise**: as análises do Excel (veredictos, países, tipos de empresa, melhores vagas, match contra probabilidade, quantas candidaturas fazer, efeito da língua, modelo e pressupostos), cada uma com explicação.
- **Vagas**: lista completa com pesquisa e filtros, para decidir fora do baralho.
- **Progresso**: pontos, nível, sequência de dias, meta diária, mapa de atividade, conquistas, estado da sincronização e exportação dos dados.

## Onde fica cada coisa no Firestore

```
users/chancha/decisoes/{idVaga}       gosto, passo, prioridade, data
users/chancha/candidaturas/{idVaga}   estado, datas, seguimento, notas
users/chancha/eventos/{...}           registo de ações (histórico e sequência de dias)
users/chancha/conquistas/{id}         conquistas desbloqueadas
vagas/{idVaga}                        as 224 vagas (semeadas na primeira abertura)
```

As vagas estão também no código (`src/data/vagas.json`), por isso o site abre mesmo sem rede. Se editares uma vaga no Firestore, essa versão passa à frente da do código.

## Atualizar as vagas

Depois de mudares o Excel `Estagios_Janeiro2027.xlsx` (na pasta acima):

```
npm run vagas
```

Isto reescreve `src/data/vagas.json`. Para atualizar também o Firestore, abre Progresso e carrega em "Guardar vagas no Firestore".

## Publicar (opcional)

```
npm install -g firebase-tools
firebase login
firebase init hosting   (pasta pública: dist; single-page app: sim)
npm run deploy
```

## Ligação ao gerador de candidaturas

Em cada vaga, "Comando dos textos" copia `python gerar.py gerar --id N`. Corre-o na pasta `gerar-candidaturas` para criar a carta, os emails e a ficha de entrevista dessa vaga.

## Ficheiros

- `src/store.jsx`: estado, Firestore, conquistas e mensagens.
- `src/firebase.js`: configuração e utilizador fixo.
- `src/lib/gamify.js`: conquistas, pontos, nível e frases de incentivo.
- `src/lib/model.js`: probabilidade de pelo menos uma oferta, recomendações e pesos do modelo.
- `src/views/`: os seis ecrãs. `src/components/`: cartão, baralho, detalhe, gráficos, filtros.
- `scripts/export_vagas.py`: Excel para JSON.
