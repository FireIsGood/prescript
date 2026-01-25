<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>𝐏𝐫𝐞𝐬𝐜𝐫𝐢𝐩𝐭: 【𝐃𝐞𝐯𝐢𝐜𝐞】</title>
  <!-- Font -->
  <link rel="preload" as="font" href="Perfect.woff" type="font/woff" crossorigin="anonymous" />

  <!-- Favicon-->
  <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
  <link rel="shortcut icon" href="/favicon/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
  <link rel="manifest" href="/favicon/site.webmanifest" />
</svelte:head>

{@render children()}
