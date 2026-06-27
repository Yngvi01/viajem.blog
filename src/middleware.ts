import { defineMiddleware } from "astro:middleware";
import { isAuthenticated } from "./utils/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protege todas as rotas /admin/*
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated(context.request)) {
      return context.redirect(
        "/login?redirect=" + encodeURIComponent(pathname),
        302,
      );
    }
  }

  return next();
});
