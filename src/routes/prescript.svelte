<script lang="ts">
  import { Howl } from "howler";
  import dayjs from "dayjs";
  import duration from "dayjs/plugin/duration"; // import plugin
  dayjs.extend(duration);
  import beepStartSrc from "$lib/assets/beepstart.mp3";
  import beepRepeatSrc from "$lib/assets/beep.mp3";
  import buttonPrimarySrc from "$lib/assets/button_primary.mp3";
  import buttonSecondarySrc from "$lib/assets/button_secondary.mp3";
  import { getPrescript, type RumbleType } from "$lib/city-rumbles";
  import { browser } from "$app/environment";
  import { remap } from "$lib/util";

  type PrescriptState = [
    //
    "main_menu",
    "random",
    "daily",
    "proselytize",
    "name_input",
    "name_input_transient"
  ][number];
  type AnimationState = [
    //
    "loading",
    "showing_name",
    "showing_prescript",
    "prescript_finished"
  ][number];

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
  let initial_load = $state(true); // Just for intro animations
  // Righteous real state machine
  let visible: boolean = $state(false);
  let prescriptState = $state<PrescriptState>("main_menu");
  let animationState = $state<AnimationState>("loading");

  // EVIL HACK FOR LIVE TIMERS
  // the library didn't work out...
  let secondUpdate = $state<number>(0);
  setTimeout(() => {
    secondUpdate = Date.now();
    setInterval(() => {
      secondUpdate = Date.now();
    }, 1000);
  }, Date.now() % 1000);

  // Daily timer
  let relativeLastOpened = $derived.by(() => {
    secondUpdate;
    let timeLastOpened =
      browser && localStorage.getItem("LAST_OPENED")
        ? new Date(localStorage.getItem("LAST_OPENED") ?? 0)
        : null;
    if (timeLastOpened === null) return null;

    const duration = dayjs.duration(dayjs(timeLastOpened).add(1, "day").diff());
    return duration.asSeconds() > 0 ? duration.format("HH:mm:ss") : null;
  });

  let beepStart = new Howl({
    src: [beepStartSrc],
    volume: 0.2
  });
  let beepRepeat = new Howl({
    src: [beepRepeatSrc],
    volume: 0.03
  });
  let buttonPrimary = new Howl({
    src: [buttonPrimarySrc],
    volume: 0.075
  });
  let buttonSecondary = new Howl({
    src: [buttonSecondarySrc],
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
    // Get name from local storage
    name = localStorage.getItem("PROXY_NAME") ?? "";

    // Personal daily
    if (!forOther && name) {
      showPrescript("seeded", name, true);
      return;
    }

    // Clear name for Proselytizing
    if (forOther) {
      name = "";
    }

    // Ask for name
    buttonPrimary.play();
    prescriptState = forOther ? "name_input_transient" : "name_input";
  }

  function cancelName() {
    buttonSecondary.play();
    prescriptState = "main_menu";
    initial_load = false;
  }

  function submitName() {
    if (prescriptState === "name_input") {
      localStorage.setItem("PROXY_NAME", name);
    }
    showPrescript("seeded", name);
  }

  function showPrescript(
    rumbleType: RumbleType,
    seed: string | undefined = undefined,
    updateLastOpened: boolean = false
  ) {
    buttonPrimary.play();

    if (updateLastOpened) {
      const today = new Date();
      today.setUTCSeconds(0);
      today.setUTCMinutes(0);
      today.setUTCHours(0);
      localStorage.setItem("LAST_OPENED", today.toUTCString());
    }

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
    animationState = "loading";
  }

  function resetPrescript() {
    buttonSecondary.play();
    visible = false;
    prescriptState = "main_menu";
  }

  $effect(() => {
    forceText;
    visible = false;
  });
</script>

<!-- weird transition workaround -->
{#if visible && animationState === "loading"}
  <p
    in:prescript={{ pauseDuration: 0, sound: false, speed: 15 }}
    onintroend={() => setTimeout(() => (animationState = "showing_name"), 480)}
    class="loading-line"
  >
    ...
  </p>
{:else if visible && name}
  <p
    in:prescript={{ pauseDuration: 0 }}
    onintroend={() => setTimeout(() => (animationState = "showing_prescript"), 480)}
    class="name-line text-shadow"
  >
    【To {name}】
  </p>
  {#if animationState === "showing_prescript" || animationState === "prescript_finished"}
    <p
      class="fade-in text-shadow"
      in:prescript={{}}
      onintroend={() => (animationState = "prescript_finished")}
    >
      {text}
    </p>
  {/if}
  {#if animationState === "prescript_finished"}
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
    onintroend={() => (animationState = "prescript_finished")}
  >
    {text}
  </p>
  {#if animationState === "prescript_finished"}
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
{:else if prescriptState === "name_input" || prescriptState === "name_input_transient"}
  <div class="name-input">
    <label>
      Name
      <br />
      <input class="fade-in" type="text" bind:value={name} />
    </label>
    <div class="button-group reverse">
      <button class="receive text-shadow" onclick={submitName} disabled={name.trim() === ""}>
        <div class="button-arrow-left">&gt;</div>
        SUBMIT
        <div class="button-arrow-right">&lt;</div>
      </button>
      <button class="receive text-shadow" onclick={cancelName}>
        <div class="button-arrow-left">&gt;</div>
        CANCEL
        <div class="button-arrow-right">&lt;</div>
      </button>
    </div>
  </div>
{:else}
  <div class="prescript-options">
    <button class="receive text-shadow" onclick={() => showPrescript("random")}>
      <div class="button-arrow-left">&gt;</div>
      INSTANT
      <div class="button-arrow-right">&lt;</div>
    </button>
    <button class="receive daily-button text-shadow" onclick={() => showSeeded()}>
      <div class="button-arrow-left">&gt;</div>
      DAILY
      <div class="button-arrow-right">&lt;</div>
      {#if browser && prescriptState === "main_menu"}
        <div
          class="time-popup"
          class:new={relativeLastOpened === null}
          class:fade-in={initial_load}
        >
          {#if relativeLastOpened}
            IN {relativeLastOpened}
          {:else}
            NEW
          {/if}
        </div>
      {/if}
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

  .daily-button {
    anchor-name: --daily-button;
  }
  .time-popup {
    position: absolute;
    position-anchor: --daily-button;
    position-area: inline-end center;
    position-visibility: no-overflow;
    padding: 0.25em 0.25em 0.125em 0.25em;
    margin-left: -0.25rem;
    background-color: var(--background-main);
    color: var(--text);
    font-size: 0.875rem;
    line-height: 1;
    font-family: monospace;
    text-align: center;
    user-select: none;
    translate: 0 -2px;
    opacity: 0.8;
    --opacity: 0.8;

    &.new {
      background-color: var(--background-secondary);
      opacity: 1;
    }

    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 0.35em;
      height: 0.5em;
      rotate: 45deg;
      translate: -50% -50%;
      z-index: -1;
      background-color: inherit;
    }
  }

  .loading-line {
    padding: 0.5em;
    color: rgb(from var(--text) r g b / 0.25);
  }

  .name-line {
    margin-bottom: 0.5em;
  }

  .button-group {
    display: flex;

    &.reverse {
      flex-direction: row-reverse;
    }
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
      opacity: var(--opacity, 1);
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
