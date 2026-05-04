import { app } from "../../scripts/app.js";

const EXT_NAME = "lerico.resolution.forge.v2.ui";
const NODE_CLASS = "LericoResolutionForgeV2";
const PANEL_WIDGET = "__lerico_rf_v2_panel";
const FAVORITES_KEY = "lerico-resolution-forge-v2-favorites";
const MIN_WIDTH = 392;
const MIN_HEIGHT = 500;
const LOAD_IMAGE_CLASS_NAMES = new Set(["LoadImage", "LoadImageMask", "LoadImageOutput"]);
const SHOW_SDXL_CONTROLS = false;
const MAX_DIMENSION = 16384;
const MAX_RATIO_COMPONENT = 4096;
const MAX_TOTAL_PIXELS = MAX_DIMENSION * MAX_DIMENSION;
const MAX_MEGAPIXELS = MAX_TOTAL_PIXELS / 1_000_000;
const DEFAULT_RESOLUTION_FORMAT = "{w}*{h}";
const MAX_RESOLUTION_FORMAT_LENGTH = 160;
const MAX_RESOLUTION_OUTPUT_LENGTH = 240;
const RESOLUTION_FORMAT_TOKENS = new Set(["w", "h", "ar", "ar_decimal", "n_px", "mp", "orientation"]);

const SVGS = {
  portrait: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><rect width="12" height="20" x="6" y="2" rx="2"/></svg>`,
  square: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
  landscape: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><rect width="20" height="12" x="2" y="6" rx="2"/></svg>`,
  image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  aspect: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M12 9v11"/><path d="M2 9h13a2 2 0 0 1 2 2v9"/></svg>`,
  exact: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>`,
  auto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
  format: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22h4a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M5 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1"/><path d="M9 22a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1"/></svg>`,
  title: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v4"/><path d="m14.305 7.53.923-.382"/><path d="m15.228 4.852-.923-.383"/><path d="m16.852 3.228-.383-.924"/><path d="m16.852 8.772-.383.923"/><path d="m19.148 3.228.383-.924"/><path d="m19.53 9.696-.382-.924"/><path d="m20.772 4.852.924-.383"/><path d="m20.772 7.148.924.383"/><path d="M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M8 21h8"/><circle cx="18" cy="6" r="3"/></svg>`,
};

const COMMON_RESOLUTIONS = {
  "1:1": [
    { w: 360, h: 360, label: "" },
    { w: 480, h: 480, label: "" },
    { w: 512, h: 512, label: "" },
    { w: 768, h: 768, label: "" },
    { w: 1024, h: 1024, label: "" },
    { w: 1536, h: 1536, label: "" },
    { w: 2048, h: 2048, label: "" },
  ],
  "4:3": [
    { w: 480, h: 360, label: "360p" },
    { w: 640, h: 480, label: "VGA" },
    { w: 640, h: 480, label: "480p" },
    { w: 800, h: 600, label: "SVGA" },
    { w: 1024, h: 768, label: "XGA" },
    { w: 1280, h: 960, label: "SXGA-" },
    { w: 1600, h: 1200, label: "UXGA" },
  ],
  "3:2": [
    { w: 540, h: 360, label: "360p" },
    { w: 720, h: 480, label: "480p" },
    { w: 768, h: 512, label: "" },
    { w: 1152, h: 768, label: "" },
    { w: 1536, h: 1024, label: "" },
    { w: 1920, h: 1280, label: "" },
  ],
  "5:4": [
    { w: 450, h: 360, label: "360p" },
    { w: 600, h: 480, label: "480p" },
    { w: 640, h: 512, label: "" },
    { w: 800, h: 640, label: "" },
    { w: 1280, h: 1024, label: "" },
    { w: 1600, h: 1280, label: "" },
  ],
  "2:1": [
    { w: 720, h: 360, label: "360p" },
    { w: 960, h: 480, label: "480p" },
    { w: 1024, h: 512, label: "" },
    { w: 1536, h: 768, label: "" },
    { w: 2048, h: 1024, label: "" },
    { w: 2560, h: 1280, label: "" },
  ],
  "16:9": [
    { w: 640, h: 360, label: "360p" },
    { w: 854, h: 480, label: "480p" },
    { w: 1280, h: 720, label: "720p" },
    { w: 1600, h: 900, label: "" },
    { w: 1920, h: 1080, label: "1080p" },
    { w: 2560, h: 1440, label: "1440p" },
    { w: 3840, h: 2160, label: "4K" },
  ],
  "21:9": [
    { w: 840, h: 360, label: "360p" },
    { w: 1120, h: 480, label: "480p" },
    { w: 2560, h: 1080, label: "" },
    { w: 3440, h: 1440, label: "" },
  ],
  "1.85:1": [
    { w: 666, h: 360, label: "360p" },
    { w: 888, h: 480, label: "480p" },
    { w: 1664, h: 900, label: "" },
    { w: 1920, h: 1038, label: "" },
    { w: 2048, h: 1108, label: "" },
  ],
  "2.39:1": [
    { w: 860, h: 360, label: "360p" },
    { w: 1148, h: 480, label: "480p" },
    { w: 2048, h: 858, label: "" },
    { w: 4096, h: 1716, label: "" },
  ],
};

const SDXL_ASPECT_LABELS = [
  "9:7 (7:9)",
  "19:13 (13:19)",
  "7:4 (4:7)",
  "12:5 (5:12)",
];
const SDXL_ASPECT_SET = new Set(SDXL_ASPECT_LABELS);
const SDXL_COMMON_RESOLUTIONS = {
  "9:7": [
    { w: 1152, h: 896, label: "SDXL" },
  ],
  "19:13": [
    { w: 1216, h: 832, label: "SDXL" },
  ],
  "7:4": [
    { w: 1344, h: 768, label: "SDXL" },
  ],
  "12:5": [
    { w: 1536, h: 640, label: "SDXL" },
  ],
};
const ITERATION_COMMON_RESOLUTIONS = {
  "1:1": [
    { w: 576, h: 576, label: "" },
    { w: 704, h: 704, label: "" },
    { w: 896, h: 896, label: "" },
  ],
  "2:1": [
    { w: 704, h: 352, label: "" },
    { w: 832, h: 416, label: "" },
    { w: 992, h: 496, label: "" },
    { w: 1232, h: 608, label: "" },
    { w: 1408, h: 704, label: "" },
  ],
  "5:4": [
    { w: 560, h: 448, label: "" },
    { w: 656, h: 528, label: "" },
    { w: 784, h: 640, label: "" },
    { w: 976, h: 768, label: "" },
    { w: 1120, h: 896, label: "" },
  ],
  "4:3": [
    { w: 576, h: 432, label: "" },
    { w: 688, h: 512, label: "" },
    { w: 816, h: 608, label: "" },
    { w: 992, h: 752, label: "" },
    { w: 1152, h: 864, label: "" },
  ],
  "3:2": [
    { w: 608, h: 416, label: "" },
    { w: 864, h: 576, label: "" },
    { w: 1056, h: 704, label: "" },
    { w: 1232, h: 816, label: "" },
  ],
  "16:9": [
    { w: 672, h: 368, label: "" },
    { w: 784, h: 448, label: "" },
    { w: 944, h: 528, label: "" },
    { w: 1152, h: 656, label: "" },
    { w: 1328, h: 752, label: "" },
  ],
  "21:9": [
    { w: 768, h: 320, label: "" },
    { w: 896, h: 384, label: "" },
    { w: 1088, h: 464, label: "" },
    { w: 1328, h: 560, label: "" },
    { w: 1520, h: 656, label: "" },
  ],
  "1.85:1": [
    { w: 688, h: 368, label: "" },
    { w: 800, h: 432, label: "" },
    { w: 960, h: 512, label: "" },
    { w: 1184, h: 640, label: "" },
    { w: 1360, h: 736, label: "" },
  ],
  "2.39:1": [
    { w: 768, h: 320, label: "" },
    { w: 912, h: 384, label: "" },
    { w: 1088, h: 464, label: "" },
    { w: 1344, h: 560, label: "" },
    { w: 1552, h: 640, label: "" },
  ],
};
const HIGH_DETAIL_COMMON_RESOLUTIONS = {
  "1:1": [
    { w: 1216, h: 1216, label: "" },
    { w: 1408, h: 1408, label: "" },
    { w: 1728, h: 1728, label: "" },
    { w: 2000, h: 2000, label: "" },
  ],
  "2:1": [
    { w: 1728, h: 864, label: "" },
    { w: 2000, h: 992, label: "" },
    { w: 2448, h: 1232, label: "" },
    { w: 2832, h: 1408, label: "" },
  ],
  "5:4": [
    { w: 1376, h: 1088, label: "" },
    { w: 1584, h: 1264, label: "" },
    { w: 1936, h: 1552, label: "" },
    { w: 2240, h: 1792, label: "" },
  ],
  "4:3": [
    { w: 1408, h: 1056, label: "" },
    { w: 1632, h: 1232, label: "" },
    { w: 2000, h: 1504, label: "" },
    { w: 2304, h: 1728, label: "" },
  ],
  "3:2": [
    { w: 1504, h: 992, label: "" },
    { w: 1728, h: 1152, label: "" },
    { w: 2128, h: 1408, label: "" },
    { w: 2448, h: 1632, label: "" },
  ],
  "16:9": [
    { w: 1632, h: 912, label: "" },
    { w: 1888, h: 1056, label: "" },
    { w: 2304, h: 1296, label: "" },
    { w: 2672, h: 1504, label: "" },
  ],
  "21:9": [
    { w: 1872, h: 800, label: "" },
    { w: 2160, h: 928, label: "" },
    { w: 2640, h: 1136, label: "" },
    { w: 3056, h: 1312, label: "" },
  ],
  "1.85:1": [
    { w: 1664, h: 896, label: "" },
    { w: 1920, h: 1040, label: "" },
    { w: 2352, h: 1280, label: "" },
    { w: 2720, h: 1472, label: "" },
  ],
  "2.39:1": [
    { w: 1888, h: 800, label: "" },
    { w: 2192, h: 912, label: "" },
    { w: 2672, h: 1120, label: "" },
    { w: 3088, h: 1296, label: "" },
  ],
};
const EXTENDED_COMMON_RESOLUTIONS = {
  "1:1": [
    { w: 2240, h: 2240, label: "" },
    { w: 2448, h: 2448, label: "" },
    { w: 2832, h: 2832, label: "" },
  ],
  "2:1": [
    { w: 3168, h: 1584, label: "" },
    { w: 3472, h: 1728, label: "" },
    { w: 4000, h: 2000, label: "" },
  ],
  "5:4": [
    { w: 2496, h: 2000, label: "" },
    { w: 2736, h: 2192, label: "" },
    { w: 3168, h: 2528, label: "" },
  ],
  "4:3": [
    { w: 2576, h: 1936, label: "" },
    { w: 2832, h: 2128, label: "" },
    { w: 3264, h: 2448, label: "" },
  ],
  "3:2": [
    { w: 2736, h: 1824, label: "" },
    { w: 3008, h: 2000, label: "" },
    { w: 3472, h: 2304, label: "" },
  ],
  "16:9": [
    { w: 2976, h: 1680, label: "" },
    { w: 3264, h: 1840, label: "" },
    { w: 3776, h: 2128, label: "" },
  ],
  "21:9": [
    { w: 3408, h: 1456, label: "" },
    { w: 3744, h: 1600, label: "" },
    { w: 4320, h: 1856, label: "" },
  ],
  "1.85:1": [
    { w: 3040, h: 1648, label: "" },
    { w: 3328, h: 1808, label: "" },
    { w: 3840, h: 2080, label: "" },
  ],
  "2.39:1": [
    { w: 3456, h: 1440, label: "" },
    { w: 3792, h: 1584, label: "" },
    { w: 4368, h: 1824, label: "" },
  ],
};
const SDXL_FALLBACK_BY_LABEL = {
  "9:7 (7:9)": "4:3 (3:4)",
  "19:13 (13:19)": "3:2 (2:3)",
  "7:4 (4:7)": "16:9 (9:16)",
  "12:5 (5:12)": "21:9 (9:21)",
};
const COMMON_FAMILY_DEFS = [
  { key: "common", label: "Common", map: COMMON_RESOLUTIONS },
  { key: "iteration", label: "Iteration", map: ITERATION_COMMON_RESOLUTIONS },
  { key: "high_detail", label: "High Detail", map: HIGH_DETAIL_COMMON_RESOLUTIONS },
  { key: "extended", label: "Extended", map: EXTENDED_COMMON_RESOLUTIONS },
  { key: "sdxl", label: "SDXL", map: SDXL_COMMON_RESOLUTIONS },
];
const MODE_META = {
  Aspect: { icon: SVGS.aspect, label: "Manual", hint: "Exact sizing, ratio sizing, and common presets" },
  Image: { icon: SVGS.image, label: "Image", hint: "Input-dependent sizing" },
};
const ASPECT_SOURCE_META = {
  "Exact Dimensions": { icon: SVGS.exact, label: "Exact Dimensions", hint: "Set width and height directly" },
  "Aspect Ratio": { icon: SVGS.aspect, label: "Preset Ratio", hint: "Use curated ratio cards" },
  "Width+Height": { icon: SVGS.exact, label: "Custom Ratio", hint: "Enter ratio width and height" },
  Image: { icon: SVGS.image, label: "Image Ratio", hint: "Read ratio from the optional image input" },
};
const SIZE_MODE_META = {
  "Target Megapixels": { label: "MP Target", hint: "Match a total megapixel budget" },
  "Target Pixels": { label: "Pixel Target", hint: "Match a total pixel count" },
  "Target Width": { label: "Lock Width", hint: "Solve height from a fixed width" },
  "Target Height": { label: "Lock Height", hint: "Solve width from a fixed height" },
  "Common (Pick)": { label: "Pick Common", hint: "Choose from common resolutions" },
  "Common (Closest)": { label: "Closest Common", hint: "Find the nearest common preset" },
};
const IMAGE_MODE_META = {
  "Use Image Size": { label: "Use Input", hint: "Keep the source image size" },
  "Scale Factor": { label: "Scale", hint: "Multiply the source dimensions" },
  "Target Megapixels": { label: "Target MP", hint: "Retarget to a megapixel budget" },
  "Target Pixels": { label: "Target Pixels", hint: "Retarget to a pixel budget" },
  "Fit Long Side": { label: "Fit Long", hint: "Match the longer side" },
  "Fit Short Side": { label: "Fit Short", hint: "Match the shorter side" },
};
const ORIENTATION_META = {
  auto: { icon: SVGS.auto, label: "Auto" },
  landscape: { icon: SVGS.landscape, label: "Landscape" },
  portrait: { icon: SVGS.portrait, label: "Portrait" },
  square: { icon: SVGS.square, label: "Square" },
};
const FLOAT_WIDGETS = new Set([
  "target_megapixels",
  "common_target_value",
  "scale_factor",
]);
const INPUT_IMAGE_DIMENSION_CACHE = new Map();
const LOG_MAX_TOTAL_PIXELS = Math.log(MAX_TOTAL_PIXELS);

function mapBiasedDimensionFromSlider(value, min, mid, max) {
  const t = clamp(Number(value), 0, 1000);
  if (t <= 800) {
    return min + ((mid - min) * (t / 800));
  }
  return mid + ((max - mid) * ((t - 800) / 200));
}

function mapBiasedDimensionToSlider(value, min, mid, max) {
  const safe = clamp(Number(value), min, max);
  if (safe <= mid) {
    return ((safe - min) / Math.max(mid - min, 1)) * 800;
  }
  return 800 + (((safe - mid) / Math.max(max - mid, 1)) * 200);
}

function createBiasedDimensionSliderConfig(label) {
  return {
    label,
    min: 1,
    max: MAX_DIMENSION,
    step: 1,
    sliderMin: 0,
    sliderMax: 1000,
    sliderStep: 1,
    fromSlider: (value) => mapBiasedDimensionFromSlider(value, 1, 4096, MAX_DIMENSION),
    toSlider: (value) => mapBiasedDimensionToSlider(value, 1, 4096, MAX_DIMENSION),
    format: (value) => Math.round(value).toLocaleString(),
  };
}

const SLIDER_WIDGETS = {
  target_megapixels: {
    label: "Target Megapixels",
    min: 0.01,
    //max: MAX_MEGAPIXELS,
    max: 16.78,
    step: 0.01,
    sliderMin: 0.01,
    //sliderMax: MAX_MEGAPIXELS,
    sliderMax: 16.78,
    sliderStep: 0.01,
    fromSlider: (value) => value,
    toSlider: (value) => value,
    format: (value) => Number(value).toFixed(2),
  },
  aspect_width: {
    label: "Ratio Width",
    min: 1,
    max: MAX_RATIO_COMPONENT,
    step: 1,
    sliderMin: 1,
    sliderMax: MAX_RATIO_COMPONENT,
    sliderStep: 1,
    fromSlider: (value) => value,
    toSlider: (value) => value,
    format: (value) => Math.round(value).toLocaleString(),
  },
  aspect_height: {
    label: "Ratio Height",
    min: 1,
    max: MAX_RATIO_COMPONENT,
    step: 1,
    sliderMin: 1,
    sliderMax: MAX_RATIO_COMPONENT,
    sliderStep: 1,
    fromSlider: (value) => value,
    toSlider: (value) => value,
    format: (value) => Math.round(value).toLocaleString(),
  },
  target_pixels: {
    label: "Target Pixels",
    min: 1,
    max: MAX_TOTAL_PIXELS,
    step: 1,
    sliderMin: 0,
    sliderMax: 1000,
    sliderStep: 1,
    fromSlider: (value) => Math.round(Math.exp((Number(value) / 1000) * LOG_MAX_TOTAL_PIXELS)),
    toSlider: (value) => Math.round((Math.log(Math.max(Number(value), 1)) / LOG_MAX_TOTAL_PIXELS) * 1000),
    format: (value) => Math.round(value).toLocaleString(),
  },
  target_width: {
    ...createBiasedDimensionSliderConfig("Target Width"),
  },
  target_height: {
    ...createBiasedDimensionSliderConfig("Target Height"),
  },
  scale_factor: {
    label: "Scale Factor",
    min: 0.01,
    max: 10,
    step: 0.01,
    sliderMin: 0.01,
    sliderMax: 10,
    sliderStep: 0.01,
    fromSlider: (value) => value,
    toSlider: (value) => value,
    format: (value) => Number(value).toFixed(2),
  },
  target_long_side: {
    ...createBiasedDimensionSliderConfig("Target Long Side"),
  },
  target_short_side: {
    ...createBiasedDimensionSliderConfig("Target Short Side"),
  },
};

function injectStyles() {
  if (document.getElementById("lerico-rf-v2-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "lerico-rf-v2-styles";
  style.textContent = `
    .lerico-rfv2 {
      --rf-bg: linear-gradient(180deg, rgba(25,31,41,0.98), rgba(13,18,26,0.98));
      --rf-sheen: linear-gradient(135deg, rgba(141, 221, 255, 0.08), rgba(141, 221, 255, 0) 38%, rgba(255, 206, 142, 0.08) 100%);
      --rf-panel: rgba(255,255,255,0.055);
      --rf-panel-strong: rgba(255,255,255,0.075);
      --rf-border: rgba(183, 211, 240, 0.16);
      --rf-border-strong: rgba(183, 211, 240, 0.28);
      --rf-accent: #85d4ff;
      --rf-accent-soft: rgba(133, 212, 255, 0.16);
      --rf-accent-warm: #ffcf8c;
      --rf-text: #eef4fb;
      --rf-muted: #aebdce;
      --rf-danger: #ffb0ab;
      --rf-warning: #ffd6a5;
      --rf-shadow: 0 18px 38px rgba(0, 0, 0, 0.34);
      position: relative;
      overflow: hidden;
      background: var(--rf-bg);
      color: var(--rf-text);
      border: 1px solid var(--rf-border);
      border-radius: 16px;
      box-shadow: var(--rf-shadow);
      font-family: "Segoe UI", "Trebuchet MS", sans-serif;
      padding: 10px;
      box-sizing: border-box;
      isolation: isolate;
    }
    .lerico-rfv2::before {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--rf-sheen);
      pointer-events: none;
      z-index: -1;
    }
    .lerico-rfv2 * {
      box-sizing: border-box;
    }
    .lerico-rfv2 button,
    .lerico-rfv2 input,
    .lerico-rfv2 select,
    .lerico-rfv2 summary {
      font: inherit;
    }
    .lerico-rfv2__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
    }
    .lerico-rfv2__title {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: var(--rf-text);
      font-size: 25px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1;
      text-shadow: 0 1px 0 rgba(0,0,0,0.28);
    }
    .lerico-rfv2__titleIcon {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--rf-accent);
      flex: 0 0 auto;
    }
    .lerico-rfv2__titleIcon svg {
      width: 24px;
      height: 24px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .lerico-rfv2__subtitle {
      display: none;
    }
    .lerico-rfv2__headerActions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .lerico-rfv2__favorite {
      border: 1px solid var(--rf-border);
      background: rgba(255,255,255,0.045);
      color: var(--rf-accent-warm);
      border-radius: 999px;
      padding: 6px 10px;
      cursor: pointer;
      transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
      white-space: nowrap;
    }
    .lerico-rfv2__favorite:hover {
      transform: translateY(-1px);
      background: rgba(255,255,255,0.07);
      border-color: var(--rf-border-strong);
    }
    .lerico-rfv2__favorite.is-active {
      color: var(--rf-accent);
      background: rgba(133, 212, 255, 0.12);
      border-color: rgba(133, 212, 255, 0.44);
    }
    .lerico-rfv2__section {
      background: rgba(255,255,255,0.045);
      border: 1px solid var(--rf-border);
      border-radius: 14px;
      padding: 8px;
      margin-bottom: 8px;
      backdrop-filter: blur(10px);
    }
    .lerico-rfv2__stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .lerico-rfv2__sectionTitle {
      color: var(--rf-muted);
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.11em;
      margin-bottom: 4px;
    }
    .lerico-rfv2__sectionTitle:not(:first-child) {
      margin-top: 8px;
    }
    .lerico-rfv2__modeGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .lerico-rfv2__controlRow {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .lerico-rfv2__button,
    .lerico-rfv2__card,
    .lerico-rfv2__chip,
    .lerico-rfv2__toggle,
    .lerico-rfv2__orientation,
    .lerico-rfv2__selectShell {
      border: 1px solid var(--rf-border);
      background: rgba(255,255,255,0.04);
      color: var(--rf-text);
      border-radius: 12px;
      cursor: pointer;
      transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }
    .lerico-rfv2__button:hover,
    .lerico-rfv2__card:hover,
    .lerico-rfv2__chip:hover,
    .lerico-rfv2__toggle:hover,
    .lerico-rfv2__orientation:hover,
    .lerico-rfv2__selectShell:hover {
      transform: translateY(-1px);
      background: rgba(255,255,255,0.065);
      border-color: var(--rf-border-strong);
      box-shadow: 0 8px 18px rgba(0,0,0,0.14);
    }
    .lerico-rfv2__button.is-active,
    .lerico-rfv2__card.is-active,
    .lerico-rfv2__chip.is-active,
    .lerico-rfv2__toggle.is-active,
    .lerico-rfv2__orientation.is-active,
    .lerico-rfv2__selectShell.is-active {
      background: linear-gradient(180deg, rgba(133, 212, 255, 0.18), rgba(133, 212, 255, 0.08));
      border-color: rgba(133, 212, 255, 0.55);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 18px rgba(0,0,0,0.16);
    }
    .lerico-rfv2__button {
      padding: 8px;
      text-align: center;
      min-height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lerico-rfv2__buttonTop {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      width: 100%;
    }
    .lerico-rfv2__buttonIcon,
    .lerico-rfv2__iconChip {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: var(--rf-accent);
    }
    .lerico-rfv2__buttonIcon svg,
    .lerico-rfv2__iconChip svg,
    .lerico-rfv2__orientationIcon svg {
      width: 15px;
      height: 15px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .lerico-rfv2__buttonTitle {
      font-size: 11px;
      font-weight: 700;
    }
    .lerico-rfv2__button small {
      display: none;
    }
    .lerico-rfv2__toolbar,
    .lerico-rfv2__chips,
    .lerico-rfv2__ratios,
    .lerico-rfv2__badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .lerico-rfv2__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .lerico-rfv2__orientationGrid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
    }
    .lerico-rfv2__orientation {
      min-height: 42px;
      padding: 5px 8px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-align: center;
    }
    .lerico-rfv2__orientationIcon {
      width: 15px;
      height: 15px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--rf-accent);
    }
    .lerico-rfv2__orientationLabel {
      font-size: 10px;
      color: var(--rf-text);
      line-height: 1.2;
    }
    .lerico-rfv2__card {
      flex: 1 1 92px;
      padding: 6px 8px;
      text-align: center;
      min-width: 92px;
      display: flex;
      gap: 7px;
      align-items: center;
      justify-content: center;
    }
    .lerico-rfv2__cardLabel {
      display: block;
      font-size: 10.8px;
      font-weight: 700;
      line-height: 1.25;
    }
    .lerico-rfv2__cardHint {
      display: none;
    }
    .lerico-rfv2__chip {
      padding: 5px 8px;
      font-size: 10px;
      line-height: 1;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }
    .lerico-rfv2__ratios .lerico-rfv2__chip {
      flex: 1 1 0;
      min-width: max-content;
    }
    .lerico-rfv2__chip--sdxl {
      border-color: rgba(255, 207, 140, 0.34);
      background: rgba(255, 207, 140, 0.08);
    }
    .lerico-rfv2__chip--sdxl:hover {
      background: rgba(255, 207, 140, 0.12);
      border-color: rgba(255, 207, 140, 0.5);
    }
    .lerico-rfv2__chip--sdxl.is-active {
      background: linear-gradient(180deg, rgba(255, 207, 140, 0.2), rgba(255, 207, 140, 0.1));
      border-color: rgba(255, 207, 140, 0.62);
    }
    .lerico-rfv2__chipRatio {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      line-height: 1.05;
      min-width: 0;
    }
    .lerico-rfv2__chipRatioLine {
      display: block;
      white-space: nowrap;
    }
    .lerico-rfv2__chipRatioDivider {
      width: 100%;
      height: 1px;
      background: rgba(255,255,255,0.18);
    }
    .lerico-rfv2__field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .lerico-rfv2__field label {
      color: var(--rf-muted);
      font-size: 10px;
    }
    .lerico-rfv2__field input,
    .lerico-rfv2__field select {
      width: 100%;
      min-width: 0;
      border: 1px solid rgba(255,255,255,0.11);
      background: rgba(10, 14, 20, 0.72);
      color: var(--rf-text);
      border-radius: 10px;
      padding: 7px 9px;
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }
    .lerico-rfv2__field input:focus,
    .lerico-rfv2__field select:focus {
      border-color: rgba(133, 212, 255, 0.56);
      box-shadow: 0 0 0 3px rgba(133, 212, 255, 0.12);
      background: rgba(10, 14, 20, 0.9);
    }
    .lerico-rfv2__field input:disabled,
    .lerico-rfv2__field select:disabled,
    .lerico-rfv2__selectShell select:disabled {
      opacity: 0.42;
      cursor: not-allowed;
    }
    .lerico-rfv2__sliderField {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
      padding: 8px 9px;
      border: 1px solid var(--rf-border);
      border-radius: 12px;
      background: rgba(255,255,255,0.04);
    }
    .lerico-rfv2__sliderHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }
    .lerico-rfv2__sliderLabel {
      color: var(--rf-muted);
      font-size: 10px;
      line-height: 1.1;
      white-space: nowrap;
    }
    .lerico-rfv2__sliderValue {
      color: var(--rf-text);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
      text-align: right;
    }
    .lerico-rfv2__slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 18px;
      margin: 0;
      padding: 0;
      background: transparent;
      outline: none;
      cursor: pointer;
    }
    .lerico-rfv2__slider:disabled {
      opacity: 0.42;
      cursor: not-allowed;
    }
    .lerico-rfv2__slider::-webkit-slider-runnable-track {
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(133, 212, 255, 0.9) 0%, rgba(133, 212, 255, 0.9) calc(var(--rf-slider-fill, 0) * 1%), rgba(255,255,255,0.12) calc(var(--rf-slider-fill, 0) * 1%), rgba(255,255,255,0.12) 100%);
    }
    .lerico-rfv2__slider::-moz-range-track {
      height: 4px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
    }
    .lerico-rfv2__slider::-moz-range-progress {
      height: 4px;
      border-radius: 999px;
      background: rgba(133, 212, 255, 0.9);
    }
    .lerico-rfv2__slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 0;
      background: #eef4fb;
      box-shadow: 0 0 0 3px rgba(133, 212, 255, 0.18), 0 2px 8px rgba(0,0,0,0.24);
      margin-top: -4px;
    }
    .lerico-rfv2__slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border: 0;
      border-radius: 999px;
      background: #eef4fb;
      box-shadow: 0 0 0 3px rgba(133, 212, 255, 0.18), 0 2px 8px rgba(0,0,0,0.24);
    }
    .lerico-rfv2__toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 36px;
      padding: 7px 9px;
    }
    .lerico-rfv2__toggleText strong {
      display: block;
      font-size: 10.8px;
      line-height: 1.25;
    }
    .lerico-rfv2__toggleText span {
      display: none;
    }
    .lerico-rfv2__toggleMark {
      width: 32px;
      height: 18px;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      position: relative;
      flex: 0 0 auto;
    }
    .lerico-rfv2__toggleMark::after {
      content: "";
      width: 12px;
      height: 12px;
      position: absolute;
      top: 3px;
      left: 3px;
      border-radius: 999px;
      background: white;
      transition: transform 140ms ease;
    }
    .lerico-rfv2__toggle.is-active .lerico-rfv2__toggleMark {
      background: rgba(133, 212, 255, 0.56);
    }
    .lerico-rfv2__toggle.is-active .lerico-rfv2__toggleMark::after {
      transform: translateX(14px);
    }
    .lerico-rfv2__selectShell {
      position: relative;
      min-height: 36px;
      padding: 5px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      cursor: default;
      background: rgba(10, 14, 20, 0.72);
      border: 1px solid rgba(255,255,255,0.11);
    }
    .lerico-rfv2__selectShell::after {
      content: "";
      position: absolute;
      right: 10px;
      top: 50%;
      width: 7px;
      height: 7px;
      margin-top: -5px;
      border-right: 1.5px solid var(--rf-text);
      border-bottom: 1.5px solid var(--rf-text);
      transform: rotate(45deg);
      pointer-events: none;
      opacity: 0.8;
    }
    .lerico-rfv2__selectShellLabel {
      font-size: 10.8px;
      font-weight: 700;
      white-space: nowrap;
    }
    .lerico-rfv2__selectShell select {
      min-width: 0;
      flex: 1 1 auto;
      width: auto;
      background: transparent;
      border: 0;
      box-shadow: none;
      padding: 0;
      padding-right: 16px;
      color: var(--rf-text);
      text-align: right;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      color-scheme: dark;
    }
    .lerico-rfv2__selectShell select:focus {
      border: 0;
      box-shadow: none;
      background: transparent;
    }
    .lerico-rfv2__selectShell select option {
      background: rgb(10, 14, 20);
      color: var(--rf-text);
    }
    .lerico-rfv2__advanced summary {
      cursor: pointer;
      color: var(--rf-muted);
      font-size: 10.8px;
      list-style: none;
      margin-bottom: 6px;
    }
    .lerico-rfv2__advanced summary::-webkit-details-marker {
      display: none;
    }
    .lerico-rfv2__result {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at top left, rgba(133, 212, 255, 0.16), transparent 44%),
        radial-gradient(circle at bottom right, rgba(255, 207, 140, 0.12), transparent 35%),
        rgba(7, 11, 17, 0.72);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 9px;
    }
    .lerico-rfv2__resultHeader {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 6px;
    }
    .lerico-rfv2__resultTitle {
      font-size: 11px;
      font-weight: 700;
    }
    .lerico-rfv2__resultText {
      display: none;
    }
    .lerico-rfv2__resultLayout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 10px;
      align-items: stretch;
    }
    .lerico-rfv2__stats {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .lerico-rfv2__stat {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 12px;
      padding: 7px 8px;
    }
    .lerico-rfv2__stat.is-output {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
    }
    .lerico-rfv2__statMain {
      min-width: 0;
    }
    .lerico-rfv2__statLabel {
      display: block;
      color: var(--rf-muted);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }
    .lerico-rfv2__statValue {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.2;
    }
    .lerico-rfv2__formatIconButton {
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--rf-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.78;
      transition: opacity 140ms ease, transform 140ms ease, color 140ms ease;
    }
    .lerico-rfv2__formatIconButton:hover {
      opacity: 1;
      color: var(--rf-accent-warm);
      transform: translateY(-1px);
    }
    .lerico-rfv2__formatIconButton svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .lerico-rfv2__visual {
      position: relative;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      background: rgba(255,255,255,0.03);
    }
    .lerico-rfv2__frame {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.18);
      background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
    }
    .lerico-rfv2__frame::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.05) 50%, transparent 51%),
        linear-gradient(transparent 49%, rgba(255,255,255,0.05) 50%, transparent 51%);
      background-size: 18px 18px;
    }
    .lerico-rfv2__frameText {
      position: relative;
      z-index: 1;
      max-width: calc(100% - 10px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: var(--rf-frame-text-size, 10.5px);
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 1px 0 rgba(0,0,0,0.4);
    }
    .lerico-rfv2__placeholder {
      width: 100%;
      border: 1px dashed rgba(255,255,255,0.14);
      border-radius: 12px;
      padding: 12px 10px;
      text-align: center;
      color: var(--rf-muted);
      font-size: 10.5px;
      line-height: 1.4;
      background: rgba(255,255,255,0.03);
    }
    .lerico-rfv2__placeholderIcon {
      width: 24px;
      height: 24px;
      margin: 0 auto 6px;
      color: var(--rf-accent);
    }
    .lerico-rfv2__badge {
      border-radius: 999px;
      padding: 5px 8px;
      background: rgba(255,255,255,0.065);
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 9px;
      line-height: 1;
      color: #edf5fd;
    }
    .lerico-rfv2__visualBadges {
      position: absolute;
      right: 8px;
      bottom: 8px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
      max-width: calc(100% - 16px);
    }
    .lerico-rfv2__warningList {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .lerico-rfv2__warning {
      border-radius: 10px;
      padding: 7px 9px;
      background: rgba(255, 214, 165, 0.08);
      border: 1px solid rgba(255, 214, 165, 0.22);
      color: var(--rf-warning);
      font-size: 9.8px;
      line-height: 1.35;
    }
    .lerico-rfv2__warning.is-danger {
      background: rgba(255, 176, 171, 0.08);
      border-color: rgba(255, 176, 171, 0.22);
      color: var(--rf-danger);
    }
    .lerico-rfv2__modalOverlay {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: rgba(3, 6, 10, 0.62);
      backdrop-filter: blur(7px);
    }
    .lerico-rfv2__modal {
      width: min(100%, 390px);
      border: 1px solid var(--rf-border-strong);
      border-radius: 14px;
      background: linear-gradient(180deg, rgba(22, 31, 43, 0.98), rgba(12, 17, 25, 0.98));
      box-shadow: 0 18px 42px rgba(0,0,0,0.36);
      padding: 10px;
    }
    .lerico-rfv2__modalHeader {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }
    .lerico-rfv2__modalTitle {
      font-size: 12px;
      font-weight: 700;
    }
    .lerico-rfv2__modalBody {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .lerico-rfv2__formatInput {
      width: 100%;
      border-radius: 10px;
      border: 1px solid var(--rf-border);
      background: rgba(5, 9, 14, 0.86);
      color: var(--rf-text);
      padding: 8px 9px;
      outline: none;
    }
    .lerico-rfv2__formatInput:focus {
      border-color: rgba(133, 212, 255, 0.48);
      box-shadow: 0 0 0 2px rgba(133, 212, 255, 0.12);
    }
    .lerico-rfv2__tokenRow {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .lerico-rfv2__token {
      border-radius: 7px;
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.055);
      color: var(--rf-muted);
      padding: 4px 6px;
      font-size: 9.5px;
      line-height: 1;
    }
    .lerico-rfv2__modalPreview {
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.04);
      padding: 7px 8px;
      font-size: 10.5px;
      line-height: 1.35;
      word-break: break-word;
    }
    .lerico-rfv2__modalError {
      color: var(--rf-warning);
      font-size: 9.8px;
      line-height: 1.3;
      min-height: 13px;
    }
    .lerico-rfv2__modalActions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      margin-top: 2px;
    }
    .lerico-rfv2__modalButton {
      border: 1px solid var(--rf-border);
      border-radius: 9px;
      background: rgba(255,255,255,0.055);
      color: var(--rf-text);
      padding: 6px 9px;
      cursor: pointer;
    }
    .lerico-rfv2__modalButton.is-primary {
      color: #071019;
      background: var(--rf-accent);
      border-color: rgba(133, 212, 255, 0.72);
      font-weight: 700;
    }
    @media (max-width: 420px) {
      .lerico-rfv2__modeGrid,
      .lerico-rfv2__orientationGrid,
      .lerico-rfv2__grid,
      .lerico-rfv2__controlRow,
      .lerico-rfv2__resultLayout {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
  document.head.appendChild(style);
}

function formatEntry(entry) {
  return entry.label ? `${entry.w}x${entry.h} (${entry.label})` : `${entry.w}x${entry.h}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function aspectRatioText(width, height) {
  const gcd = (a, b) => {
    let left = Math.abs(Math.round(a));
    let right = Math.abs(Math.round(b));
    while (right) {
      [left, right] = [right, left % right];
    }
    return Math.max(left, 1);
  };
  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

function orientationFromDims(width, height) {
  if (width === height) {
    return "square";
  }
  return width > height ? "landscape" : "portrait";
}

function validateResolutionFormat(template) {
  const text = template == null ? DEFAULT_RESOLUTION_FORMAT : String(template);
  if (text.length > MAX_RESOLUTION_FORMAT_LENGTH) {
    return { valid: false, message: "Format is too long." };
  }
  if ([...text].some((char) => char.charCodeAt(0) < 32)) {
    return { valid: false, message: "Format contains unsupported control characters." };
  }

  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (char === "{") {
      if (text[index + 1] === "{") {
        index += 2;
        continue;
      }
      const end = text.indexOf("}", index + 1);
      if (end === -1) {
        return { valid: false, message: "Format has an unmatched opening brace." };
      }
      const token = text.slice(index + 1, end);
      if (!token || !RESOLUTION_FORMAT_TOKENS.has(token)) {
        return { valid: false, message: `Unknown token: {${token}}.` };
      }
      index = end + 1;
      continue;
    }
    if (char === "}") {
      if (text[index + 1] === "}") {
        index += 2;
        continue;
      }
      return { valid: false, message: "Format has an unmatched closing brace." };
    }
    index += 1;
  }
  return { valid: true, message: "" };
}

function formatResolutionString(template, width, height) {
  let activeTemplate = template == null ? DEFAULT_RESOLUTION_FORMAT : String(template);
  const validation = validateResolutionFormat(activeTemplate);
  const widthInt = Math.round(width);
  const heightInt = Math.round(height);
  const pixelCount = widthInt * heightInt;
  if (!validation.valid) {
    activeTemplate = DEFAULT_RESOLUTION_FORMAT;
  }

  const values = {
    w: String(widthInt),
    h: String(heightInt),
    ar: aspectRatioText(widthInt, heightInt),
    ar_decimal: (widthInt / Math.max(heightInt, 1)).toFixed(3),
    n_px: String(pixelCount),
    mp: (pixelCount / 1_000_000).toFixed(2),
    orientation: orientationFromDims(widthInt, heightInt),
  };

  let output = "";
  let index = 0;
  while (index < activeTemplate.length) {
    const char = activeTemplate[index];
    if (char === "{" && activeTemplate[index + 1] === "{") {
      output += "{";
      index += 2;
      continue;
    }
    if (char === "}" && activeTemplate[index + 1] === "}") {
      output += "}";
      index += 2;
      continue;
    }
    if (char === "{") {
      const end = activeTemplate.indexOf("}", index + 1);
      const token = activeTemplate.slice(index + 1, end);
      output += values[token];
      index = end + 1;
      continue;
    }
    output += char;
    index += 1;
  }

  if (output.length > MAX_RESOLUTION_OUTPUT_LENGTH) {
    return {
      value: `${widthInt}*${heightInt}`,
      valid: false,
      message: "Formatted output is too long. Using default.",
    };
  }
  return {
    value: output,
    valid: validation.valid,
    message: validation.message,
  };
}

function getFormatPreviewDims(node) {
  const preview = computePreview(node);
  if (preview.hasPreview && preview.width && preview.height) {
    return { width: preview.width, height: preview.height, executionDependent: false };
  }
  return { width: 1024, height: 1024, executionDependent: true };
}

function appendResolutionFamily(merged, familyMap) {
  for (const [key, entries] of Object.entries(familyMap)) {
    const bucket = merged[key] || [];
    const seen = new Set(bucket.map((entry) => `${entry.w}x${entry.h}|${entry.label || ""}`));
    for (const entry of entries) {
      const fingerprint = `${entry.w}x${entry.h}|${entry.label || ""}`;
      if (seen.has(fingerprint)) {
        continue;
      }
      bucket.push({ ...entry });
      seen.add(fingerprint);
    }
    merged[key] = bucket;
  }
}

function getCommonFamilyFlags(node, overrides = {}) {
  return {
    includeSdxl: SHOW_SDXL_CONTROLS && !!getWidgetValue(node, "sdxl_resolutions"),
    includeIteration: !!getWidgetValue(node, "iteration_resolutions"),
    includeHighDetail: !!getWidgetValue(node, "high_detail_resolutions"),
    includeExtended: !!getWidgetValue(node, "extended_resolutions"),
    ...overrides,
  };
}

function getEnabledCommonFamilies(flags = {}) {
  return COMMON_FAMILY_DEFS.filter((family) => {
    if (family.key === "common") {
      return true;
    }
    if (family.key === "sdxl") {
      return !!flags.includeSdxl;
    }
    if (family.key === "iteration") {
      return !!flags.includeIteration;
    }
    if (family.key === "high_detail") {
      return !!flags.includeHighDetail;
    }
    if (family.key === "extended") {
      return !!flags.includeExtended;
    }
    return false;
  });
}

function getCommonResolutionMap(flags = {}) {
  const merged = Object.fromEntries(
    Object.entries(COMMON_RESOLUTIONS).map(([key, entries]) => [key, entries.map((entry) => ({ ...entry }))]),
  );
  for (const family of getEnabledCommonFamilies(flags)) {
    if (family.key === "common") {
      continue;
    }
    appendResolutionFamily(merged, family.map);
  }
  return merged;
}

function getAllCommonEntries(flags = {}) {
  return Object.values(getCommonResolutionMap(flags)).flat();
}

function isSdxlAspectLabel(label) {
  return SDXL_ASPECT_SET.has(label);
}

function getLegacyAspectFallback(label) {
  return SDXL_FALLBACK_BY_LABEL[label] || label;
}

function resolveEntryOrientation(entry, orientation) {
  let width = entry.w;
  let height = entry.h;
  if (orientation === "portrait") {
    [width, height] = [height, width];
  }
  if (orientation === "square") {
    const side = Math.min(width, height);
    width = side;
    height = side;
  }
  return { width, height };
}

function buildCommonOptionRecords(families, orientation, ratioKey = null) {
  const records = [];
  const seen = new Set();
  const resolvedOrientation = orientation === "square" ? "auto" : orientation;

  for (const family of families) {
    const sourceEntries = ratioKey
      ? [[ratioKey, family.map[ratioKey] || []]]
      : Object.entries(family.map);

    for (const [entryRatioKey, entries] of sourceEntries) {
      for (const entry of entries) {
        const { width, height } = resolveEntryOrientation(entry, resolvedOrientation);
        const value = formatEntry({ w: width, h: height, label: entry.label || "" });
        if (seen.has(value)) {
          continue;
        }
        seen.add(value);
        records.push({
          value,
          label: family.key === "common" ? value : `${value} \u00b7 ${family.label}`,
          ratio_key: entryRatioKey,
          family_key: family.key,
          family_label: family.label,
          area: width * height,
        });
      }
    }
  }

  return records;
}

function buildCommonOptionGroups(records, groupBy) {
  const groups = [];
  const lookup = new Map();

  for (const record of records) {
    const groupKey = groupBy === "family" ? record.family_key : record.ratio_key;
    const groupLabel = groupBy === "family" ? record.family_label : record.ratio_key;
    if (!lookup.has(groupKey)) {
      const group = { key: groupKey, label: groupLabel, options: [] };
      lookup.set(groupKey, group);
      groups.push(group);
    }
    lookup.get(groupKey).options.push(record);
  }

  for (const group of groups) {
    group.options.sort((left, right) => {
      const familyIndex = COMMON_FAMILY_DEFS.findIndex((family) => family.key === left.family_key)
        - COMMON_FAMILY_DEFS.findIndex((family) => family.key === right.family_key);
      if (familyIndex !== 0) {
        return familyIndex;
      }
      return left.area - right.area;
    });
  }

  return groups.filter((group) => group.options.length);
}

function flattenCommonOptionGroups(groups) {
  return groups.flatMap((group) => group.options.map((option) => option.value));
}

function renderGroupedSelectOptions(groups, currentValue) {
  return groups.map((group) => `
    <optgroup label="${group.label}">
      ${group.options.map((option) => `
        <option value="${option.value}" ${currentValue === option.value ? "selected" : ""}>${option.label}</option>
      `).join("")}
    </optgroup>
  `).join("");
}

function populateGroupedSelect(select, groups, currentValue) {
  select.innerHTML = renderGroupedSelectOptions(groups, currentValue);
  if (currentValue) {
    select.value = currentValue;
  }
}

function findClosestCommonOptionValue(targetValue, values) {
  if (!values.length) {
    return null;
  }
  const parsed = parseResolutionText(targetValue);
  if (!parsed) {
    return values[0];
  }

  const targetArea = parsed[0] * parsed[1];
  let best = values[0];
  let bestError = Number.POSITIVE_INFINITY;
  for (const value of values) {
    const dims = parseResolutionText(value);
    if (!dims) {
      continue;
    }
    const error = Math.abs((dims[0] * dims[1]) - targetArea);
    if (error < bestError) {
      best = value;
      bestError = error;
    }
  }
  return best;
}

function parseRatioLabel(label) {
  if (!label) {
    return { land: null, port: null };
  }
  const mainMatch = label.match(/([0-9.]+)\s*:\s*([0-9.]+)/);
  let land = mainMatch ? `${mainMatch[1]}:${mainMatch[2]}` : null;
  let port = null;
  const parenMatch = label.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const insideMatch = parenMatch[1].match(/([0-9.]+)\s*:\s*([0-9.]+)/);
    if (insideMatch) {
      port = `${insideMatch[1]}:${insideMatch[2]}`;
    }
  }
  return { land, port };
}

function parseDualRatio(label) {
  const text = (label || "").trim();
  if (text.includes("(") && text.includes(")")) {
    const open = text.indexOf("(");
    const close = text.indexOf(")", open + 1);
    const before = text.slice(0, open).trim();
    const inside = close === -1 ? text.slice(open + 1).trim() : text.slice(open + 1, close).trim();
    return [before, inside];
  }
  return [text, text];
}

function ratioToFloat(text) {
  if (!text) {
    return null;
  }
  const match = text.match(/([0-9]*\.?[0-9]+)\s*:\s*([0-9]*\.?[0-9]+)/);
  if (!match) {
    return null;
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) {
    return null;
  }
  return width / height;
}

function ratioFromLabel(label, orientation) {
  const [landText, portText] = parseDualRatio(label);
  let land = ratioToFloat(landText);
  let port = ratioToFloat(portText);

  if (port == null && land) {
    port = 1 / land;
  }
  if (land == null && port) {
    land = 1 / port;
  }

  if (orientation === "portrait") {
    return port || land || 1;
  }
  if (orientation === "landscape") {
    return land || port || 1;
  }
  if (orientation === "square") {
    return 1;
  }
  return land || port || 1;
}

function applyOrientationToRatio(ratio, orientation) {
  const safe = ratio && ratio > 0 ? ratio : 1;
  if (orientation === "square") {
    return 1;
  }
  if (orientation === "portrait" && safe > 1) {
    return 1 / safe;
  }
  if (orientation === "landscape" && safe < 1) {
    return 1 / safe;
  }
  return safe;
}

function roundToMultiple(value, multiple, mode) {
  if (multiple <= 1) {
    if (mode === "floor") {
      return Math.floor(value);
    }
    if (mode === "ceil") {
      return Math.ceil(value);
    }
    return Math.round(value);
  }
  if (mode === "floor") {
    return Math.floor(value / multiple) * multiple;
  }
  if (mode === "ceil") {
    return Math.ceil(value / multiple) * multiple;
  }
  return Math.round(value / multiple) * multiple;
}

function roundDims(width, height, multiple, roundingMode) {
  const minSide = multiple > 1 ? multiple : 1;
  return [
    Math.max(roundToMultiple(width, multiple, roundingMode), minSide),
    Math.max(roundToMultiple(height, multiple, roundingMode), minSide),
  ];
}

function closestCandidate(candidates, targetPixels) {
  let best = candidates[0];
  let bestErr = Math.abs(best[0] * best[1] - targetPixels);
  for (const candidate of candidates.slice(1)) {
    const err = Math.abs(candidate[0] * candidate[1] - targetPixels);
    if (err < bestErr) {
      best = candidate;
      bestErr = err;
    }
  }
  return best;
}

function refineCandidate(candidate, targetPixels, multiple) {
  const step = Math.max(Number(multiple) || 1, 1);
  let best = candidate;
  let bestErr = Math.abs(candidate[0] * candidate[1] - targetPixels);
  for (const [dw, dh] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
    const next = [Math.max(step, candidate[0] + dw), Math.max(step, candidate[1] + dh)];
    const err = Math.abs(next[0] * next[1] - targetPixels);
    if (err < bestErr) {
      best = next;
      bestErr = err;
    }
  }
  return best;
}

function fitRatioToPixels(ratio, pixels, multiple, pixelMatchMode) {
  const safeRatio = Math.max(ratio || 0, 1e-9);
  const safePixels = Math.max(Number(pixels) || 0, 1);
  const width = Math.sqrt(safePixels * safeRatio);
  const height = Math.sqrt(safePixels / safeRatio);
  const floorCandidate = [
    roundToMultiple(width, multiple, "floor"),
    roundToMultiple(height, multiple, "floor"),
  ];
  const ceilCandidate = [
    roundToMultiple(width, multiple, "ceil"),
    roundToMultiple(height, multiple, "ceil"),
  ];

  if (pixelMatchMode === "lower") {
    return floorCandidate;
  }
  if (pixelMatchMode === "higher") {
    return ceilCandidate;
  }

  const best = closestCandidate([floorCandidate, ceilCandidate], safePixels);
  return refineCandidate(best, safePixels, multiple);
}

function parseResolutionText(text) {
  const match = (text || "").match(/(\d+)\s*[x*]\s*(\d+)/i);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2])];
}

function nearestCommonRatioKey(ratio, commonResolutions = COMMON_RESOLUTIONS) {
  const safeRatio = Math.max(ratio || 0, 1e-9);
  let bestKey = "1:1";
  let bestErr = Number.POSITIVE_INFINITY;
  for (const key of Object.keys(commonResolutions)) {
    const keyRatio = ratioToFloat(key) || 1;
    const err = Math.abs(keyRatio - safeRatio);
    if (err < bestErr) {
      bestKey = key;
      bestErr = err;
    }
  }
  return bestKey;
}

function getCommonCandidates(ratio, orientation, flags = {}) {
  const commonResolutions = getCommonResolutionMap(flags);
  const key = orientation === "square" ? "1:1" : nearestCommonRatioKey(ratio, commonResolutions);
  const entries = commonResolutions[key] || [];
  if (orientation === "portrait") {
    return entries.map((entry) => [entry.h, entry.w, entry.label || ""]);
  }
  return entries.map((entry) => [entry.w, entry.h, entry.label || ""]);
}

function selectCommonByTarget(candidates, targetPixels, pixelMatchMode) {
  if (!candidates.length) {
    return null;
  }
  const areas = candidates.map(([width, height]) => [width, height, width * height]);
  if (pixelMatchMode === "lower") {
    const below = areas.filter((candidate) => candidate[2] <= targetPixels);
    const chosen = below.length
      ? below.reduce((best, candidate) => (candidate[2] > best[2] ? candidate : best))
      : areas.reduce((best, candidate) => (candidate[2] < best[2] ? candidate : best));
    return [chosen[0], chosen[1]];
  }
  if (pixelMatchMode === "higher") {
    const above = areas.filter((candidate) => candidate[2] >= targetPixels);
    const chosen = above.length
      ? above.reduce((best, candidate) => (candidate[2] < best[2] ? candidate : best))
      : areas.reduce((best, candidate) => (candidate[2] > best[2] ? candidate : best));
    return [chosen[0], chosen[1]];
  }
  const chosen = areas.reduce((best, candidate) => {
    const bestErr = Math.abs(best[2] - targetPixels);
    const nextErr = Math.abs(candidate[2] - targetPixels);
    return nextErr < bestErr ? candidate : best;
  });
  return [chosen[0], chosen[1]];
}

function applyMaxPixels(width, height, maxPixels) {
  if (maxPixels <= 0) {
    return [width, height];
  }
  const area = width * height;
  if (area <= maxPixels) {
    return [width, height];
  }
  const scale = Math.sqrt(maxPixels / area);
  return [width * scale, height * scale];
}

function enforceOrientation(width, height, orientation) {
  if (orientation === "square") {
    const side = Math.min(width, height);
    return [side, side];
  }
  if (orientation === "portrait" && width > height) {
    return [height, width];
  }
  if (orientation === "landscape" && height > width) {
    return [height, width];
  }
  return [width, height];
}

function findWidget(node, name) {
  return node.widgets?.find((widget) => widget.name === name);
}

function getWidgetValue(node, name) {
  const widget = findWidget(node, name);
  return widget ? widget.value : undefined;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function setWidgetHidden(widget, hidden) {
  if (!widget) {
    return;
  }
  if (!widget._lericoOrigComputeSizeSet) {
    widget._lericoOrigComputeSize = widget.computeSize;
    widget._lericoOrigComputeSizeSet = true;
  }
  if (!widget._lericoOrigDisplaySet && widget.element) {
    widget._lericoOrigDisplay = widget.element.style.display;
    widget._lericoOrigDisplaySet = true;
  }
  widget.hidden = !!hidden;
  if (hidden) {
    widget.computeSize = () => [0, -4];
  } else if (widget._lericoOrigComputeSizeSet) {
    if (widget._lericoOrigComputeSize === undefined) {
      delete widget.computeSize;
    } else {
      widget.computeSize = widget._lericoOrigComputeSize;
    }
  }
  if (widget.element) {
    const display = widget._lericoOrigDisplaySet ? widget._lericoOrigDisplay : "";
    widget.element.style.display = hidden ? "none" : display;
    const label = widget.element.previousElementSibling;
    if (label && label.textContent === `${widget.name}:`) {
      label.style.display = hidden ? "none" : display;
    }
  }
}

function findInputIndex(node, name) {
  return node.inputs ? node.inputs.findIndex((input) => input.name === name) : -1;
}

function setInputVisible(node, name, type, visible) {
  const index = findInputIndex(node, name);
  if (index === -1) {
    if (visible && node.addInput) {
      node.addInput(name, type);
    }
    return;
  }
  const input = node.inputs[index];
  if (input) {
    input.hidden = !visible;
  }
}

function isImageLinked(node) {
  const index = findInputIndex(node, "image");
  if (index === -1) {
    return false;
  }
  return !!node.inputs?.[index]?.link;
}

function getLinkedImageSourceNode(node) {
  const index = findInputIndex(node, "image");
  if (index === -1) {
    return null;
  }
  if (typeof node.getInputNode === "function") {
    return node.getInputNode(index);
  }
  const linkId = node.inputs?.[index]?.link;
  if (!linkId || !node.graph?.links) {
    return null;
  }
  const link = node.graph.links[linkId];
  return link?.origin_id != null && typeof node.graph.getNodeById === "function"
    ? node.graph.getNodeById(link.origin_id)
    : null;
}

function isNativeLoadImageNode(node) {
  const className = node?.comfyClass || node?.type || "";
  return LOAD_IMAGE_CLASS_NAMES.has(className);
}

function readImageDimensionsFromObject(image) {
  if (!image) {
    return null;
  }

  const width = Number(image.naturalWidth || image.videoWidth || image.width || image.naturalWidth);
  const height = Number(image.naturalHeight || image.videoHeight || image.height || image.naturalHeight);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

function getLoadImageSelectionValue(sourceNode) {
  const widget = findWidget(sourceNode, "image");
  return widget?.value != null ? String(widget.value) : "";
}

function buildLoadImageViewUrl(selectionValue) {
  const encoded = encodeURIComponent(selectionValue);
  if (selectionValue.startsWith("blake3:")) {
    return `/view?filename=${encoded}`;
  }
  return `/view?filename=${encoded}&type=input`;
}

function getLinkedInputImageDimensions(node) {
  const data = node._lericoRfV2InputImage;
  return data?.dimensions || null;
}

function clearLinkedInputImageDimensions(node) {
  node._lericoRfV2InputImage = null;
}

function storeLinkedInputImageDimensions(node, descriptor, dimensions) {
  node._lericoRfV2InputImage = {
    descriptor,
    dimensions,
  };
}

function attachImageSourceWatcher(node, sourceNode) {
  const current = node._lericoRfV2ImageSource;
  if (current?.node === sourceNode) {
    return;
  }

  if (current?.node && current.listener) {
    current.node._lericoRfV2ImageListeners?.delete(current.listener);
  }

  node._lericoRfV2ImageSource = null;

  if (!sourceNode) {
    return;
  }

  if (!sourceNode._lericoRfV2ImageListeners) {
    sourceNode._lericoRfV2ImageListeners = new Set();
    const originalOnWidgetChanged = sourceNode.onWidgetChanged;
    sourceNode.onWidgetChanged = function () {
      const result = originalOnWidgetChanged ? originalOnWidgetChanged.apply(this, arguments) : undefined;
      for (const listener of this._lericoRfV2ImageListeners || []) {
        listener();
      }
      return result;
    };
  }

  const listener = () => {
    clearLinkedInputImageDimensions(node);
    ensureLinkedInputImageDimensions(node, { force: true });
    applyNodeState(node);
  };

  sourceNode._lericoRfV2ImageListeners.add(listener);
  node._lericoRfV2ImageSource = { node: sourceNode, listener };
}

function ensureLinkedInputImageDimensions(node, options = {}) {
  const sourceNode = getLinkedImageSourceNode(node);
  if (!isNativeLoadImageNode(sourceNode)) {
    attachImageSourceWatcher(node, null);
    clearLinkedInputImageDimensions(node);
    return;
  }

  attachImageSourceWatcher(node, sourceNode);

  const selectionValue = getLoadImageSelectionValue(sourceNode);
  if (!selectionValue) {
    clearLinkedInputImageDimensions(node);
    return;
  }

  const descriptor = `${sourceNode.id}:${selectionValue}`;
  if (!options.force && node._lericoRfV2InputImage?.descriptor === descriptor && node._lericoRfV2InputImage?.dimensions) {
    return;
  }

  const sourcePreview = Array.isArray(sourceNode.imgs) ? sourceNode.imgs.find(Boolean) : null;
  const previewDimensions = readImageDimensionsFromObject(sourcePreview);
  if (previewDimensions) {
    storeLinkedInputImageDimensions(node, descriptor, previewDimensions);
    return;
  }

  const cached = INPUT_IMAGE_DIMENSION_CACHE.get(selectionValue);
  if (cached?.dimensions) {
    storeLinkedInputImageDimensions(node, descriptor, cached.dimensions);
    return;
  }
  if (cached?.promise) {
    return;
  }

  const url = buildLoadImageViewUrl(selectionValue);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = readImageDimensionsFromObject(img);
      if (!dimensions) {
        reject(new Error("Image dimensions unavailable."));
        return;
      }
      resolve(dimensions);
    };
    img.onerror = () => reject(new Error("Failed to probe image dimensions."));
    img.src = url;
  });

  INPUT_IMAGE_DIMENSION_CACHE.set(selectionValue, { promise });
  promise.then((dimensions) => {
    INPUT_IMAGE_DIMENSION_CACHE.set(selectionValue, { dimensions });
    if (node._lericoRfV2InputImage?.descriptor === descriptor || getLoadImageSelectionValue(sourceNode) === selectionValue) {
      storeLinkedInputImageDimensions(node, descriptor, dimensions);
      applyNodeState(node);
    }
  }).catch(() => {
    INPUT_IMAGE_DIMENSION_CACHE.delete(selectionValue);
  });
}

function updateCommonOptions(node) {
  const aspectSource = getWidgetValue(node, "aspect_source");
  const orientation = getWidgetValue(node, "orientation") || "auto";
  const aspectLabel = getWidgetValue(node, "aspect_ratio");
  const flags = getCommonFamilyFlags(node);
  const enabledFamilies = getEnabledCommonFamilies(flags);

  let groups = buildCommonOptionGroups(buildCommonOptionRecords(enabledFamilies, orientation), "ratio");
  if (aspectSource === "Aspect Ratio") {
    const parsed = parseRatioLabel(aspectLabel);
    const key = orientation === "square" ? "1:1" : parsed.land;
    groups = buildCommonOptionGroups(buildCommonOptionRecords(enabledFamilies, orientation, key), "family");
  } else if (orientation === "square") {
    groups = buildCommonOptionGroups(buildCommonOptionRecords(enabledFamilies, "auto", "1:1"), "ratio");
  }
  const options = flattenCommonOptionGroups(groups);

  const widget = findWidget(node, "common_resolution");
  if (!widget) {
    return;
  }
  widget.options = widget.options || {};
  widget.options.values = options;
  widget.__lericoRfV2OptionGroups = groups;
  if (options.length && !options.includes(widget.value)) {
    widget.value = findClosestCommonOptionValue(widget.value, options) || options[0];
  }

  if (widget.element && widget.element.tagName === "SELECT") {
    populateGroupedSelect(widget.element, groups, widget.value);
  }
}

function getAspectRatioFromSource(node, aspectSource, orientation) {
  if (aspectSource === "Image") {
    const dims = getLinkedInputImageDimensions(node);
    if (!dims?.width || !dims?.height) {
      return null;
    }
    const ratio = dims.width / dims.height;
    return applyOrientationToRatio(ratio, orientation);
  }
  if (aspectSource === "Width+Height") {
    const aspectWidth = toNumber(getWidgetValue(node, "aspect_width"), 1);
    const aspectHeight = toNumber(getWidgetValue(node, "aspect_height"), 1);
    const ratio = aspectHeight ? aspectWidth / aspectHeight : 1;
    return applyOrientationToRatio(ratio, orientation);
  }
  return ratioFromLabel(getWidgetValue(node, "aspect_ratio"), orientation);
}

function computePreview(node) {
  const mode = getWidgetValue(node, "mode");
  const orientation = getWidgetValue(node, "orientation") || "auto";
  const forceOrientation = !!getWidgetValue(node, "force_orientation");
  const divisible = !!getWidgetValue(node, "divisible_by");
  const multiple = divisible ? Math.max(toNumber(getWidgetValue(node, "divisible_by_value"), 1), 1) : 1;
  const roundingMode = getWidgetValue(node, "rounding_mode") || "nearest";
  const pixelMatchMode = getWidgetValue(node, "pixel_match_mode") || "closest";
  const limitMaxPixels = !!getWidgetValue(node, "limit_max_pixels");
  const maxPixels = toNumber(getWidgetValue(node, "max_pixels"), 0);
  const commonFamilyFlags = getCommonFamilyFlags(node);
  const inputDims = getLinkedInputImageDimensions(node);
  const loadImageSource = isNativeLoadImageNode(getLinkedImageSourceNode(node));
  const aspectSource = getWidgetValue(node, "aspect_source");
  const exactDimensionsMode = mode === "Exact" || (mode === "Aspect" && aspectSource === "Exact Dimensions");

  let width = null;
  let height = null;
  let status = null;

  if (exactDimensionsMode) {
    width = toNumber(getWidgetValue(node, "width"), 1024);
    height = toNumber(getWidgetValue(node, "height"), 1024);
  } else if (mode === "Aspect") {
    const sizeMode = getWidgetValue(node, "size_mode");
    const ratio = getAspectRatioFromSource(node, aspectSource, orientation);

    if (!ratio) {
      status = aspectSource === "Image"
        ? (loadImageSource
          ? "Preview is waiting on the connected Load Image dimensions."
          : "Preview needs a direct native Load Image source to resolve image-based aspect ratio before execution.")
        : "Aspect settings are incomplete.";
    } else if (sizeMode === "Target Megapixels") {
      const target = toNumber(getWidgetValue(node, "target_megapixels"), 1) * 1_000_000;
      [width, height] = fitRatioToPixels(ratio, target, multiple, pixelMatchMode);
    } else if (sizeMode === "Target Pixels") {
      const target = toNumber(getWidgetValue(node, "target_pixels"), 1_000_000);
      [width, height] = fitRatioToPixels(ratio, target, multiple, pixelMatchMode);
    } else if (sizeMode === "Target Width") {
      width = toNumber(getWidgetValue(node, "target_width"), 1024);
      height = ratio ? width / ratio : toNumber(getWidgetValue(node, "target_height"), 1024);
    } else if (sizeMode === "Target Height") {
      height = toNumber(getWidgetValue(node, "target_height"), 1024);
      width = ratio ? height * ratio : toNumber(getWidgetValue(node, "target_width"), 1024);
    } else if (sizeMode === "Common (Pick)") {
      const parsed = parseResolutionText(getWidgetValue(node, "common_resolution"));
      if (parsed) {
        [width, height] = parsed;
      } else {
        const candidates = getCommonCandidates(ratio, orientation, commonFamilyFlags);
        if (candidates.length) {
          [width, height] = candidates[0];
        }
      }
    } else if (sizeMode === "Common (Closest)") {
      const units = getWidgetValue(node, "common_target_units");
      const value = toNumber(getWidgetValue(node, "common_target_value"), 1);
      const target = units === "pixels" ? value : value * 1_000_000;
      const candidates = getCommonCandidates(ratio, orientation, commonFamilyFlags);
      const chosen = selectCommonByTarget(candidates, target, pixelMatchMode);
      if (chosen) {
        [width, height] = chosen;
      }
    }
  } else if (mode === "Image") {
    if (!inputDims?.width || !inputDims?.height) {
      status = loadImageSource
        ? "Preview is waiting on the connected Load Image dimensions."
        : "Preview needs a direct native Load Image source to resolve image sizing before execution.";
    } else {
      const baseWidth = inputDims.width;
      const baseHeight = inputDims.height;
      const ratio = baseWidth / Math.max(baseHeight, 1);
      const imageMode = getWidgetValue(node, "image_mode") || "Use Image Size";

      if (imageMode === "Use Image Size") {
        width = baseWidth;
        height = baseHeight;
      } else if (imageMode === "Scale Factor") {
        const scale = Math.max(toNumber(getWidgetValue(node, "scale_factor"), 1), 0.01);
        width = baseWidth * scale;
        height = baseHeight * scale;
      } else if (imageMode === "Target Megapixels") {
        const target = toNumber(getWidgetValue(node, "target_megapixels"), 1) * 1_000_000;
        [width, height] = fitRatioToPixels(ratio, target, multiple, pixelMatchMode);
      } else if (imageMode === "Target Pixels") {
        const target = toNumber(getWidgetValue(node, "target_pixels"), 1_000_000);
        [width, height] = fitRatioToPixels(ratio, target, multiple, pixelMatchMode);
      } else if (imageMode === "Fit Long Side") {
        const longSide = Math.max(toNumber(getWidgetValue(node, "target_long_side"), 1024), 1);
        const scale = longSide / Math.max(baseWidth, baseHeight);
        width = baseWidth * scale;
        height = baseHeight * scale;
      } else if (imageMode === "Fit Short Side") {
        const shortSide = Math.max(toNumber(getWidgetValue(node, "target_short_side"), 768), 1);
        const scale = shortSide / Math.min(baseWidth, baseHeight);
        width = baseWidth * scale;
        height = baseHeight * scale;
      } else {
        width = baseWidth;
        height = baseHeight;
      }
    }
  }

  if (width == null || height == null) {
    return {
      width: null,
      height: null,
      pixelCount: null,
      text: "",
      status,
      hasPreview: false,
      constrained: false,
    };
  }

  let constrained = false;
  if (limitMaxPixels) {
    const area = width * height;
    [width, height] = applyMaxPixels(width, height, Math.max(maxPixels, 1));
    constrained = area > Math.max(maxPixels, 1);
  }

  [width, height] = applyOutputCaps(width, height);

  let [widthInt, heightInt] = roundDims(width, height, multiple, roundingMode);
  if (widthInt > MAX_DIMENSION || heightInt > MAX_DIMENSION || (widthInt * heightInt) > MAX_TOTAL_PIXELS) {
    [width, height] = applyOutputCaps(widthInt, heightInt);
    [widthInt, heightInt] = roundDims(width, height, multiple, "floor");
  }
  const force = (mode === "Aspect" && !exactDimensionsMode) || forceOrientation;
  if (force && orientation !== "auto") {
    [widthInt, heightInt] = enforceOrientation(widthInt, heightInt, orientation);
  }

  const pixelCount = widthInt * heightInt;
  return {
    width: widthInt,
    height: heightInt,
    pixelCount,
    text: `${widthInt}x${heightInt} | ${pixelCount.toLocaleString()} px`,
    status,
    hasPreview: true,
    constrained,
  };
}

function getFavorites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function setFavorites(values) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(values));
  } catch {
    // Storage can be unavailable in some runtimes.
  }
}

function toggleFavorite(label) {
  const next = new Set(getFavorites());
  if (next.has(label)) {
    next.delete(label);
  } else {
    next.add(label);
  }
  setFavorites(Array.from(next));
}

function setWidgetValue(node, name, value) {
  const widget = findWidget(node, name);
  if (!widget) {
    return;
  }
  const nextValue = typeof widget.value === "number" || widget.type === "number" ? Number(value) : value;
  widget.value = nextValue;
  if (widget.element) {
    if (widget.element.type === "checkbox") {
      widget.element.checked = !!nextValue;
    } else if ("value" in widget.element) {
      widget.element.value = String(nextValue);
    }
  }
}

function findClosestLegacyCommonOption(targetLabel, fallbackAspectLabel, orientation) {
  const parsed = parseResolutionText(targetLabel);
  const key = orientation === "square" ? "1:1" : parseRatioLabel(fallbackAspectLabel).land;
  const records = key && COMMON_RESOLUTIONS[key]
    ? buildCommonOptionRecords([{ key: "common", label: "Common", map: { [key]: COMMON_RESOLUTIONS[key] } }], orientation === "square" ? "auto" : orientation, key)
    : buildCommonOptionRecords([{ key: "common", label: "Common", map: COMMON_RESOLUTIONS }], orientation === "square" ? "auto" : orientation);
  const options = records.map((record) => record.value);
  if (!options.length) {
    return null;
  }
  return parsed ? findClosestCommonOptionValue(targetLabel, options) : options[0];
}

function bootstrapSdxlState(node) {
  if (!SHOW_SDXL_CONTROLS) {
    return;
  }
  if (node._lericoRfV2SdxlBootstrapped) {
    return;
  }
  node._lericoRfV2SdxlBootstrapped = true;

  const currentAspect = getWidgetValue(node, "aspect_ratio");
  const currentCommon = getWidgetValue(node, "common_resolution");
  if (isSdxlAspectLabel(currentAspect) || /\(SDXL\)/.test(String(currentCommon || ""))) {
    setWidgetValue(node, "sdxl_resolutions", true);
  }
}

function enforceHiddenFeatureFlags(node) {
  if (!SHOW_SDXL_CONTROLS && getWidgetValue(node, "sdxl_resolutions")) {
    disableSdxlState(node);
    setWidgetValue(node, "sdxl_resolutions", false);
  }
}

function bootstrapLegacyExactMode(node) {
  if (node._lericoRfV2ExactBootstrapped) {
    return;
  }
  node._lericoRfV2ExactBootstrapped = true;

  if (getWidgetValue(node, "mode") === "Exact") {
    setWidgetValue(node, "mode", "Aspect");
    setWidgetValue(node, "aspect_source", "Exact Dimensions");
  }
}

function disableSdxlState(node) {
  const currentAspect = getWidgetValue(node, "aspect_ratio");
  const orientation = getWidgetValue(node, "orientation") || "auto";
  const remappedAspect = getLegacyAspectFallback(currentAspect);

  if (remappedAspect !== currentAspect) {
    setWidgetValue(node, "aspect_ratio", remappedAspect);
  }

  const currentCommon = String(getWidgetValue(node, "common_resolution") || "");
  if (/\(SDXL\)/.test(currentCommon)) {
    const nextOption = findClosestLegacyCommonOption(currentCommon, remappedAspect, orientation);
    if (nextOption) {
      setWidgetValue(node, "common_resolution", nextOption);
    }
  }
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(value, maximum));
}

function sanitizeWidgetNumber(node, name, value) {
  switch (name) {
    case "width":
    case "height":
    case "target_width":
    case "target_height":
    case "target_long_side":
    case "target_short_side":
      return Math.round(clamp(value, 1, MAX_DIMENSION));
    case "aspect_width":
    case "aspect_height":
      return Math.round(clamp(value, 1, MAX_RATIO_COMPONENT));
    case "target_pixels":
    case "max_pixels":
      return Math.round(clamp(value, 1, MAX_TOTAL_PIXELS));
    case "target_megapixels":
      return clamp(value, 0.01, MAX_MEGAPIXELS);
    case "common_target_value":
      return getWidgetValue(node, "common_target_units") === "pixels"
        ? clamp(value, 1, MAX_TOTAL_PIXELS)
        : clamp(value, 0.01, MAX_MEGAPIXELS);
    case "scale_factor":
      return clamp(value, 0.01, 10);
    default:
      return value;
  }
}

function normalizeSanityBounds(node) {
  const numericWidgets = [
    "width",
    "height",
    "max_pixels",
    "aspect_width",
    "aspect_height",
    "target_megapixels",
    "target_pixels",
    "target_width",
    "target_height",
    "common_target_value",
    "scale_factor",
    "target_long_side",
    "target_short_side",
  ];

  for (const name of numericWidgets) {
    const current = getWidgetValue(node, name);
    if (typeof current !== "number" || !Number.isFinite(current)) {
      continue;
    }
    const sanitized = sanitizeWidgetNumber(node, name, current);
    if (sanitized !== current) {
      setWidgetValue(node, name, sanitized);
    }
  }
}

function getDraftStore(node) {
  if (!node._lericoRfV2Drafts) {
    node._lericoRfV2Drafts = {};
  }
  return node._lericoRfV2Drafts;
}

function getInputDraftValue(node, name, fallback) {
  const drafts = getDraftStore(node);
  return Object.prototype.hasOwnProperty.call(drafts, name) ? drafts[name] : String(fallback);
}

function setInputDraftValue(node, name, value) {
  getDraftStore(node)[name] = value;
}

function clearInputDraftValue(node, name) {
  delete getDraftStore(node)[name];
}

function isFloatWidget(name) {
  return FLOAT_WIDGETS.has(name);
}

function parseDraftNumber(name, raw) {
  const text = String(raw ?? "").trim();
  if (text === "") {
    return { valid: false, incomplete: true };
  }

  const floatPattern = /^-?(?:\d+)?(?:\.\d*)?$/;
  const intPattern = /^-?\d+$/;

  if (isFloatWidget(name)) {
    if (!floatPattern.test(text) || text === "-" || text === "." || text === "-.") {
      return { valid: false, incomplete: true };
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? { valid: true, value: parsed } : { valid: false, incomplete: true };
  }

  if (!intPattern.test(text)) {
    return { valid: false, incomplete: true };
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? { valid: true, value: parsed } : { valid: false, incomplete: true };
}

function quantizeToStep(value, step, minimum) {
  if (!Number.isFinite(step) || step <= 0) {
    return value;
  }
  const base = Number.isFinite(minimum) ? minimum : 0;
  const snapped = Math.round((value - base) / step) * step + base;
  const precision = step >= 1 ? 0 : Math.min(6, String(step).split(".")[1]?.length || 0);
  return precision > 0 ? Number(snapped.toFixed(precision)) : Math.round(snapped);
}

function getSliderConfig(name, node = null) {
  if (name === "common_target_value") {
    const units = getWidgetValue(node, "common_target_units") === "pixels" ? "pixels" : "megapixels";
    return units === "pixels"
      ? {
        ...SLIDER_WIDGETS.target_pixels,
        label: "Target Pixels",
      }
      : {
        ...SLIDER_WIDGETS.target_megapixels,
        label: "Target Megapixels",
      };
  }
  return SLIDER_WIDGETS[name] || null;
}

function getSliderResolvedValue(node, name, rawSliderValue) {
  const config = getSliderConfig(name, node);
  if (!config) {
    return sanitizeWidgetNumber(node, name, Number(rawSliderValue));
  }
  const mapped = config.fromSlider(Number(rawSliderValue));
  const quantized = quantizeToStep(mapped, config.step, config.min);
  const clamped = clamp(quantized, config.min, config.max);
  return sanitizeWidgetNumber(node, name, clamped);
}

function getSliderElementPercent(element) {
  const min = Number(element.min);
  const max = Number(element.max);
  const value = Number(element.value);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return 0;
  }
  return ((value - min) / (max - min)) * 100;
}

function updateSliderElementVisual(element) {
  if (!element) {
    return;
  }
  element.style.setProperty("--rf-slider-fill", `${getSliderElementPercent(element)}`);
}

function updateSliderDisplay(node, element) {
  if (!element) {
    return;
  }
  const config = getSliderConfig(element.dataset.widget, node);
  if (!config) {
    return;
  }
  const valueNode = element.closest("[data-slider-shell]")?.querySelector("[data-slider-value]");
  const resolvedValue = getSliderResolvedValue(node, element.dataset.widget, element.value);
  if (valueNode) {
    valueNode.textContent = config.format(resolvedValue);
  }
  updateSliderElementVisual(element);
}

function renderSliderField(node, name, fallback) {
  const config = getSliderConfig(name, node);
  if (!config) {
    return "";
  }
  const widgetValue = sanitizeWidgetNumber(node, name, toNumber(getWidgetValue(node, name), fallback));
  const sliderValue = clamp(config.toSlider(widgetValue), config.sliderMin, config.sliderMax);
  const percent = config.sliderMax > config.sliderMin
    ? ((sliderValue - config.sliderMin) / (config.sliderMax - config.sliderMin)) * 100
    : 0;
  return `
    <div class="lerico-rfv2__sliderField" data-slider-shell="${name}">
      <div class="lerico-rfv2__sliderHeader">
        <span class="lerico-rfv2__sliderLabel">${config.label}</span>
        <span class="lerico-rfv2__sliderValue" data-slider-value>${config.format(widgetValue)}</span>
      </div>
      <input
        class="lerico-rfv2__slider"
        type="range"
        min="${config.sliderMin}"
        max="${config.sliderMax}"
        step="${config.sliderStep}"
        value="${sliderValue}"
        data-action="set-slider"
        data-widget="${name}"
        style="--rf-slider-fill:${percent};"
      />
    </div>
  `;
}

function captureFocusState(root) {
  const active = document.activeElement;
  if (!root || !active || !root.contains(active)) {
    return null;
  }

  const state = {
    tagName: active.tagName?.toLowerCase() || "",
    widget: active.dataset?.widget || "",
    action: active.dataset?.action || "",
    type: active.type || "",
    value: "value" in active ? active.value : null,
    selectionStart: null,
    selectionEnd: null,
  };

  try {
    if (typeof active.selectionStart === "number" && typeof active.selectionEnd === "number") {
      state.selectionStart = active.selectionStart;
      state.selectionEnd = active.selectionEnd;
    }
  } catch {
    // Some input types do not expose selection state.
  }

  return state.widget || state.action ? state : null;
}

function restoreFocusState(root, focusState) {
  if (!root || !focusState) {
    return;
  }

  let selector = "";
  if (focusState.widget) {
    selector = `${focusState.tagName || ""}[data-widget="${focusState.widget}"]`;
  } else if (focusState.action) {
    selector = `${focusState.tagName || ""}[data-action="${focusState.action}"]`;
  }
  if (!selector) {
    return;
  }

  const target = root.querySelector(selector);
  if (!target || typeof target.focus !== "function") {
    return;
  }

  target.focus({ preventScroll: true });

  if (focusState.value != null && "value" in target && target.value !== focusState.value) {
    target.value = focusState.value;
  }

  try {
    if (typeof target.setSelectionRange === "function" && focusState.selectionStart != null && focusState.selectionEnd != null) {
      target.setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
    }
  } catch {
    // Ignore unsupported selection restoration.
  }
}

function applyOutputCaps(width, height) {
  let safeWidth = Math.max(Number(width) || 0, 1);
  let safeHeight = Math.max(Number(height) || 0, 1);
  const area = safeWidth * safeHeight;
  let scale = 1;

  if (safeWidth > MAX_DIMENSION) {
    scale = Math.min(scale, MAX_DIMENSION / safeWidth);
  }
  if (safeHeight > MAX_DIMENSION) {
    scale = Math.min(scale, MAX_DIMENSION / safeHeight);
  }
  if (area > MAX_TOTAL_PIXELS && area > 0) {
    scale = Math.min(scale, Math.sqrt(MAX_TOTAL_PIXELS / area));
  }

  if (scale < 1) {
    safeWidth *= scale;
    safeHeight *= scale;
  }

  return [safeWidth, safeHeight];
}

function measurePanelContentHeight(node) {
  const root = node._lericoRfV2?.root;
  const panel = root?.firstElementChild;
  if (!panel) {
    return MIN_HEIGHT;
  }

  const rectHeight = Math.ceil(panel.getBoundingClientRect().height || 0);
  const scrollHeight = Math.ceil(panel.scrollHeight || 0);
  const offsetHeight = Math.ceil(panel.offsetHeight || 0);
  const measured = Math.max(rectHeight, scrollHeight, offsetHeight, MIN_HEIGHT - 24);
  return measured;
}

function fitNode(node) {
  if (!node._lericoRfV2?.root || !node.setSize) {
    return;
  }

  const width = Math.max(node.size?.[0] || MIN_WIDTH, MIN_WIDTH);
  const height = Math.max(measurePanelContentHeight(node) + 24, MIN_HEIGHT);

  if (Math.abs((node.size?.[1] || 0) - height) < 2 && Math.abs((node.size?.[0] || 0) - width) < 2) {
    return;
  }

  node.setSize([width, height]);
  node?.graph?.setDirtyCanvas?.(true, true);
  node?.setDirtyCanvas?.(true, true);
}

function applyNodeState(node) {
  if (node._lericoRfV2Applying) {
    return;
  }
  node._lericoRfV2Applying = true;
  try {
    bootstrapLegacyExactMode(node);
    bootstrapSdxlState(node);
    enforceHiddenFeatureFlags(node);
    ensureLinkedInputImageDimensions(node);
    normalizeSanityBounds(node);
    updateCommonOptions(node);
    const mode = getWidgetValue(node, "mode");
    const aspectSource = getWidgetValue(node, "aspect_source");
    const showImageInput = mode === "Image" || (mode === "Aspect" && aspectSource === "Image");
    setInputVisible(node, "image", "IMAGE", showImageInput);

    for (const widget of node.widgets || []) {
      if (widget.name === PANEL_WIDGET || widget._lericoRfV2Dom) {
        setWidgetHidden(widget, false);
      } else {
        setWidgetHidden(widget, true);
      }
    }

    renderPanel(node);
    fitNode(node);
  } finally {
    node._lericoRfV2Applying = false;
  }
}

function orientationMarkup(current) {
  return Object.entries(ORIENTATION_META).map(([value, meta]) => `
    <button class="lerico-rfv2__orientation ${current === value ? "is-active" : ""}" data-action="set-widget" data-widget="orientation" data-value="${value}" title="${meta.label}">
      <span class="lerico-rfv2__orientationIcon">${meta.icon}</span>
      <span class="lerico-rfv2__orientationLabel">${meta.label}</span>
    </button>
  `).join("");
}

function favoritesMarkup(aspectLabels, favorites, currentAspect) {
  const favoriteLabels = aspectLabels.filter((label) => favorites.includes(label));
  if (!favoriteLabels.length) {
    return "";
  }
  return `
    <div style="margin-bottom: 8px;">
      <div class="lerico-rfv2__sectionTitle">Pinned Ratios</div>
      <div class="lerico-rfv2__chips">
        ${favoriteLabels.map((label) => `
          <button class="lerico-rfv2__chip ${isSdxlAspectLabel(label) ? "lerico-rfv2__chip--sdxl " : ""}${currentAspect === label ? "is-active" : ""}" data-action="set-aspect-ratio" data-value="${label}">
            ${ratioChipContent(label)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function commonAspectMarkup(aspectLabels, favorites, currentAspect, includeSdxl) {
  const ordered = [
    ...aspectLabels.filter((label) => favorites.includes(label)),
    ...aspectLabels.filter((label) => !favorites.includes(label)),
  ];
  const legacy = ordered.filter((label) => !isSdxlAspectLabel(label)).slice(0, 10);
  const sdxl = includeSdxl ? ordered.filter((label) => isSdxlAspectLabel(label)) : [];

  return `
    <div class="lerico-rfv2__sectionTitle">Common Ratios</div>
    <div class="lerico-rfv2__ratios">
      ${legacy.map((label) => `
        <button class="lerico-rfv2__chip ${currentAspect === label ? "is-active" : ""}" data-action="set-aspect-ratio" data-value="${label}">
          ${ratioChipContent(label)}
        </button>
      `).join("")}
    </div>
    ${sdxl.length ? `
      <div class="lerico-rfv2__sectionTitle">SDXL Ratios</div>
      <div class="lerico-rfv2__ratios">
        ${sdxl.map((label) => `
          <button class="lerico-rfv2__chip lerico-rfv2__chip--sdxl ${currentAspect === label ? "is-active" : ""}" data-action="set-aspect-ratio" data-value="${label}">
            ${ratioChipContent(label)}
          </button>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function ratioChipContent(label) {
  const [landText, portText] = parseDualRatio(label);
  const land = (landText || "").trim();
  const port = (portText || "").trim();

  if (!land || land === port) {
    return `<span class="lerico-rfv2__chipRatioLine">${land || label}</span>`;
  }

  return `
    <span class="lerico-rfv2__chipRatio">
      <span class="lerico-rfv2__chipRatioLine">${land}</span>
      <span class="lerico-rfv2__chipRatioDivider"></span>
      <span class="lerico-rfv2__chipRatioLine">${port}</span>
    </span>
  `;
}

function renderModeCards(mode) {
  return Object.entries(MODE_META).map(([value, meta]) => `
    <button class="lerico-rfv2__button ${mode === value ? "is-active" : ""}" data-action="set-widget" data-widget="mode" data-value="${value}" title="${meta.hint}">
      <div class="lerico-rfv2__buttonTop">
        <span class="lerico-rfv2__buttonIcon">${meta.icon}</span>
        <span class="lerico-rfv2__buttonTitle">${meta.label}</span>
      </div>
    </button>
  `).join("");
}

function renderAspectSourceCards(aspectSource) {
  return Object.entries(ASPECT_SOURCE_META).map(([value, meta]) => `
    <button class="lerico-rfv2__card ${aspectSource === value ? "is-active" : ""}" data-action="set-widget" data-widget="aspect_source" data-value="${value}" title="${meta.hint}">
      <span class="lerico-rfv2__iconChip">${meta.icon}</span>
      <span>
        <span class="lerico-rfv2__cardLabel">${meta.label}</span>
      </span>
    </button>
  `).join("");
}

function renderStrategyCards(metaMap, current, widget) {
  return Object.entries(metaMap).map(([value, meta]) => `
    <button class="lerico-rfv2__card ${current === value ? "is-active" : ""}" data-action="set-widget" data-widget="${widget}" data-value="${value}" title="${meta.hint}">
      <span>
        <span class="lerico-rfv2__cardLabel">${meta.label}</span>
      </span>
    </button>
  `).join("");
}

function getResolutionFormatDraft(node) {
  const modal = node._lericoRfV2FormatModal;
  if (modal?.open) {
    return modal.draft ?? "";
  }
  return getWidgetValue(node, "resolution_format") ?? DEFAULT_RESOLUTION_FORMAT;
}

function renderFormatModal(node) {
  const modal = node._lericoRfV2FormatModal;
  if (!modal?.open) {
    return "";
  }

  const draft = getResolutionFormatDraft(node);
  const dims = getFormatPreviewDims(node);
  const formatted = formatResolutionString(draft, dims.width, dims.height);
  const error = formatted.valid
    ? (dims.executionDependent ? "Preview uses sample dimensions until the result can be computed." : "")
    : `${formatted.message} Default preview shown.`;
  const tokenTitles = {
    "{w}": "Final output width.",
    "{h}": "Final output height.",
    "{ar}": "Simplified aspect ratio, such as 16:9.",
    "{ar_decimal}": "Decimal aspect ratio with three decimals.",
    "{n_px}": "Final pixel count as an integer.",
    "{mp}": "Final megapixels with two decimals.",
    "{orientation}": "Final orientation: landscape, portrait, or square.",
  };

  return `
    <div class="lerico-rfv2__modalOverlay" data-action="cancel-format">
      <div class="lerico-rfv2__modal" data-modal-stop="true">
        <div class="lerico-rfv2__modalHeader">
          <div class="lerico-rfv2__modalTitle">Resolution Format</div>
        </div>
        <div class="lerico-rfv2__modalBody">
          <input class="lerico-rfv2__formatInput" type="text" maxlength="${MAX_RESOLUTION_FORMAT_LENGTH}" value="${escapeHtml(draft)}" data-action="set-format-draft" autofocus />
          <div class="lerico-rfv2__tokenRow">
            ${["{w}", "{h}", "{ar}", "{ar_decimal}", "{n_px}", "{mp}", "{orientation}"].map((token) => `
              <span class="lerico-rfv2__token" title="${escapeHtml(tokenTitles[token])}">${token}</span>
            `).join("")}
          </div>
          <div class="lerico-rfv2__modalPreview" data-format-preview>${escapeHtml(formatted.value)}</div>
          <div class="lerico-rfv2__modalError" data-format-error>${escapeHtml(error)}</div>
          <div class="lerico-rfv2__modalActions">
            <button class="lerico-rfv2__modalButton" data-action="reset-format">Reset</button>
            <button class="lerico-rfv2__modalButton" data-action="cancel-format">Cancel</button>
            <button class="lerico-rfv2__modalButton is-primary" data-action="apply-format">Apply</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateFormatModalPreview(node, input) {
  const root = node._lericoRfV2?.root;
  if (!root) {
    return;
  }
  const draft = input.value;
  const dims = getFormatPreviewDims(node);
  const formatted = formatResolutionString(draft, dims.width, dims.height);
  const preview = root.querySelector("[data-format-preview]");
  const error = root.querySelector("[data-format-error]");
  if (preview) {
    preview.textContent = formatted.value;
  }
  if (error) {
    error.textContent = formatted.valid
      ? (dims.executionDependent ? "Preview uses sample dimensions until the result can be computed." : "")
      : `${formatted.message} Default preview shown.`;
  }
}

function renderPanel(node) {
  const root = node._lericoRfV2?.root;
  if (!root) {
    return;
  }

  const focusState = captureFocusState(root);

  const mode = getWidgetValue(node, "mode") || "Aspect";
  const orientation = getWidgetValue(node, "orientation") || "auto";
  const aspectSource = getWidgetValue(node, "aspect_source") || "Aspect Ratio";
  const sizeMode = getWidgetValue(node, "size_mode") || "Target Megapixels";
  const imageMode = getWidgetValue(node, "image_mode") || "Use Image Size";
  const divisible = !!getWidgetValue(node, "divisible_by");
  const forceOrientation = !!getWidgetValue(node, "force_orientation");
  const limitMaxPixels = !!getWidgetValue(node, "limit_max_pixels");
  const roundingMode = getWidgetValue(node, "rounding_mode") || "nearest";
  const pixelMatchMode = getWidgetValue(node, "pixel_match_mode") || "closest";
  const preview = computePreview(node);
  const inputDims = getLinkedInputImageDimensions(node);
  const commonFamilyFlags = getCommonFamilyFlags(node);
  const includeSdxl = SHOW_SDXL_CONTROLS && !!getWidgetValue(node, "sdxl_resolutions");
  const aspectLabels = findWidget(node, "aspect_ratio")?.options?.values || [];
  const visibleAspectLabels = includeSdxl
    ? aspectLabels
    : aspectLabels.filter((label) => !isSdxlAspectLabel(label));
  const commonOptionGroups = findWidget(node, "common_resolution")?.__lericoRfV2OptionGroups || [];
  const favorites = getFavorites();
  const currentAspect = getWidgetValue(node, "aspect_ratio");
  const favoriteActive = favorites.includes(currentAspect);
  const imageLinked = isImageLinked(node);
  const exactDimensionsMode = mode === "Aspect" && aspectSource === "Exact Dimensions";
  const megapixels = preview.pixelCount ? (preview.pixelCount / 1_000_000).toFixed(2) : "--";
  const ratioText = preview.hasPreview && preview.height
    ? `${(preview.width / preview.height).toFixed(3)} : 1`
    : (aspectSource === "Width+Height"
      ? `${toNumber(getWidgetValue(node, "aspect_width"), 1)}:${toNumber(getWidgetValue(node, "aspect_height"), 1)}`
      : (currentAspect || "--"));

  const warnings = [];
  if (mode === "Image" && !imageLinked) {
    warnings.push({ text: "Image mode is active, but no image is connected yet.", danger: true });
  }
  if (mode === "Aspect" && aspectSource === "Image" && !imageLinked) {
    warnings.push({ text: "Aspect-from-image needs the optional image input to be connected.", danger: true });
  } else if (mode === "Aspect" && aspectSource === "Image" && imageLinked && inputDims) {
    warnings.push({ text: `Input image detected: ${inputDims.width} x ${inputDims.height}. Aspect preview is live from the connected Load Image node.`, danger: false });
  } else if (mode === "Aspect" && aspectSource === "Image" && imageLinked && !inputDims) {
    warnings.push({ text: "Image is connected, but live aspect preview only resolves automatically from a direct native Load Image source.", danger: false });
  }
  if (mode === "Image" && imageLinked && inputDims) {
    warnings.push({ text: `Input image detected: ${inputDims.width} x ${inputDims.height}. Image-mode preview is live from the connected Load Image node.`, danger: false });
  } else if (mode === "Image" && imageLinked && !inputDims) {
    warnings.push({ text: "Image is connected, but live image-mode preview only resolves automatically from a direct native Load Image source.", danger: false });
  }
  if (preview.constrained) {
    warnings.push({ text: "Max pixel limiting is scaling the current result down.", danger: false });
  }
  if (orientation === "square" && mode === "Image") {
    warnings.push({ text: "Square orientation in Image mode will only be finalized when the input image is known.", danger: false });
  }

  const frameMarkup = preview.hasPreview
    ? (() => {
      const maxWidth = 200;
      const maxHeight = 112;
      const minTextWidth = 76;
      const ratio = preview.width / Math.max(preview.height, 1);
      let frameWidth = maxWidth;
      let frameHeight = Math.max(54, Math.round(frameWidth / ratio));
      if (frameHeight > maxHeight) {
        frameHeight = maxHeight;
        frameWidth = Math.max(54, Math.round(frameHeight * ratio));
      }
      frameWidth = Math.max(frameWidth, minTextWidth);
      const label = `${preview.width} x ${preview.height}`;
      const frameTextSize = Math.max(8, Math.min(10.5, (frameWidth - 10) / Math.max(label.length * 0.62, 1)));
      return `
        <div class="lerico-rfv2__frame" style="width:${frameWidth}px; height:${frameHeight}px;">
          <div class="lerico-rfv2__frameText" style="--rf-frame-text-size:${frameTextSize.toFixed(2)}px;">${label}</div>
        </div>
      `;
    })()
    : `
      <div class="lerico-rfv2__placeholder">
        <div class="lerico-rfv2__placeholderIcon">${SVGS.image}</div>
        <div>${preview.status || "Result preview depends on execution."}</div>
      </div>
    `;

  root.innerHTML = `
    <div class="lerico-rfv2">
      <div class="lerico-rfv2__header">
        <div>
          <div class="lerico-rfv2__title">
            <span class="lerico-rfv2__titleIcon">${SVGS.title}</span>
            <span>Resolution Forge V2</span>
          </div>
        </div>
        <div class="lerico-rfv2__headerActions">
          <button class="lerico-rfv2__favorite ${commonFamilyFlags.includeIteration ? "is-active" : ""}" data-action="toggle-widget" data-widget="iteration_resolutions" title="Enable lower-resolution iteration presets for faster motion and video passes.">
            Iteration
          </button>
          <button class="lerico-rfv2__favorite ${commonFamilyFlags.includeHighDetail ? "is-active" : ""}" data-action="toggle-widget" data-widget="high_detail_resolutions" title="Enable additional medium and high-detail image generation presets.">
            High Detail
          </button>
          <button class="lerico-rfv2__favorite ${commonFamilyFlags.includeExtended ? "is-active" : ""}" data-action="toggle-widget" data-widget="extended_resolutions" title="Enable larger extended presets beyond the default common set.">
            Extended
          </button>
          ${SHOW_SDXL_CONTROLS ? `
          <button class="lerico-rfv2__favorite ${includeSdxl ? "is-active" : ""}" data-action="toggle-widget" data-widget="sdxl_resolutions" title="Enable official SDXL-native ratios and common resolutions.">
            SDXL Resolutions
          </button>
          ` : ""}
          <button class="lerico-rfv2__favorite" data-action="toggle-favorite" title="Pin or unpin the current preset aspect ratio.">
            ${favoriteActive ? "Pinned Ratio" : "Pin Ratio"}
          </button>
        </div>
      </div>

      <div class="lerico-rfv2__section">
        <div class="lerico-rfv2__sectionTitle">Mode</div>
        <div class="lerico-rfv2__modeGrid">
          ${renderModeCards(mode)}
        </div>
      </div>

      <div class="lerico-rfv2__section">
        <div class="lerico-rfv2__sectionTitle">Orientation</div>
        <div class="lerico-rfv2__stack">
        <div class="lerico-rfv2__orientationGrid">
          ${orientationMarkup(orientation)}
        </div>
        <div class="lerico-rfv2__controlRow">
          <button class="lerico-rfv2__toggle ${forceOrientation ? "is-active" : ""}" data-action="toggle-widget" data-widget="force_orientation" title="Swap width and height when needed in Exact Dimensions and Image modes.">
            <div class="lerico-rfv2__toggleText">
              <strong>Force Orientation</strong>
              <span>Swap width and height when needed in Exact Dimensions and Image modes.</span>
            </div>
            <div class="lerico-rfv2__toggleMark"></div>
          </button>
          <button class="lerico-rfv2__toggle ${limitMaxPixels ? "is-active" : ""}" data-action="toggle-widget" data-widget="limit_max_pixels" title="Scale down automatically when the total pixel count gets too high.">
            <div class="lerico-rfv2__toggleText">
              <strong>Cap Max Pixels</strong>
              <span>Scale down automatically when the total pixel count gets too high.</span>
            </div>
            <div class="lerico-rfv2__toggleMark"></div>
          </button>
          <button class="lerico-rfv2__toggle ${divisible ? "is-active" : ""}" data-action="toggle-widget" data-widget="divisible_by" title="Snap the result to 16, 32, or 64 for model-friendly dimensions.">
            <div class="lerico-rfv2__toggleText">
              <strong>Divisible Output</strong>
              <span>Snap the result to 16, 32, or 64 for model-friendly dimensions.</span>
            </div>
            <div class="lerico-rfv2__toggleMark"></div>
          </button>
          <div class="lerico-rfv2__selectShell" title="How dimension snapping rounds when divisibility is enabled.">
            <span class="lerico-rfv2__selectShellLabel">Rounding</span>
            <select data-action="set-widget" data-widget="rounding_mode">
              ${["nearest", "floor", "ceil"].map((value) => `
                <option value="${value}" ${roundingMode === value ? "selected" : ""}>${value}</option>
              `).join("")}
            </select>
          </div>
        </div>
        </div>
      </div>

      ${mode === "Aspect" ? `
        <div class="lerico-rfv2__section">
          <div class="lerico-rfv2__sectionTitle">Manual Source</div>
          <div class="lerico-rfv2__stack">
          <div class="lerico-rfv2__toolbar">
            ${renderAspectSourceCards(aspectSource)}
          </div>

          ${aspectSource === "Exact Dimensions" ? `
            <div class="lerico-rfv2__grid">
              <div class="lerico-rfv2__field">
                <label>Width</label>
                <input type="text" inputmode="numeric" value="${getInputDraftValue(node, "width", toNumber(getWidgetValue(node, "width"), 1024))}" data-action="set-number" data-widget="width" />
              </div>
              <div class="lerico-rfv2__field">
                <label>Height</label>
                <input type="text" inputmode="numeric" value="${getInputDraftValue(node, "height", toNumber(getWidgetValue(node, "height"), 1024))}" data-action="set-number" data-widget="height" />
              </div>
            </div>
          ` : ""}

          ${aspectSource === "Aspect Ratio" ? `
            ${favoritesMarkup(visibleAspectLabels, favorites, currentAspect)}
            ${commonAspectMarkup(visibleAspectLabels, favorites, currentAspect, includeSdxl)}
          ` : ""}

          ${aspectSource === "Width+Height" ? `
            <div class="lerico-rfv2__grid">
              ${renderSliderField(node, "aspect_width", 1)}
              ${renderSliderField(node, "aspect_height", 1)}
            </div>
          ` : ""}

          ${aspectSource === "Image" ? `
            <div class="lerico-rfv2__warning ${imageLinked ? "" : "is-danger"}" style="margin-top:10px;">
              ${imageLinked
                ? (inputDims
                  ? `Aspect Source is reading the connected Load Image dimensions live: ${inputDims.width} x ${inputDims.height}.`
                  : "Aspect Source is set to Image. Live preview works when the input comes directly from a native Load Image node; other sources still resolve at execution time.")
                : "Aspect Source is set to Image. Connect an image to derive the ratio."}
            </div>
          ` : ""}
          </div>
        </div>

        ${!exactDimensionsMode ? `
        <div class="lerico-rfv2__section">
          <div class="lerico-rfv2__sectionTitle">Sizing</div>
          <div class="lerico-rfv2__stack">
          <div class="lerico-rfv2__toolbar">
            ${renderStrategyCards(SIZE_MODE_META, sizeMode, "size_mode")}
          </div>

          ${sizeMode === "Target Megapixels" ? `
            ${renderSliderField(node, "target_megapixels", 1)}
          ` : ""}

          ${sizeMode === "Target Pixels" ? `
            ${renderSliderField(node, "target_pixels", 1000000)}
          ` : ""}

          ${sizeMode === "Target Width" ? `
            ${renderSliderField(node, "target_width", 1024)}
          ` : ""}

          ${sizeMode === "Target Height" ? `
            ${renderSliderField(node, "target_height", 1024)}
          ` : ""}

          ${sizeMode === "Common (Pick)" ? `
            <div class="lerico-rfv2__field">
              <label>Common Resolution</label>
              <select data-action="set-widget" data-widget="common_resolution">
                ${renderGroupedSelectOptions(commonOptionGroups, getWidgetValue(node, "common_resolution"))}
              </select>
            </div>
          ` : ""}

          ${sizeMode === "Common (Closest)" ? `
            <div class="lerico-rfv2__grid">
              <div class="lerico-rfv2__field">
                <label>Target Units</label>
                <select data-action="set-widget" data-widget="common_target_units">
                  ${["megapixels", "pixels"].map((value) => `
                    <option value="${value}" ${getWidgetValue(node, "common_target_units") === value ? "selected" : ""}>${value}</option>
                  `).join("")}
                </select>
              </div>
              ${renderSliderField(node, "common_target_value", 1)}
            </div>
          ` : ""}
          </div>
        </div>
        ` : ""}
      ` : ""}

      ${mode === "Image" ? `
        <div class="lerico-rfv2__section">
          <div class="lerico-rfv2__sectionTitle">Image Sizing</div>
          <div class="lerico-rfv2__stack">
          <div class="lerico-rfv2__toolbar">
            ${renderStrategyCards(IMAGE_MODE_META, imageMode, "image_mode")}
          </div>

          ${imageMode === "Scale Factor" ? `
            ${renderSliderField(node, "scale_factor", 1)}
          ` : ""}

          ${imageMode === "Target Megapixels" ? `
            ${renderSliderField(node, "target_megapixels", 1)}
          ` : ""}

          ${imageMode === "Target Pixels" ? `
            ${renderSliderField(node, "target_pixels", 1000000)}
          ` : ""}

          ${imageMode === "Fit Long Side" ? `
            ${renderSliderField(node, "target_long_side", 1024)}
          ` : ""}

          ${imageMode === "Fit Short Side" ? `
            ${renderSliderField(node, "target_short_side", 768)}
          ` : ""}

          <div class="lerico-rfv2__warning ${imageLinked ? "" : "is-danger"}" style="margin-top:10px;">
            ${imageLinked
              ? (inputDims
                ? `Image input detected live from Load Image: ${inputDims.width} x ${inputDims.height}.`
                : "Image input is connected. Live preview works when the source is a direct native Load Image node; other sources still resolve after execution.")
              : "Connect an image to enable image-mode sizing."}
          </div>
          </div>
        </div>
      ` : ""}

      <details class="lerico-rfv2__section lerico-rfv2__advanced" open>
        <summary title="Divisibility, pixel matching, max pixels, and ratio info.">Advanced</summary>
        <div class="lerico-rfv2__controlRow">
          <div class="lerico-rfv2__field">
            <label>Divisible By</label>
            <select data-action="set-widget" data-widget="divisible_by_value" ${divisible ? "" : "disabled"}>
              ${[16, 32, 64].map((value) => `
                <option value="${value}" ${toNumber(getWidgetValue(node, "divisible_by_value"), 16) === value ? "selected" : ""}>${value}</option>
              `).join("")}
            </select>
          </div>
          <div class="lerico-rfv2__field">
            <label>Pixel Match</label>
            <select data-action="set-widget" data-widget="pixel_match_mode" ${(mode === "Aspect" && exactDimensionsMode) ? "disabled" : ""}>
              ${["closest", "lower", "higher"].map((value) => `
                <option value="${value}" ${pixelMatchMode === value ? "selected" : ""}>${value}</option>
              `).join("")}
            </select>
          </div>
          <div class="lerico-rfv2__field">
            <label>Max Pixels</label>
            <input type="text" inputmode="numeric" value="${getInputDraftValue(node, "max_pixels", toNumber(getWidgetValue(node, "max_pixels"), 16777216))}" data-action="set-number" data-widget="max_pixels" ${limitMaxPixels ? "" : "disabled"} />
          </div>
          <div class="lerico-rfv2__field">
            <label>Current Ratio</label>
            <input type="text" value="${ratioText}" readonly />
          </div>
        </div>
      </details>

      <div class="lerico-rfv2__result">
        <div class="lerico-rfv2__resultHeader">
          <div>
            <div class="lerico-rfv2__resultTitle">Result Snapshot</div>
          </div>
        </div>

        <div class="lerico-rfv2__resultLayout">
          <div class="lerico-rfv2__stats">
            <div class="lerico-rfv2__stat is-output">
              <div class="lerico-rfv2__statMain">
                <span class="lerico-rfv2__statLabel">Output</span>
                <span class="lerico-rfv2__statValue">${preview.hasPreview ? `${preview.width} x ${preview.height}` : "Execution-dependent"}</span>
              </div>
              <button class="lerico-rfv2__formatIconButton" data-action="open-format-modal" title="Customize resolution string output">
                ${SVGS.format}
              </button>
            </div>
            <div class="lerico-rfv2__stat">
              <span class="lerico-rfv2__statLabel">Area</span>
              <span class="lerico-rfv2__statValue">${preview.pixelCount ? preview.pixelCount.toLocaleString() : "--"} px</span>
            </div>
            <div class="lerico-rfv2__stat">
              <span class="lerico-rfv2__statLabel">Megapixels</span>
              <span class="lerico-rfv2__statValue">${megapixels}</span>
            </div>
            <div class="lerico-rfv2__stat">
              <span class="lerico-rfv2__statLabel">Aspect</span>
              <span class="lerico-rfv2__statValue">${ratioText}</span>
            </div>
          </div>

          <div class="lerico-rfv2__visual">
            ${frameMarkup}
            <div class="lerico-rfv2__visualBadges">
              <span class="lerico-rfv2__badge">${orientation}</span>
              <span class="lerico-rfv2__badge">${divisible ? `divisible ${getWidgetValue(node, "divisible_by_value")}` : "free size"}</span>
              <span class="lerico-rfv2__badge">${roundingMode}</span>
              ${limitMaxPixels ? `<span class="lerico-rfv2__badge">cap ${toNumber(getWidgetValue(node, "max_pixels"), 0).toLocaleString()}</span>` : ""}
            </div>
          </div>
        </div>

        ${(node._lericoRfV2LastExecution || warnings.length) ? `
          <div class="lerico-rfv2__warningList">
            ${node._lericoRfV2LastExecution ? `
              <div class="lerico-rfv2__warning">Last execution: ${node._lericoRfV2LastExecution}</div>
            ` : ""}
            ${warnings.map((warning) => `
              <div class="lerico-rfv2__warning ${warning.danger ? "is-danger" : ""}">${warning.text}</div>
            `).join("")}
          </div>
        ` : ""}
      </div>
      ${renderFormatModal(node)}
    </div>
  `;

  root.querySelectorAll("[data-modal-stop]").forEach((element) => {
    element.addEventListener("click", (event) => event.stopPropagation());
  });

  root.querySelectorAll("[data-action]").forEach((element) => {
    const action = element.dataset.action;
    if (action === "set-format-draft") {
      element.addEventListener("input", (event) => {
        node._lericoRfV2FormatModal = node._lericoRfV2FormatModal || { open: true, draft: "" };
        node._lericoRfV2FormatModal.draft = event.currentTarget.value;
        updateFormatModalPreview(node, event.currentTarget);
      });
      return;
    }

    if (element.tagName === "SELECT") {
      element.addEventListener("change", (event) => {
        const target = event.currentTarget;
        setWidgetValue(node, target.dataset.widget, target.value);
        applyNodeState(node);
      });
      return;
    }

    if (element.tagName === "INPUT" && action === "set-number") {
      element.addEventListener("input", (event) => {
        const target = event.currentTarget;
        const raw = target.value;
        setInputDraftValue(node, target.dataset.widget, raw);
        const parsed = parseDraftNumber(target.dataset.widget, raw);
        if (parsed.valid) {
          setWidgetValue(node, target.dataset.widget, sanitizeWidgetNumber(node, target.dataset.widget, parsed.value));
        }
        applyNodeState(node);
      });

      element.addEventListener("blur", (event) => {
        const target = event.currentTarget;
        const raw = target.value;
        const parsed = parseDraftNumber(target.dataset.widget, raw);
        if (parsed.valid) {
          setWidgetValue(node, target.dataset.widget, sanitizeWidgetNumber(node, target.dataset.widget, parsed.value));
        }
        clearInputDraftValue(node, target.dataset.widget);
        applyNodeState(node);
      });
      return;
    }

    if (element.tagName === "INPUT" && action === "set-slider") {
      element.addEventListener("input", (event) => {
        const target = event.currentTarget;
        const value = getSliderResolvedValue(node, target.dataset.widget, target.value);
        setWidgetValue(node, target.dataset.widget, value);
        updateSliderDisplay(node, target);
      });

      element.addEventListener("change", (event) => {
        const target = event.currentTarget;
        const value = getSliderResolvedValue(node, target.dataset.widget, target.value);
        setWidgetValue(node, target.dataset.widget, value);
        updateSliderDisplay(node, target);
        applyNodeState(node);
      });
      return;
    }

    element.addEventListener("click", (event) => {
      const target = event.currentTarget;
      if (action === "set-widget") {
        setWidgetValue(node, target.dataset.widget, target.dataset.value);
      } else if (action === "toggle-widget") {
        const widgetName = target.dataset.widget;
        const nextValue = !getWidgetValue(node, widgetName);
        if (widgetName === "sdxl_resolutions" && !nextValue) {
          disableSdxlState(node);
        }
        setWidgetValue(node, widgetName, nextValue);
      } else if (action === "set-aspect-ratio") {
        setWidgetValue(node, "aspect_source", "Aspect Ratio");
        if (isSdxlAspectLabel(target.dataset.value)) {
          setWidgetValue(node, "sdxl_resolutions", true);
        }
        setWidgetValue(node, "aspect_ratio", target.dataset.value);
      } else if (action === "toggle-favorite") {
        if (currentAspect) {
          toggleFavorite(currentAspect);
        }
      } else if (action === "open-format-modal") {
        node._lericoRfV2FormatModal = {
          open: true,
          draft: getWidgetValue(node, "resolution_format") ?? DEFAULT_RESOLUTION_FORMAT,
        };
      } else if (action === "cancel-format") {
        node._lericoRfV2FormatModal = { open: false, draft: "" };
      } else if (action === "reset-format") {
        node._lericoRfV2FormatModal = node._lericoRfV2FormatModal || { open: true, draft: "" };
        node._lericoRfV2FormatModal.draft = DEFAULT_RESOLUTION_FORMAT;
        const input = root.querySelector("[data-action='set-format-draft']");
        if (input) {
          input.value = DEFAULT_RESOLUTION_FORMAT;
          updateFormatModalPreview(node, input);
        }
        return;
      } else if (action === "apply-format") {
        const draft = node._lericoRfV2FormatModal?.draft ?? DEFAULT_RESOLUTION_FORMAT;
        setWidgetValue(node, "resolution_format", draft);
        node._lericoRfV2FormatModal = { open: false, draft: "" };
      }
      applyNodeState(node);
    });
  });

  restoreFocusState(root, focusState);
}

function createPanel(node) {
  injectStyles();
  const root = document.createElement("div");
  root.style.width = "100%";
  root.style.height = "auto";
  root.style.display = "block";
  root.style.minHeight = "0";

  const domWidget = node.addDOMWidget(PANEL_WIDGET, "RFV2_PANEL", root, {
    hideOnZoom: false,
  });
  domWidget._lericoRfV2Dom = true;
  domWidget.computeSize = (width) => [
    Math.max(width || MIN_WIDTH, MIN_WIDTH),
    Math.max(measurePanelContentHeight(node) + 18, MIN_HEIGHT),
  ];

  node._lericoRfV2 = { root, domWidget };
}

app.registerExtension({
  name: EXT_NAME,
  async nodeCreated(node) {
    if ((node.comfyClass || node.type) !== NODE_CLASS) {
      return;
    }
    if (node._lericoRfV2Init) {
      return;
    }
    node._lericoRfV2Init = true;

    createPanel(node);

    const originalOnWidgetChanged = node.onWidgetChanged;
    node.onWidgetChanged = function () {
      const result = originalOnWidgetChanged ? originalOnWidgetChanged.apply(this, arguments) : undefined;
      applyNodeState(this);
      return result;
    };

    const originalOnConnectionsChange = node.onConnectionsChange;
    node.onConnectionsChange = function () {
      const result = originalOnConnectionsChange ? originalOnConnectionsChange.apply(this, arguments) : undefined;
      applyNodeState(this);
      return result;
    };

    const originalOnExecuted = node.onExecuted;
    node.onExecuted = function (message) {
      const result = originalOnExecuted ? originalOnExecuted.apply(this, arguments) : undefined;
      const uiText = Array.isArray(message?.text) ? message.text[0] : null;
      if (typeof uiText === "string" && uiText.trim()) {
        this._lericoRfV2LastExecution = uiText;
      }
      applyNodeState(this);
      return result;
    };

    const originalOnRemoved = node.onRemoved;
    node.onRemoved = function () {
      attachImageSourceWatcher(this, null);
      clearLinkedInputImageDimensions(this);
      return originalOnRemoved ? originalOnRemoved.apply(this, arguments) : undefined;
    };

    setTimeout(() => applyNodeState(node), 0);
  },
});
