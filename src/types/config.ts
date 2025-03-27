import type I18nKeys from "../locales/keys";

interface Configuration {
  title: string;
  subTitle: string;
  brandTitle: string;

  keywords: string;

  description: string;

  site: string;

  locale: "pt-BR" | "zh-CN";

  navigators: { nameKey: I18nKeys; href: string }[];

  username: string;
  sign: string;
  avatarUrl: string;

  socialLinks: { icon: string; link: string; label: string }[];

  banners: string[];

  slugMode: "HASH" | "RAW";

  bannerStyle: "LOOP";
}

export type { Configuration };
