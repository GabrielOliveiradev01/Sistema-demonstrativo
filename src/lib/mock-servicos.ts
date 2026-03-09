// Dados mock — Módulo Serviços

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
}

export interface Servico {
  id: string;
  nome: string;
  categoriaId: string;
  categoriaNome: string;
  duracao: number;
  precoBase: number;
  profissionaisVinculados: number;
  status: "ativo" | "inativo";
  receita30Dias: number;
}

export interface ServicoCompleto extends Servico {
  descricao: string;
  corCalendario: string;
  imagemUrl?: string;
  bufferAntes: number;
  bufferDepois: number;
  exigirSinal: boolean;
  percentualSinal: number;
  permitirDesconto: boolean;
  disponivelOnline: boolean;
  antecedenciaMinima: number;
  antecedenciaMaxima: number;
  profissionais: ProfissionalVinculado[];
  precoDinamicoPorDia: { dia: string; valor: number }[];
  precoPorFaixaHorario: { faixa: string; valor: number }[];
  limiteDiarioAtendimentos: number | null;
  apenasRecorrentes: boolean;
  scoreMinimo: number | null;
  recorrente: boolean;
  intervaloDias: number | null;
  gerarProximosAutomatico: boolean;
  limiteRepeticoes: number | null;
}

export interface ProfissionalVinculado {
  id: string;
  nome: string;
  ativo: boolean;
  precoPersonalizado: number | null;
  duracaoPersonalizada: number | null;
  comissaoPersonalizada: number | null;
}

// Categorias
export const CATEGORIAS: Categoria[] = [
  { id: "c1", nome: "Unhas", cor: "#ec4899", ordem: 1 },
  { id: "c2", nome: "Cílios", cor: "#a855f7", ordem: 2 },
  { id: "c3", nome: "Sobrancelha", cor: "#f59e0b", ordem: 3 },
  { id: "c4", nome: "Estética", cor: "#22c55e", ordem: 4 },
  { id: "c5", nome: "Terapia", cor: "#3b82f6", ordem: 5 },
];

// Lista de serviços
export const LISTA_SERVICOS: Servico[] = [
  { id: "s1", nome: "Manicure", categoriaId: "c1", categoriaNome: "Unhas", duracao: 45, precoBase: 65, profissionaisVinculados: 3, status: "ativo", receita30Dias: 4560 },
  { id: "s2", nome: "Coloração", categoriaId: "c4", categoriaNome: "Estética", duracao: 120, precoBase: 280, profissionaisVinculados: 2, status: "ativo", receita30Dias: 31200 },
  { id: "s3", nome: "Corte", categoriaId: "c4", categoriaNome: "Estética", duracao: 45, precoBase: 80, profissionaisVinculados: 3, status: "ativo", receita30Dias: 24800 },
  { id: "s4", nome: "Alongamento de cílios", categoriaId: "c2", categoriaNome: "Cílios", duracao: 90, precoBase: 150, profissionaisVinculados: 1, status: "ativo", receita30Dias: 4200 },
  { id: "s5", nome: "Design de sobrancelha", categoriaId: "c3", categoriaNome: "Sobrancelha", duracao: 30, precoBase: 45, profissionaisVinculados: 2, status: "ativo", receita30Dias: 1890 },
  { id: "s6", nome: "Massagem relaxante", categoriaId: "c5", categoriaNome: "Terapia", duracao: 60, precoBase: 120, profissionaisVinculados: 1, status: "inativo", receita30Dias: 0 },
];

// Serviço completo (para edição)
export function getServicoCompleto(id: string): ServicoCompleto | null {
  const s = LISTA_SERVICOS.find((x) => x.id === id);
  if (!s) return null;
  return {
    ...s,
    descricao: "Serviço de qualidade com produtos premium.",
    corCalendario: "#22c55e",
    bufferAntes: 0,
    bufferDepois: 15,
    exigirSinal: false,
    percentualSinal: 30,
    permitirDesconto: true,
    disponivelOnline: true,
    antecedenciaMinima: 60,
    antecedenciaMaxima: 90,
    profissionais: [
      { id: "p1", nome: "Ana Silva", ativo: true, precoPersonalizado: null, duracaoPersonalizada: null, comissaoPersonalizada: 40 },
      { id: "p2", nome: "Carlos Lima", ativo: true, precoPersonalizado: 70, duracaoPersonalizada: 50, comissaoPersonalizada: 35 },
    ],
    precoDinamicoPorDia: [],
    precoPorFaixaHorario: [{ faixa: "Sábado 10h-14h", valor: 95 }],
    limiteDiarioAtendimentos: null,
    apenasRecorrentes: false,
    scoreMinimo: null,
    recorrente: false,
    intervaloDias: null,
    gerarProximosAutomatico: false,
    limiteRepeticoes: null,
  };
}

// Métricas por serviço (exemplo)
export const METRICAS_SERVICO = {
  atendimentos30Dias: 42,
  receita30Dias: 4560,
  ticketMedio: 108,
  ocupacaoMedia: 72,
};

// Serviço vazio para criação
export function getServicoVazio(): ServicoCompleto {
  const first = LISTA_SERVICOS[0];
  return {
    id: "",
    nome: "",
    categoriaId: CATEGORIAS[0]?.id ?? "",
    categoriaNome: CATEGORIAS[0]?.nome ?? "",
    duracao: 60,
    precoBase: 0,
    profissionaisVinculados: 0,
    status: "ativo",
    receita30Dias: 0,
    descricao: "",
    corCalendario: "#22c55e",
    bufferAntes: 0,
    bufferDepois: 15,
    exigirSinal: false,
    percentualSinal: 30,
    permitirDesconto: true,
    disponivelOnline: true,
    antecedenciaMinima: 60,
    antecedenciaMaxima: 90,
    profissionais: [],
    precoDinamicoPorDia: [],
    precoPorFaixaHorario: [],
    limiteDiarioAtendimentos: null,
    apenasRecorrentes: false,
    scoreMinimo: null,
    recorrente: false,
    intervaloDias: null,
    gerarProximosAutomatico: false,
    limiteRepeticoes: null,
  };
}

// Pacote exemplo
export interface Pacote {
  id: string;
  nome: string;
  servicos: { id: string; nome: string }[];
  precoFechado: number;
  duracaoTotal: number;
}

export const PACOTES_EXEMPLO: Pacote[] = [
  { id: "pk1", nome: "Combo Cílios + Sobrancelha", servicos: [{ id: "s4", nome: "Alongamento de cílios" }, { id: "s5", nome: "Design de sobrancelha" }], precoFechado: 180, duracaoTotal: 120 },
];
