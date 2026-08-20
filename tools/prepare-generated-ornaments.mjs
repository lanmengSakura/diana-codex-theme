import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, "assets", "diana-brand", "source");
const outputDir = path.join(root, "assets", "diana-brand", "derived");

const assets = {
  star: {
    source: path.join(sourceDir, "diana-hand-star-reference-v2-source.png"),
    output: path.join(outputDir, "diana-hand-star-reference-v2.png"),
  },
  wrappedCandy: {
    source: path.join(sourceDir, "diana-candy-wrapped-v1-source.png"),
    output: path.join(outputDir, "diana-candy-wrapped-v1.png"),
  },
  lollipop: {
    source: path.join(sourceDir, "diana-candy-lollipop-v1-source.png"),
    output: path.join(outputDir, "diana-candy-lollipop-v1.png"),
  },
  leftTopLine: {
    source: path.join(sourceDir, "diana-left-top-heart-candy-v1-source.png"),
    output: path.join(outputDir, "diana-left-top-heart-candy-v1.png"),
    maskOutput: path.join(outputDir, "diana-left-top-heart-candy-mask-v2.png"),
  },
  leftTopBroken: {
    source: path.join(sourceDir, "diana-left-top-broken-heart-candy-v2-source.png"),
    output: path.join(outputDir, "diana-left-top-broken-heart-candy-v2.png"),
    maskOutput: path.join(outputDir, "diana-left-top-broken-heart-candy-mask-v3.png"),
  },
  leftTopCorner: {
    source: path.join(sourceDir, "diana-left-top-broken-corner-v3-source.png"),
    output: path.join(outputDir, "diana-left-top-broken-corner-mask-v4.png"),
  },
  leftTopFineCorner: {
    source: path.join(sourceDir, "diana-left-top-fine-corner-v4-source.png"),
    output: path.join(outputDir, "diana-left-top-fine-corner-v4.png"),
    maskOutput: path.join(outputDir, "diana-left-top-fine-corner-mask-v5.png"),
  },
  leftTopShallowCorner: {
    source: path.join(sourceDir, "diana-left-top-shallow-corner-v5-source.png"),
    output: path.join(outputDir, "diana-left-top-shallow-corner-v5.png"),
    maskOutput: path.join(outputDir, "diana-left-top-shallow-corner-mask-v6.png"),
  },
  leftTopDetailedCorner: {
    source: path.join(sourceDir, "diana-left-top-detailed-corner-v6-source.png"),
    output: path.join(outputDir, "diana-left-top-detailed-corner-v6.png"),
    maskOutput: path.join(outputDir, "diana-left-top-detailed-corner-mask-v7.png"),
  },
  acaoHeart: {
    source: path.join(sourceDir, "acao-heart-v3-source.png"),
    output: path.join(outputDir, "acao-heart-v3.png"),
  },
  acaoCheer: {
    source: path.join(sourceDir, "acao-cheer-v1-source.png"),
    output: path.join(outputDir, "acao-cheer-v1.png"),
  },
};

async function squareAndSave(input, output, size = 256) {
  const trimmed = await sharp(input)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
    .png()
    .toBuffer();

  await sharp(trimmed)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}

async function wideAndSave(input, output, width = 1600) {
  await sharp(input)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
    .resize({ width, withoutEnlargement: false })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}

async function shallowCornerAndSave(input, output, cropHeight = 540) {
  const metadata = await sharp(input).metadata();
  const height = Math.min(cropHeight, metadata.height ?? cropHeight);
  const width = metadata.width ?? 1536;
  const cropped = await sharp(input)
    .extract({ left: 0, top: 0, width, height })
    .png()
    .toBuffer();
  const trimmed = await sharp(cropped)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
    .png()
    .toBuffer();

  await sharp(trimmed)
    .resize(1600, 485, { fit: "fill" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}

async function makeThinAlphaMask(input, output, width = null) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4, 255);
  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const sourceIndex = pixel * 4;
    const red = data[sourceIndex];
    const green = data[sourceIndex + 1];
    const blue = data[sourceIndex + 2];
    const sourceAlpha = data[sourceIndex + 3];
    const brightness = (red + green + blue) / 3;
    const isWarmInnerStroke = sourceAlpha >= 48
      && red >= 225
      && green >= 180
      && blue <= 215
      && red - blue >= 35
      && green - blue >= 12
      && brightness <= 238;
    rgba[sourceIndex + 3] = isWarmInnerStroke ? 255 : 0;
  }

  let pipeline = sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });

  if (width) {
    pipeline = pipeline
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
      .resize({ width, withoutEnlargement: false });
  }

  await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(output);
}

async function makeBrightLineMask(input, output, width = 1600) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4, 255);

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const sourceIndex = pixel * 4;
    const red = data[sourceIndex];
    const green = data[sourceIndex + 1];
    const blue = data[sourceIndex + 2];
    const sourceAlpha = data[sourceIndex + 3];
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const isBrightCoreStroke = sourceAlpha >= 48 && luminance >= 180;
    rgba[sourceIndex + 3] = isBrightCoreStroke ? 255 : 0;
  }

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .resize({ width, withoutEnlargement: false })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}

async function makeAlphaThresholdMask(input, output, threshold = 224) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4, 255);

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const sourceIndex = pixel * 4;
    rgba[sourceIndex + 3] = data[sourceIndex + 3] >= threshold ? 255 : 0;
  }

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}

async function removeFaintGlow(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha <= 72) {
      data[index + 3] = 0;
      continue;
    }
    data[index + 3] = Math.min(255, Math.round(((alpha - 72) / 183) * 255));
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

async function removeRenderedCheckerboard(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const chroma = maximum - minimum;
    const brightness = (red + green + blue) / 3;

    if ((brightness >= 205 && chroma <= 20) || (brightness >= 188 && chroma <= 10)) {
      data[index + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

await fs.mkdir(outputDir, { recursive: true });
await squareAndSave(assets.star.source, assets.star.output);
await squareAndSave(await removeFaintGlow(assets.wrappedCandy.source), assets.wrappedCandy.output);
await squareAndSave(await removeRenderedCheckerboard(assets.lollipop.source), assets.lollipop.output);
await wideAndSave(assets.leftTopLine.source, assets.leftTopLine.output);
await makeThinAlphaMask(assets.leftTopLine.output, assets.leftTopLine.maskOutput);
await wideAndSave(
  await removeRenderedCheckerboard(assets.leftTopBroken.source),
  assets.leftTopBroken.output,
);
await makeThinAlphaMask(assets.leftTopBroken.output, assets.leftTopBroken.maskOutput);
await makeBrightLineMask(assets.leftTopCorner.source, assets.leftTopCorner.output);
await wideAndSave(
  await removeRenderedCheckerboard(assets.leftTopFineCorner.source),
  assets.leftTopFineCorner.output,
);
await makeAlphaThresholdMask(assets.leftTopFineCorner.output, assets.leftTopFineCorner.maskOutput);
await wideAndSave(
  await removeRenderedCheckerboard(assets.leftTopShallowCorner.source),
  assets.leftTopShallowCorner.output,
);
await makeAlphaThresholdMask(
  assets.leftTopShallowCorner.output,
  assets.leftTopShallowCorner.maskOutput,
);
await shallowCornerAndSave(
  await removeRenderedCheckerboard(assets.leftTopDetailedCorner.source),
  assets.leftTopDetailedCorner.output,
);
await makeAlphaThresholdMask(
  assets.leftTopDetailedCorner.output,
  assets.leftTopDetailedCorner.maskOutput,
);
await squareAndSave(
  await removeRenderedCheckerboard(assets.acaoHeart.source),
  assets.acaoHeart.output,
  512,
);
await squareAndSave(
  await removeRenderedCheckerboard(assets.acaoCheer.source),
  assets.acaoCheer.output,
  512,
);

for (const asset of Object.values(assets)) {
  const metadata = await sharp(asset.output).metadata();
  process.stdout.write(`${path.relative(root, asset.output)} ${metadata.width}x${metadata.height} alpha=${metadata.hasAlpha}\n`);
  if (asset.maskOutput) {
    const maskMetadata = await sharp(asset.maskOutput).metadata();
    process.stdout.write(`${path.relative(root, asset.maskOutput)} ${maskMetadata.width}x${maskMetadata.height} alpha=${maskMetadata.hasAlpha}\n`);
  }
}
