#!/usr/bin/env node
/* =============================================================================
   Merge live WordPress content edits back into the local codebase.

     make pull-content         → merge and write
     make check-content-drift  → report drift and exit 1, write nothing

   THE PROBLEM THIS SOLVES. Logged-in users edit text, images and links directly
   on the live site. Those edits live in the WordPress database and SHADOW the
   defaults in src/lib/content.js — so a local default can be months out of date
   without anything looking wrong, right up until someone resets content or
   greps the repo for copy that no longer matches production.

   The merge lands in src/lib/content-overrides.json, which sits between the WP
   database and the code defaults in the resolution order (see
   src/lib/wp/wpEdit.svelte.js). It is a tracked file, so `git diff` shows
   exactly what the client changed before you commit it — and the static
   GitHub Pages build picks the same edits up.

   There is deliberately no push direction: the live site cannot write commits
   into this repo, and pretending otherwise would be worse than a gate.
   ============================================================================= */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OVERRIDES_FILE = path.join(ROOT, 'src/lib/content-overrides.json');
const SYNC_DIR = path.join(ROOT, '.content-sync');
const CHECK_ONLY = process.argv.includes('--check');

/** @param {string} file */
function readJson(file, fallback) {
	const full = path.join(SYNC_DIR, file);
	if (!fs.existsSync(full)) {
		console.error(`❌ ${path.relative(ROOT, full)} is missing. Run this through the Makefile:`);
		console.error(`   make ${CHECK_ONLY ? 'check-content-drift' : 'pull-content'}`);
		process.exit(2);
	}
	const raw = fs.readFileSync(full, 'utf8').trim();
	if (!raw) return fallback;
	try {
		return JSON.parse(raw);
	} catch {
		console.error(`❌ ${file} is not valid JSON. WP-CLI probably printed an error instead:`);
		console.error(raw.slice(0, 400));
		process.exit(2);
	}
}

/* ------------------------------------------------------- flatten live state */

// `wp option list --search='xo_global_*' --format=json`
const options = readJson('options.json', []);
// `wp option get xo_route_overrides --format=json` — an empty PHP array comes
// back as [], a populated one as an object keyed by route.
const routeOverrides = readJson('route-overrides.json', {});

/** @type {Record<string, string>} */
const live = {};

for (const row of Array.isArray(options) ? options : []) {
	if (!row?.option_name) continue;
	live[row.option_name.replace(/^xo_/, '')] = String(row.option_value ?? '');
}

for (const overrides of Object.values(routeOverrides ?? {})) {
	if (!overrides || typeof overrides !== 'object') continue;
	for (const [key, value] of Object.entries(overrides)) {
		live[key] = String(value ?? '');
	}
}

/* --------------------------------------------------------------- compare */

const local = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'));
const drift = Object.entries(live).filter(([key, value]) => String(local[key] ?? '') !== value);

const preview = (value) => {
	const s = JSON.stringify(value ?? null);
	return s.length > 90 ? `${s.slice(0, 87)}…` : s;
};

if (CHECK_ONLY) {
	if (drift.length) {
		console.error(`❌ DRIFT: the live site has ${drift.length} content value(s) this repo does not.`);
		for (const [key, value] of drift.slice(0, 20)) {
			console.error(`   ${key}\n      local: ${preview(local[key])}\n      live:  ${preview(value)}`);
		}
		if (drift.length > 20) console.error(`   …and ${drift.length - 20} more.`);
		console.error('');
		console.error('Run `make pull-content`, review the diff, and commit it BEFORE editing local content.');
		process.exit(1);
	}
	console.log(`✅ Local content matches the live site (${Object.keys(live).length} keys checked).`);
	process.exit(0);
}

if (!drift.length) {
	console.log(`✅ Nothing to merge — already in sync (${Object.keys(live).length} keys checked).`);
	process.exit(0);
}

for (const [key, value] of drift) local[key] = value;

// Sorted keys keep the diff readable when several syncs land over time.
const sorted = Object.fromEntries(Object.entries(local).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OVERRIDES_FILE, `${JSON.stringify(sorted, null, '\t')}\n`);

console.log(`✅ Merged ${drift.length} live edit(s) into src/lib/content-overrides.json:`);
for (const [key] of drift.slice(0, 20)) console.log(`   ${key}`);
if (drift.length > 20) console.log(`   …and ${drift.length - 20} more.`);
