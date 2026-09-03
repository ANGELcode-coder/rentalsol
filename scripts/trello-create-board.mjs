/**
 * SMOOTH — Trello board creator
 *
 * Reads card titles from docs/TRELLO.md and creates them on a new board.
 *
 *  1. Get a Trello API key:      https://trello.com/power-ups/admin
 *     (Create a "Power-Up" -> "API Key")
 *  2. Generate a token from that page (the "Token" link).
 *  3. export TRELLO_KEY=...  and  export TRELLO_TOKEN=...
 *  4. node scripts/trello-create-board.mjs ["Board Name"] "your@email,partner@email"
 *
 * The email arg is optional and auto-invites members.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const BASE = 'https://api.trello.com/1';

if (!TRELLO_KEY || !TRELLO_TOKEN) {
  console.error('Missing credentials. Set TRELLO_KEY and TRELLO_TOKEN env vars first.');
  process.exit(1);
}

const boardName = process.argv[2] || 'SMOOTH — Phase 1 MVP';
const emails = (process.argv[3] || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// --- Parse docs/TRELLO.md into { listName: [cardTitle, ...] } ---
const trelloMd = readFileSync(join(__dirname, '..', 'docs', 'TRELLO.md'), 'utf8');
const lists = [];
let currentList = null;

for (const line of trelloMd.split('\n')) {
  const listHeader = line.match(/^## LIST \d+ — (.+)$/);
  if (listHeader) {
    currentList = { name: listHeader[1].trim(), cards: [] };
    lists.push(currentList);
    continue;
  }
  const card = line.match(/^- \[(DB|BE|FE|MO|QA)-\d+\] (.+)$/);
  if (card && currentList) {
    currentList.cards.push(card[2].trim());
  }
}

console.log(`Parsed ${lists.length} lists, ${lists.reduce((s, l) => s + l.cards.length, 0)} cards.`);

async function api(path, params = {}, method = 'GET') {
  const qs = new URLSearchParams({
    key: TRELLO_KEY,
    token: TRELLO_TOKEN,
    ...params
  });
  const url = `${BASE}/${path}?${qs.toString()}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}: ${body}`);
  }
  return res.json();
}

async function main() {
  console.log('Creating board:', boardName);
  const board = await api('boards', { name: boardName, defaultLists: false }, 'POST');
  const boardId = board.id;
  const shortLink = board.shortUrl.split('/b/')[1];
  console.log('Board created:', board.shortUrl);

  for (const list of lists) {
    const created = await api('lists', { name: list.name, idBoard: boardId }, 'POST');
    for (const title of list.cards) {
      await api('cards', { idList: created.id, name: title }, 'POST');
    }
    console.log(`  ${created.name}: ${list.cards.length} cards`);
  }

  for (const email of emails) {
    try {
      await api('boards/' + boardId + '/members', { email }, 'PUT');
      console.log('  invited:', email);
    } catch (e) {
      console.warn('  invite failed for', email, '->', e.message);
    }
  }

  console.log('\nDone! Board URL: https://trello.com/b/' + shortLink);
  console.log('Now your teammate can accept the invite and pick up cards.');
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
