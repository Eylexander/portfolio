<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
})

// const showDropdown = ref(false)

// const changeLocale = (code: 'en' | 'fr') => {
//     switchLocalePath(code)
//     showDropdown.value = false
// }
</script>

<template>
    <UTooltip :text="$t('header_bar.toggle_language')" :ui="{ popper: { strategy: 'absolute' } }">
        <NuxtLink class="relative px-3 py-4 flex items-center justify-center transition hover:opacity-75"
            :to="switchLocalePath(availableLocales[0].code)">
            <Icon aria-hidden="true" :name="locale === 'fr' ? 'circle-flags:fx' : 'circle-flags:' + locale"
                class="w-5 h-5" />
            <span class="sr-only">{{ $t('header_bar.toggle_language') }}</span>
        </NuxtLink>
    </UTooltip>
</template>

<!-- <template>
    <UTooltip text="Toggle locale" :ui="{ popper: { strategy: 'absolute' } }">
        <button
            class="relative px-3 py-4 flex items-center justify-center transition hover:opacity-75"
            @click="showDropdown = !showDropdown"
        >
            <Icon
                aria-hidden="true"
                :name="locale === 'fr' ? 'circle-flags:fx' : 'circle-flags:' + locale"
                class="w-5 h-5"
            />
            <span class="sr-only">{{ $t('header_bar.toggle_language') }}</span>
        </button>
    </UTooltip>
    <ul
        v-if="showDropdown"
        class="absolute bg-white shadow-lg rounded-lg mt-2 py-2 w-48 dark:bg-gray-800"
        style="z-index: 1000;"
    >
        <li v-for="loc in availableLocales" :key="loc.code" class="px-4 py-2 hover:bg-gray-100" dark:hover:bg-gray-900>
            <NuxtLink :key="loc.code" :to="switchLocalePath(loc.code)" @click="changeLocale(loc.code)">
                <Icon :name="'circle-flags:' + (loc.code === 'fr' ? 'fx' : loc.code)" class="w-5 h-5 inline-block mr-2" />
            </NuxtLink>
        </li>
    </ul>
</template> -->