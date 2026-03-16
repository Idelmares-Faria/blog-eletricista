# AtivMax Blog — Marketing Digital

Blog premium baseado no template Figma "The Blog - A Web Personal Blog", adaptado e otimizado para marketing digital com suporte completo a dark/light mode.

## 📋 O que foi criado

Um blog moderno, responsivo e totalmente funcional com:

- ✅ **Versão Light** — Tema claro profissional
- ✅ **Versão Dark** — Tema escuro sofisticado (#090d1f)
- ✅ **Toggle automático** — Detecta preferência do SO e salva no localStorage
- ✅ **100% responsivo** — Mobile, tablet e desktop
- ✅ **Tipografia premium** — Instrument Serif (display) + DM Sans (body)
- ✅ **Conteúdo marketing** — Tráfego Pago, SEO, Copywriting, Email, Funis, etc.

## 📁 Estrutura de arquivos

```
portal-ativmax/
├── index.html          # Markup completo com semântica HTML5
├── styles.css          # CSS com variables para theming
├── script.js           # JS para toggle tema + mobile menu + scroll reveal
├── server.js           # Servidor Node.js leve para preview
├── README.md           # Este arquivo
└── .claude/
    └── launch.json     # Config para preview via Claude Code
```

## 🎨 Design System

### Cores (Light Mode)
- **Background**: `#ffffff`
- **Text Primary**: `#1a1a1a`
- **Text Secondary**: `#667085`
- **Accent**: `#6941c6` (Purple)
- **Borders**: `rgba(0, 0, 0, 0.12)`

### Cores (Dark Mode)
- **Background**: `#090d1f` (Navy)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#c0c5d0`
- **Accent**: `#a78bfa` (Purple lighter)
- **Borders**: `rgba(255, 255, 255, 0.08)`

### Tipografia
- **Display**: Instrument Serif (itálico para logo)
- **Body**: DM Sans
- **Sizes**: 14px–244px com escalas responsivas

## 📱 Seções do Blog

1. **Navbar** — Logo, menu navegação, theme toggle
2. **Hero** — "THE BLOG" em typografia serifada monumental
3. **Posts Recentes** — Featured card grande + 2 cards horizontais laterais
4. **Post Destaque** — Layout com imagem esquerda + conteúdo direita
5. **Todos os Posts** — Grid 3 colunas com 6 posts
6. **Paginação** — Navegação entre páginas
7. **Footer** — Copyright + links sociais

## 🚀 Como usar

### Iniciar o servidor

```bash
# Opção 1: Usar Node.js (recomendado)
node server.js

# Opção 2: Usar http-server
http-server -p 3457

# Opção 3: Usar Python
python -m http.server 3457
```

Abra [http://localhost:3457](http://localhost:3457) no navegador.

### Customizar conteúdo

- **Logo**: Editar `.navbar__logo` no HTML
- **Posts**: Adicionar novos `<article class="post-card post-card--vertical">` no grid
- **Cores**: Modificar CSS variables em `[data-theme="light"]` e `[data-theme="dark"]`
- **Fontes**: Alterar import do Google Fonts em `<head>`

## ✨ Features implementados

- 🌓 **Dark Mode automático** — Detecta `prefers-color-scheme` do SO
- 💾 **Persistência de tema** — Salva escolha do usuário no localStorage
- 📱 **Menu mobile** — Hamburger menu responsivo
- ✨ **Scroll reveal** — Animações ao descer a página
- 🎯 **Hover effects** — Transições suaves em cards e links
- ♿ **Acessibilidade** — ARIA labels, semântica HTML5
- ⚡ **Performance** — CSS variables, zero JS frameworks

## 🎭 Temas de conteúdo implementados

- Tráfego Pago (Facebook Ads, Google Ads)
- SEO e conteúdo orgânico
- Copywriting e headlines
- Email Marketing e automação
- Funis de vendas high-ticket
- Social Media (Instagram, TikTok)
- Analytics e métricas
- Landing pages e conversão
- Comunidades digitais

## 🔧 Personalização

### Alterar cores globalmente

Edite as variáveis CSS no início de `styles.css`:

```css
[data-theme="light"] {
  --accent: #sua-cor-aqui;
  --text-primary: #sua-cor-aqui;
  /* ... etc */
}

[data-theme="dark"] {
  --accent: #sua-cor-aqui;
  /* ... etc */
}
```

### Adicionar novas seções

Copie a estrutura de uma seção existente e adapte as classes CSS.

### Modificar tipografia

Altere o import de fontes em `<head>` ou use Web Safe Fonts.

## 📊 Responsividade

- **Desktop**: 1440px+ (grid 3 colunas)
- **Tablet**: 768px–1024px (grid 2 colunas)
- **Mobile**: <768px (grid 1 coluna, menu hamburger)

## 🎬 Animações

- **Hero reveal**: Tipografia gigante com fade-in + border grow
- **Scroll reveal**: Cards fadein+slide ao entrar no viewport
- **Hover effects**: Cards levantam (translateY) + imagens zoom
- **Theme transition**: 400ms smooth para trocar de tema

## 📋 Checklist

- ✅ HTML semântico completo
- ✅ CSS com variables para fácil customização
- ✅ JavaScript puro (zero dependências)
- ✅ Dark mode funcionando
- ✅ Mobile responsivo
- ✅ Performance otimizada
- ✅ Conteúdo marketing digital
- ✅ Imagens via Unsplash (é possível substituir)

## 🤝 Próximos passos (opcional)

1. Conectar a um CMS (Strapi, WordPress, Ghost)
2. Adicionar sistema de comentários
3. Integrar newsletter
4. SEO/Open Graph meta tags
5. Analytics (GA, Mixpanel)
6. Busca por posts
7. Categorias/Tags filter

---

**Criado com ❤️ baseado no template "The Blog" do Figma, adaptado para AtivMax**
