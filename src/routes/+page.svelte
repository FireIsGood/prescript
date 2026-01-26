<script lang="ts">
  import indexLogo from "$lib/assets/index_logo.png";
  import Prescript from "./prescript.svelte";

  function toggleSecretMenu() {
    secretMenuVisible = !secretMenuVisible;
  }

  function resetPrescript() {
    visible = false;
  }

  let secretMenuVisible: boolean = $state(false);
  let forceText: string = $state("");
  let visible: boolean = $state(false);
</script>

<main>
  <section class="top-section">
    <div class="image-holder">
      <button class="secret-menu-toggle" ondblclick={toggleSecretMenu}>
        <img src={indexLogo} alt="Index Logo" class="center-image" />
      </button>
    </div>
    {#if secretMenuVisible}
      <div class="secret-menu">
        <h2>Weaver Controls</h2>
        <div class="secret-control">
          <label>
            Force Text<br />
            <textarea rows="3" bind:value={forceText}></textarea>
          </label>
        </div>
        <div class="secret-control">
          <button class="secret-button" onclick={resetPrescript} disabled={!visible}
            >Reset prescript</button
          >
        </div>
      </div>
    {/if}
  </section>
  <section>
    <div class="prescript-text">
      <Prescript {forceText} bind:visible />
    </div>
  </section>
</main>

<style>
  main {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .top-section {
    margin-top: min(30svh, 50vw);
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

  .secret-menu {
    min-width: 35ch;
  }

  .secret-control {
    padding-bottom: 0.5rem;
  }

  .secret-button {
    background-color: rgb(from var(--background-high) r g b / 0.8);
    padding: 0.25em 0.75em;
    &:hover {
      background-color: rgb(from var(--background-high) r g b / 0.9);
    }
    &:active {
      background-color: var(--background-high);
    }
    &:disabled {
      background-color: rgb(from var(--background-high) r g b / 0.6);
    }
  }

  .prescript-text {
    max-width: 50ch;
    text-align: center;
    font-size: 1.5em;
  }
</style>
