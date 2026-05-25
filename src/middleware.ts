import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const pathname = url.pathname;

  // Si l'URL est exactement "/" : redirige selon Accept-Language
  if (pathname === '/' || pathname === '') {
    const acceptLang = context.request.headers.get('accept-language') ?? '';
    const prefersArabic = acceptLang.toLowerCase().includes('ar');
    const target = prefersArabic ? '/ar/' : '/fr/';
    return context.redirect(target, 302);
  }

  return next();
});
