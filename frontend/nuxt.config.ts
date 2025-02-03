// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@nuxt/ui",
    "@nuxtjs/color-mode",
    "@formkit/auto-animate",
    "@nuxtjs/sitemap",
    "@vueuse/nuxt",
    "@nuxtjs/robots",
    "@nuxt/test-utils",
  ],
  i18n: {
    locales: [
      { code: "en", iso: "en-US", name: "English", file: "en-US.ts" },
      { code: "fr", iso: "fr-FR", name: "Français", file: "fr-FR.ts" },
    ],
    langDir: "locales/",
    lazy: true,
    defaultLocale: "en",
    strategy: "prefix",
    detectBrowserLanguage: false,
    vueI18n: "./i18n/i18n.config.ts",
  },
  colorMode: {
    preference: "system",
    fallback: "dark",
  },
  ui: {
    global: true
  }
});