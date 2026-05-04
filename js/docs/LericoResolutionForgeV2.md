# Resolution Forge V2

Resolution Forge V2 is the modernized version of the original Resolution Forge node.

It keeps the same backend sizing logic and outputs:

- `width`
- `height`
- `resolution`

## What Changed

- A custom HTML/CSS/JS control panel replaces the default long widget stack.
- Modes are grouped into clearer sections:
  - `Manual`
  - `Image`
- Orientation uses dedicated icon buttons for `auto`, `landscape`, `portrait`, and `square`.
- The result area shows:
  - solved output dimensions
  - pixel count
  - megapixels
  - aspect ratio
  - a visual frame preview when the result can be computed client-side

## Behavior Notes

- V2 is a separate node and does not replace the original `Resolution Forge`.
- The node still serializes through normal ComfyUI widget values under the hood for workflow compatibility.
- Image-derived previews stay honest:
- if the image input is required to solve the result, the panel shows a placeholder until execution
- if the image is connected and the node executes, the last executed result is shown in the panel
- when the image input comes directly from a native `Load Image` node, V2 can read its dimensions client-side and show a live preview without queueing the workflow

## Manual Mode

Manual mode supports:

- `Exact Dimensions`
- `Preset Ratio`
- `Custom Ratio`
- `Image Ratio`

When using a ratio-based source, it supports these sizing strategies:

- `Target Megapixels`
- `Target Pixels`
- `Target Width`
- `Target Height`
- `Common (Pick)`
- `Common (Closest)`

- `Exact Dimensions` uses width and height directly.
- `Preset Ratio` uses the curated ratio cards.
- `Custom Ratio` uses ratio width and height controls.
- `Image Ratio` reads the ratio from the optional image input.

## Image Mode

Image mode supports:

- `Use Image Size`
- `Scale Factor`
- `Target Megapixels`
- `Target Pixels`
- `Fit Long Side`
- `Fit Short Side`

## Tips

- Use `Divisible Output` when you need sizes aligned to 16, 32, or 64.
- Use `Cap Max Pixels` to prevent accidental oversized outputs.
- Pin frequently used aspect ratios with the `Pin Ratio` action for faster reuse.
- Use `Format` to customize the `resolution` string output. The default is `{w}*{h}`.
- Format tokens: `{w}`, `{h}`, `{ar}`, `{ar_decimal}`, `{n_px}`, `{mp}`, `{orientation}`.
- Enable `Iteration` for smaller low-MP common presets geared toward fast video and motion passes.
- Enable `High Detail` for additional medium and high-detail image-generation presets.
- Enable `Extended` for larger optional preset sizes beyond the default common set.
- Common resolution dropdowns are grouped:
  - by family when you are picking within one active ratio
  - by ratio when the picker spans multiple ratio buckets
