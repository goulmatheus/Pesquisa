// =====================================================================
//  CONFIGURAÇÃO DA PESQUISA  —  perguntas, pontos e níveis
//  (Os vídeos A/B e o link da etapa 2 são preenchidos na página /admin)
// =====================================================================

// "pontos"   = quantos pontos vale cada alternativa (na mesma ordem das alternativas).
//              Sem "pontos", a pergunta NÃO entra na pontuação (só fica registrada).
// "opcional" = true permite pular a pergunta.
const perguntas = [
  {
    texto: "Qual a sua idade?",
    alternativas: ["Menos de 18 anos", "18 a 24 anos", "25 a 34 anos", "35 a 44 anos", "45 a 54 anos", "55 anos ou mais"],
  },
  {
    texto: "Com que frequência você assiste a jogos de futebol?",
    alternativas: ["Nunca", "Raramente", "1 a 2 vezes por mês", "Toda semana", "Quase todo dia"],
    pontos: [0, 1, 2, 3, 4],
  },
  {
    texto: "Como você avalia seu conhecimento das regras do futebol?",
    alternativas: ["1 (nenhum)", "2", "3", "4", "5", "6", "7 (muito alto)"],
    pontos: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    texto: "O quanto você se considera torcedor(a)?",
    alternativas: ["1 (nada)", "2", "3", "4", "5", "6", "7 (muito)"],
    // sem pontos: os jogos são de times que a pessoa não torce
  },
  {
    texto: "Você costuma assistir a jogos com narração e comentário?",
    alternativas: ["Sempre", "Às vezes", "Raramente", "Nunca"],
    // sem pontos: só registra
  },
  {
    texto: "Você tem formação ou atuação em arbitragem ou jornalismo esportivo?",
    alternativas: ["Sim", "Não"],
    pontos: [4, 0],
  },
  {
    texto: "Gênero (opcional)",
    alternativas: ["Feminino", "Masculino", "Outro", "Prefiro não informar"],
    opcional: true,
  },
];

// Níveis pela pontuação total. Pontuação máxima atual = 4 + 6 + 4 = 14.
// "min" = menor pontuação que entra no nível (ordem crescente; o primeiro com min: 0).
// Aqui: baixo = 0 a 4 | médio = 5 a 9 | alto = 10 a 14.
// Na página /admin você vê a distribuição das pontuações para ajustar estes cortes.
const niveis = [
  { nome: "baixo", min: 0 },
  { nome: "medio", min: 5 },
  { nome: "alto", min: 10 },
];

module.exports = { perguntas, niveis };
