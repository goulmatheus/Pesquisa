// /api/admin  (protegido pela senha ADMIN_SENHA enviada no cabeçalho x-admin-senha)
//  GET  -> configuração atual, resumo, distribuição de pontuações e lista de participantes
//  POST -> { acao:"salvar", form_a, form_b }  ou  { acao:"limpar", confirmacao:"APAGAR" }
const crypto = require("crypto");
const { perguntas, niveis } = require("./_config");
const { sb, getConfig } = require("./_db");

function autorizado(req) {
  const senha = process.env.ADMIN_SENHA || "";
  const dado = String(req.headers["x-admin-senha"] || "");
  const a = Buffer.from(dado);
  const b = Buffer.from(senha);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function linkOk(v) {
  return v === "" || /^https?:\/\/\S+$/i.test(v);
}

async function todosParticipantes() {
  const todos = [];
  for (let off = 0; off < 100000; off += 1000) {
    const lote = await sb(
      `participantes?select=id,criado_em,pontuacao,nivel,grupo,respostas&order=criado_em.asc&limit=1000&offset=${off}`
    );
    todos.push(...lote);
    if (lote.length < 1000) break;
  }
  return todos;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.ADMIN_SENHA) {
    return res.status(500).json({ erro: "Defina a variável ADMIN_SENHA no Vercel e faça Redeploy." });
  }
  if (!autorizado(req)) return res.status(401).json({ erro: "Senha incorreta." });

  try {
    if (req.method === "GET") {
      const config = await getConfig();
      const lista = await todosParticipantes();

      const resumo = {};
      for (const n of niveis) resumo[n.nome] = { A: 0, B: 0 };
      const distribuicao = {};
      for (const p of lista) {
        if (!resumo[p.nivel]) resumo[p.nivel] = { A: 0, B: 0 };
        resumo[p.nivel][p.grupo] += 1;
        distribuicao[p.pontuacao] = (distribuicao[p.pontuacao] || 0) + 1;
      }

      const participantes = lista.map((p) => ({
        codigo: String(p.id).slice(0, 8).toUpperCase(),
        criado_em: p.criado_em,
        nivel: p.nivel,
        pontuacao: p.pontuacao,
        grupo: p.grupo,
        respostas: (p.respostas || []).map((r, i) =>
          r === null || r === undefined
            ? ""
            : perguntas[i] && perguntas[i].alternativas[r] !== undefined
            ? perguntas[i].alternativas[r]
            : String(r)
        ),
      }));

      return res.status(200).json({
        config,
        perguntas: perguntas.map((p) => p.texto),
        niveis,
        total: lista.length,
        resumo,
        distribuicao,
        participantes,
      });
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (b.acao === "salvar") {
        const campos = {};
        for (const k of ["form_a", "form_b"]) {
          const v = String(b[k] || "").trim();
          if (v.length > 500 || !linkOk(v)) {
            return res.status(400).json({ erro: `Link inválido em ${k}. Use um endereço começando com https://` });
          }
          campos[k] = v;
        }
        await sb("configuracao?id=eq.1", { method: "PATCH", body: campos, prefer: "return=minimal" });
        return res.status(200).json({ ok: true });
      }
      if (b.acao === "limpar") {
        if (b.confirmacao !== "APAGAR") return res.status(400).json({ erro: "Confirmação inválida." });
        await sb("participantes?criado_em=gte.1900-01-01", { method: "DELETE", prefer: "return=minimal" });
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ erro: "Ação desconhecida." });
    }

    return res.status(405).json({ erro: "Método não permitido" });
  } catch (e) {
    console.error(e.detalhe || e);
    return res.status(500).json({ erro: "Erro no servidor ou no banco de dados." });
  }
};
