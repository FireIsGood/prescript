<script lang="ts">
  import { Howl } from "howler";
  import beepStartSrc from "$lib/assets/beepstart.mp3";
  import beepRepeatSrc from "$lib/assets/beep.mp3";
  import buttonPressSrc from "$lib/assets/button.mp3";
  import { getPrescript, type RumbleType } from "./city-rumbles";

  let {
    forceText,
    forceID
  }: {
    forceText?: string;
    forceID?: string;
  } = $props();
  let name: string = $state("");
  let text: string = $state("");
  let rumbleSeed: string = $state("");
  // Evil fake state machine
  let visible: boolean = $state(false);
  let inputtingName: boolean = $state(false); // When a name is being input
  let transientInput: boolean = $state(false); // When a name should not be remembered
  let introDone: boolean = $state(false); // When the intro "to name" finishes
  let visibleDone: boolean = $state(false); // When the animation finishes

  function remap(
    value: number,
    lowIn: number,
    highIn: number,
    lowOut: number,
    highOut: number
  ): number {
    return lowOut + (value - lowIn) * ((highOut - lowOut) / (highIn - lowIn));
  }

  let beepStart = new Howl({
    src: [beepStartSrc],
    volume: 0.2
  });
  let beepRepeat = new Howl({
    src: [beepRepeatSrc],
    volume: 0.03
  });
  let buttonPress = new Howl({
    src: [buttonPressSrc],
    volume: 0.075
  });

  function prescript(
    node: HTMLElement,
    {
      pauseDuration = 750,
      sound = true,
      speed = 40
    }: { pauseDuration?: number; sound?: boolean; speed?: number }
  ) {
    const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

    if (!valid) {
      throw new Error(`This transition only works on elements with a single text node child`);
    }

    const text = node.textContent;
    const textScrollDuration = text.length * (1000 / speed);
    const duration = textScrollDuration + pauseDuration;

    if (pauseDuration > 0 && sound) {
      beepStart.play();
    }

    return {
      duration,
      tick: (t: number) => {
        const textPaused = t * duration < pauseDuration;

        let sliceCount = 0;
        let randomCount = text.length;
        if (!textPaused) {
          const _t = remap(t * duration, pauseDuration, duration, 0, 1);
          sliceCount = Math.trunc(text.length * _t);
          if (t === 1) sliceCount = text.length;
          randomCount = text.length - sliceCount;
        }

        const visibleSlice = text.slice(0, sliceCount);
        let randomSlice = "";

        // Random fill
        const randomCharacterList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < randomCount; i++) {
          if (text.charAt(sliceCount + i) === " ") {
            randomSlice += "​"; // zero width space
          }
          randomSlice += randomCharacterList.charAt(
            Math.floor(Math.random() * randomCharacterList.length)
          );
        }

        node.textContent = visibleSlice + randomSlice;

        // Sounds
        if (!beepRepeat.playing() && !textPaused) {
          if (sound) beepRepeat.play();
        }
      }
    };
  }

  // Gets name if not known to load up a daily seed
  // For Other option makes it ask always and not remember
  function showSeeded(forOther: boolean = false) {
    transientInput = forOther;

    // Get name from local storage
    name = localStorage.getItem("PROXY_NAME") ?? "";

    if (!forOther && name) {
      showPrescript("seeded", name);
      return;
    }

    // Clear name for Proselytizing
    if (forOther) {
      name = "";
    }

    // Ask for name
    inputtingName = true;
  }

  function submitName() {
    inputtingName = false;
    if (!transientInput) {
      localStorage.setItem("PROXY_NAME", name);
    }
    showPrescript("seeded", name);
  }

  function showPrescript(rumbleType: RumbleType, seed: string | undefined = undefined) {
    if (forceText) {
      text = forceText;
    } else if (forceID) {
      const id = parseInt(forceID, 36);
      const res = getPrescript(rumbleType, seed, id);
      text = res.text;
      rumbleSeed = res.rumbleSeed;
    } else {
      const res = getPrescript(rumbleType, seed);
      text = res.text;
      rumbleSeed = res.rumbleSeed;
    }

    name = seed ?? "";
    visible = true;
  }

  function resetPrescript() {
    buttonPress.play();
    visible = false;
  }

  $effect(() => {
    forceText;
    visible = false;
  });
</script>

{#if visible && name}
  <!-- weird transition workaround -->
  <p
    in:prescript={{ pauseDuration: 0 }}
    onintrostart={() => {
      introDone = false;
      visibleDone = false;
    }}
    onintroend={() => setTimeout(() => (introDone = true), 480)}
    class="name-line text-shadow"
  >
    【To {name}】
  </p>
  {#if introDone}
    <p class="fade-in text-shadow" in:prescript={{}} onintroend={() => (visibleDone = true)}>
      {text}
    </p>
  {/if}
  {#if visibleDone}
    <p class="prescript-meta fade-in">
      ID: {rumbleSeed} - {new Date().getUTCFullYear()}/{new Date().getUTCMonth() +
        1}/{new Date().getUTCDate()}
    </p>
    <button
      in:prescript={{ pauseDuration: 360, sound: false, speed: 12 }}
      class="proceed text-shadow"
      onclick={resetPrescript}
    >
      &gt;&gt;&gt;
    </button>
  {/if}
{:else if visible}
  <p
    class="fade-in text-shadow"
    in:prescript={{}}
    onintrostart={() => (visibleDone = false)}
    onintroend={() => (visibleDone = true)}
  >
    {text}
  </p>
  {#if visibleDone}
    <p class="prescript-meta fade-in">
      ID: {rumbleSeed}
    </p>
    <button
      in:prescript={{ pauseDuration: 360, sound: false, speed: 12 }}
      class="proceed text-shadow"
      onclick={resetPrescript}
    >
      &gt;&gt;&gt;
    </button>
  {/if}
{:else if inputtingName}
  <div class="name-input">
    <label>
      Name
      <br />
      <input class="fade-in" type="text" bind:value={name} />
    </label>
    <button class="receive text-shadow" onclick={submitName} disabled={name.trim() === ""}>
      <div class="button-arrow-left">&gt;</div>
      SUBMIT
      <div class="button-arrow-right">&lt;</div>
    </button>
  </div>
{:else}
  <div class="prescript-options">
    <button class="receive text-shadow" onclick={() => showPrescript("random")}>
      <div class="button-arrow-left">&gt;</div>
      INSTANT
      <div class="button-arrow-right">&lt;</div>
    </button>
    <button class="receive text-shadow" onclick={() => showSeeded()}>
      <div class="button-arrow-left">&gt;</div>
      DAILY
      <div class="button-arrow-right">&lt;</div>
    </button>
    <button class="receive text-shadow" onclick={() => showSeeded(true)}>
      <div class="button-arrow-left">&gt;</div>
      PROSELYTIZE
      <div class="button-arrow-right">&lt;</div>
    </button>
  </div>
{/if}

<style>
  p {
    margin: 0;
  }

  .name-input {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .prescript-options {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
  }

  .receive {
    display: flex;
    padding: 0.25em 0.75em;
    cursor: pointer;
    transition: opacity 140ms ease;
    opacity: 0.5;

    .button-arrow-right,
    .button-arrow-left {
      opacity: 0;
      user-select: none;
      transition: opacity 140ms ease;
    }

    &:is(:hover, :focus):not(:disabled) {
      opacity: 1;

      .button-arrow-right,
      .button-arrow-left {
        opacity: 1;
      }
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .button-arrow-left {
    animation: float-left 2400ms infinite ease-in-out;
  }
  @keyframes float-left {
    0%,
    100% {
      translate: -3px 0;
    }
    50% {
      translate: 0 0;
    }
  }
  .button-arrow-right {
    animation: float-right 2400ms infinite ease-in-out;
  }
  @keyframes float-right {
    0%,
    100% {
      translate: 3px 0;
    }
    50% {
      translate: 0 0;
    }
  }

  .name-line {
    margin-bottom: 0.5em;
  }

  .proceed {
    padding: 0.5em 0.5em;
    margin-block: -0.5em;
    margin-top: 1.5rem;
    font-size: 0.8em;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 240ms ease;
    animation: fade-in-partial 560ms ease-out;

    &:hover,
    &:focus {
      opacity: 1;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  @keyframes fade-in-partial {
    0%,
    50% {
      opacity: 0;
    }
    to {
      opacity: 0.5;
    }
  }

  .fade-in {
    animation: fade-in 280ms ease-out;
  }
  @keyframes fade-in {
    from {
      opacity: 0.2;
    }
    to {
      opacity: 1;
    }
  }
  .prescript-meta {
    color: rgb(from var(--text) r g b / 0.25);
    font-size: 0.625em;
    margin-top: 1rem;
    opacity: 0;
    animation-fill-mode: forwards;
    animation-delay: 360ms;
  }
</style>
