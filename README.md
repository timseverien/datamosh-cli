# datamosh-cli

A command-line tool to break files.

## What the hell is datamoshing?

Long story short, it’s the act of modifying digital files in such a way that they create artifacts for aesthetic pleasure. See [Compression Artifact on Wikipedia](https://en.wikipedia.org/wiki/Compression_artifact#Artistic_use).

## Installation

If you want to use datamosh-cli in a project, you can install it as a project dependency:

```shell
npm install datamosh-cli
```

If you want to use it on your computer instead, you can either install the package globally:

```shell
npm install -g datamosh-cli
```

Or use npx to download the package automatically and run it:

```shell
npx -p datamosh-cli datamosh [command] [options]
```

## Usage

```shell
datamosh [command] <source> <destination> [options] [-- ffmpeg arguments]
```

Internally [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) is being used to convert various formats to corruptable formats. Consequently, `<source>` and `<destination>` can be whatever format ffmpeg gets. You can pass additional settings (like encoding, compression, etc) after the `--` argument:

```
datamosh all stickers.mp4 stickers-destroyed.mp4 -- -c:v libx264
```

Supplying additional parameters to ffmpeg might result in weird behaviour, so use with caution.

### `datamosh all <source> <destination> [options]`

Option            | Default value | Description
------------------|---------------|--------------------------------------------------------------------
`--overwrite`     | -             | Skips overwrite prompt and overwrites `<destination>` if it exists

The `all` command runs all commands in the following order:

1. `remove-keyframes`
2. `shuffle-frames`

#### Example

```shell
datamosh all examples/stickers.mp4 examples/stickers-all.gif -- -filter_complex 'fps=15'
```

![](examples/stickers-all.gif)

### `datamosh remove-keyframes <source> <destination> [options]`

Option            | Default value | Description
------------------|---------------|--------------------------------------------------------------------
`--frame-offset`  | `-1`          | Offset to start looking for neighbouring frames
`--overwrite`     | -             | Skips overwrite prompt and overwrites `<destination>` if it exists

The `remove-keyframes` command replaces keyframes (I-frames) with delta frames (B/P-frames), resulting in the pixel of one scene leaking into to next, similar to [the music video of A$AP Mob - Yamborghini High](https://www.youtube.com/watch?v=tt7gP_IW-1w). The first keyframe is preserved. When replacing keyframe `n`, datamosh-cli starts at frame `n + frameOffset` and loops back in time until it finds a delta frame. This means that a positive frame offset can be used to cause (intentional) stuttering.

#### Example

```shell
datamosh remove-keyframes examples/stickers.mp4 examples/stickers-remove-keyframes.gif --frame-offset 4 -- -filter_complex 'fps=15'
```

![](examples/stickers-remove-keyframes.gif)

### `datamosh shuffle-frames <source> <destination> [options]`

Option                | Default value | Description
----------------------|---------------|--------------------------------------------------------------------
`--overwrite`         | -             | Skips overwrite prompt and overwrites `<destination>` if it exists
`-p`, `--probability` | `0.1` (=10%)  | Probability of swapping a frame
`-r`, `--range`       | `2`           | Range of neighbouring frames to swap

The `shuffle-frames` command shuffles B/P-frames around. Each B/P-frame has a probability of `probability` of being swapped. A greater `probability` will cause more distortion. If frame `n` is being swapped, it will swap with one of the neighbouring frames, based on `range`. A greater `range` will cause more stuttering, depending on `probability`.

#### Example

```shell
datamosh shuffle-frames examples/stickers.mp4 examples/stickers-shuffle-frames.gif --probability 0.25 --range 4 -- -filter_complex 'fps=15'
```

![](examples/stickers-shuffle-frames.gif)

## What are these stickers from?

- [Fronteers](https://fronteers.nl) - a Dutch union for front-end web developers
- [Hawgs](https://landyachtz.com/wheels) - wheel brand of Landyachtz skateboards
- [Landyachtz](https://landyachtz.com) - skateboard, longboard, and apparel brand
- [MODALZ MODALZ MODALZ](https://modalzmodalzmodalz.com) - a site by [@adrianegger](https://twitter.com/adrianegger) revealing a painful truth
- [S1 Helmet Co.](https://shop.s1helmets.com) - skate helmets to protect your skull
- [Vans](https://www.vans.com) - dope shoes

## Disclaimer

This project is not affiliated with the logos/brands shown in the examples. I’m just a sticker-owning fan. Don’t sue me. Send me a message if you’re angry.