import type I18nKeys from "../locales/keys";

interface BannerImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

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

  banners: BannerImage[];

  slugMode: "HASH" | "RAW";

  bannerStyle: "LOOP";
}

export type { Configuration, BannerImage };
