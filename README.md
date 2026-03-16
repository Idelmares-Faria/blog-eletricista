# Blog do Eletricista — Dicas e Tutoriais de Elétrica

Blog premium baseado no template Figma "The Blog", adaptado e otimizado para a área de elétrica com suporte completo a dark/light mode.

## 📋 O que foi criado

Um blog moderno, responsivo e totalmente funcional focado em profissionais e entusiastas de elétrica, com:

- ✅ **Versão Light** — Tema claro profissional
- ✅ **Versão Dark** — Tema escuro sofisticado (#090d1f)
- ✅ **Toggle automático** — Detecta preferência do SO e salva no localStorage
- ✅ **100% responsivo** — Mobile, tablet e desktop
- ✅ **Tipografia premium** — Instrument Serif (display) + DM Sans (body)
- ✅ **Conteúdo especializado** — Instalações Elétricas, Normas, Segurança, Manutenção, etc.

## 📁 Estrutura de arquivos

```
blog-eletricista/
├── index.html          # Markup completo com semântica HTML5
├── post.html           # Template interno para exibir artigos
├── category.html       # Visualização de posts por categoria
├── search.html         # Página de resultados da busca
├── about.html          # Página sobre o projeto
├── newsletter.html     # Página para inscrição na newsletter
├── styles.css          # CSS com variables para theming
├── script.js           # JS para toggle tema, menu mobile, etc.
├── server.js           # Servidor Node.js + API REST com PostgreSQL
├── README.md           # Este arquivo
└── data/               # Arquivos de dados (se aplicável)
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

1. **Navbar** — Logo, menu de navegação, campo de busca, theme toggle
2. **Hero** — Destaque inicial do site com tipografia grande e CTA
3. **Posts Recentes** — Exibe um banco de cards das postagens mais novas
4. **Todos os Posts** — Grid flexível de visualização de posts cadastrados
5. **Paginação** — Navegação entre páginas de posts
6. **Footer** — Copyright + links de navegação adicionais
7. **Páginas Auxiliares** — Sobre, Busca, Categorias e Newsletter

## 🚀 Como usar

### Iniciar o servidor Node.js + Banco de Dados (PostgreSQL)

O projeto requer o PostgreSQL rodando e a configuração no `.env` com a variável `DATABASE_URL`.

```bash
# Instalar dependências
npm install

# Rodar o servidor Node
npm start
# (ou `npm run dev` para logs e debug, se configurado)
```

Abra [http://localhost:3457](http://localhost:3457) no navegador.

### Customizar conteúdo

- **Logo**: Editar `.navbar__logo` no HTML
- **Cores**: Modificar CSS variables em `[data-theme="light"]` e `[data-theme="dark"]` do arquivo `styles.css`
- **Banco de Dados**: Usar os scripts em `schema.sql` ou `seed.js` caso precise popular o banco novamente.

## ✨ Features implementados

- 🌓 **Dark Mode automático** — Detecta `prefers-color-scheme` do SO
- 💾 **Persistência de tema** — Salva escolha do usuário no localStorage
- 📱 **Menu mobile** — Hamburger menu responsivo
- ✨ **Scroll reveal** — Animações ao descer a página
- 🎯 **Hover effects** — Transições suaves em cards e links
- ♿ **Acessibilidade** — ARIA labels, semântica HTML5
- 🗄️ **Integração Real com API** — Posts, categorias, newsletter e comentários via PostgreSQL e Node

## 🎭 Temas de conteúdo abordados

- Instalações Residenciais e Comerciais
- Normas Técnicas e NBR (NR-10, NBR 5410)
- Segurança em Eletricidade e EPIs
- Iluminação e Projetos Luminotécnicos
- Manutenção Preventiva e Corretiva
- Ferramentas e Instrumentos de Medição

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

## 📊 Responsividade

- **Desktop**: 1440px+ (grid ou layouts maiores)
- **Tablet**: 768px–1024px
- **Mobile**: <768px (grid 1 coluna, menu hamburger)

## 🎬 Animações

- **Hero reveal** e **Scroll reveal** com visual moderno.
- **Hover effects**: Cards levantam e imagens dão zoom ligeiramente.
- **Theme transition**: 400ms smooth para trocar de tema.

## 📋 Checklist

- ✅ HTML semântico usando boas práticas
- ✅ CSS com variables para customização global e fácil
- ✅ Backend integrado em PostgreSQL com pool connections
- ✅ Dark mode autônomo e salvo em localStorage
- ✅ Mobile adaptativo
- ✅ Performance otimizada (caching simple, sem payloads pesados)

---

**Criado com ❤️ baseado no template "The Blog", adaptado e estendido para o Blog do Eletricista**
