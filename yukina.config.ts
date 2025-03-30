import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "Guia de Viagem",
  subTitle: "A direção para sua viagem inesquecível! ",
  brandTitle: "Guia de Viagem",

  description: "A direção para sua viagem inesquecível! Dicas, roteiros e experiências para planejar sua próxima aventura.",

  site: "https://guiadeviagem.blog",
  
  keywords: "viagem, turismo, dicas de viagem, roteiros de viagem, destinos turísticos, guia de viagem, melhores lugares para visitar, planejamento de viagem, férias, hospedagem, passeios, aventura, Brasil, internacional",

  locale: "pt-BR", // set for website language and date format

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
  avatarUrl: "/src/images/logo.png",
  socialLinks: [
    {
      icon: "line-md:instagram",
      link: "https://www.instagram.com/guiadeviagem.blog/",
      label: "Instagram do Guia de Viagem",
    },
    {
      icon: "line-md:facebook",
      link: "#",
      label: "Facebook do Guia de Viagem",
    },
  ],

  banners: [
    "https://cdn.pixabay.com/photo/2015/06/14/23/35/rio-de-janeiro-809756_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/01/04/08/22/brasil-3912643_1280.jpg",
    "https://cdn.pixabay.com/photo/2015/12/17/23/53/ouro-preto-1098064_960_720.jpg",
    "https://cdn.pixabay.com/photo/2016/01/15/23/46/rio-1142673_960_720.jpg",
    "https://cdn.pixabay.com/photo/2016/11/14/04/57/brazil-1822657_960_720.jpg",
    "https://cdn.pixabay.com/photo/2017/05/30/20/34/reflection-2358116_960_720.jpg",
  ],

  slugMode: "RAW", // 'RAW' | 'HASH'

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
