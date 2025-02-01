import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "Guia de Viagem",
  subTitle: "Roteiros e dicas para uma viagem inesquecível",
  brandTitle: "Guia de Viagem",

  description: "Sua viagem legal!",

  site: "https://guiadeviagem.blog",

  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/destinos",
    },
    {
      nameKey: I18nKeys.nav_bar_about,
      href: "/sobre",
    },
    
  ],

  username: "Guia de Viagem",
  sign: "A bussola para seguir os seus sonhos!",
  avatarUrl: "/images/logo.jpeg",
  socialLinks: [
    {
      icon: "line-md:instagram",
      link: "https://www.instagram.com/guiadeviagem.blog/",
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

  slugMode: "RAW", // 'RAW' | 'HASH'



  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
