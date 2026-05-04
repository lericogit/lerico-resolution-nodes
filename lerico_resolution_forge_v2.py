from .resolution_forge_core import ResolutionForgeBase
import math
import re


class LericoResolutionForgeV2(ResolutionForgeBase):
    """Resolution Forge V2 with a custom DOM-backed editor in the frontend."""

    RETURN_TYPES = ("INT", "INT", "STRING")
    RETURN_NAMES = ("width", "height", "resolution")
    DEFAULT_RESOLUTION_FORMAT = "{w}*{h}"
    MAX_RESOLUTION_FORMAT_LENGTH = 160
    MAX_RESOLUTION_OUTPUT_LENGTH = 240
    _FORMAT_TOKEN_RE = re.compile(r"\{([a-z_]+)\}")
    _FORMAT_ALLOWED_TOKENS = {"w", "h", "ar", "ar_decimal", "n_px", "mp", "orientation"}

    @classmethod
    def INPUT_TYPES(cls):
        base = super().INPUT_TYPES()
        required = {}
        for name, value in base["required"].items():
            required[name] = value
            if name == "aspect_ratio":
                required["sdxl_resolutions"] = (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Enable official SDXL-native ratio cards and common resolutions in V2.",
                    },
                )
                required["iteration_resolutions"] = (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Enable lower-resolution iteration presets for faster video and motion workflow passes.",
                    },
                )
                required["high_detail_resolutions"] = (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Enable additional medium and high-detail image generation presets.",
                    },
                )
                required["extended_resolutions"] = (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Enable larger extended presets beyond the default common set.",
                    },
                )

        required["mode"] = (
            ["Aspect", "Image"],
            {
                "default": "Aspect",
                "tooltip": "Manual handles exact sizing, ratio-driven sizing, and common presets. Image derives size from the input image.",
            },
        )
        required["aspect_source"] = (
            ["Exact Dimensions", "Aspect Ratio", "Image", "Width+Height"],
            {
                "default": "Aspect Ratio",
                "tooltip": "Choose exact dimensions, a preset ratio, image-derived ratio, or a custom width/height ratio.",
            },
        )
        required["width"] = (
            "INT",
            {
                "default": 1024,
                "min": 1,
                "max": cls.MAX_DIMENSION,
                "step": 1,
                "tooltip": "Exact Dimensions width for Manual mode.",
            },
        )
        required["height"] = (
            "INT",
            {
                "default": 1024,
                "min": 1,
                "max": cls.MAX_DIMENSION,
                "step": 1,
                "tooltip": "Exact Dimensions height for Manual mode.",
            },
        )

        required["aspect_ratio"] = (
            cls._aspect_labels(include_sdxl=True),
            required["aspect_ratio"][1],
        )
        required["common_resolution"] = (
            cls._common_resolution_options(
                include_sdxl=True,
                include_iteration=True,
                include_high_detail=True,
                include_extended=True,
            ),
            required["common_resolution"][1],
        )
        required["resolution_format"] = (
            "STRING",
            {
                "default": cls.DEFAULT_RESOLUTION_FORMAT,
                "multiline": False,
                "tooltip": "Format the resolution string output. Tokens: {w}, {h}, {ar}, {ar_decimal}, {n_px}, {mp}, {orientation}.",
            },
        )

        return {
            "required": required,
            "optional": dict(base.get("optional", {})),
        }

    @staticmethod
    def _orientation_from_dims(width, height):
        if width == height:
            return "square"
        return "landscape" if width > height else "portrait"

    @staticmethod
    def _aspect_text(width, height):
        divisor = math.gcd(max(int(width), 1), max(int(height), 1))
        return f"{int(width) // divisor}:{int(height) // divisor}"

    @classmethod
    def _validate_resolution_format(cls, template):
        if template is None:
            template = cls.DEFAULT_RESOLUTION_FORMAT
        template = str(template)
        if len(template) > cls.MAX_RESOLUTION_FORMAT_LENGTH:
            return False, "Format is too long."
        if any(ord(ch) < 32 for ch in template):
            return False, "Format contains unsupported control characters."

        index = 0
        while index < len(template):
            char = template[index]
            if char == "{":
                if index + 1 < len(template) and template[index + 1] == "{":
                    index += 2
                    continue
                end = template.find("}", index + 1)
                if end == -1:
                    return False, "Format has an unmatched opening brace."
                token = template[index + 1:end]
                if not token or token not in cls._FORMAT_ALLOWED_TOKENS:
                    return False, f"Unknown token: {{{token}}}."
                index = end + 1
                continue
            if char == "}":
                if index + 1 < len(template) and template[index + 1] == "}":
                    index += 2
                    continue
                return False, "Format has an unmatched closing brace."
            index += 1
        return True, ""

    @classmethod
    def _format_resolution_string(cls, template, width, height, pixel_count):
        valid, _ = cls._validate_resolution_format(template)
        if not valid:
            template = cls.DEFAULT_RESOLUTION_FORMAT

        width = int(width)
        height = int(height)
        pixel_count = int(pixel_count)
        values = {
            "w": str(width),
            "h": str(height),
            "ar": cls._aspect_text(width, height),
            "ar_decimal": f"{(width / max(height, 1)):.3f}",
            "n_px": str(pixel_count),
            "mp": f"{(pixel_count / 1_000_000.0):.2f}",
            "orientation": cls._orientation_from_dims(width, height),
        }

        output = []
        index = 0
        while index < len(template):
            char = template[index]
            if char == "{" and index + 1 < len(template) and template[index + 1] == "{":
                output.append("{")
                index += 2
                continue
            if char == "}" and index + 1 < len(template) and template[index + 1] == "}":
                output.append("}")
                index += 2
                continue
            if char == "{":
                end = template.find("}", index + 1)
                token = template[index + 1:end]
                output.append(values[token])
                index = end + 1
                continue
            output.append(char)
            index += 1

        formatted = "".join(output)
        if len(formatted) > cls.MAX_RESOLUTION_OUTPUT_LENGTH:
            return f"{width}*{height}"
        return formatted

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
        sdxl_resolutions,
        iteration_resolutions,
        high_detail_resolutions,
        extended_resolutions,
        aspect_width,
        aspect_height,
        size_mode,
        target_megapixels,
        target_pixels,
        target_width,
        target_height,
        common_resolution,
        resolution_format,
        common_target_units,
        common_target_value,
        image_mode,
        scale_factor,
        target_long_side,
        target_short_side,
        image=None,
    ):
        effective_mode = mode
        effective_aspect_source = aspect_source

        if mode == "Exact":
            effective_mode = "Aspect"
            effective_aspect_source = "Exact Dimensions"

        if effective_mode == "Aspect" and effective_aspect_source == "Exact Dimensions":
            effective_mode = "Exact"

        resolved_width, resolved_height, pixel_count, _resolution = self._resolve_impl(
            effective_mode,
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
            effective_aspect_source,
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
            sdxl_resolutions=bool(sdxl_resolutions),
            iteration_resolutions=bool(iteration_resolutions),
            high_detail_resolutions=bool(high_detail_resolutions),
            extended_resolutions=bool(extended_resolutions),
        )
        return (
            resolved_width,
            resolved_height,
            self._format_resolution_string(resolution_format, resolved_width, resolved_height, pixel_count),
        )

    def ui(self, width, height, resolution):
        return {"ui": {"text": [f"{width}x{height} | {resolution}"]}}


NODE_CLASS_MAPPINGS = {
    "LericoResolutionForgeV2": LericoResolutionForgeV2,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LericoResolutionForgeV2": "Resolution Forge V2",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
