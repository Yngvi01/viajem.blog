import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "Guia de Viagem",
  subTitle: "Roteiros e dicas para uma viagem inesquecível",
  brandTitle: "Guia de Viagem",

  description: "Sua viagem legal!",

  site: "https://Viagem.blog",

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

  username: "Viagem.blog",
  sign: "A bussola para seguir os seus sonhos!",
  avatarUrl: "/images/logo.jpg",
  socialLinks: [
    {
      icon: "line-md:instagram",
      link: "#",
    },
    {
      icon: "line-md:facebook",
      link: "#",
    },
  ],

  banners: [
    "/images/banner3.jpg",
    "/images/banner1.jpg",
    "/images/banner4.jpg",
    "/images/banner5.jpg",

    
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'



  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
