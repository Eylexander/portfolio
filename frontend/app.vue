<script setup lang="ts">
import { NuxtLayout } from '#components';
import { useI18n } from '#imports';

const { locale } = useI18n();
</script>

<template>
  <html :lang="locale">

  <body>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </body>

  </html>
</template>

<!-- <style>
*html{
  transition: background-color 1s ease;
}
</style> -->