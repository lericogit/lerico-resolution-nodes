from .resolution_forge_core import ResolutionForgeBase


class LericoResolutionForge(ResolutionForgeBase):
    """Original Resolution Forge node retained for workflow compatibility."""


NODE_CLASS_MAPPINGS = {
    "LericoResolutionForge": LericoResolutionForge,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LericoResolutionForge": "Resolution Forge",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
