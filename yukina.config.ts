import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const YukinaConfig: Configuration = {
  title: "Guia de Viagem",
  subTitle: "A direção para sua viagem inesquecível! ",
  brandTitle: "Guia de Viagem",

  description:
    "A direção para sua viagem inesquecível! Dicas, roteiros e experiências para planejar sua próxima aventura.",

  site: "https://guiadeviagem.blog",

  keywords:
    "viagem, turismo, dicas de viagem, roteiros de viagem, destinos turísticos, guia de viagem, melhores lugares para visitar, planejamento de viagem, férias, hospedagem, passeios, aventura, Brasil, internacional",

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
  avatarUrl: "images/avatar.png",
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
    {
      url: "/images/banner/banner1.png",
      alt: "Ilustração em estilo low poly do Rio de Janeiro, com o Pão de Açúcar e a Baía de Guanabara sob um pôr do sol caloroso em tons dourados e alaranjados",
      width: 1920,
      height: 1080,
    },
    {
      url: "/images/banner/banner2.png",
      alt: "Ilustração em estilo low poly das Cataratas do Iguaçu, destacando as quedas d'água majestosas e um suave arco-íris sob a luz do entardecer",
      width: 1920,
      height: 1080,
    },
    {
      url: "/images/banner/banner3.png",
      alt: "Ilustração em estilo low poly dos Lençóis Maranhenses, retratando as dunas de areia branca e lagoas azul-turquesa sob o brilho de um pôr do sol aconchegante",
      width: 1920,
      height: 1080,
    },
    {
      url: "/images/banner/banner4.png",
      alt: "Ilustração em estilo low poly da Chapada Diamantina, destacando o Morro do Pai Inácio banhado pela luz dourada e rústica do entardecer",
      width: 1920,
      height: 1080,
    },
    {
      url: "/images/banner/banner5.png",
      alt: "Ilustração em estilo low poly do centro histórico de Ouro Preto, mostrando ladeiras e igrejas coloniais barrocas iluminadas pelo brilho acolhedor de fim de tarde",
      width: 1920,
      height: 1080,
    },
  ],

  slugMode: "RAW", // 'RAW' | 'HASH'

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default YukinaConfig;
