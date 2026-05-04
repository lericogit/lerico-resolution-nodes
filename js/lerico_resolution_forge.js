import { app } from "../../scripts/app.js";

const EXT_NAME = "lerico.resolution.forge.ui";
const NODE_CLASS = "LericoResolutionForge";
const PREVIEW_FOOTER_HEIGHT = 20;

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

const ALL_COMMON_ENTRIES = Object.values(COMMON_RESOLUTIONS).flat();

function formatEntry(entry) {
  if (entry.label) {
    return `${entry.w}x${entry.h} (${entry.label})`;
  }
  return `${entry.w}x${entry.h}`;
}

function buildOptions(entries, orientation) {
  if (!entries || entries.length === 0) {
    return [];
  }
  return entries.map((entry) => {
    let w = entry.w;
    let h = entry.h;
    if (orientation === "portrait") {
      const t = w;
      w = h;
      h = t;
    }
    if (orientation === "square") {
      const side = Math.min(w, h);
      w = side;
      h = side;
    }
    return formatEntry({ w, h, label: entry.label || "" });
  });
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
    const inside = parenMatch[1];
    const insideMatch = inside.match(/([0-9.]+)\s*:\s*([0-9.]+)/);
    if (insideMatch) {
      port = `${insideMatch[1]}:${insideMatch[2]}`;
    }
  }
  return { land, port };
}

function getCommonOptionsFor(label, orientation) {
  if (orientation === "square") {
    return buildOptions(COMMON_RESOLUTIONS["1:1"] || [], "auto");
  }
  const parsed = parseRatioLabel(label);
  const key = parsed.land;
  if (key && COMMON_RESOLUTIONS[key]) {
    return buildOptions(COMMON_RESOLUTIONS[key], orientation);
  }
  return buildOptions(ALL_COMMON_ENTRIES, orientation);
}

function findWidget(node, name) {
  return node.widgets ? node.widgets.find((w) => w.name === name) : null;
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

function setWidgetVisible(node, name, visible) {
  const widget = findWidget(node, name);
  setWidgetHidden(widget, !visible);
}

function findInputIndex(node, name) {
  if (!node.inputs) {
    return -1;
  }
  return node.inputs.findIndex((input) => input.name === name);
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

function updateCommonOptions(node) {
  const aspectSource = getWidgetValue(node, "aspect_source");
  const orientation = getWidgetValue(node, "orientation") || "auto";
  const aspectLabel = getWidgetValue(node, "aspect_ratio");

  let options = buildOptions(ALL_COMMON_ENTRIES, orientation);
  if (aspectSource === "Aspect Ratio") {
    options = getCommonOptionsFor(aspectLabel, orientation);
  } else if (orientation === "square") {
    options = getCommonOptionsFor("1:1", "square");
  }

  const widget = findWidget(node, "common_resolution");
  if (!widget) {
    return;
  }
  widget.options = widget.options || {};
  widget.options.values = options;
  if (options.length && !options.includes(widget.value)) {
    widget.value = options[0];
  }
  if (widget.element && widget.element.tagName === "SELECT") {
    const select = widget.element;
    select.options.length = 0;
    for (const value of options) {
      select.add(new Option(value, value));
    }
    if (widget.value) {
      select.value = widget.value;
    }
  }
}

function parseDualRatio(label) {
  const text = (label || "").trim();
  if (text.includes("(") && text.includes(")")) {
    const openIndex = text.indexOf("(");
    const closeIndex = text.indexOf(")", openIndex + 1);
    const before = text.slice(0, openIndex).trim();
    const inside = closeIndex === -1
      ? text.slice(openIndex + 1).trim()
      : text.slice(openIndex + 1, closeIndex).trim();
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
  const safeRatio = ratio && ratio > 0 ? ratio : 1;
  if (orientation === "square") {
    return 1;
  }
  if (orientation === "portrait" && safeRatio > 1) {
    return 1 / safeRatio;
  }
  if (orientation === "landscape" && safeRatio < 1) {
    return 1 / safeRatio;
  }
  return safeRatio;
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
  for (const [dw, dh] of [
    [step, 0],
    [-step, 0],
    [0, step],
    [0, -step],
  ]) {
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

function nearestCommonRatioKey(ratio) {
  const safeRatio = Math.max(ratio || 0, 1e-9);
  let bestKey = "1:1";
  let bestErr = Number.POSITIVE_INFINITY;
  for (const key of Object.keys(COMMON_RESOLUTIONS)) {
    const keyRatio = ratioToFloat(key) || 1;
    const err = Math.abs(keyRatio - safeRatio);
    if (err < bestErr) {
      bestKey = key;
      bestErr = err;
    }
  }
  return bestKey;
}

function getCommonCandidates(ratio, orientation) {
  const key = orientation === "square" ? "1:1" : nearestCommonRatioKey(ratio);
  const entries = COMMON_RESOLUTIONS[key] || [];
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

function getAspectRatioFromSource(node, aspectSource, orientation) {
  if (aspectSource === "Image") {
    return null;
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
  if (mode === "Image") {
    return null;
  }

  const orientation = getWidgetValue(node, "orientation") || "auto";
  const forceOrientation = !!getWidgetValue(node, "force_orientation");
  const divisible = !!getWidgetValue(node, "divisible_by");
  const multiple = divisible ? Math.max(toNumber(getWidgetValue(node, "divisible_by_value"), 1), 1) : 1;
  const roundingMode = getWidgetValue(node, "rounding_mode") || "nearest";
  const pixelMatchMode = getWidgetValue(node, "pixel_match_mode") || "closest";
  const limitMaxPixels = !!getWidgetValue(node, "limit_max_pixels");
  const maxPixels = toNumber(getWidgetValue(node, "max_pixels"), 0);

  let width = null;
  let height = null;

  if (mode === "Exact") {
    width = toNumber(getWidgetValue(node, "width"), 1024);
    height = toNumber(getWidgetValue(node, "height"), 1024);
  } else if (mode === "Aspect") {
    const aspectSource = getWidgetValue(node, "aspect_source");
    const sizeMode = getWidgetValue(node, "size_mode");
    const ratio = getAspectRatioFromSource(node, aspectSource, orientation);
    if (!ratio) {
      return null;
    }

    if (sizeMode === "Target Megapixels") {
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
        const candidates = getCommonCandidates(ratio, orientation);
        if (candidates.length) {
          [width, height] = candidates[0];
        }
      }
    } else if (sizeMode === "Common (Closest)") {
      const units = getWidgetValue(node, "common_target_units");
      const value = toNumber(getWidgetValue(node, "common_target_value"), 1);
      const target = units === "pixels" ? value : value * 1_000_000;
      const candidates = getCommonCandidates(ratio, orientation);
      const chosen = selectCommonByTarget(candidates, target, pixelMatchMode);
      if (chosen) {
        [width, height] = chosen;
      }
    }
  }

  if (width == null || height == null) {
    return null;
  }

  if (limitMaxPixels) {
    [width, height] = applyMaxPixels(width, height, Math.max(maxPixels, 1));
  }

  let [widthInt, heightInt] = roundDims(width, height, multiple, roundingMode);
  const force = mode === "Aspect" || forceOrientation;
  if (force && orientation !== "auto") {
    [widthInt, heightInt] = enforceOrientation(widthInt, heightInt, orientation);
  }

  const pixelCount = widthInt * heightInt;
  return {
    width: widthInt,
    height: heightInt,
    pixelCount,
    text: `${widthInt}x${heightInt} | ${pixelCount.toLocaleString()} px`,
  };
}

function updatePreview(node) {
  const preview = computePreview(node);
  node._lericoResolutionForgePreview = preview;
  node._lericoResolutionForgePreviewText = preview ? preview.text : "";
}

function drawPreviewFooter(node, ctx) {
  const text = node._lericoResolutionForgePreviewText;
  if (!text || node.flags?.collapsed) {
    return;
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${LiteGraph.NODE_SUBTEXT_SIZE || 12}px Arial`;

  const width = Math.ceil(ctx.measureText(text).width) + 14;
  const height = 16;
  const x = (node.size[0] - width) / 2;
  const y = node.size[1] - height - 4;

  ctx.fillStyle = LiteGraph.NODE_DEFAULT_BGCOLOR || "#222";
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, width, height);
  }

  ctx.fillStyle = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR || "#bbb";
  ctx.fillText(text, node.size[0] / 2, y + height / 2 + 0.5);
  ctx.restore();
}

function attachPreviewRenderer(node) {
  if (node._lericoResolutionForgePreviewAttached) {
    return;
  }
  node._lericoResolutionForgePreviewAttached = true;

  const originalComputeSize = node.computeSize;
  node.computeSize = function () {
    const size = originalComputeSize
      ? originalComputeSize.apply(this, arguments)
      : [this.size?.[0] || 0, this.size?.[1] || 0];
    if (this._lericoResolutionForgePreviewText) {
      size[1] += PREVIEW_FOOTER_HEIGHT;
    }
    return size;
  };

  const originalOnDrawForeground = node.onDrawForeground;
  node.onDrawForeground = function (ctx) {
    const result = originalOnDrawForeground
      ? originalOnDrawForeground.apply(this, arguments)
      : undefined;
    drawPreviewFooter(this, ctx);
    return result;
  };
}

function applyVisibility(node) {
  if (node._lericoResolutionForgeApplying) {
    return;
  }
  node._lericoResolutionForgeApplying = true;
  try {
    const mode = getWidgetValue(node, "mode");
    const aspectSource = getWidgetValue(node, "aspect_source");
    const sizeMode = getWidgetValue(node, "size_mode");
    const imageMode = getWidgetValue(node, "image_mode");
    const divisible = !!getWidgetValue(node, "divisible_by");
    const limitMax = !!getWidgetValue(node, "limit_max_pixels");

    const isExact = mode === "Exact";
    const isAspect = mode === "Aspect";
    const isImage = mode === "Image";

    setWidgetVisible(node, "width", isExact);
    setWidgetVisible(node, "height", isExact);

    setWidgetVisible(node, "aspect_source", isAspect);
    setWidgetVisible(node, "aspect_ratio", isAspect && aspectSource === "Aspect Ratio");
    setWidgetVisible(node, "aspect_width", isAspect && aspectSource === "Width+Height");
    setWidgetVisible(node, "aspect_height", isAspect && aspectSource === "Width+Height");
    setWidgetVisible(node, "size_mode", isAspect);

    setWidgetVisible(node, "target_width", isAspect && sizeMode === "Target Width");
    setWidgetVisible(node, "target_height", isAspect && sizeMode === "Target Height");
    setWidgetVisible(node, "common_resolution", isAspect && sizeMode === "Common (Pick)");
    setWidgetVisible(node, "common_target_units", isAspect && sizeMode === "Common (Closest)");
    setWidgetVisible(node, "common_target_value", isAspect && sizeMode === "Common (Closest)");

    const showTargetMP =
      (isAspect && sizeMode === "Target Megapixels") ||
      (isImage && imageMode === "Target Megapixels");
    const showTargetPixels =
      (isAspect && sizeMode === "Target Pixels") ||
      (isImage && imageMode === "Target Pixels");
    setWidgetVisible(node, "target_megapixels", showTargetMP);
    setWidgetVisible(node, "target_pixels", showTargetPixels);

    setWidgetVisible(node, "image_mode", isImage);
    setWidgetVisible(node, "scale_factor", isImage && imageMode === "Scale Factor");
    setWidgetVisible(node, "target_long_side", isImage && imageMode === "Fit Long Side");
    setWidgetVisible(node, "target_short_side", isImage && imageMode === "Fit Short Side");

    const showPixelMatch =
      (isAspect &&
        (sizeMode === "Target Megapixels" ||
          sizeMode === "Target Pixels" ||
          sizeMode === "Common (Closest)")) ||
      (isImage && (imageMode === "Target Megapixels" || imageMode === "Target Pixels"));
    setWidgetVisible(node, "pixel_match_mode", showPixelMatch);

    setWidgetVisible(node, "divisible_by_value", divisible);
    setWidgetVisible(node, "max_pixels", limitMax);

    updateCommonOptions(node);
    updatePreview(node);

    setInputVisible(node, "image", "IMAGE", isImage || (isAspect && aspectSource === "Image"));

    if (node.computeSize && node.setSize) {
      const computed = node.computeSize();
      if (Array.isArray(computed) && computed.length >= 2) {
        node.setSize([Math.max(node.size?.[0] || 0, computed[0]), computed[1]]);
      }
    }
    if (node.setDirtyCanvas) {
      node.setDirtyCanvas(true, true);
    }
    if (node.graph && node.graph.canvas) {
      node.graph.canvas.setDirty(true, true);
    }
    setTimeout(() => {
      if (node.onResize) {
        node.onResize(node.size);
      }
      if (node.setDirtyCanvas) {
        node.setDirtyCanvas(true, true);
      }
    }, 10);
  } finally {
    node._lericoResolutionForgeApplying = false;
  }
}

function attachCallbacks(node) {
  const watch = [
    "mode",
    "aspect_source",
    "size_mode",
    "image_mode",
    "divisible_by",
    "limit_max_pixels",
    "orientation",
    "aspect_ratio",
  ];
  for (const name of watch) {
    const widget = findWidget(node, name);
    if (!widget) {
      continue;
    }
    const original = widget.callback;
    widget.callback = function () {
      const result = original ? original.apply(this, arguments) : undefined;
      applyVisibility(node);
      return result;
    };
  }
}

app.registerExtension({
  name: EXT_NAME,
  async nodeCreated(node) {
    const comfyClass = node.comfyClass || node.type;
    if (comfyClass !== NODE_CLASS) {
      return;
    }
    if (node._lericoResolutionForgeInit) {
      return;
    }
    node._lericoResolutionForgeInit = true;
    attachPreviewRenderer(node);
    attachCallbacks(node);
    const originalOnWidgetChanged = node.onWidgetChanged;
    node.onWidgetChanged = function () {
      const result = originalOnWidgetChanged
        ? originalOnWidgetChanged.apply(this, arguments)
        : undefined;
      applyVisibility(node);
      return result;
    };
    setTimeout(() => applyVisibility(node), 0);
  },
});
