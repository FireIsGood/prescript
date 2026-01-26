<script lang="ts">
  import { onMount } from "svelte";

  // Individual droplets. xy are positions from 0 to 1 like a shader.
  type Raindrop = {
    x: number;
    y: number;
    v: number; // Velocity
  };

  let canvas: HTMLCanvasElement;
  let canvasWidth: number = 100;
  let canvasHeight: number = 100;
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
    // Clear previous frame
    ctx.clearRect(0, 0, ctx.canvas.clientWidth * 2, ctx.canvas.clientHeight * 2);

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
        -dropSize / 2 + drop.x * ctx.canvas.clientWidth,
        -dropSize / 2 + drop.y * ctx.canvas.clientHeight + 20,
        dropSize * 0.8,
        dropSize
      );

      // Move drop
      drop.x += -0.001 * drop.v * delta;
      drop.x = (drop.x + 1) % 1;
      drop.y += 0.05 * drop.v * delta;
      drop.y = (drop.y + 1) % 1;
    }

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
</style>
