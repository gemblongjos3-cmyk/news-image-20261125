// make.fun · news-image-20261125
// Validates entry.png as a well-formed baseline/progressive JPEG: walks the
// marker segments between SOI and SOS, reads the frame size from SOF0/SOF2,
// requires 1024x1024, and then copies the bytes unchanged into the output
// directory.
//
// Node standard library only — run it directly: node main.ts

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const EXPECTED_DIMENSION = 1024;

interface FrameInfo {
  width: number;
  height: number;
}

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const source = join(import.meta.dirname, "entry.png");

let bytes: Buffer;
try {
  bytes = readFileSync(source);
} catch (err) {
  fail(`could not read ${source}: ${(err as Error).message}`);
}

// ---- SOI / EOI bookends -----------------------------------------------------

if (bytes.length < 4) {
  fail(`entry.png is too small to be a JPEG (${bytes.length} bytes)`);
}
if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
  fail("entry.png does not start with a JPEG SOI marker (ff d8)");
}
if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
  fail("entry.png does not end with a JPEG EOI marker (ff d9)");
}

// ---- marker segment walk (SOI .. SOS) --------------------------------------

let offset = 2;
let frame: FrameInfo | null = null;
let reachedSOS = false;

while (offset < bytes.length) {
  if (bytes[offset] !== 0xff) {
    fail(`expected a marker at byte ${offset}, found 0x${bytes[offset].toString(16)}`);
  }

  // Runs of 0xff are fill bytes; the marker code is the first non-0xff byte.
  while (offset < bytes.length && bytes[offset] === 0xff) offset++;
  if (offset >= bytes.length) {
    fail("file ended inside a marker prefix");
  }
  const marker = bytes[offset];
  offset++;

  if (marker === 0x00) {
    fail(`stuffed byte 0xff 0x00 outside entropy-coded data at byte ${offset - 2}`);
  }
  if (marker === 0xd8) {
    fail("unexpected second SOI marker in the segment walk");
  }
  if (marker === 0xd9) {
    fail("reached EOI before SOS: no image scan in this JPEG");
  }
  if (marker === 0xda) {
    reachedSOS = true;
    break;
  }
  // Standalone markers: TEM (0x01) and RST0..RST7 (0xd0..0xd7).
  if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
    continue;
  }

  // Every other marker carries a 2-byte big-endian length that includes itself.
  if (offset + 2 > bytes.length) {
    fail(`truncated segment header after marker 0x${marker.toString(16)}`);
  }
  const segmentLength = bytes.readUInt16BE(offset);
  if (segmentLength < 2) {
    fail(`segment 0x${marker.toString(16)} declares an invalid length (${segmentLength})`);
  }
  const segmentEnd = offset + segmentLength;
  if (segmentEnd > bytes.length) {
    fail(
      `segment 0x${marker.toString(16)} runs past end of file ` +
        `(needs byte ${segmentEnd}, file is ${bytes.length})`,
    );
  }

  // SOF0 (baseline) or SOF2 (progressive) frame header.
  if ((marker === 0xc0 || marker === 0xc2) && frame === null) {
    if (segmentLength < 8) {
      fail(`frame header 0x${marker.toString(16)} is too short (${segmentLength} bytes)`);
    }
    // Layout after the marker: length(2) precision(1) height(2) width(2).
    const body = offset + 2;
    frame = {
      height: bytes.readUInt16BE(body + 1),
      width: bytes.readUInt16BE(body + 3),
    };
  }

  offset = segmentEnd;
}

if (!reachedSOS) {
  fail("segment walk never reached a start-of-scan marker (ff da)");
}
if (frame === null) {
  fail("no SOF0 (ff c0) or SOF2 (ff c2) frame header found before SOS");
}
if (frame.width !== EXPECTED_DIMENSION || frame.height !== EXPECTED_DIMENSION) {
  fail(`expected a ${EXPECTED_DIMENSION}x${EXPECTED_DIMENSION} frame, got ${frame.width}x${frame.height}`);
}

// ---- write and report -------------------------------------------------------

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outputDir, "entry.png");

try {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(target, bytes);
} catch (err) {
  fail(`could not write ${target}: ${(err as Error).message}`);
}

const digest = createHash("sha256").update(bytes).digest("hex");

console.log(
  `entry.png: ${frame.width}x${frame.height} jpeg, ${bytes.length} bytes, sha256 ${digest}`,
);
