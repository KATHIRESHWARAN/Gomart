const http = require('http');
const app = require('../server');

const testSearch = async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5199, resolve));

  const queries = [
    'react',
    'python',
    'java',
    'ebook',
    'ebooks',
    'tutorial',
    'tutorials',
    'study',
    'study materials',
    'template',
    'templates',
    'pdf',
    'pdfs',
    'design',
    'notes',
    'guide',
    'dsa',
    'interview',
    'docker',
    'figma',
    'starter kit'
  ];

  console.log('\n--- VERIFYING SEARCH ENGINE RESULTS ---');
  let allMatched = true;

  for (const q of queries) {
    const res = await fetch(`http://localhost:5199/api/products?search=${encodeURIComponent(q)}`);
    const json = await res.json();
    const count = json.count || 0;
    const top = json.data?.[0]?.name || 'None';
    console.log(`[Query: "${q}"] -> ${count} results. Top: "${top}"`);
    if (count === 0) {
      allMatched = false;
      console.error(`❌ FAILED: Query "${q}" returned 0 results!`);
    }
  }

  server.close();
  if (!allMatched) {
    process.exit(1);
  } else {
    console.log('\n✅ ALL SIMPLE WORD SEARCH QUERIES PASSED WITH RICH MATCHES!');
    process.exit(0);
  }
};

testSearch().catch((err) => {
  console.error(err);
  process.exit(1);
});
