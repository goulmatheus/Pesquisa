// GET /api/perguntas -> perguntas (sem pontos) + se a pesquisa já está aberta (formulários cadastrados)
const { perguntas } = require("./_config");
const { getConfig } = require("./_db");

function motivo(e) {
  if (e.semConfig) return "Faltam as variáveis SUPABASE_URL ou SUPABASE_SERVICE_KEY no Vercel.";
  const d = e.detalhe;
  if (d && typeof d === "object") return [d.code, d.message, d.hint].filter(Boolean).join(" | ");
  if (typeof d === "string" && d) return d.slice(0, 200);
  return [e.message, e.cause && e.cause.message].filter(Boolean).join(" | ");
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const cfg = await getConfig();
    const aberta = Boolean(cfg.form_a && cfg.form_b);
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
    res.status(500).json({ erro: "Não foi possível carregar a pesquisa.", motivo: motivo(e) });
  }
};
