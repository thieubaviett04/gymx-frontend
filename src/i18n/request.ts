import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Load các namespace i18n song song
  const [common, auth, dashboard] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/dashboard.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      ...auth.default,
      ...dashboard.default,
    },
  };
});
