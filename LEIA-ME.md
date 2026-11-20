# Pesquisa com atribuição automática de vídeo (A/B por nível de conhecimento)

Um único link: etapa 1 (perguntas) → o sistema calcula o nível → sorteia Vídeo A ou B
equilibrando dentro de cada nível → etapa 2 (vídeo + link do formulário final).

## Passo a passo

### 1) Supabase (banco de dados)
1. Crie um projeto em supabase.com (grátis).
2. Menu **SQL Editor** → New query → cole todo o conteúdo de `supabase.sql` → **Run**.
3. Anote duas coisas em **Project Settings → API** (ou "API Keys"):
   - **Project URL** (ex.: https://xxxx.supabase.co)
   - **service_role key** (ou "secret key"). É SECRETA: nunca coloque no código nem no GitHub.

### 2) Perguntas e níveis
Em `api/_config.js` ficam as perguntas, os pontos de cada alternativa e os cortes dos níveis (já preenchidos).

### 3) Publicar no Vercel
1. Suba esta pasta para um repositório no GitHub (ou use `vercel` pelo terminal).
2. No Vercel: **Add New → Project** → escolha o repositório → **Deploy**.
3. Em **Settings → Environment Variables**, crie:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_KEY` = service_role / secret key
   - `ADMIN_SENHA` = uma senha forte à sua escolha (para a página /admin)
4. **Deployments → Redeploy** (para ler as variáveis).
5. O link do projeto (ex.: https://pesquisa-xxx.vercel.app) é o link único da pesquisa.

### 4) Página de administração: /admin
Acesse `https://SEU-SITE.vercel.app/admin`, entre com a `ADMIN_SENHA` e:
- cole os links dos Vídeos A e B e o link da etapa 2 e clique em **Salvar** (a pesquisa só abre para
  participantes quando os dois vídeos estiverem cadastrados; você pode fazer isso depois);
- veja o resumo por nível/grupo, a distribuição das pontuações e a lista de participantes;
- baixe o CSV (abre no Excel) e apague os dados de teste.

### 5) Testar antes de divulgar
Responda uma vez, veja se aparece o vídeo e o código. No Supabase: **Table Editor → participantes**
deve ter uma linha. Depois **apague as linhas de teste** (e limpe o armazenamento do navegador
ou use aba anônima para testar de novo).

## Acompanhar o equilíbrio (SQL Editor)
```sql
select nivel, grupo, count(*) from participantes group by nivel, grupo order by nivel, grupo;
```

## Exportar para análise
Table Editor → participantes → Export → CSV. O "código" mostrado ao participante são os
8 primeiros caracteres do `id` (em maiúsculas), para cruzar com o formulário da etapa 2.

## Observações
- O gabarito fica só no servidor (`api/_config.js`), não aparece no navegador.
- Se a pessoa recarregar a página no mesmo aparelho, vê o mesmo vídeo (não sorteia de novo).
- Para mudar quem entra em cada nível, edite `niveis` em `api/_config.js`.
