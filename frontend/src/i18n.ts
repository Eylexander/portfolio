import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en-US', 'fr-FR'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  
  let locale = 'en-US';

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage && acceptLanguage.toLowerCase().includes('fr')) {
      locale = 'fr-FR';
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
