<script lang="ts">
  import "../app.css";
  import image from "$lib/assets/index_logo.png";

  let { children } = $props();

  const title = "𝐏𝐫𝐞𝐬𝐜𝐫𝐢𝐩𝐭: 【𝐃𝐞𝐯𝐢𝐜𝐞】";
  const description = "As the City Wills";
</script>

<svelte:head>
  <!-- Meta tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="color-scheme" content="light dark" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <!-- Twitter -->
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

{@render children()}
