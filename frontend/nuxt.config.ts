// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/i18n"
  ],
  i18n: {
    locales: [
      { code: "en", iso: "en-US" },
      { code: "fr", iso: "fr-FR" },
    ],
    defaultLocale: "en",
  },
});
