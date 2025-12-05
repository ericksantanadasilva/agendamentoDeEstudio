// feriadosRJ.js

function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function adicionarDias(data, dias) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function formatarData(data) {
  return data.toISOString().split('T')[0];
}

export function gerarFeriadosRJ(ano) {
  const pascoa = calcularPascoa(ano);

  const feriadosFixos = [
    {
      data: `${ano}-01-01`,
      nome: 'Ano Novo',
      tipo: 'nacional',
    },
    { data: `${ano}-04-21`, nome: 'Tiradentes', tipo: 'nacional' },
    { data: `${ano}-04-23`, nome: 'Dia de São Jorge', tipo: 'estadual - RJ' },
    { data: `${ano}-05-01`, nome: 'Dia do Trabalhador', tipo: 'nacional' },
    { data: `${ano}-09-07`, nome: 'Independência do Brasil', tipo: 'nacional' },
    { data: `${ano}-10-12`, nome: 'Nossa Senhora Aparecida', tipo: 'nacional' },
    { data: `${ano}-11-02`, nome: 'Finados', tipo: 'nacional' },
    {
      data: `${ano}-11-15`,
      nome: 'Proclamação da República',
      tipo: 'nacional',
    },
    { data: `${ano}-11-20`, nome: 'Consciência Negra', tipo: 'estadual - RJ' },
    { data: `${ano}-12-25`, nome: 'Natal', tipo: 'nacional' },
  ];

  const feriadosMoveis = [
    {
      data: formatarData(adicionarDias(pascoa, -47)),
      nome: 'Carnaval',
      tipo: 'móvel',
    },
    {
      data: formatarData(adicionarDias(pascoa, -2)),
      nome: 'Sexta-feira Santa',
      tipo: 'móvel',
    },
    { data: formatarData(pascoa), nome: 'Páscoa', tipo: 'móvel' },
    {
      data: formatarData(adicionarDias(pascoa, 60)),
      nome: 'Corpus Christi',
      tipo: 'móvel',
    },
  ];

  return [...feriadosFixos, ...feriadosMoveis].map((f) => ({
    title: `${f.nome}`,
    start: f.data,
    allDay: true,
    extendedProps: { feriado: true, tipo: f.tipo },
    classNames: ['fc-feriado'],
  }));
}
