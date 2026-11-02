import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const now = new Date();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const yyyy = now.getFullYear();
const datePart = `${mm}${dd}${yyyy}`;
const dateStr = `${yyyy}-${mm}-${dd}`;

const commitsToday = parseInt(
  execSync(`git log --since="${dateStr} 00:00" --oneline | wc -l`).toString().trim(),
  10
);

const buildNum = String(commitsToday).padStart(2, '0');
const version = `v1.${datePart}.${buildNum}-phase1`;

const out = {
  version,
  date: `${mm}/${dd}/${yyyy}`,
  builds: commitsToday
};

const outPath = join(__dirname, '..', 'public', 'version.json');
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
console.log(`Updated version to ${version}`);
