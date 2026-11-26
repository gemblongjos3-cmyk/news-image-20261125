// make.fun · news-image-20261125
// Copies entry.png into the output directory, unchanged, after checking that
// the file looks like a JPEG (starts with SOI, ends with EOI).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SOURCE = join(import.meta.dirname, "entry.png");

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

let bytes: Buffer;
try {
  bytes = readFileSync(SOURCE);
} catch (err) {
  fail(`could not read ${SOURCE}: ${(err as Error).message}`);
}

if (bytes.length < 4) {
  fail(`entry.png is too small to be a JPEG (${bytes.length} bytes)`);
}

const startsWithSOI = bytes[0] === 0xff && bytes[1] === 0xd8;
const endsWithEOI =
  bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;

if (!startsWithSOI) {
  fail("entry.png does not start with a JPEG SOI marker (ff d8)");
}
if (!endsWithEOI) {
  fail("entry.png does not end with a JPEG EOI marker (ff d9)");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outputDir, "entry.png");

try {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(target, bytes);
} catch (err) {
  fail(`could not write ${target}: ${(err as Error).message}`);
}

console.log(`wrote ${target} (${bytes.length} bytes)`);
