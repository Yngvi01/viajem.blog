interface Window {
  pagefind: any;
  loadPagefind: () => Promise<any>;
}

declare module 'astro-pagefind' {
  export {};
} 