<script lang="ts">
  import { Howl } from "howler";
  import beepStartSrc from "$lib/assets/beepstart.mp3";
  import beepRepeatSrc from "$lib/assets/beep.mp3";
  import { getPrescript } from "./city-rumbles";

  let {
    forceText,
    visible = $bindable(false)
  }: {
    forceText?: string;
    visible?: boolean;
  } = $props();
  let text: string = $state("");

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

  function prescript(node: HTMLElement) {
    const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

    if (!valid) {
      throw new Error(`This transition only works on elements with a single text node child`);
    }

    const speed = 40; // Characters shown per second
    const text = node.textContent;
    const textScrollDuration = text.length * (1000 / speed);
    const pauseDuration = 750;
    const duration = textScrollDuration + pauseDuration;

    beepStart.play();

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
          beepRepeat.play();
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

  $effect(() => {
    forceText;
    visible = false;
  });
</script>

{#if visible}
  <p class="fade-in text-shadow" in:prescript>{text}</p>
{:else}
  <button class="receive text-shadow" onclick={showPrescript} class:hidden={visible}>
    &gt;RECEIVE&lt;
  </button>
{/if}

<style>
  p {
    margin: 0;
  }

  .receive {
    padding: 0.75em 0.75em;
    margin-block: -0.75em;
    cursor: pointer;
    transition: opacity 140ms ease;
    opacity: 0.9;

    /* background-color: #fff2; */

    &:hover {
      opacity: 1;
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
