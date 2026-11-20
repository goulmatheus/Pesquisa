// POST /api/enviar  { respostas: [0,2,null,...] }
// Soma os pontos, define o nível, sorteia o grupo (A/B equilibrado dentro do nível),
// grava no Supabase e devolve o vídeo do grupo.
const { perguntas, niveis } = require("./_config");
const { sb, getConfig } = require("./_db");

function nivelPorPontos(pontos) {
  let escolhido = niveis[0].nome;
  for (const n of niveis) if (pontos >= n.min) escolhido = n.nome;
  return escolhido;
}

function toEmbed(url) {
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    else id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido" });

  const respostas = req.body && req.body.respostas;
  const valido =
    Array.isArray(respostas) &&
    respostas.length === perguntas.length &&
    respostas.every((r, i) => {
      if (r === null) return perguntas[i].opcional === true;
      return Number.isInteger(r) && r >= 0 && r < perguntas[i].alternativas.length;
    });
  if (!valido) return res.status(400).json({ erro: "Respostas inválidas ou incompletas." });

  const pontuacao = respostas.reduce((s, r, i) => {
    const pts = perguntas[i].pontos;
    return s + (pts && r !== null ? pts[r] : 0);
  }, 0);
  const nivel = nivelPorPontos(pontuacao);

  try {
    const cfg = await getConfig();
    if (!cfg.video_a || !cfg.video_b) {
      return res.status(503).json({ erro: "A pesquisa ainda não foi aberta." });
    }

    const dados = await sb("rpc/atribuir_grupo", {
      method: "POST",
      body: { p_pontuacao: pontuacao, p_nivel: nivel, p_respostas: respostas },
    });
    const linha = Array.isArray(dados) ? dados[0] : dados;
    const grupo = linha.out_grupo;
    const codigo = String(linha.out_id).slice(0, 8).toUpperCase();

    return res.status(200).json({
      codigo,
      grupo,
      video: toEmbed(grupo === "A" ? cfg.video_a : cfg.video_b),
      linkEtapa2: cfg.link_etapa2 || "",
    });
  } catch (e) {
    console.error(e.detalhe || e);
    return res.status(500).json({ erro: "Falha ao salvar. Tente novamente." });
  }
};
