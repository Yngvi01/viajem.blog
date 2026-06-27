<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";

  import I18nKeys from "../locales/keys";
  import { i18n } from "../locales/translation";

  let searchKeyword = "";
  let searchResult: { title: string; url: string; excerpt: string; cover: string | null }[] = [];
  let searchBarDisplay = false;
  let isSearching = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  let resultPannel: HTMLDivElement;
  let searchBar: HTMLDivElement;
  let searchButton: HTMLButtonElement;

  async function search(keyword: string) {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!keyword.trim() || keyword.trim().length < 2) {
      searchResult = [];
      hideResultPanel();
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
        updateResultPanel();
      }
    }, 250);
  }

  function updateResultPanel() {
    requestAnimationFrame(() => {
      if (searchResult.length > 0) {
        const newHeight = `${Math.min(searchResult.length * 84 + 16, 436)}px`;
        resultPannel.style.height = newHeight;
        resultPannel.style.opacity = "1";
        resultPannel.style.visibility = "visible";
        resultPannel.style.marginTop = "8px";
        resultPannel.style.pointerEvents = "auto";
      } else {
        hideResultPanel();
      }
    });
  }

  function hideResultPanel() {
    requestAnimationFrame(() => {
      resultPannel.style.height = "0px";
      resultPannel.style.opacity = "0";
      resultPannel.style.visibility = "hidden";
      resultPannel.style.marginTop = "0px";
      resultPannel.style.pointerEvents = "none";
    });
  }

  function toggleSearchBar() {
    searchBarDisplay = !searchBarDisplay;
    requestAnimationFrame(() => {
      if (searchBarDisplay) {
        searchBar.style.height = "48px";
        searchBar.style.opacity = "1";
        // focus no input
        const input = searchBar.querySelector("input");
        input?.focus();
      } else {
        searchBar.style.height = "0px";
        searchBar.style.opacity = "0";
        hideResultPanel();
        searchKeyword = "";
        searchResult = [];
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
      }
    });
  }

  // fechar ao clicar fora
  if (typeof document !== "undefined") {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        resultPannel &&
        searchBar &&
        searchButton &&
        !resultPannel.contains(target) &&
        !searchBar.contains(target) &&
        !searchButton.contains(target)
      ) {
        requestAnimationFrame(() => {
          searchBar.style.height = "0px";
          searchBar.style.opacity = "0";
          hideResultPanel();
        });
        searchBarDisplay = false;
        searchResult = [];
        searchKeyword = "";
      }
    };

    document.addEventListener("click", handleOutsideClick);

    onMount(() => {
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    });
  }

  $: if (searchBarDisplay) search(searchKeyword);
</script>

<div class="lg:hidden">
  <button
    type="button"
    bind:this={searchButton}
    on:click={toggleSearchBar}
    aria-label="Pesquisar"
    class="flex w-11 justify-center rounded-lg py-2 text-[var(--text-color)] transition-all hover:bg-[var(--primary-color-hover)] hover:text-[var(--primary-color)]"
  >
    <Icon icon="mingcute:search-line" height={24} width={24} />
  </button>
</div>

<!-- mobile search bar -->
<div class="fixed w-full z-50 top-[4.5rem] left-0 right-0">
  <!-- search input panel -->
  <div
    bind:this={searchBar}
    class="mx-auto w-[95%] px-1 flex flex-col h-0 opacity-0 lg:hidden bg-[var(--card-color)] rounded-xl transition-all overflow-hidden before:content-[''] after:content-[''] before:pt-1 after:pb-1"
  >
    <div class="bg-black/5 dark:bg-white/5 h-10 rounded-lg flex flex-row items-center">
      <label
        for="search-bar-input-mobile"
        aria-label="Pesquisar"
        class="w-10 h-10 flex flex-row justify-center items-center pl-2 pr-1 hover:cursor-text text-gray-400"
      >
        {#if isSearching}
          <Icon icon="mingcute:loading-line" width={24} height={24} aria-hidden="true" class="animate-spin" />
        {:else}
          <Icon icon="mingcute:search-line" width={24} height={24} aria-hidden="true" />
        {/if}
      </label>
      <input
        id="search-bar-input-mobile"
        class="text-[var(--text-color)] grow bg-transparent outline-none transition-all"
        placeholder={i18n(I18nKeys.nav_bar_search_placeholder)}
        type="text"
        autocomplete="off"
        bind:value={searchKeyword}
      />
    </div>
  </div>

  <!-- result panel -->
  <div
    id="result-pannel-mobile"
    bind:this={resultPannel}
    class="max-h-[436px] overflow-y-scroll opacity-0 mx-auto h-0 w-[95%] bg-[var(--card-color)] rounded-2xl transition-all shadow-lg"
    style="visibility: hidden; pointer-events: none;"
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
</div>
