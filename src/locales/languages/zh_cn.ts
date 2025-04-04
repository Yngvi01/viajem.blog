import type { Translation } from "../translation";
import key from "../keys";

export const zh_CN: Translation = {
  [key.copy_right_author]: "作者",
  [key.copy_right_publish_date]: "发布日期",
  [key.copy_right_license]: "许可证",
  [key.source_link]: "源链接",

  [key.nav_bar_home]: "首页",
  [key.nav_bar_archive]: "归档",
  [key.nav_bar_about]: "关于",
  [key.nav_bar_github]: "GitHub",
  [key.nav_bar_search_placeholder]: "搜索",

  [key.post_card_words]: "字",
  [key.post_card_minutes]: "分钟",

  [key.side_bar_categories]: "分类",
  [key.side_bar_tags]: "标签",

  [key.archive_year_title_count]: "共 {{}} 篇文章",
  [key.archive_year_title_count_single]: "共 {{}} 篇文章",

  [key.pages_categories_archive]: "文章归档",
  [key.pages_tags_archive]: "标签归档",
  [key.pages_archive_archive]: "归档",
  // Adicionando as chaves que estavam faltando
  [key.category_archive_title]: "Artigos sobre {{}}",
  [key.category_archive_subtitle]: "Explorando a categoria {{}}",
  [key.errors_category_not_found]: "Categoria não encontrada",
};
