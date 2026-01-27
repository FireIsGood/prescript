<script lang="ts">
  import { Howl } from "howler";
  import indexLogo from "$lib/assets/index_logo.png";
  import buttonOpenSrc from "$lib/assets/button_open.mp3";
  import buttonCloseSrc from "$lib/assets/button_close.mp3";
  import Prescript from "./prescript.svelte";
  import { browser } from "$app/environment";

  let buttonClose = new Howl({
    src: [buttonCloseSrc],
    volume: 0.3
  });

  let buttonOpen = new Howl({
    src: [buttonOpenSrc],
    volume: 0.3
  });

  function toggleSecretMenu() {
    if (secretMenuVisible) {
      buttonOpen.play();
    } else {
      buttonClose.play();
    }
    secretMenuVisible = !secretMenuVisible;
  }

  function resetName() {
    const res = confirm("Are you sure? You will have to re-input next Daily");
    if (!res) return;

    localStorage.removeItem("PROXY_NAME");
    alert("Name reset");
  }

  let secretMenuVisible: boolean = $state(false);
  let forceText: string = $state("");
  let forceID: string = $state("");
</script>

<section class="top-section">
  <div class="image-holder">
    <button class="secret-menu-toggle" ondblclick={toggleSecretMenu}>
      <div class="image-overlay">
        <img src={indexLogo} alt="Index Logo" class="center-image" />
        {#each [0, 1, 2, 3] as i}
          <img
            src={indexLogo}
            alt="Index Logo"
            class="center-image glow-image"
            style={`--delay: -${((i + 1) / 4) * 3600}ms`}
          />
        {/each}
      </div>
    </button>
  </div>
  {#if browser}
    <div class="secret-menu" class:hidden={!secretMenuVisible}>
      <div class="secret-menu-inner">
        <h2>Weaver Controls</h2>
        <div class="secret-control">
          <label>
            Force Text<br />
            <textarea rows="3" bind:value={forceText} class="secret-textarea"></textarea>
          </label>
        </div>
        <div class="secret-control">
          <label
            >Force ID<br />
            <input type="text" bind:value={forceID} class="secret-input" size="16" />
          </label>
        </div>
        <div class="secret-control">
          <button class="secret-button" onclick={resetName}>Reset your name</button>
        </div>
      </div>
    </div>
  {/if}
</section>
<section>
  <div class="prescript-text">
    <Prescript {forceText} {forceID} />
  </div>
</section>

<style>
  .top-section {
    margin-top: min(30svh, 75vw);
    display: flex;
  }

  .image-holder {
    grid: flex;
    place-items: center;
  }

  .secret-menu-toggle {
    display: block;
  }

  .center-image {
    height: 25vh;
    user-select: none;
    -webkit-user-drag: none;
  }

  .image-overlay {
    display: grid;
    > * {
      grid-area: -1 / 1;
    }
  }

  .glow-image {
    animation: glow 3600ms infinite ease-out;
    animation-delay: var(--delay);
    mix-blend-mode: color;
    z-index: -1;
  }
  @keyframes glow {
    0% {
      scale: 1;
      opacity: 0.2;
    }
    60% {
      scale: 1.35;
    }
    100% {
      scale: 1.35;
      opacity: 0;
    }
  }

  .secret-menu {
    width: 35ch;
    height: calc-size(auto, size); /* Modern CSS magic */
    overflow: clip;
    transition:
      height 240ms ease-in,
      width 240ms ease-in;
    transition-behavior: allow-discrete;

    &.hidden {
      width: 0;
      height: 0;
    }
  }

  .secret-menu-inner {
    width: 35ch;
  }

  .secret-control {
    padding-bottom: 0.5rem;
  }

  .secret-textarea {
    box-shadow: var(--shadow);
  }

  .secret-button {
    background-color: rgb(from var(--background-high) r g b / 0.8);
    box-shadow: var(--shadow);
    padding: 0.25em 0.75em;

    &:hover {
      background-color: rgb(from var(--background-high) r g b / 0.9);
    }
    &:active {
      background-color: var(--background-high);
    }
    &:disabled {
      color: rgb(from var(--text-muted) r g b / 0.6);
      background-color: rgb(from var(--background-high) r g b / 0.6);
    }
  }

  .prescript-text {
    max-width: 50ch;
    text-align: center;
    font-size: 1.5em;
    --min-fs: 1;
    --max-fs: 1.5;
    --min-vw: 10;
    --max-vw: 45;

    --min-fs-rem: var(--min-fs) * 1rem;
    --max-fs-rem: var(--max-fs) * 1rem;
    --min-vw-rem: var(--min-vw) * 1rem;

    --slope: (var(--max-fs) - var(--min-fs)) * (100vw - var(--min-vw-rem)) /
      (var(--max-vw) - var(--min-vw));

    font-size: clamp(var(--min-fs-rem), var(--min-fs-rem) + var(--slope), var(--max-fs-rem));
  }
</style>
