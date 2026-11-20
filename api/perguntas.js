// GET /api/perguntas -> perguntas (sem pontos) + se a pesquisa já está aberta (vídeos cadastrados)
const { perguntas } = require("./_config");
const { getConfig } = require("./_db");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const cfg = await getConfig();
    const aberta = Boolean(cfg.video_a && cfg.video_b);
    res.status(200).json({
      aberta,
      perguntas: perguntas.map((p) => ({
        texto: p.texto,
        alternativas: p.alternativas,
        opcional: p.opcional === true,
      })),
    });
  } catch (e) {
    console.error(e.detalhe || e);
    res.status(500).json({ erro: "Não foi possível carregar a pesquisa." });
  }
};
