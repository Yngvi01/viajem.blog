<script lang="ts">
  import { onMount } from "svelte";
  // Importar OverlayScrollbars sob demanda quando necessário
  let OverlayScrollbars: any;
  import Icon from "@iconify/svelte";

  import I18nKeys from "../locales/keys";
  import { i18n } from "../locales/translation";

  let searchKeyword = "";
  let searchResult: any[] = [];
  let searchInitialized = false;
  let isSearching = false;
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  let resultPannel: HTMLDivElement;
  let searchBar: HTMLDivElement;

  let search = (keyword: string) => {};

  onMount(async () => {
    searchInitialized = true;
    
    // setup overlay scrollbars apenas quando houver resultados
    const initScrollbars = async () => {
      // Atrasar carregamento até ser realmente necessário
      if (!OverlayScrollbars) {
        const module = await import("overlayscrollbars");
        OverlayScrollbars = module.OverlayScrollbars;
      }
      
      // Usar requestAnimationFrame para sincronizar com a renderização
      requestAnimationFrame(() => {
        OverlayScrollbars(resultPannel, {
          scrollbars: {
            theme: "scrollbar-base scrollbar-auto py-1",
            autoHide: "move",
          },
        });
      });
    };

    /**
     * Asynchronously performs a search based on the provided keyword.
     * If in development mode, extracts a subset of mock results for demonstration.
     * Otherwise, fetches results from the Pagefind search engine and populates the array.
     * Toggles the visibility and height of the results panel based on the outcome.
     */
    search = async (keyword: string) => {
      // Evitar buscas repetidas do mesmo termo
      if (isSearching) return;
      
      // Cancelar busca anterior se estiver em progresso
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Debounce para evitar buscas enquanto o usuário digita
      searchTimeout = setTimeout(async () => {
        if (keyword.trim().length < 2) {
          searchResult = [];
          updateResultPanel(false);
          return;
        }
        
        isSearching = true;
        
        try {
          let searchResultArr = [];
          
          // Envolver operação pesada em uma Promise e executeAsync para liberar a thread principal
          await new Promise<void>(resolve => {
            // Usar setTimeout de 0 para permitir que a UI responda enquanto processamos
            setTimeout(async () => {
              try {
                // @ts-ignore
                const ret = await pagefind.search(keyword);
                
                // Processar resultados em lotes para reduzir bloqueio
                const results = ret.results;
                const batchSize = 5;
                
                for (let i = 0; i < results.length; i += batchSize) {
                  const batch = results.slice(i, i + batchSize);
                  const batchResults = await Promise.all(
                    batch.map(item => item.data())
                  );
                  
                  searchResultArr = [...searchResultArr, ...batchResults];
                  
                  // Se for o primeiro lote, já atualizamos a UI para feedback mais rápido
                  if (i === 0) {
                    searchResult = [...searchResultArr];
                    updateResultPanel(true);
                    
                    // Inicializar scrollbars se temos resultados suficientes
                    if (searchResultArr.length > 5) {
                      initScrollbars();
                    }
                  }
                  
                  // Pequena pausa entre lotes para permitir que a UI responda
                  if (i + batchSize < results.length) {
                    await new Promise(r => setTimeout(r, 10));
                  }
                }
                
                // Atualizar com todos os resultados
                searchResult = searchResultArr;
                updateResultPanel(searchResultArr.length > 0);
              } catch (error) {
                console.error("Erro na busca:", error);
                searchResult = [];
                updateResultPanel(false);
              }
              
              resolve();
            }, 0);
          });
        } finally {
          isSearching = false;
          searchTimeout = null;
        }
      }, 250); // Debounce de 250ms
    };
    
    // Separar a atualização visual da lógica de busca
    const updateResultPanel = (shouldShow: boolean) => {
      requestAnimationFrame(() => {
        if (shouldShow) {
          resultPannel.style.height = `${Math.min(searchResult.length * 84 + 16, 436)}px`;
          resultPannel.style.opacity = "100%";
        } else {
          resultPannel.style.height = "0px";
          resultPannel.style.opacity = "0";
        }
      });
    };
  });

  // Usar evento delegado para capturar cliques fora e otimizar listeners
  if (typeof document !== 'undefined') {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!searchInitialized) return;
      
      const target = event.target as Node;
      if (
        resultPannel && 
        searchBar &&
        !resultPannel.contains(target) &&
        !searchBar.contains(target)
      ) {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          searchTimeout = null;
        }
        searchResult = [];
        requestAnimationFrame(() => {
          resultPannel.style.height = "0px";
          resultPannel.style.opacity = "0";
        });
      }
    };
    
    document.addEventListener("click", handleOutsideClick);
    
    // Cleanup listener on component destruction
    onMount(() => {
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    });
  }

  // Implementar debounce reativo para a busca
  $: {
    if (searchInitialized) {
      search(searchKeyword);
    }
  }
</script>

<!-- search bar -->
<div bind:this={searchBar} class="search-bar hidden lg:block">
  <div class="bg-black/5 dark:bg-white/5 h-10 rounded-lg flex flex-row">
    <label
      for="search-bar-input"
      aria-label="Pesquisar"
      class="w-10 h-10 flex flex-row justify-center items-center pl-2 pr-1 hover:cursor-text text-gray-400"
    >
      <Icon icon="mingcute:search-line" width={24} height={24} aria-hidden="true" />
    </label>
    <input
      id="search-bar-input"
      class="w-36 text-[var(--text-color)] xl:focus:w-60 bg-transparent outline-none transition-all"
      placeholder={i18n(I18nKeys.nav_bar_search_placeholder)}
      type="text"
      autocomplete="off"
      on:focus={() => {
        search(searchKeyword);
      }}
      bind:value={searchKeyword}
    />
  </div>
</div>

<!-- result pannel -->
<div
  id="result-pannel"
  bind:this={resultPannel}
  class="max-h-[436px] overflow-y-scroll opacity-0 !absolute h-0 -right-3 w-[28rem] bg-[var(--card-color)] rounded-2xl top-20 transition-all"
>
  <div
    class="flex flex-col h-full onload-animation before:content-[''] before:pt-2 after:content-[''] after:pb-2"
  >
    {#each searchResult as item}
      <a
        href={item.url}
        class="mx-2 py-2 px-3 rounded-xl result-item transition-all"
      >
        <div class="flex flex-row space-x-1 items-center">
          <p
            class="line-clamp-1 text-lg font-semibold text-[var(--text-color)] result-title"
          >
            {item.meta.title}
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
              {@html item.excerpt}
            </p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
