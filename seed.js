const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  // Categories
  await pool.query(`
    INSERT INTO categories (slug, name, color) VALUES
      ('instalacoes', 'Instalações', 'yellow'),
      ('seguranca', 'Segurança', 'red'),
      ('normas', 'Normas Técnicas', 'blue'),
      ('manutencao', 'Manutenção', 'green'),
      ('materiais', 'Materiais', 'orange')
    ON CONFLICT (slug) DO NOTHING
  `);

  const catResult = await pool.query('SELECT id, slug FROM categories');
  const cats = Object.fromEntries(catResult.rows.map(r => [r.slug, r.id]));

  // Tags
  await pool.query(`
    INSERT INTO tags (name) VALUES
      ('NBR 5410'), ('SPDA'), ('Aterramento'), ('Disjuntor'), ('Tomada'),
      ('Fiação'), ('Iluminação'), ('Quadro de Distribuição'), ('CFTV'), ('DPS')
    ON CONFLICT (name) DO NOTHING
  `);

  const tagResult = await pool.query('SELECT id, name FROM tags');
  const tags = Object.fromEntries(tagResult.rows.map(r => [r.name, r.id]));

  // Posts
  const posts = [
    {
      slug: 'nbr-5410-entenda-a-norma-instalacoes-eletricas',
      title: 'NBR 5410: entenda a norma que regula instalações elétricas no Brasil',
      excerpt: 'A NBR 5410 é a principal norma brasileira para instalações elétricas em baixa tensão. Saiba o que ela exige e por que seguir é obrigatório.',
      content: '<h2>O que é a NBR 5410?</h2><p>A <strong>NBR 5410</strong> é a norma técnica da ABNT (Associação Brasileira de Normas Técnicas) que estabelece os requisitos para instalações elétricas de baixa tensão em edificações. Ela é a referência principal para qualquer eletricista ou engenheiro que atua em projetos residenciais, comerciais e industriais no Brasil.</p><h2>Por que seguir a norma é obrigatório?</h2><p>Seguir a NBR 5410 não é apenas uma boa prática — em muitos casos é obrigação legal. Os principais motivos são:</p><ul><li><strong>Segurança:</strong> evita choques elétricos, incêndios e acidentes</li><li><strong>Seguro residencial:</strong> seguradoras podem negar indenizações se a instalação não estiver em conformidade</li><li><strong>Habite-se:</strong> prefeituras exigem laudo elétrico conforme a norma</li><li><strong>Responsabilidade civil:</strong> o eletricista pode ser responsabilizado por instalações fora do padrão</li></ul><h2>Principais exigências da NBR 5410</h2><h3>Circuitos independentes</h3><p>A norma exige que determinados equipamentos tenham circuitos exclusivos: chuveiros, fornos, ar-condicionado, máquina de lavar e geladeira devem ter circuitos separados para evitar sobrecarga.</p><h3>Aterramento</h3><p>Todo sistema elétrico deve ter um sistema de aterramento eficiente. O aterramento protege equipamentos e pessoas em caso de falha de isolação.</p><h3>Disjuntores adequados</h3><p>Cada circuito deve ser protegido por um disjuntor com capacidade nominal adequada à seção do condutor utilizado. Usar disjuntores superdimensionados é perigoso.</p><h3>Tomadas com proteção</h3><p>Tomadas em banheiros, cozinhas, áreas externas e garagens devem ter proteção por DR (Dispositivo Residual), que desliga automaticamente em caso de fuga de corrente.</p><h2>Como saber se sua instalação está em conformidade?</h2><p>Contrate um eletricista habilitado (com registro no CREA ou CFT) para fazer uma vistoria completa. Ele emitirá um laudo técnico atestando a conformidade ou apontando as adequações necessárias.</p>',
      author_name: 'Ricardo Oliveira',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      author_bio: 'Eletricista com 15 anos de experiência em instalações residenciais e comerciais. Especialista em adequação à NBR 5410.',
      category_slug: 'normas',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
      featured: true,
      read_time: '8 min de leitura',
      date: '2026-03-10',
      tags: ['NBR 5410', 'Aterramento']
    },
    {
      slug: 'como-dimensionar-quadro-de-distribuicao-residencial',
      title: 'Como dimensionar o quadro de distribuição residencial corretamente',
      excerpt: 'O quadro de distribuição é o coração da instalação elétrica. Veja como calcular o número de circuitos e escolher os disjuntores certos.',
      content: '<h2>O que é o quadro de distribuição?</h2><p>O <strong>quadro de distribuição</strong> (QD) é o painel elétrico que concentra todos os disjuntores e dispositivos de proteção da instalação. É por ele que a energia é distribuída para cada circuito da casa ou empresa.</p><h2>Passo a passo para dimensionar o quadro</h2><h3>1. Levante todos os circuitos necessários</h3><p>Mapeie todos os pontos de energia e iluminação. A NBR 5410 define que cada circuito pode ter no máximo:</p><ul><li><strong>Iluminação:</strong> até 1.000 VA por circuito</li><li><strong>Tomadas de uso geral (TUG):</strong> até 1.500 VA por circuito</li><li><strong>Tomadas de uso específico (TUE):</strong> circuito exclusivo por equipamento</li></ul><h3>2. Identifique os circuitos exclusivos obrigatórios</h3><p>Os seguintes equipamentos exigem circuito exclusivo:</p><ul><li>Chuveiro elétrico</li><li>Ar-condicionado</li><li>Forno elétrico / microondas de alta potência</li><li>Máquina de lavar e secar</li><li>Geladeira (recomendado)</li></ul><h3>3. Escolha os disjuntores corretos</h3><p>O disjuntor deve ser dimensionado pela seção do condutor:</p><ul><li>Fio 1,5 mm² → disjuntor de 10A (iluminação)</li><li>Fio 2,5 mm² → disjuntor de 16A (tomadas gerais)</li><li>Fio 4 mm² → disjuntor de 20A ou 25A (chuveiro)</li><li>Fio 6 mm² → disjuntor de 32A (ar-condicionado split)</li></ul><h3>4. Adicione folga para expansão</h3><p>Sempre deixe pelo menos 2 a 4 disjuntores livres no quadro para futuras expansões. Isso evita a necessidade de trocar o quadro quando for instalar um equipamento novo.</p><h2>Exemplo prático: residência de 80 m²</h2><p>Para uma residência de 80 m², o quadro típico terá:</p><ul><li>2 circuitos de iluminação</li><li>3 circuitos de tomadas gerais</li><li>1 circuito para chuveiro</li><li>1 circuito para ar-condicionado</li><li>1 circuito para máquina de lavar</li><li>1 disjuntor geral</li></ul><p>Total: quadro de 12 a 16 disjuntores com DR obrigatório.</p>',
      author_name: 'Carlos Mendes',
      author_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
      author_bio: 'Técnico em eletrotécnica e professor de cursos profissionalizantes de elétrica predial.',
      category_slug: 'instalacoes',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      featured: true,
      read_time: '10 min de leitura',
      date: '2026-03-08',
      tags: ['Quadro de Distribuição', 'Disjuntor', 'NBR 5410']
    },
    {
      slug: 'aterramento-eletrico-o-que-e-e-como-fazer',
      title: 'Aterramento elétrico: o que é, para que serve e como fazer',
      excerpt: 'O aterramento é a principal proteção contra choques elétricos. Entenda como funciona e saiba verificar se o seu está correto.',
      content: '<h2>O que é aterramento elétrico?</h2><p>O <strong>aterramento</strong> é a conexão intencional de partes metálicas da instalação elétrica com a terra, usando um condutor de baixa resistência. Ele é a principal defesa contra choques elétricos e danos a equipamentos sensíveis.</p><h2>Como funciona o aterramento?</h2><p>Quando ocorre uma falha de isolamento em um equipamento (por exemplo, a fase toca a carcaça metálica de uma geladeira), a corrente elétrica segue pelo condutor de aterramento até a terra, ao invés de passar pelo corpo de uma pessoa. O disjuntor DR detecta essa fuga e desliga o circuito instantaneamente.</p><h2>Componentes do sistema de aterramento</h2><ul><li><strong>Eletrodo de aterramento:</strong> haste de cobre cravada no solo (mínimo 2,4m de profundidade)</li><li><strong>Barramento de aterramento (PE):</strong> barra no quadro elétrico que recebe todos os condutores de proteção</li><li><strong>Condutor de proteção (fio verde/amarelo):</strong> conecta as massas metálicas dos equipamentos ao barramento</li></ul><h2>Como verificar se o aterramento está funcionando?</h2><p>Use um multímetro:</p><ol><li>Configure para tensão CA</li><li>Meça entre fase e neutro: deve indicar ~127V ou ~220V</li><li>Meça entre fase e terra: deve indicar o mesmo valor</li><li>Meça entre neutro e terra: deve indicar próximo a 0V (máximo 2V)</li></ol><p>Se a medição entre fase e terra for zero, o aterramento não está funcionando.</p><h2>Resistência de aterramento</h2><p>A NBR 5410 recomenda que a resistência do eletrodo de aterramento seja inferior a <strong>10 ohms</strong>. Para medir, é necessário um terrômetro (medidor de resistência de terra).</p>',
      author_name: 'Ricardo Oliveira',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      author_bio: 'Eletricista com 15 anos de experiência em instalações residenciais e comerciais. Especialista em adequação à NBR 5410.',
      category_slug: 'seguranca',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
      featured: false,
      read_time: '7 min de leitura',
      date: '2026-03-05',
      tags: ['Aterramento', 'NBR 5410']
    },
    {
      slug: 'como-instalar-tomada-2p-t-passo-a-passo',
      title: 'Como instalar tomada 2P+T (padrão brasileiro) passo a passo',
      excerpt: 'Aprenda a instalar tomadas no padrão NBR 14136 com segurança. Guia completo com fotos e dicas para não errar.',
      content: '<h2>Padrão brasileiro de tomadas (NBR 14136)</h2><p>Desde 2011, o Brasil adotou o padrão <strong>NBR 14136</strong> para tomadas e plugues. Existem dois tamanhos: tomada de 10A (para equipamentos comuns) e tomada de 20A (para equipamentos de maior potência).</p><h2>Materiais necessários</h2><ul><li>Tomada 2P+T (fase, neutro e terra) no padrão NBR 14136</li><li>Caixa de embutir 4x2</li><li>Chave de fenda e philips</li><li>Alicate de corte e descascador</li><li>Multímetro (para verificação)</li><li>Fita isolante ou conector Wago</li></ul><h2>Passo a passo da instalação</h2><h3>1. Desligue o disjuntor</h3><p><strong>NUNCA trabalhe com o circuito energizado.</strong> Desligue o disjuntor correspondente no quadro e sinalize para que ninguém o ligue durante o serviço. Confirme com o multímetro que não há tensão nos fios.</p><h3>2. Identifique os fios</h3><ul><li><strong>Fase:</strong> fio preto ou vermelho (tensão)</li><li><strong>Neutro:</strong> fio azul (retorno)</li><li><strong>Terra:</strong> fio verde/amarelo (proteção)</li></ul><h3>3. Descasque os fios</h3><p>Retire aproximadamente 1,5 cm de isolamento de cada fio. Torça levemente os fios de cobre para garantir bom contato.</p><h3>4. Conecte na tomada</h3><p>As tomadas NBR 14136 têm 3 terminais identificados:</p><ul><li><strong>L (Line/Fase):</strong> conecte o fio preto/vermelho</li><li><strong>N (Neutro):</strong> conecte o fio azul</li><li><strong>⏚ (Terra):</strong> conecte o fio verde/amarelo (pino central)</li></ul><h3>5. Fixe na caixa e teste</h3><p>Encaixe a tomada na caixa, aparafuse e coloque a placa. Ligue o disjuntor e teste com um plug para verificar o funcionamento.</p>',
      author_name: 'João Silva',
      author_avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&q=80',
      author_bio: 'Eletricista residencial há 10 anos. Criador de tutoriais práticos para eletricistas e leigos.',
      category_slug: 'instalacoes',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
      featured: false,
      read_time: '6 min de leitura',
      date: '2026-03-01',
      tags: ['Tomada', 'NBR 5410']
    },
    {
      slug: 'spda-para-raios-como-funciona-e-quando-instalar',
      title: 'SPDA para raios: como funciona e quando instalar',
      excerpt: 'O Sistema de Proteção contra Descargas Atmosféricas (SPDA) é obrigatório em muitas edificações. Entenda o que diz a NBR 5419.',
      content: '<h2>O que é o SPDA?</h2><p>O <strong>SPDA (Sistema de Proteção contra Descargas Atmosféricas)</strong>, popularmente conhecido como para-raios, é o conjunto de dispositivos projetado para proteger edificações e pessoas contra os efeitos dos raios. No Brasil, é regulamentado pela norma <strong>NBR 5419</strong>.</p><h2>Como funciona o para-raios?</h2><p>O SPDA funciona como um caminho de baixa resistência para que a corrente do raio chegue ao solo sem passar pelas estruturas da edificação. Ele é composto por:</p><ul><li><strong>Captores (terminais aéreos):</strong> hastes metálicas no topo da edificação que capturam a descarga</li><li><strong>Condutores de descida:</strong> cabos que conduzem a corrente do captor até o solo</li><li><strong>Eletrodo de aterramento:</strong> sistema de hastes enterradas que dissipam a energia no solo</li></ul><h2>Quando o SPDA é obrigatório?</h2><p>Segundo a NBR 5419, é obrigatório em:</p><ul><li>Edificações com altura superior a 10m (em algumas situações)</li><li>Estruturas em locais com alta densidade de raios</li><li>Locais com grande concentração de pessoas (escolas, hospitais, shoppings)</li><li>Locais com materiais inflamáveis ou explosivos</li><li>Edificações com equipamentos eletrônicos sensíveis</li></ul><p>A análise de risco (conforme NBR 5419) determina se um SPDA é necessário para cada edificação específica.</p><h2>DPS: Dispositivo de Proteção contra Surtos</h2><p>Além do SPDA externo, é fundamental instalar <strong>DPS (Dispositivos de Proteção contra Surtos)</strong> no quadro elétrico. Eles protegem os equipamentos eletrônicos dos surtos de tensão causados por raios próximos.</p>',
      author_name: 'Carlos Mendes',
      author_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
      author_bio: 'Técnico em eletrotécnica e professor de cursos profissionalizantes de elétrica predial.',
      category_slug: 'seguranca',
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80',
      featured: false,
      read_time: '9 min de leitura',
      date: '2026-02-25',
      tags: ['SPDA', 'DPS', 'NBR 5410']
    },
    {
      slug: 'fio-ou-cabo-qual-usar-em-instalacoes-eletricas',
      title: 'Fio ou cabo elétrico: qual usar em instalações elétricas?',
      excerpt: 'Muita gente confunde fio com cabo. Saiba a diferença, quando usar cada um e como escolher a seção correta para cada aplicação.',
      content: '<h2>Fio vs Cabo: qual a diferença?</h2><p>Muitas pessoas usam os termos "fio" e "cabo" como sinônimos, mas tecnicamente são diferentes:</p><ul><li><strong>Fio elétrico:</strong> condutor único (sólido ou flexível) com isolamento simples. Usado em instalações fixas dentro de eletrodutos.</li><li><strong>Cabo elétrico:</strong> conjunto de condutores agrupados dentro de uma capa protetora externa. Usado em instalações que necessitam de maior flexibilidade ou proteção mecânica.</li></ul><h2>Fios mais comuns em instalações residenciais</h2><h3>Fio rígido (sólido)</h3><p>Condutor de cobre sólido com isolação em PVC. Indicado para instalações fixas em eletrodutos. As seções mais comuns são 1,5mm², 2,5mm², 4mm², 6mm² e 10mm².</p><h3>Fio flexível</h3><p>Condutor de múltiplos fios finos trançados. Mais fácil de manusear que o rígido. Indicado para conexões que exigem mais mobilidade.</p><h2>Como escolher a seção correta?</h2><p>A regra básica:</p><ul><li><strong>1,5 mm²:</strong> circuitos de iluminação (até 10A)</li><li><strong>2,5 mm²:</strong> tomadas de uso geral (até 16A)</li><li><strong>4 mm²:</strong> chuveiro elétrico, lavadora (até 25A)</li><li><strong>6 mm²:</strong> ar-condicionado de alta potência (até 32A)</li><li><strong>10 mm²:</strong> alimentação de quadros secundários</li></ul><h2>Cores dos fios e seus significados</h2><p>A NBR 5410 define as cores:</p><ul><li><strong>Preto, vermelho, marrom:</strong> fase</li><li><strong>Azul claro:</strong> neutro</li><li><strong>Verde ou verde/amarelo:</strong> proteção (terra)</li></ul><p>Nunca improvise com as cores — isso facilita manutenções futuras e evita acidentes.</p>',
      author_name: 'João Silva',
      author_avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&q=80',
      author_bio: 'Eletricista residencial há 10 anos. Criador de tutoriais práticos para eletricistas e leigos.',
      category_slug: 'materiais',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
      featured: false,
      read_time: '7 min de leitura',
      date: '2026-02-20',
      tags: ['Fiação', 'NBR 5410']
    }
  ];

  for (const post of posts) {
    const catId = cats[post.category_slug];
    const res = await pool.query(
      `INSERT INTO posts (slug, title, excerpt, content, author_name, author_avatar, author_bio, category_id, image, featured, read_time, date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (slug) DO NOTHING RETURNING id`,
      [post.slug, post.title, post.excerpt, post.content, post.author_name, post.author_avatar, post.author_bio, catId, post.image, post.featured, post.read_time, post.date]
    );
    if (res.rows.length > 0) {
      const postId = res.rows[0].id;
      for (const tagName of post.tags) {
        const tagId = tags[tagName];
        if (tagId) {
          await pool.query('INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [postId, tagId]);
        }
      }
    }
  }

  console.log('Banco populado com sucesso!');
  await pool.end();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
