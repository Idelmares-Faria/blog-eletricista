export interface AdLocation {
  key: string
  label: string
  page: string
  width: number
  height: number
  description: string
  scalable: boolean // true = multiplica conforme quantidade de posts
}

export const AD_LOCATIONS: AdLocation[] = [
  // ═══ HOMEPAGE ═══
  {
    key: 'home_banner_1',
    label: 'Homepage — Banner Superior',
    page: 'Homepage',
    width: 1148,
    height: 100,
    description: 'Banner horizontal entre as categorias e os posts recentes. Visível para todos os visitantes.',
    scalable: false,
  },
  {
    key: 'home_banner_2',
    label: 'Homepage — Banner Inferior',
    page: 'Homepage',
    width: 1148,
    height: 100,
    description: 'Banner horizontal entre os posts recentes e a listagem geral de posts.',
    scalable: false,
  },
  {
    key: 'home_between_posts',
    label: 'Homepage — Entre Posts',
    page: 'Homepage',
    width: 1148,
    height: 100,
    description: 'Banner inserido a cada 6 posts na grid de "Todos os posts". Quanto mais artigos, mais banners aparecem.',
    scalable: true,
  },

  // ═══ POST (ARTIGO) ═══
  {
    key: 'post_sidebar',
    label: 'Artigo — Sidebar',
    page: 'Post',
    width: 288,
    height: 180,
    description: 'Banner na sidebar entre artigos recomendados. Aparece 1x a cada artigo recomendado listado.',
    scalable: true,
  },
  {
    key: 'post_after_content',
    label: 'Artigo — Após Conteúdo',
    page: 'Post',
    width: 728,
    height: 90,
    description: 'Banner horizontal após o conteúdo do artigo, antes da caixa do autor.',
    scalable: false,
  },

  // ═══ CATEGORIAS ═══
  {
    key: 'categorias_banner',
    label: 'Categorias — Banner',
    page: 'Categorias',
    width: 1148,
    height: 100,
    description: 'Banner horizontal após o carrossel de categorias, antes da grid de posts.',
    scalable: false,
  },
  {
    key: 'categorias_between_posts',
    label: 'Categorias — Entre Posts',
    page: 'Categorias',
    width: 1148,
    height: 100,
    description: 'Banner inserido a cada 6 posts na listagem. Escala com a quantidade de artigos filtrados.',
    scalable: true,
  },

  // ═══ BUSCA ═══
  {
    key: 'busca_banner',
    label: 'Busca — Banner',
    page: 'Busca',
    width: 1148,
    height: 100,
    description: 'Banner horizontal acima dos resultados de busca.',
    scalable: false,
  },
]

export function getLocationByKey(key: string): AdLocation | undefined {
  return AD_LOCATIONS.find(l => l.key === key)
}

export function getLocationsByPage(page: string): AdLocation[] {
  return AD_LOCATIONS.filter(l => l.page === page)
}
