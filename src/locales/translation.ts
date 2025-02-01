import YukinaConfig from "../../yukina.config";
import type I18nKeys from "./keys";
import { pt_BR } from "./languages/pt_br";
import { zh_CN } from "./languages/zh_cn";

export type Translation = {
  [K in I18nKeys]: string;
};

const map: { [key: string]: Translation } = {
  "pt-br": pt_BR,
  "zh-cn": zh_CN,
};

export function getTranslation(lang: string): Translation {
  return map[lang.toLowerCase()] || pt_BR;
}

export function i18n(key: I18nKeys, ...interpolations: string[]): string {
  const lang = YukinaConfig.locale;
  let translation = getTranslation(lang)[key];
  interpolations.forEach((interpolation) => {
    translation = translation.replace("{{}}", interpolation);
  });
  return translation;
}
