import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/home/ubuntu/workspace/.platform/attachments/";
const OUT = "/home/ubuntu/workspace/app/src/frontend/public/assets/products/";
mkdirSync(OUT, { recursive: true });

const COLLAGES = {
  collage1: "whatsapp_image_2026-10-04_at_7.12.26_pm-01a107db-1921-736e-9a90-1915cce6f062.jpeg",
  collage2: "whatsapp_image_2026-10-04_at_7.12.26_pm_1-01a107db-164b-71b9-b8b1-d7386088d9a2.jpeg",
  collage3: "whatsapp_image_2026-10-04_at_7.12.26_pm_2-01a107db-1131-7543-94fe-eeb75eb7eb68.jpeg",
};

// Each crop: [x0, y0, x1, y1] as fractions of the source image.
// Boxes are tuned to the polaroid photo content, trimming the white frame
// and the handwritten caption strip so each output is a clean product photo.
const CROPS = {
  collage1: [
    { file: "collage1-garba-vibes.jpg", box: [0.06, 0.185, 0.335, 0.335] },
    { file: "collage1-braided-accessories.jpg", box: [0.37, 0.185, 0.645, 0.335] },
    { file: "collage1-pretty-in-pink.jpg", box: [0.68, 0.185, 0.955, 0.335] },
    { file: "collage1-hair-flower.jpg", box: [0.06, 0.425, 0.335, 0.575] },
    { file: "collage1-garba-outfit-idea.jpg", box: [0.37, 0.425, 0.645, 0.575] },
    { file: "collage1-elegant-details.jpg", box: [0.68, 0.425, 0.955, 0.575] },
    { file: "collage1-hair-bows.jpg", box: [0.06, 0.665, 0.335, 0.815] },
    { file: "collage1-traditional-look.jpg", box: [0.37, 0.665, 0.645, 0.815] },
    { file: "collage1-cute-hair-clips.jpg", box: [0.68, 0.665, 0.955, 0.815] },
  ],
  collage2: [
    { file: "collage2-garba-dance.jpg", box: [0.06, 0.185, 0.335, 0.335] },
    { file: "collage2-braided-accessories.jpg", box: [0.37, 0.185, 0.645, 0.335] },
    { file: "collage2-pearl-details.jpg", box: [0.68, 0.185, 0.955, 0.335] },
    { file: "collage2-hair-flower.jpg", box: [0.06, 0.425, 0.335, 0.575] },
    { file: "collage2-braided-tassels.jpg", box: [0.37, 0.425, 0.645, 0.575] },
    { file: "collage2-elegant-traditional.jpg", box: [0.68, 0.425, 0.955, 0.575] },
    { file: "collage2-cute-hair-bows.jpg", box: [0.06, 0.665, 0.335, 0.815] },
    { file: "collage2-handmade-hair-accessories.jpg", box: [0.37, 0.665, 0.645, 0.815] },
    { file: "collage2-ready-for-navratri.jpg", box: [0.68, 0.665, 0.955, 0.815] },
  ],
  collage3: [
    { file: "collage3-garba-dance.jpg", box: [0.05, 0.155, 0.33, 0.35] },
    { file: "collage3-fishtail-braid.jpg", box: [0.05, 0.415, 0.33, 0.61] },
    { file: "collage3-messy-braid.jpg", box: [0.05, 0.675, 0.33, 0.87] },
    { file: "collage3-braid-their.jpg", box: [0.36, 0.155, 0.64, 0.71] },
    { file: "collage3-crown-braid.jpg", box: [0.68, 0.155, 0.95, 0.35] },
    { file: "collage3-messy-extensions.jpg", box: [0.68, 0.415, 0.95, 0.61] },
    { file: "collage3-garba-hook.jpg", box: [0.68, 0.675, 0.95, 0.87] },
  ],
};

const report = [];
for (const [collage, crops] of Object.entries(CROPS)) {
  const src = SRC + COLLAGES[collage];
  const { width: W, height: H } = await sharp(src).metadata();
  for (const { file, box } of crops) {
    const left = Math.round(box[0] * W);
    const top = Math.round(box[1] * H);
    const width = Math.round((box[2] - box[0]) * W);
    const height = Math.round((box[3] - box[1]) * H);
    const info = await sharp(src)
      .extract({ left, top, width, height })
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(OUT + file);
    report.push({ file, width: info.width, height: info.height });
  }
}

console.log(JSON.stringify(report, null, 2));
