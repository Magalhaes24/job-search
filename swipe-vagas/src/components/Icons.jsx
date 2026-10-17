const P = {
  cards: 'M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 9h6M9 13h4',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  chart: 'M5 20V10M12 20V4M19 20v-7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  star: 'M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7L12 4z',
  undo: 'M9 7L4 12l5 5M4 12h10a5 5 0 0 1 0 10h-2',
  info: 'M12 11v6M12 7.5v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  filter: 'M4 6h16M7 12h10M10 18h4',
  cloud: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5 3.8 3.8 0 0 1 17.5 18H7z',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  chevron: 'M9 6l6 6-6 6',
  pin: 'M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10zM12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  ponto: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  filtro: 'M4 5h16l-6 7v6l-4 2v-8L4 5z',
  volta: 'M4 12a8 8 0 0 1 14-5l2-2v6h-6l2.3-2.3A5.5 5.5 0 1 0 17.5 14',
  envio: 'M4 12l16-8-6 16-3-6-7-2z',
  raio: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
  casa: 'M4 11l8-7 8 7v9h-5v-6H9v6H4v-9z',
  globo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18',
  grafico: 'M4 19l5-6 4 3 7-9',
  relogio: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  chama: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
  alvo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.01V12',
  voz: 'M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zM6 12a6 6 0 0 0 12 0M12 18v3',
  trofeu: 'M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
}

export default function Icon({ nome, tam = 20, cor = 'currentColor', fino = 1.8, preencher = false }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill={preencher ? cor : 'none'} stroke={cor}
      strokeWidth={fino} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[nome] || P.ponto} />
    </svg>
  )
}
