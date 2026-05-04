import math
import re


class ResolutionForgeBase:
    CATEGORY = "Lerico/Resolution"
    RETURN_TYPES = ("INT", "INT", "INT", "STRING")
    RETURN_NAMES = ("width", "height", "pixel_count", "resolution")
    FUNCTION = "resolve"
    OUTPUT_NODE = True
    MAX_DIMENSION = 16384
    MAX_RATIO_COMPONENT = 4096
    MAX_TOTAL_PIXELS = MAX_DIMENSION * MAX_DIMENSION
    MAX_MEGAPIXELS = MAX_TOTAL_PIXELS / 1_000_000.0

    _RATIO_RE = re.compile(r"([0-9]*\.?[0-9]+)\s*:\s*([0-9]*\.?[0-9]+)")
    _RES_RE = re.compile(r"(\d+)\s*[x*]\s*(\d+)")

    ASPECT_LABELS = [
        "1:1",
        "2:1 (1:2)",
        "5:4 (4:5)",
        "4:3 (3:4)",
        "3:2 (2:3)",
        "16:9 (9:16)",
        "21:9 (9:21)",
        "1.85:1 (1:1.85)",
        "2.39:1 (1:2.39)",
    ]
    SDXL_ASPECT_LABELS = [
        "9:7 (7:9)",
        "19:13 (13:19)",
        "7:4 (4:7)",
        "12:5 (5:12)",
    ]

    COMMON_RESOLUTIONS = {
        "1:1": [
            (360, 360, ""),
            (480, 480, ""),
            (512, 512, ""),
            (768, 768, ""),
            (1024, 1024, ""),
            (1536, 1536, ""),
            (2048, 2048, ""),
        ],
        "4:3": [
            (480, 360, "360p"),
            (640, 480, "VGA"),
            (640, 480, "480p"),
            (800, 600, "SVGA"),
            (1024, 768, "XGA"),
            (1280, 960, "SXGA-"),
            (1600, 1200, "UXGA"),
        ],
        "3:2": [
            (540, 360, "360p"),
            (720, 480, "480p"),
            (768, 512, ""),
            (1152, 768, ""),
            (1536, 1024, ""),
            (1920, 1280, ""),
        ],
        "5:4": [
            (450, 360, "360p"),
            (600, 480, "480p"),
            (640, 512, ""),
            (800, 640, ""),
            (1280, 1024, ""),
            (1600, 1280, ""),
        ],
        "2:1": [
            (720, 360, "360p"),
            (960, 480, "480p"),
            (1024, 512, ""),
            (1536, 768, ""),
            (2048, 1024, ""),
            (2560, 1280, ""),
        ],
        "16:9": [
            (640, 360, "360p"),
            (854, 480, "480p"),
            (1280, 720, "720p"),
            (1600, 900, ""),
            (1920, 1080, "1080p"),
            (2560, 1440, "1440p"),
            (3840, 2160, "4K"),
        ],
        "21:9": [
            (840, 360, "360p"),
            (1120, 480, "480p"),
            (2560, 1080, ""),
            (3440, 1440, ""),
        ],
        "1.85:1": [
            (666, 360, "360p"),
            (888, 480, "480p"),
            (1664, 900, ""),
            (1920, 1038, ""),
            (2048, 1108, ""),
        ],
        "2.39:1": [
            (860, 360, "360p"),
            (1148, 480, "480p"),
            (2048, 858, ""),
            (4096, 1716, ""),
        ],
    }
    SDXL_COMMON_RESOLUTIONS = {
        "9:7": [
            (1152, 896, "SDXL"),
        ],
        "19:13": [
            (1216, 832, "SDXL"),
        ],
        "7:4": [
            (1344, 768, "SDXL"),
        ],
        "12:5": [
            (1536, 640, "SDXL"),
        ],
    }
    ITERATION_COMMON_RESOLUTIONS = {
        "1:1": [
            (576, 576, ""),
            (704, 704, ""),
            (896, 896, ""),
        ],
        "2:1": [
            (704, 352, ""),
            (832, 416, ""),
            (992, 496, ""),
            (1232, 608, ""),
            (1408, 704, ""),
        ],
        "5:4": [
            (560, 448, ""),
            (656, 528, ""),
            (784, 640, ""),
            (976, 768, ""),
            (1120, 896, ""),
        ],
        "4:3": [
            (576, 432, ""),
            (688, 512, ""),
            (816, 608, ""),
            (992, 752, ""),
            (1152, 864, ""),
        ],
        "3:2": [
            (608, 416, ""),
            (864, 576, ""),
            (1056, 704, ""),
            (1232, 816, ""),
        ],
        "16:9": [
            (672, 368, ""),
            (784, 448, ""),
            (944, 528, ""),
            (1152, 656, ""),
            (1328, 752, ""),
        ],
        "21:9": [
            (768, 320, ""),
            (896, 384, ""),
            (1088, 464, ""),
            (1328, 560, ""),
            (1520, 656, ""),
        ],
        "1.85:1": [
            (688, 368, ""),
            (800, 432, ""),
            (960, 512, ""),
            (1184, 640, ""),
            (1360, 736, ""),
        ],
        "2.39:1": [
            (768, 320, ""),
            (912, 384, ""),
            (1088, 464, ""),
            (1344, 560, ""),
            (1552, 640, ""),
        ],
    }
    HIGH_DETAIL_COMMON_RESOLUTIONS = {
        "1:1": [
            (1216, 1216, ""),
            (1408, 1408, ""),
            (1728, 1728, ""),
            (2000, 2000, ""),
        ],
        "2:1": [
            (1728, 864, ""),
            (2000, 992, ""),
            (2448, 1232, ""),
            (2832, 1408, ""),
        ],
        "5:4": [
            (1376, 1088, ""),
            (1584, 1264, ""),
            (1936, 1552, ""),
            (2240, 1792, ""),
        ],
        "4:3": [
            (1408, 1056, ""),
            (1632, 1232, ""),
            (2000, 1504, ""),
            (2304, 1728, ""),
        ],
        "3:2": [
            (1504, 992, ""),
            (1728, 1152, ""),
            (2128, 1408, ""),
            (2448, 1632, ""),
        ],
        "16:9": [
            (1632, 912, ""),
            (1888, 1056, ""),
            (2304, 1296, ""),
            (2672, 1504, ""),
        ],
        "21:9": [
            (1872, 800, ""),
            (2160, 928, ""),
            (2640, 1136, ""),
            (3056, 1312, ""),
        ],
        "1.85:1": [
            (1664, 896, ""),
            (1920, 1040, ""),
            (2352, 1280, ""),
            (2720, 1472, ""),
        ],
        "2.39:1": [
            (1888, 800, ""),
            (2192, 912, ""),
            (2672, 1120, ""),
            (3088, 1296, ""),
        ],
    }
    EXTENDED_COMMON_RESOLUTIONS = {
        "1:1": [
            (2240, 2240, ""),
            (2448, 2448, ""),
            (2832, 2832, ""),
        ],
        "2:1": [
            (3168, 1584, ""),
            (3472, 1728, ""),
            (4000, 2000, ""),
        ],
        "5:4": [
            (2496, 2000, ""),
            (2736, 2192, ""),
            (3168, 2528, ""),
        ],
        "4:3": [
            (2576, 1936, ""),
            (2832, 2128, ""),
            (3264, 2448, ""),
        ],
        "3:2": [
            (2736, 1824, ""),
            (3008, 2000, ""),
            (3472, 2304, ""),
        ],
        "16:9": [
            (2976, 1680, ""),
            (3264, 1840, ""),
            (3776, 2128, ""),
        ],
        "21:9": [
            (3408, 1456, ""),
            (3744, 1600, ""),
            (4320, 1856, ""),
        ],
        "1.85:1": [
            (3040, 1648, ""),
            (3328, 1808, ""),
            (3840, 2080, ""),
        ],
        "2.39:1": [
            (3456, 1440, ""),
            (3792, 1584, ""),
            (4368, 1824, ""),
        ],
    }

    @classmethod
    def _aspect_labels(cls, include_sdxl=False):
        labels = list(cls.ASPECT_LABELS)
        if include_sdxl:
            labels.extend(cls.SDXL_ASPECT_LABELS)
        return labels

    @classmethod
    def _append_resolution_family(cls, merged, family_map):
        for key, entries in family_map.items():
            bucket = merged.setdefault(key, [])
            seen = {(w, h, label) for (w, h, label) in bucket}
            for entry in entries:
                if entry in seen:
                    continue
                bucket.append(entry)
                seen.add(entry)

    @classmethod
    def _common_resolutions(
        cls,
        include_sdxl=False,
        include_iteration=False,
        include_high_detail=False,
        include_extended=False,
    ):
        merged = {key: list(entries) for key, entries in cls.COMMON_RESOLUTIONS.items()}
        if include_iteration:
            cls._append_resolution_family(merged, cls.ITERATION_COMMON_RESOLUTIONS)
        if include_high_detail:
            cls._append_resolution_family(merged, cls.HIGH_DETAIL_COMMON_RESOLUTIONS)
        if include_extended:
            cls._append_resolution_family(merged, cls.EXTENDED_COMMON_RESOLUTIONS)
        if include_sdxl:
            cls._append_resolution_family(merged, cls.SDXL_COMMON_RESOLUTIONS)
        return merged

    @classmethod
    def _common_resolution_options(
        cls,
        include_sdxl=False,
        include_iteration=False,
        include_high_detail=False,
        include_extended=False,
    ):
        options = []
        seen = set()
        for entries in cls._common_resolutions(
            include_sdxl=include_sdxl,
            include_iteration=include_iteration,
            include_high_detail=include_high_detail,
            include_extended=include_extended,
        ).values():
            for width, height, label in entries:
                for w, h in ((width, height), (height, width)):
                    if w == h and (w, h) != (width, height):
                        continue
                    text = f"{w}x{h} ({label})" if label else f"{w}x{h}"
                    if text not in seen:
                        options.append(text)
                        seen.add(text)
        return options

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mode": (
                    ["Exact", "Aspect", "Image"],
                    {
                        "default": "Aspect",
                        "tooltip": "Choose how to compute the output. Exact uses Width/Height. Aspect uses an aspect ratio + size target. Image uses the input image.",
                    },
                ),
                "orientation": (
                    ["auto", "landscape", "portrait", "square"],
                    {
                        "default": "auto",
                        "tooltip": "auto keeps the computed orientation. Landscape/Portrait/Square can force the output orientation.",
                    },
                ),
                "force_orientation": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "If enabled, swaps width/height to match Orientation even in Exact or Image modes.",
                    },
                ),
                "divisible_by": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Snap output dimensions to a multiple (16/32/64). Useful for model requirements.",
                    },
                ),
                "divisible_by_value": (
                    [16, 32, 64],
                    {
                        "default": 16,
                        "tooltip": "Multiple to use when Divisible By is enabled.",
                    },
                ),
                "rounding_mode": (
                    ["nearest", "floor", "ceil"],
                    {
                        "default": "nearest",
                        "tooltip": "How to round when snapping: nearest, floor (down), or ceil (up).",
                    },
                ),
                "pixel_match_mode": (
                    ["closest", "lower", "higher"],
                    {
                        "default": "closest",
                        "tooltip": "When targeting pixels/MP, pick closest, always lower, or always higher pixel count.",
                    },
                ),
                "limit_max_pixels": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "If enabled, scales output down to stay under Max Pixels.",
                    },
                ),
                "max_pixels": (
                    "INT",
                    {
                        "default": 16777216,
                        "min": 1,
                        "max": cls.MAX_TOTAL_PIXELS,
                        "step": 1,
                        "tooltip": "Maximum total pixels (width*height). Example: 16,777,216 = 4096x4096.",
                    },
                ),
                "width": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_DIMENSION,
                    "step": 1,
                    "tooltip": "Exact mode width. Also used as a fallback if a mode cannot compute width.",
                    },
                ),
                "height": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_DIMENSION,
                    "step": 1,
                    "tooltip": "Exact mode height. Also used as a fallback if a mode cannot compute height.",
                    },
                ),
                "aspect_source": (
                    ["Aspect Ratio", "Image", "Width+Height"],
                    {
                        "default": "Aspect Ratio",
                        "tooltip": "Where the aspect ratio comes from: dropdown, image input, or Aspect Width/Height.",
                    },
                ),
                "aspect_ratio": (
                    cls._aspect_labels(),
                    {
                        "default": "16:9 (9:16)",
                        "tooltip": "Pick an aspect ratio. Dual labels show landscape (left) and portrait (right). Example: 16:9 (9:16).",
                    },
                ),
                "aspect_width": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_RATIO_COMPONENT,
                    "step": 1,
                    "tooltip": "Aspect source Width+Height: width part of the ratio. Example: 4 for 4:3.",
                    },
                ),
                "aspect_height": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_RATIO_COMPONENT,
                    "step": 1,
                    "tooltip": "Aspect source Width+Height: height part of the ratio. Example: 3 for 4:3.",
                    },
                ),
                "size_mode": (
                    ["Target Megapixels", "Target Pixels", "Target Width", "Target Height", "Common (Pick)", "Common (Closest)"],
                    {
                        "default": "Target Megapixels",
                        "tooltip": "How to choose size while keeping aspect: target MP/pixels, fixed side, or common presets.",
                    },
                ),
                "target_megapixels": (
                    "FLOAT",
                    {
                    "default": 1.0,
                    "min": 0.01,
                    "max": cls.MAX_MEGAPIXELS,
                    "step": 0.01,
                    "tooltip": "Desired total megapixels. Example: 1.0 = ~1,000,000 pixels.",
                    },
                ),
                "target_pixels": (
                    "INT",
                    {
                    "default": 1000000,
                    "min": 1,
                    "max": cls.MAX_TOTAL_PIXELS,
                    "step": 1,
                    "tooltip": "Desired total pixels. Example: 2,073,600 for 1920x1080.",
                    },
                ),
                "target_width": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_DIMENSION,
                    "step": 1,
                    "tooltip": "Fix width; height is derived from the aspect ratio.",
                    },
                ),
                "target_height": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_DIMENSION,
                    "step": 1,
                    "tooltip": "Fix height; width is derived from the aspect ratio.",
                    },
                ),
                "common_resolution": (
                    cls._common_resolution_options(),
                    {
                        "default": "1024x1024",
                        "tooltip": "Pick a common resolution for the current aspect/orientation.",
                    },
                ),
                "common_target_units": (
                    ["megapixels", "pixels"],
                    {
                        "default": "megapixels",
                        "tooltip": "Units for Common (Closest) target: megapixels or pixels.",
                    },
                ),
                "common_target_value": (
                    "FLOAT",
                    {
                    "default": 1.0,
                    "min": 0.01,
                    "max": cls.MAX_MEGAPIXELS,
                    "step": 0.01,
                    "tooltip": "Target size for Common (Closest). Example: 0.9 MP or 900000 pixels.",
                    },
                ),
                "image_mode": (
                    ["Use Image Size", "Scale Factor", "Target Megapixels", "Target Pixels", "Fit Long Side", "Fit Short Side"],
                    {
                        "default": "Use Image Size",
                        "tooltip": "How to derive size from the image: use its size, scale it, target MP/pixels, or fit long/short side.",
                    },
                ),
                "scale_factor": (
                    "FLOAT",
                    {
                        "default": 1.0,
                        "min": 0.01,
                        "max": 10.0,
                        "step": 0.01,
                        "tooltip": "Multiply image size. Example: 0.5 halves, 2.0 doubles.",
                    },
                ),
                "target_long_side": (
                    "INT",
                    {
                    "default": 1024,
                    "min": 1,
                    "max": cls.MAX_DIMENSION,
                    "step": 1,
                    "tooltip": "Scale image so the longer side equals this value.",
                    },
                ),
                "target_short_side": (
                    "INT",
                    {
                    "default": 768,
                    "min": 1,
                    "max": cls.MAX_DIMENSION,
                    "step": 1,
                    "tooltip": "Scale image so the shorter side equals this value.",
                    },
                ),
            },
            "optional": {
                "image": ("IMAGE",),
            },
        }

    @staticmethod
    def _parse_dual_ratio(label):
        label = (label or "").strip()
        if "(" in label and ")" in label:
            before = label.split("(", 1)[0].strip()
            inside = label.split("(", 1)[1].split(")", 1)[0].strip()
            return before, inside
        return label, label

    @classmethod
    def _ratio_to_float(cls, text):
        if not text:
            return None
        match = cls._RATIO_RE.search(text)
        if not match:
            return None
        w = float(match.group(1))
        h = float(match.group(2))
        if h == 0:
            return None
        return w / h

    @classmethod
    def _ratio_from_label(cls, label, orientation):
        land_str, port_str = cls._parse_dual_ratio(label)
        land = cls._ratio_to_float(land_str)
        port = cls._ratio_to_float(port_str)

        if port is None and land is not None and land != 0:
            port = 1.0 / land
        if land is None and port is not None and port != 0:
            land = 1.0 / port

        if orientation == "portrait":
            return port or land or 1.0
        if orientation == "landscape":
            return land or port or 1.0
        if orientation == "square":
            return 1.0
        return land or port or 1.0

    @staticmethod
    def _apply_orientation_to_ratio(ratio, orientation):
        ratio = ratio if ratio and ratio > 0 else 1.0
        if orientation == "square":
            return 1.0
        if orientation == "portrait" and ratio > 1.0:
            return 1.0 / ratio
        if orientation == "landscape" and ratio < 1.0:
            return 1.0 / ratio
        return ratio

    @staticmethod
    def _round_to_multiple(value, multiple, mode):
        if multiple <= 1:
            if mode == "floor":
                return int(math.floor(value))
            if mode == "ceil":
                return int(math.ceil(value))
            return int(round(value))
        if mode == "floor":
            return int(math.floor(value / multiple) * multiple)
        if mode == "ceil":
            return int(math.ceil(value / multiple) * multiple)
        return int(round(value / multiple) * multiple)

    def _round_dims(self, width_f, height_f, multiple, rounding_mode):
        width = self._round_to_multiple(width_f, multiple, rounding_mode)
        height = self._round_to_multiple(height_f, multiple, rounding_mode)
        min_side = multiple if multiple > 1 else 1
        width = max(width, min_side)
        height = max(height, min_side)
        return width, height

    @staticmethod
    def _closest_candidate(candidates, target_pixels):
        best = candidates[0]
        best_err = abs(best[0] * best[1] - target_pixels)
        for width, height in candidates[1:]:
            err = abs(width * height - target_pixels)
            if err < best_err:
                best = (width, height)
                best_err = err
        return best

    @staticmethod
    def _refine_candidate(candidate, target_pixels, multiple):
        width, height = candidate
        step = max(int(multiple), 1)
        best = (width, height)
        best_err = abs(width * height - target_pixels)
        for dw, dh in ((step, 0), (-step, 0), (0, step), (0, -step)):
            cand_w = max(step, width + dw)
            cand_h = max(step, height + dh)
            err = abs(cand_w * cand_h - target_pixels)
            if err < best_err:
                best = (cand_w, cand_h)
                best_err = err
        return best

    def _fit_ratio_to_pixels(self, ratio, pixels, multiple, pixel_match_mode):
        ratio = max(ratio, 1e-9)
        pixels = max(float(pixels), 1.0)

        width_f = math.sqrt(pixels * ratio)
        height_f = math.sqrt(pixels / ratio)

        width_floor = self._round_to_multiple(width_f, multiple, "floor")
        height_floor = self._round_to_multiple(height_f, multiple, "floor")
        width_ceil = self._round_to_multiple(width_f, multiple, "ceil")
        height_ceil = self._round_to_multiple(height_f, multiple, "ceil")

        candidates = [(width_floor, height_floor), (width_ceil, height_ceil)]

        if pixel_match_mode == "lower":
            return candidates[0]
        if pixel_match_mode == "higher":
            return candidates[1]

        best = self._closest_candidate(candidates, pixels)
        return self._refine_candidate(best, pixels, multiple)

    @staticmethod
    def _image_dims(image):
        if image is None:
            raise ValueError("Image input is required for this mode.")
        try:
            _, height, width, _ = image.shape
        except Exception as exc:
            raise ValueError("Image input is not a valid ComfyUI IMAGE.") from exc
        return int(width), int(height)

    @classmethod
    def _parse_resolution_text(cls, text):
        if not text:
            return None
        match = cls._RES_RE.search(text)
        if not match:
            return None
        return int(match.group(1)), int(match.group(2))

    @classmethod
    def _nearest_common_ratio_key(cls, ratio, common_resolutions=None):
        ratio = max(ratio, 1e-9)
        best_key = "1:1"
        best_err = float("inf")
        for key in common_resolutions or cls.COMMON_RESOLUTIONS:
            key_ratio = cls._ratio_to_float(key) or 1.0
            err = abs(key_ratio - ratio)
            if err < best_err:
                best_key = key
                best_err = err
        return best_key

    @classmethod
    def _get_common_candidates(
        cls,
        ratio,
        orientation,
        include_sdxl=False,
        include_iteration=False,
        include_high_detail=False,
        include_extended=False,
    ):
        common_resolutions = cls._common_resolutions(
            include_sdxl=include_sdxl,
            include_iteration=include_iteration,
            include_high_detail=include_high_detail,
            include_extended=include_extended,
        )
        key = "1:1" if orientation == "square" else cls._nearest_common_ratio_key(ratio, common_resolutions)
        entries = common_resolutions.get(key, [])
        if orientation == "portrait":
            return [(h, w, label) for (w, h, label) in entries]
        return entries

    @staticmethod
    def _select_common_by_target(candidates, target_pixels, pixel_match_mode):
        if not candidates:
            return None
        areas = [(w, h, w * h) for (w, h, _) in candidates]

        if pixel_match_mode == "lower":
            below = [c for c in areas if c[2] <= target_pixels]
            chosen = max(below, key=lambda c: c[2]) if below else min(areas, key=lambda c: c[2])
            return chosen[0], chosen[1]

        if pixel_match_mode == "higher":
            above = [c for c in areas if c[2] >= target_pixels]
            chosen = min(above, key=lambda c: c[2]) if above else max(areas, key=lambda c: c[2])
            return chosen[0], chosen[1]

        chosen = min(areas, key=lambda c: abs(c[2] - target_pixels))
        return chosen[0], chosen[1]

    @staticmethod
    def _apply_max_pixels(width_f, height_f, max_pixels):
        if max_pixels <= 0:
            return width_f, height_f
        area = width_f * height_f
        if area <= max_pixels:
            return width_f, height_f
        scale = math.sqrt(max_pixels / area)
        return width_f * scale, height_f * scale

    @staticmethod
    def _enforce_orientation(width, height, orientation):
        if orientation == "square":
            side = min(width, height)
            return side, side
        if orientation == "portrait" and width > height:
            return height, width
        if orientation == "landscape" and height > width:
            return height, width
        return width, height

    def _get_ratio_from_source(self, aspect_source, aspect_ratio, aspect_width, aspect_height, image, orientation):
        if aspect_source == "Image":
            width, height = self._image_dims(image)
            ratio = width / height if height else 1.0
            return self._apply_orientation_to_ratio(ratio, orientation)
        if aspect_source == "Width+Height":
            ratio = aspect_width / aspect_height if aspect_height else 1.0
            return self._apply_orientation_to_ratio(ratio, orientation)
        return self._ratio_from_label(aspect_ratio, orientation)

    @staticmethod
    def _clamp(value, minimum, maximum):
        return max(minimum, min(value, maximum))

    def _sanitize_inputs(
        self,
        width,
        height,
        max_pixels,
        aspect_width,
        aspect_height,
        target_megapixels,
        target_pixels,
        target_width,
        target_height,
        common_target_units,
        common_target_value,
        scale_factor,
        target_long_side,
        target_short_side,
    ):
        width = int(self._clamp(int(width), 1, self.MAX_DIMENSION))
        height = int(self._clamp(int(height), 1, self.MAX_DIMENSION))
        max_pixels = int(self._clamp(int(max_pixels), 1, self.MAX_TOTAL_PIXELS))
        aspect_width = int(self._clamp(int(aspect_width), 1, self.MAX_RATIO_COMPONENT))
        aspect_height = int(self._clamp(int(aspect_height), 1, self.MAX_RATIO_COMPONENT))
        target_megapixels = float(self._clamp(float(target_megapixels), 0.01, self.MAX_MEGAPIXELS))
        target_pixels = int(self._clamp(int(target_pixels), 1, self.MAX_TOTAL_PIXELS))
        target_width = int(self._clamp(int(target_width), 1, self.MAX_DIMENSION))
        target_height = int(self._clamp(int(target_height), 1, self.MAX_DIMENSION))
        if common_target_units == "pixels":
            common_target_value = float(self._clamp(float(common_target_value), 1.0, float(self.MAX_TOTAL_PIXELS)))
        else:
            common_target_value = float(self._clamp(float(common_target_value), 0.01, self.MAX_MEGAPIXELS))
        scale_factor = float(self._clamp(float(scale_factor), 0.01, 10.0))
        target_long_side = int(self._clamp(int(target_long_side), 1, self.MAX_DIMENSION))
        target_short_side = int(self._clamp(int(target_short_side), 1, self.MAX_DIMENSION))
        return (
            width,
            height,
            max_pixels,
            aspect_width,
            aspect_height,
            target_megapixels,
            target_pixels,
            target_width,
            target_height,
            common_target_value,
            scale_factor,
            target_long_side,
            target_short_side,
        )

    def _apply_output_caps(self, width_f, height_f):
        width_f = max(float(width_f), 1.0)
        height_f = max(float(height_f), 1.0)
        area = width_f * height_f
        scale = 1.0
        if width_f > self.MAX_DIMENSION:
            scale = min(scale, self.MAX_DIMENSION / width_f)
        if height_f > self.MAX_DIMENSION:
            scale = min(scale, self.MAX_DIMENSION / height_f)
        if area > self.MAX_TOTAL_PIXELS and area > 0:
            scale = min(scale, math.sqrt(self.MAX_TOTAL_PIXELS / area))
        if scale < 1.0:
            width_f *= scale
            height_f *= scale
        return width_f, height_f

    def resolve(
        self,
        mode,
        orientation,
        force_orientation,
        divisible_by,
        divisible_by_value,
        rounding_mode,
        pixel_match_mode,
        limit_max_pixels,
        max_pixels,
        width,
        height,
        aspect_source,
        aspect_ratio,
        aspect_width,
        aspect_height,
        size_mode,
        target_megapixels,
        target_pixels,
        target_width,
        target_height,
        common_resolution,
        common_target_units,
        common_target_value,
        image_mode,
        scale_factor,
        target_long_side,
        target_short_side,
        image=None,
    ):
        return self._resolve_impl(
            mode,
            orientation,
            force_orientation,
            divisible_by,
            divisible_by_value,
            rounding_mode,
            pixel_match_mode,
            limit_max_pixels,
            max_pixels,
            width,
            height,
            aspect_source,
            aspect_ratio,
            aspect_width,
            aspect_height,
            size_mode,
            target_megapixels,
            target_pixels,
            target_width,
            target_height,
            common_resolution,
            common_target_units,
            common_target_value,
            image_mode,
            scale_factor,
            target_long_side,
            target_short_side,
            image=image,
            sdxl_resolutions=False,
            iteration_resolutions=False,
            high_detail_resolutions=False,
            extended_resolutions=False,
        )

    def _resolve_impl(
        self,
        mode,
        orientation,
        force_orientation,
        divisible_by,
        divisible_by_value,
        rounding_mode,
        pixel_match_mode,
        limit_max_pixels,
        max_pixels,
        width,
        height,
        aspect_source,
        aspect_ratio,
        aspect_width,
        aspect_height,
        size_mode,
        target_megapixels,
        target_pixels,
        target_width,
        target_height,
        common_resolution,
        common_target_units,
        common_target_value,
        image_mode,
        scale_factor,
        target_long_side,
        target_short_side,
        image=None,
        sdxl_resolutions=False,
        iteration_resolutions=False,
        high_detail_resolutions=False,
        extended_resolutions=False,
    ):
        (
            width,
            height,
            max_pixels,
            aspect_width,
            aspect_height,
            target_megapixels,
            target_pixels,
            target_width,
            target_height,
            common_target_value,
            scale_factor,
            target_long_side,
            target_short_side,
        ) = self._sanitize_inputs(
            width,
            height,
            max_pixels,
            aspect_width,
            aspect_height,
            target_megapixels,
            target_pixels,
            target_width,
            target_height,
            common_target_units,
            common_target_value,
            scale_factor,
            target_long_side,
            target_short_side,
        )

        multiple = int(divisible_by_value) if divisible_by else 1

        width_f = None
        height_f = None

        if mode == "Exact":
            width_f = float(width)
            height_f = float(height)
        elif mode == "Image":
            base_w, base_h = self._image_dims(image)
            ratio = base_w / base_h if base_h else 1.0

            if image_mode == "Use Image Size":
                width_f, height_f = float(base_w), float(base_h)
            elif image_mode == "Scale Factor":
                scale = max(float(scale_factor), 0.01)
                width_f, height_f = base_w * scale, base_h * scale
            elif image_mode == "Target Megapixels":
                target = float(target_megapixels) * 1_000_000.0
                width_f, height_f = self._fit_ratio_to_pixels(ratio, target, multiple, pixel_match_mode)
            elif image_mode == "Target Pixels":
                target = float(target_pixels)
                width_f, height_f = self._fit_ratio_to_pixels(ratio, target, multiple, pixel_match_mode)
            elif image_mode == "Fit Long Side":
                long_side = max(int(target_long_side), 1)
                scale = long_side / max(base_w, base_h)
                width_f, height_f = base_w * scale, base_h * scale
            elif image_mode == "Fit Short Side":
                short_side = max(int(target_short_side), 1)
                scale = short_side / min(base_w, base_h)
                width_f, height_f = base_w * scale, base_h * scale
            else:
                width_f, height_f = float(base_w), float(base_h)
        elif mode == "Aspect":
            ratio = self._get_ratio_from_source(aspect_source, aspect_ratio, aspect_width, aspect_height, image, orientation)

            if size_mode == "Target Megapixels":
                target = float(target_megapixels) * 1_000_000.0
                width_f, height_f = self._fit_ratio_to_pixels(ratio, target, multiple, pixel_match_mode)
            elif size_mode == "Target Pixels":
                target = float(target_pixels)
                width_f, height_f = self._fit_ratio_to_pixels(ratio, target, multiple, pixel_match_mode)
            elif size_mode == "Target Width":
                width_f = float(target_width)
                height_f = width_f / ratio if ratio else float(target_height)
            elif size_mode == "Target Height":
                height_f = float(target_height)
                width_f = height_f * ratio if ratio else float(target_width)
            elif size_mode == "Common (Pick)":
                parsed = self._parse_resolution_text(common_resolution)
                if parsed:
                    width_f, height_f = parsed
                else:
                    candidates = self._get_common_candidates(
                        ratio,
                        orientation,
                        include_sdxl=sdxl_resolutions,
                        include_iteration=iteration_resolutions,
                        include_high_detail=high_detail_resolutions,
                        include_extended=extended_resolutions,
                    )
                    if candidates:
                        width_f, height_f = candidates[0][0], candidates[0][1]
            elif size_mode == "Common (Closest)":
                target = float(common_target_value) if common_target_units == "pixels" else float(common_target_value) * 1_000_000.0
                candidates = self._get_common_candidates(
                    ratio,
                    orientation,
                    include_sdxl=sdxl_resolutions,
                    include_iteration=iteration_resolutions,
                    include_high_detail=high_detail_resolutions,
                    include_extended=extended_resolutions,
                )
                chosen = self._select_common_by_target(candidates, target, pixel_match_mode)
                if chosen:
                    width_f, height_f = chosen
                else:
                    width_f, height_f = 1024.0, 1024.0
            else:
                width_f, height_f = float(width), float(height)

        if width_f is None or height_f is None:
            width_f, height_f = float(width), float(height)

        if limit_max_pixels:
            width_f, height_f = self._apply_max_pixels(width_f, height_f, int(max_pixels))

        width_f, height_f = self._apply_output_caps(width_f, height_f)
        width_i, height_i = self._round_dims(width_f, height_f, multiple, rounding_mode)
        if width_i > self.MAX_DIMENSION or height_i > self.MAX_DIMENSION or (width_i * height_i) > self.MAX_TOTAL_PIXELS:
            width_f, height_f = self._apply_output_caps(width_i, height_i)
            width_i, height_i = self._round_dims(width_f, height_f, multiple, "floor")

        force = (mode == "Aspect") or bool(force_orientation)
        if force and orientation != "auto":
            width_i, height_i = self._enforce_orientation(width_i, height_i, orientation)

        pixel_count = int(width_i * height_i)
        resolution_str = f"{width_i}*{height_i}"

        return (int(width_i), int(height_i), pixel_count, resolution_str)

    def ui(self, width, height, pixel_count, resolution):
        text = f"{width}x{height} | {pixel_count:,} px"
        return {"ui": {"text": [text]}}
