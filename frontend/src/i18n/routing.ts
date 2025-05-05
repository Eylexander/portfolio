import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'fr'],
    localePrefix: 'always',
    defaultLocale: 'en'
});