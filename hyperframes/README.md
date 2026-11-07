# HyperFrames workspace

HTML compositions rendered to MP4 with [HyperFrames](https://hyperframes.heygen.com), with three.js for 3-D scenes.

```
npm ci                                   # hyperframes 0.9.19, three 0.170.0, gsap 3.15.0
npx hyperframes init <name> --non-interactive --example=blank
npx hyperframes render --fps 60 -o renders/<name>.mp4
```

The render browser in the cloud container cannot reach CDNs (`cdn.jsdelivr.net` fails with `ERR_TUNNEL_CONNECTION_FAILED`),
so copy the libraries into the composition and load them locally:

```
mkdir -p <name>/assets
cp node_modules/gsap/dist/gsap.min.js node_modules/three/build/three.module.js <name>/assets/
```

```html
<script src="assets/gsap.min.js"></script>
<script type="module">import * as THREE from "./assets/three.module.js"; /* … */</script>
```

Tested: a rotating, lit three.js cube driven by a GSAP timeline renders to 1080×1920 MP4.
