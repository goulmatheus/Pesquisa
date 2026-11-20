// Ajudantes para falar com o Supabase (API REST). Arquivos com "_" não viram rotas no Vercel.

function cabecalhos(extra) {
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  const h = { "Content-Type": "application/json", apikey: KEY, ...(extra || {}) };
  if (KEY && KEY.startsWith("eyJ")) h.Authorization = `Bearer ${KEY}`; // chave antiga (JWT)
  return h;
}

async function sb(caminho, { method = "GET", body, prefer } = {}) {
  const base = process.env.SUPABASE_URL;
  if (!base || !process.env.SUPABASE_SERVICE_KEY) {
    const e = new Error("sem-config");
    e.semConfig = true;
    throw e;
  }
  const r = await fetch(`${base}/rest/v1/${caminho}`, {
    method,
    headers: cabecalhos(prefer ? { Prefer: prefer } : {}),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const txt = await r.text();
  let dados = null;
  try { dados = txt ? JSON.parse(txt) : null; } catch { dados = txt; }
  if (!r.ok) {
    const e = new Error("supabase");
    e.detalhe = dados;
    throw e;
  }
  return dados;
}

async function getConfig() {
  const linhas = await sb("configuracao?id=eq.1&select=form_a,form_b");
  return (linhas && linhas[0]) || { form_a: "", form_b: "" };
}

module.exports = { sb, getConfig };
