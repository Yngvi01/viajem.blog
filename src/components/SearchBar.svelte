<script lang="ts">
  import { onMount } from "svelte";
  import { OverlayScrollbars } from "overlayscrollbars";
  import Icon from "@iconify/svelte";

  import I18nKeys from "../locales/keys";
  import { i18n } from "../locales/translation";

  let searchKeyword = "";
  let searchResult: { title: string; url: string; excerpt: string; cover: string | null }[] = [];
  let isSearching = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  let resultPannel: HTMLDivElement;
  let searchBar: HTMLDivElement;

  onMount(() => {
    OverlayScrollbars(resultPannel, {
      scrollbars: {
        theme: "scrollbar-base scrollbar-auto py-1",
        autoHide: "move",
      },
    });
  });

  async function search(keyword: string) {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!keyword.trim() || keyword.trim().length < 2) {
      searchResult = [];
      hidePanel();
      return;
    }

    debounceTimer = setTimeout(async () => {
      isSearching = true;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(keyword.trim())}`);
        if (res.ok) {
          searchResult = await res.json();
        } else {
          searchResult = [];
        }
      } catch {
        searchResult = [];
      } finally {
        isSearching = false;
        updatePanel();
      }
    }, 250);
  }

  function updatePanel() {
    if (searchResult.length > 0) {
      resultPannel.style.height = `${Math.min(searchResult.length * 84 + 16, 436)}px`;
      resultPannel.style.opacity = "1";
    } else {
      hidePanel();
    }
  }

  function hidePanel() {
    resultPannel.style.height = "0px";
    resultPannel.style.opacity = "0";
  }

  // fechar ao clicar fora
  document.addEventListener("click", (event) => {
    if (
      !resultPannel?.contains(event.target as any) &&
      !searchBar?.contains(event.target as any)
    ) {
      searchKeyword = "";
      searchResult = [];
      hidePanel();
    }
  });

  $: search(searchKeyword);
</script>

<!-- search bar -->
<div bind:this={searchBar} class="search-bar hidden lg:block">
  <div class="bg-black/5 dark:bg-white/5 h-10 rounded-lg flex flex-row items-center">
    <label
      for="search-bar-input"
      class="w-10 h-10 flex flex-row justify-center items-center pl-2 pr-1 hover:cursor-text text-gray-400"
    >
      {#if isSearching}
        <Icon icon="mingcute:loading-line" width={24} height={24} class="animate-spin" />
      {:else}
        <Icon icon="mingcute:search-line" width={24} height={24} />
      {/if}
    </label>
    <input
      id="search-bar-input"
      class="w-36 text-[var(--text-color)] xl:focus:w-60 bg-transparent outline-none transition-all"
      placeholder={i18n(I18nKeys.nav_bar_search_placeholder)}
      type="text"
      autocomplete="off"
      on:focus={() => search(searchKeyword)}
      bind:value={searchKeyword}
    />
  </div>
</div>

<!-- result panel -->
<div
  id="result-pannel"
  bind:this={resultPannel}
  class="max-h-[436px] overflow-y-scroll opacity-0 !absolute h-0 -right-3 w-[28rem] bg-[var(--card-color)] rounded-2xl top-20 transition-all shadow-xl"
>
  <div
    class="flex flex-col h-full onload-animation before:content-[''] before:pt-2 after:content-[''] after:pb-2"
  >
    {#each searchResult as item}
      <a
        href={item.url}
        class="mx-2 py-2 px-3 rounded-xl result-item transition-all hover:bg-[var(--primary-color-transparent)]"
      >
        <div class="flex flex-row space-x-1 items-center">
          <p
            class="line-clamp-1 text-lg font-semibold text-[var(--text-color)] result-title"
          >
            {item.title}
          </p>
          <span class="text-[var(--primary-color)] font-extrabold">
            <Icon icon="cuida:caret-right-outline" width={16} height={16} />
          </span>
        </div>
        <div>
          <div class="h-10">
            <p
              class="item-excerpt text-sm line-clamp-2 text-[var(--text-color-lighten)]"
            >
              {item.excerpt}
            </p>
          </div>
        </div>
      </a>
    {:else}
      {#if searchKeyword.length >= 2 && !isSearching}
        <p class="mx-4 my-3 text-sm text-[var(--text-color-lighten)]">Nenhum resultado encontrado.</p>
      {/if}
    {/each}
  </div>
</div>