<script lang="ts">
  import "../app.css";
  import image from "$lib/assets/index_logo.png";
  import Rainy from "./rainy.svelte";

  let { children } = $props();

  const title = "𝐏𝐫𝐞𝐬𝐜𝐫𝐢𝐩𝐭: 【𝐃𝐞𝐯𝐢𝐜𝐞】";
  const description = "As the City Wills";
  const url = "https://fireisgood.github.io/prescript/";
</script>

<svelte:head>
  <!-- Meta tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="color-scheme" content="light dark" />

  <!-- Open Graph / Facebook -->
  <meta property="og:url" content={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <!-- Twitter -->
  <meta property="twitter:url" content={url} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />

  <!-- Font -->
  <link rel="preload" as="font" href="Perfect.woff" type="font/woff" crossorigin="anonymous" />

  <!-- Favicon-->
  <link rel="icon" type="image/png" href="favicon/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="favicon/favicon.svg" />
  <link rel="shortcut icon" href="favicon/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />
  <link rel="manifest" href="favicon/site.webmanifest" />
</svelte:head>

<main>
  {@render children()}
</main>
<footer>
  <p>Created by <a href="https://github.com/FireIsGood" target="_blank">FireIsGood</a></p>
  <p><a href="https://github.com/FireIsGood/prescript" target="_blank">Source code</a></p>
</footer>
<Rainy />

<style>
  main {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  footer {
    display: flex;
    row-gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: auto;
    padding: 1rem 1.5rem;
    color: var(--text-muted);

    opacity: 0.25;
    transition: opacity 280ms ease;

    &:hover {
      opacity: 1;
    }

    p {
      margin-block: 0;
    }
  }
</style>
