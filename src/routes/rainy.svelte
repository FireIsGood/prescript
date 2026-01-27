<script lang="ts">
  import { browser } from "$app/environment";
  import { drawPathSmooth, remap, typewriter, type Curve, type Point } from "$lib/util";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // Individual droplets. xy are positions from 0 to 1 like a shader.
  type Raindrop = {
    x: number;
    y: number;
    v: number; // Velocity
  };

  let canvas: HTMLCanvasElement;
  let canvasWidth: number = $state(100);
  let canvasHeight: number = $state(100);
  let ctx: CanvasRenderingContext2D;
  let rain: Raindrop[] = [];

  function init() {
    // Context
    let _ctx = canvas.getContext("2d");
    if (_ctx === null) return;
    ctx = _ctx;

    createRain(100);

    loop();
    // DEBUGGING
    // process(0);
  }

  let _clock: DOMHighResTimeStamp = 0;
  function loop(timestamp: DOMHighResTimeStamp = 0): void {
    requestAnimationFrame(loop);
    let delta = (timestamp - _clock) / 1000;
    _clock = timestamp;
    process(delta);
  }

  function process(delta: DOMHighResTimeStamp) {
    // Initialize
    ctx.clearRect(0, 0, ctx.canvas.clientWidth * 2, ctx.canvas.clientHeight * 2);
    ctx.reset();

    // Rain
    const lightnessRadius = 400;
    const gradient = ctx.createRadialGradient(
      0.5 * ctx.canvas.clientWidth,
      0.5 * ctx.canvas.clientHeight,
      0,
      0.5 * ctx.canvas.clientWidth,
      0.5 * ctx.canvas.clientHeight,
      lightnessRadius * 2
    );
    gradient.addColorStop(0, "#4a7a96");
    gradient.addColorStop(0.2, "#333f58");
    gradient.addColorStop(0.5, "#333f5880");
    gradient.addColorStop(1, "#333f5820");
    ctx.fillStyle = gradient;

    const dropSize = 4;
    for (const drop of rain) {
      ctx.fillRect(
        -dropSize / 2 + remap(drop.x, 0, 1, -0.1, 1.1) * ctx.canvas.clientWidth,
        -dropSize / 2 + remap(drop.y, 0, 1, -0.1, 1.1) * ctx.canvas.clientHeight,
        dropSize * 0.8,
        dropSize
      );

      // Move drop
      drop.x += -0.001 * drop.v * delta;
      drop.x = (drop.x + 1) % 1;
      drop.y += 0.05 * drop.v * delta;
      drop.y = (drop.y + 1) % 1;
    }

    // Randomized lines
    const curves: Curve[] = [
      [
        // Top left
        { x: -0.1, y: 0.85 },
        { x: 0.02, y: 0.42 },
        { x: 0.22, y: 0.13 },
        { x: 0.18, y: -0.1 }
      ],
      [
        // Top left
        { x: -0.2, y: 0.48 },
        { x: 0.18, y: 0.34 },
        { x: 0.12, y: 0.12 },
        { x: 0.36, y: -0.2 }
      ],
      [
        // Bottom left
        { x: -0.2, y: 0.62 },
        { x: 0.19, y: 0.61 },
        { x: 0.07, y: 0.84 },
        { x: 0.24, y: 1.1 }
      ],
      [
        // Top right
        { x: 1.2, y: 0.11 },
        { x: 0.89, y: 0.25 },
        { x: 0.68, y: 0.13 },
        { x: 0.42, y: 0.15 },
        { x: 0.27, y: -0.1 }
      ],
      [
        // Middle right 1
        { x: 0.54, y: 1.1 },
        { x: 0.84, y: 0.83 },
        { x: 0.78, y: 0.28 },
        { x: 1.2, y: -0.1 }
      ],
      [
        // Middle right 2
        { x: 1.2, y: 0.32 },
        { x: 0.89, y: 0.47 },
        { x: 0.97, y: 0.91 },
        { x: 0.62, y: 1.1 }
      ],
      [
        // Bottom
        { x: -0.1, y: 0.79 },
        { x: 0.37, y: 0.79 },
        { x: 0.76, y: 1.2 }
      ]
    ].map((c) => c.map(screenSpace));

    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.25;
    ctx.shadowBlur = 9;
    ctx.shadowColor = "#4a7a9640";
    ctx.strokeStyle = "#333f58";
    ctx.setLineDash([1200, 8800]);
    const lineSpeed = 0.12;
    const offsetSize = 5830;
    for (let i = 0; i < curves.length; i++) {
      const curve = curves[i];
      ctx.lineDashOffset = -_clock * lineSpeed + i * offsetSize - 2800;
      drawPathSmooth(ctx, curve, 1.25);
    }
    ctx.lineDashOffset = 0;
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Circle
    const smallAxis = Math.min(ctx.canvas.width, ctx.canvas.height);
    const circleRadius = Math.min(smallAxis * 0.75, 400);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#333f5880";
    const offset = { x: 0.5, y: 0.5 };
    const ringCount = 6;
    for (let i = 0; i < ringCount; i++) {
      ctx.globalAlpha = ((i + 1) / ringCount) * 0.5;
      ctx.beginPath();
      const waveTime = (Math.cos((Math.PI * 2 * _clock) / 8000) + 1) / 2;
      const shrink = 16 * waveTime * (i / ringCount);
      ctx.arc(
        offset.x * ctx.canvas.clientWidth,
        offset.y * ctx.canvas.clientHeight,
        circleRadius - (i - ringCount / 2) * 24 - shrink,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  export function screenSpace(p: Point): Point {
    return {
      x: p.x * ctx.canvas.clientWidth,
      y: p.y * ctx.canvas.clientHeight
    };
  }

  function createRain(count: number = 1) {
    rain = [];

    for (let i = 0; i < count; i++) {
      const raindrop: Raindrop = {
        x: Math.random(),
        y: Math.random(),
        v: Math.random() * 0.2 + 0.8
      };
      rain.push(raindrop);
    }
  }

  onMount(() => {
    init();
  });

  const starPositions = [
    [0.15, 0.05, 0.51],
    [0.95, 0.55, 0.19],
    [0.22, 0.19, 0.22],
    [0.45, 0.08, 0.93],
    [0.75, 0.75, 0.35],
    [0.75, 0.09, 0.68],
    [0.95, 0.15, 0.21],
    [0.05, 0.25, 0.96],
    [0.08, 0.57, 0.05],
    [0.03, 0.82, 0.78],
    [0.19, 0.78, 0.32],
    [0.57, 0.95, 0.81],
    [0.32, 0.92, 0.43],
    [0.86, 0.92, 0.48]
  ];

  type RandomText = { id: number; x: number; y: number; r: number; t: string };
  let randomTextList = $state<RandomText[]>([]);

  function createRandomText() {
    if (!browser) return;
    if (!document.hasFocus()) return;

    // Random text
    let t = "";
    if (Math.random() < 0.001) {
      t = "No one will believe you."; // gaslighting
    } else {
      const randomCharacterList = "01";
      const length = Math.floor(remap(Math.random(), 0, 1, 4, 32));
      for (let i = 0; i < length; i++) {
        t += randomCharacterList.charAt(Math.floor(Math.random() * randomCharacterList.length));
      }
    }

    // Random position
    // Must be a certain radius away from the center
    let x = 0;
    let y = 0;
    let distanceFromCenter = 0;
    let tries = 0;
    while (distanceFromCenter < 550 && tries++ < 100) {
      x = remap(Math.random(), 0, 1, -128, window.innerWidth - 128);
      y = remap(Math.random(), 0, 1, -128, window.innerHeight + 128);
      distanceFromCenter = Math.min(
        Math.abs(window.innerWidth / 2 - x) + Math.abs(window.innerHeight / 2 - y), // Left side
        Math.abs(window.innerWidth / 2 - (x + t.length * 8)) + Math.abs(window.innerHeight / 2 - y) // Right side
      );
    }

    const text: RandomText = {
      id: Math.random(),
      x,
      y,
      r: remap(Math.random(), 0, 1, -15, 15),
      t
    };
    randomTextList.push(text);
  }

  function removeRandomText(id: number) {
    const i = randomTextList.findIndex((t) => t.id === id);
    if (i !== -1) {
      randomTextList.splice(i, 1);
    }
  }

  setInterval(() => {
    createRandomText();
  }, 1700);
  setInterval(() => {
    createRandomText();
  }, 1200);
</script>

<svelte:window bind:innerWidth={canvasWidth} bind:innerHeight={canvasHeight} />
<canvas bind:this={canvas} width={canvasWidth} height={canvasHeight}></canvas>
<div class="stars">
  {#each starPositions as starPosition}
    <div
      class="star"
      style={`--x: ${starPosition[0]}; --y: ${starPosition[1]}; --delay: -${starPosition[2] * 2400}ms`}
    >
      🟅
    </div>
  {/each}
</div>
<div class="grid-container"><div class="grid"></div></div>
<div class="random-text-container">
  {#each randomTextList as randomText (randomText.id)}
    <div
      in:typewriter={{}}
      out:fade={{ delay: 1200 }}
      onintroend={() => removeRandomText(randomText.id)}
      class="random-text"
      style={`--x: ${randomText.x}px; --y: ${randomText.y}px; --r: ${randomText.r}deg`}
    >
      {randomText.t}
    </div>
  {/each}
</div>

<style>
  canvas {
    position: fixed;
    inset: 0;
    margin: 0;
    z-index: -1000;
    max-width: 100%;
    max-height: 100%;

    /* background-color: #292831; */
    /* background-color: #333f58; */
    /* background-color: #000; */
    /* background-color: #0a0a0f; */
    animation: fade-in 1600ms ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .stars {
    position: fixed;
    inset: 0;
    z-index: -900;
    user-select: none;
    animation: fade-in 1600ms ease-out;
  }

  .star {
    position: absolute;
    translate: calc(var(--x, 0.5) * 100vw) calc(var(--y, 0.5) * 100svh);
    width: fit-content;
    /* transform: translate(-50%, -50%); */
    font-size: 16px;
    color: rgb(from var(--main) r g b / 0.25);
    animation: star-wink 2400ms linear infinite;
    animation-delay: var(--delay);
  }
  @keyframes star-wink {
    0%,
    50%,
    100% {
      opacity: 0.8;
      scale: 0.8;
    }
    70%,
    80% {
      opacity: 1;
      scale: 1;
    }
  }

  .grid-container {
    position: fixed;
    inset: 0;
    z-index: -1010;
    perspective: 800px;
    animation: fade-in 2400ms ease-out;
  }

  .grid {
    position: absolute;
    inset: 0;
    top: -50%;
    left: -150%;
    right: -150%;
    transform: translateY(50%) rotateX(100deg) translateY(-50%);

    --c: var(--background-main);
    --w1: 1px;
    --w2: 2px;
    --gs: 150px;
    background-image:
      linear-gradient(0deg, var(--c) var(--w1), transparent var(--w2)),
      linear-gradient(90deg, var(--c) var(--w1), transparent var(--w2)),
      linear-gradient(-90deg, var(--c) var(--w1), transparent var(--w2)),
      linear-gradient(-180deg, var(--c) var(--w1), transparent var(--w2));
    background-size: var(--gs) var(--gs);
    background-position: 50% 50%;
    mask-image: linear-gradient(to top, #000, transparent);
    opacity: 0.35;
  }

  .random-text-container {
    position: fixed;
    inset: 0;
    z-index: -1009;
    user-select: none;
    opacity: 0.1;
  }
  .random-text {
    position: absolute;
    top: var(--y);
    left: var(--x);
    width: 35ch;
    transform: translate(-50%, -50%) rotate(var(--r)) translate(50%, 50%);
    animation: fade-in 600ms ease-out;
  }
</style>
