<script lang="ts">
  import { Howl } from "howler";
  import beepStartSrc from "$lib/assets/beepstart.mp3";
  import beepRepeatSrc from "$lib/assets/beep.mp3";
  import buttonPressSrc from "$lib/assets/button.mp3";
  import { getPrescript } from "./city-rumbles";

  let {
    forceText,
    visible = $bindable(false)
  }: {
    forceText?: string;
    visible?: boolean;
  } = $props();
  let text: string = $state("");
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

    if (sound) beepStart.play();

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

  function showPrescript() {
    if (forceText) {
      text = forceText;
    } else {
      text = getPrescript();
    }
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

{#if visible}
  <p
    class="fade-in text-shadow"
    in:prescript={{}}
    onintrostart={() => (visibleDone = false)}
    onintroend={() => (visibleDone = true)}
  >
    {text}
  </p>
  {#if visibleDone}
    <button
      in:prescript={{ pauseDuration: 360, sound: false, speed: 12 }}
      class="proceed text-shadow"
      onclick={resetPrescript}
    >
      &gt;&gt;&gt;
    </button>
  {/if}
{:else}
  <button class="receive text-shadow" onclick={showPrescript}>
    <div class="button-arrow-left">&gt;</div>
    RECEIVE
    <div class="button-arrow-right">&lt;</div>
  </button>
{/if}

<style>
  p {
    margin: 0;
  }

  .receive {
    display: flex;
    padding: 0.75em 0.75em;
    margin-block: -0.75em;
    cursor: pointer;
    transition: opacity 140ms ease;
    opacity: 0.9;

    &:hover {
      opacity: 1;
    }
  }

  .button-arrow-left {
    user-select: none;
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
    user-select: none;
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

  .proceed {
    padding: 0.5em 0.5em;
    margin-block: -0.5em;
    margin-top: 0.75rem;
    font-size: 0.8em;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 240ms ease;
    animation: fade-in-partial 560ms ease-out;

    &:hover {
      opacity: 1;
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
</style>
