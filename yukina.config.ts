import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "Viajem.Blog",
  subTitle: "a bussola para seguir os seus sonhos!",
  brandTitle: "Viajem.Blog",

  description: "Sua viajem legal!",

  site: "https://Viajem.blog",

  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/archive",
    },
    {
      nameKey: I18nKeys.nav_bar_about,
      href: "/about",
    },
    
  ],

  username: "Viajem.blog",
  sign: "viajando",
  avatarUrl: "/images/logo.jpg",
  socialLinks: [
    {
      icon: "line-md:instagram",
      link: "https://github.com/WhitePaper233",
    },
    {
      icon: "line-md:facebook",
      link: "https://space.bilibili.com/22433608",
    },
  ],

  banners: [
    "/images/banner3.jpg",
    "/images/banner1.jpg",
    "/images/banner4.jpg",
    "/images/banner5.jpg",

    
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
