const http = require('http');
const app = require('../server');

async function runSellerTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('🧪 Starting Dedicated Seller Account End-to-End Test Suite on port 5099...\n');

  const BASE = 'http://localhost:5099/api';
  const testId = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const sellerToken = `dev-token:seller_${testId}:seller_${testId}@market.com`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Create Product using pure JSON (e.g. Autofill / URLs)
    // -------------------------------------------------------------
    console.log('1️⃣ Testing Product Creation via pure JSON...');
    const jsonProductPayload = {
      name: `Cloud Architecture Masterclass ${testId}`,
      description: 'Production-ready AWS & GCP microservices architecture diagrams and cheat sheets.',
      price: 49.99,
      category: 'Tutorials',
      fileType: 'PDF Document + Diagrams',
      fileSize: '65 MB',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      digitalFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      tags: 'Cloud, AWS, GCP, Architecture'
    };

    const res1 = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify(jsonProductPayload)
    });

    const data1 = await res1.json();
    if (!res1.ok || !data1.success || !data1.data?.id) {
      throw new Error(`JSON Product creation failed: ${JSON.stringify(data1)}`);
    }
    const jsonProdId = data1.data.id;
    console.log(`✅ [PASS] JSON Product listed successfully with ID: ${jsonProdId}\n`);

    // -------------------------------------------------------------
    // TEST 2: Create Product using multipart/form-data (File Upload)
    // -------------------------------------------------------------
    console.log('2️⃣ Testing Product Creation via multipart/form-data with image & file...');

    const form = new FormData();
    form.append('name', `Full-Stack Next.js 15 Starter Kit ${testId}`);
    form.append('title', `Full-Stack Next.js 15 Starter Kit ${testId}`);
    form.append('description', 'Modern TypeScript boilerplate with Next.js 15 App router and Tailwind CSS.');
    form.append('price', '29.99');
    form.append('category', 'Templates');
    form.append('fileType', 'Full Source Code ZIP');
    form.append('fileSize', '18.4 MB');
    form.append('tags', 'Nextjs, React, Tailwind');

    const thumbBlob = new Blob(['FAKE_PNG_BINARY_CONTENT'], { type: 'image/png' });
    const digitalBlob = new Blob(['FAKE_PDF_BINARY_CONTENT'], { type: 'application/pdf' });
    form.append('thumbnail', thumbBlob, 'thumbnail.png');
    form.append('digitalFile', digitalBlob, 'source-bundle.pdf');

    const res2 = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sellerToken}`
      },
      body: form
    });

    const data2 = await res2.json();
    if (!res2.ok || !data2.success || !data2.data?.id) {
      throw new Error(`Multipart Product creation failed: ${JSON.stringify(data2)}`);
    }
    const multipartProdId = data2.data.id;
    console.log(`✅ [PASS] Multipart Product with file uploads listed successfully with ID: ${multipartProdId}`);
    console.log(`   Thumbnail Path: ${data2.data.thumbnailUrl}`);
    console.log(`   Digital File Path: ${data2.data.digitalFileUrl}\n`);

    // -------------------------------------------------------------
    // TEST 3: Fetch Seller Catalog (My Uploaded Products)
    // -------------------------------------------------------------
    console.log('3️⃣ Testing Seller Catalog Retrieval (My Uploaded Products)...');
    const res3 = await fetch(`${BASE}/products/seller/my-products`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data3 = await res3.json();
    if (!res3.ok || !data3.success) {
      throw new Error(`Failed to get seller products: ${JSON.stringify(data3)}`);
    }
    const foundJson = data3.data.some(p => p.id === jsonProdId);
    const foundMultipart = data3.data.some(p => p.id === multipartProdId);
    if (!foundJson || !foundMultipart) {
      throw new Error(`One or both created products missing from seller catalog! Found: ${data3.count}`);
    }
    console.log(`✅ [PASS] Seller catalog verified: ${data3.count} product(s) owned by seller.\n`);

    // -------------------------------------------------------------
    // TEST 4: Edit Product via JSON
    // -------------------------------------------------------------
    console.log('4️⃣ Testing Product Edit...');
    const res4 = await fetch(`${BASE}/products/${jsonProdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: `Cloud Architecture Masterclass Updated ${testId}`,
        price: 59.99,
        description: 'Updated with Kubernetes 1.30 production patterns.'
      })
    });
    const data4 = await res4.json();
    if (!res4.ok || !data4.success || data4.data.price !== 59.99) {
      throw new Error(`Product update failed: ${JSON.stringify(data4)}`);
    }
    console.log(`✅ [PASS] Product price updated to $${data4.data.price} and name updated.\n`);

    // -------------------------------------------------------------
    // TEST 5: Verify User Profile & Seller Stats
    // -------------------------------------------------------------
    console.log('5️⃣ Testing User Profile & Stats Endpoint (getMe)...');
    const res5 = await fetch(`${BASE}/users/me`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data5 = await res5.json();
    if (!res5.ok || !data5.success) {
      throw new Error(`Failed to get user profile: ${JSON.stringify(data5)}`);
    }
    const stats = data5.data.stats;
    console.log(`✅ [PASS] User Profile Stats:`);
    console.log(`   - Uploaded Products: ${stats.totalUploadedProducts} (expected at least 2)`);
    console.log(`   - Total Sales Revenue: $${stats.totalSalesRevenue}`);
    if (stats.totalUploadedProducts < 2) {
      throw new Error(`Stats mismatch: expected totalUploadedProducts >= 2, got ${stats.totalUploadedProducts}`);
    }
    console.log();

    // -------------------------------------------------------------
    // TEST 6: Delete Product
    // -------------------------------------------------------------
    console.log('6️⃣ Testing Product Deletion...');
    const res6 = await fetch(`${BASE}/products/${jsonProdId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const data6 = await res6.json();
    if (!res6.ok || !data6.success) {
      throw new Error(`Product deletion failed: ${JSON.stringify(data6)}`);
    }
    console.log(`✅ [PASS] Product ${jsonProdId} deleted successfully.\n`);

    // -------------------------------------------------------------
    // ALL SELLER TESTS PASSED
    // -------------------------------------------------------------
    console.log('🎉 ═══════════════════════════════════════════════════════');
    console.log('🎉 ALL SELLER ACCOUNT & PRODUCT UPLOAD TESTS PASSED 100%!');
    console.log('🎉 ═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ SELLER TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runSellerTests();
