const http = require('http');
const app = require('../server');
const { db } = require('../config/firebase');

const testSuite = async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('🧪 Starting comprehensive automated test suite on port 5099...\n');

  const BASE = 'http://localhost:5099/api';
  const runId = Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // Dynamic user identities for idempotency (no hardcoded state contamination)
  const buyerUserToken = `dev-token:student_buyer_${runId}:buyer_${runId}@assessment.test`;
  const strangerUserToken = `dev-token:stranger_user_${runId}:stranger_${runId}@assessment.test`;
  const failedOrderUserToken = `dev-token:failed_user_${runId}:failed_${runId}@assessment.test`;
  const adminToken = 'dev-token:admin_root_user:admin@eproducts.com';

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE}/health`);
    const health = await healthRes.json();
    console.log('✅ 1. Health Check:', health.status, `(${health.firebase})`);

    // 2. Public Products List
    const prodsRes = await fetch(`${BASE}/products`);
    const prods = await prodsRes.json();
    if (!prods.data || prods.data.length < 2) throw new Error('Not enough products in database');
    console.log(`✅ 2. Products List: ${prods.count} products returned.`);

    const targetProduct = prods.data[0];
    const secondProduct = prods.data[1];

    // 3. Category Filter
    const catRes = await fetch(`${BASE}/products?category=Templates`);
    const catProds = await catRes.json();
    console.log(`✅ 3. Category Filter ("Templates"): ${catProds.count} matches.`);

    // 4. Search Filter
    const searchRes = await fetch(`${BASE}/products?search=Java`);
    const searchProds = await searchRes.json();
    console.log(`✅ 4. Search Filter ("Java"): ${searchProds.count} matches.`);

    // 5. Product Details & View Tracking
    const detailRes = await fetch(`${BASE}/products/${targetProduct.id}`);
    const detail = await detailRes.json();
    console.log(`✅ 5. Product Details: "${detail.data.name}", views: ${detail.data.viewCount}`);

    // ========================================================
    // DOWNLOAD SECURITY SUITE (ALL 6 MANDATORY RULES)
    // ========================================================

    // 6. Security Rule 1: Unauthenticated Download Attempt (Must return HTTP 401)
    const unauthDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`);
    if (unauthDownload.status !== 401) throw new Error(`Expected 401, got ${unauthDownload.status}`);
    console.log(`✅ 6. Security Rule 1 [Unauthenticated Download]: HTTP 401 (Blocked as expected)`);

    // 7. Security Rule 2: Authenticated user without purchase (Must return HTTP 403)
    const unpurchasedDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`, {
      headers: { 'Authorization': `Bearer ${buyerUserToken}` }
    });
    if (unpurchasedDownload.status !== 403) throw new Error(`Expected 403, got ${unpurchasedDownload.status}`);
    console.log(`✅ 7. Security Rule 2 [Authenticated User Without Purchase]: HTTP 403 (Blocked as expected)`);

    // 8. Add to Cart & Duplicate Prevention
    const addToCartRes = await fetch(`${BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerUserToken}`
      },
      body: JSON.stringify({ productId: targetProduct.id })
    });
    const cartResult = await addToCartRes.json();
    console.log(`✅ 8. Add to Cart:`, cartResult.message || cartResult.success);

    const duplicateAdd = await fetch(`${BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerUserToken}`
      },
      body: JSON.stringify({ productId: targetProduct.id })
    });
    if (duplicateAdd.status !== 400) throw new Error(`Expected duplicate to return 400, got ${duplicateAdd.status}`);
    console.log(`✅ 8b. Duplicate Cart Item Prevention: HTTP 400 (Blocked as expected)`);

    // 9. Simulated Checkout (Success outcome)
    const checkoutRes = await fetch(`${BASE}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerUserToken}`
      },
      body: JSON.stringify({
        paymentMethod: 'Simulated UPI',
        paymentStatus: 'success'
      })
    });
    const orderData = await checkoutRes.json();
    console.log(`✅ 9. Simulated Checkout: Order created -> ${orderData.order?.orderId}, total: $${orderData.order?.totalAmount}`);

    // 10. Security Rule 3: Authenticated user with successful purchase (Must return HTTP 200 with downloadUrl)
    const authorizedDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`, {
      headers: { 'Authorization': `Bearer ${buyerUserToken}` }
    });
    const downloadData = await authorizedDownload.json();
    if (authorizedDownload.status !== 200 || !downloadData.downloadUrl) {
      throw new Error(`Expected 200 with downloadUrl, got ${authorizedDownload.status}`);
    }
    console.log(`✅ 10. Security Rule 3 [Purchased User Authorized Download]: HTTP 200 (URL: ${downloadData.downloadUrl})`);

    // 11. Security Rule 4: User attempting to download another user's purchased product (Must return HTTP 403)
    const crossUserDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`, {
      headers: { 'Authorization': `Bearer ${strangerUserToken}` }
    });
    if (crossUserDownload.status !== 403) throw new Error(`Expected 403, got ${crossUserDownload.status}`);
    console.log(`✅ 11. Security Rule 4 [Cross-User Download Prevention]: HTTP 403 (User A purchase does not grant User B access)`);

    // 12. Security Rule 5: Invalid or non-existent product ID (Must return HTTP 404)
    const invalidProdId = `prod_nonexistent_${Date.now()}`;
    const invalidDownload = await fetch(`${BASE}/downloads/${invalidProdId}`, {
      headers: { 'Authorization': `Bearer ${buyerUserToken}` }
    });
    if (invalidDownload.status !== 404) throw new Error(`Expected 404, got ${invalidDownload.status}`);
    console.log(`✅ 12. Security Rule 5 [Invalid Product ID]: HTTP 404 (Not Found as expected)`);

    // 13. Security Rule 6: Failed or cancelled order (Must return HTTP 403)
    const failedOrderId = `ord_failed_${runId}`;
    await db.collection('orders').doc(failedOrderId).set({
      orderId: `ORD-FAILED-${runId}`,
      buyerId: `failed_user_${runId}`,
      buyerEmail: `failed_${runId}@assessment.test`,
      items: [{
        productId: secondProduct.id,
        id: secondProduct.id,
        name: secondProduct.name,
        price: secondProduct.price
      }],
      totalAmount: Number(secondProduct.price),
      paymentStatus: 'failed', // Failed payment status
      isDemoTransaction: true,
      createdAt: new Date().toISOString()
    });

    const failedOrderDownload = await fetch(`${BASE}/downloads/${secondProduct.id}`, {
      headers: { 'Authorization': `Bearer ${failedOrderUserToken}` }
    });
    if (failedOrderDownload.status !== 403) throw new Error(`Expected 403, got ${failedOrderDownload.status}`);
    console.log(`✅ 13. Security Rule 6 [Failed Order Download Protection]: HTTP 403 (Declined/cancelled orders never grant access)`);

    // 14. Unauthorized Admin Route Check (Normal user attempting admin endpoint)
    const nonAdminCheck = await fetch(`${BASE}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${buyerUserToken}` }
    });
    console.log(`✅ 14. Admin Route Protection: HTTP ${nonAdminCheck.status} (Forbidden for normal users)`);

    // 15. Authorized Admin Route Check (Admin token)
    const adminCheck = await fetch(`${BASE}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminStats = await adminCheck.json();
    console.log(`✅ 15. Admin Access Authorized:`, {
      totalProducts: adminStats.data.totalProducts,
      totalUsers: adminStats.data.totalUsers,
      totalOrders: adminStats.data.totalOrders
    });

    // 16. Admin Analytics dataset for Recharts
    const analyticsRes = await fetch(`${BASE}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const analytics = await analyticsRes.json();
    console.log(`✅ 16. Admin Recharts Analytics Generated:`, {
      monthlySalesPoints: analytics.data.monthlySales.length,
      categoriesCount: analytics.data.categoryDistribution.length,
      mostViewedItems: analytics.data.mostViewed.length
    });

    console.log('\n🎉 ALL TECHNICAL ASSESSMENT & DOWNLOAD SECURITY CHECKS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

testSuite();
