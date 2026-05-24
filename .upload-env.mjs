import fs from 'fs';

const auth = JSON.parse(fs.readFileSync(`${process.env.APPDATA}/xdg.data/com.vercel.cli/auth.json`, 'utf8'));
const proj = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
const TOKEN = auth.token;
const PROJECT_ID = proj.projectId;
const TEAM_ID = proj.orgId;

const KEY = 'NEXT_PUBLIC_APP_URL';
const NEW_VALUE = 'https://iorganiza.com.br';

async function existing() {
  const r = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return (await r.json()).envs || [];
}

async function del(id) {
  await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${id}?teamId=${TEAM_ID}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` },
  });
}

async function create(key, value, targets) {
  const r = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, target: targets, type: 'encrypted' }),
  });
  return r.ok ? { ok: true } : { ok: false, err: await r.text() };
}

const envs = await existing();
for (const e of envs.filter((e) => e.key === KEY)) {
  await del(e.id);
}
const r = await create(KEY, NEW_VALUE, ['production', 'preview', 'development']);
console.log(`[${KEY}] ${r.ok ? 'OK' : 'FAIL: ' + r.err}`);
