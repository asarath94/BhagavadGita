// One-off placeholder icon generator: solid accent-colored square with a
// centered lighter dot, written directly as PNG bytes (stdlib zlib only,
// no image library). Re-run manually if the palette changes.
import { createWriteStream } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";

const BG = [0xa9, 0x53, 0x1f]; // --accent
const DOT = [0xf2, 0xe2, 0xcf]; // --accent-soft

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function makePng(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor (RGB)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const center = size / 2;
  const radius = size * 0.32;
  const raw = Buffer.alloc(size * (1 + size * 3));
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - center;
      const dy = y + 0.5 - center;
      const inDot = dx * dx + dy * dy <= radius * radius;
      const [r, g, b] = inDot ? DOT : BG;
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(process.cwd(), "public", "icons");
await import("node:fs/promises").then((fs) => fs.mkdir(outDir, { recursive: true }));

for (const size of [192, 512]) {
  const png = makePng(size);
  const file = path.join(outDir, `icon-${size}.png`);
  await new Promise((resolve, reject) => {
    const stream = createWriteStream(file);
    stream.on("error", reject);
    stream.on("finish", resolve);
    stream.end(png);
  });
  console.log(`wrote ${file} (${png.length} bytes)`);
}
