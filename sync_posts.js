const fs = require('fs');
const path = require('path');

// Mock pool and other things in seed.js to just extract the data
const posts = [
  // ... (I'll extract the posts from seed.js)
];

// Actually, it's easier to just read seed.js as text and extract the array
const seedContent = fs.readFileSync(path.join(__dirname, 'seed.js'), 'utf-8');
const postsMatch = seedContent.match(/const posts = (\[[\s\S]*?\]);/);

if (postsMatch) {
  // Use eval safely since it's my own code in seed.js
  const postsData = eval(postsMatch[1]);
  
  // Transform to match posts.json structure
  const transformedPosts = postsData.map((p, index) => ({
    id: index + 1,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    author: {
      name: p.author_name,
      avatar: p.author_avatar,
      bio: p.author_bio
    },
    date: p.date,
    readTime: p.read_time,
    category: {
      slug: p.category_slug,
      name: p.category_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      color: 'blue' // placeholder
    },
    tags: p.tags,
    image: p.image,
    featured: p.featured || false
  }));

  fs.writeFileSync(path.join(__dirname, 'data', 'posts.json'), JSON.stringify(transformedPosts, null, 2));
  console.log('Successfully updated data/posts.json with electrician content!');
} else {
  console.error('Could not find posts array in seed.js');
}
