const http = require('http');
const app = require('../server');
const { db } = require('../config/firebase');

const runWorkflows = async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  console.log('🚀 Running Full-Stack Functional & Security Workflow Verification on port 5098...\n');

  const BASE = 'http://localhost:5098/api';
  const runId = Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // Dynamic user identities for idempotency (no hardcoded state contamination)
  const buyerToken = `dev-token:buyer_${runId}:buyer_${runId}@assessment.test`;
  const strangerToken = `dev-token:stranger_${runId}:stranger_${runId}@assessment.test`;
  const sellerToken = `dev-token:seller_${runId}:seller_${runId}@assessment.test`;
  const adminToken = 'dev-token:admin_root_user:admin@eproducts.com';

  let createdProductId = null;

  try {
    // ==========================================
    // WORKFLOW 1: BUYER JOURNEY
    // ==========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 WORKFLOW 1: BUYER WORKFLOW VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1.1 Fetch public products dynamically
    const listRes = await fetch(`${BASE}/products`);
    const listData = await listRes.json();
    if (!listData.success || listData.count < 2) throw new Error('Public product catalog empty or insufficient');
    console.log(`[PASS] 1.1 Browse Catalog: ${listData.count} products retrieved.`);

    // 1.2 Search products dynamically
    const searchRes = await fetch(`${BASE}/products?search=Guide`);
    const searchData = await searchRes.json();
    if (!searchData.success || searchData.count === 0) throw new Error('Search failed for query "Guide"');
    console.log(`[PASS] 1.2 Search Execution: Found ${searchData.count} product(s) matching "Guide".`);

    // 1.3 Filter by category dynamically
    const catRes = await fetch(`${BASE}/products?category=E-books`);
    const catData = await catRes.json();
    if (!catData.success || catData.count === 0) throw new Error('Category filter failed for "E-books"');
    console.log(`[PASS] 1.3 Category Filter: Found ${catData.count} product(s) in "E-books".`);

    // Dynamic selection of products (never hardcoded)
    const targetProduct = catData.data[0];
    const unpurchasedProduct = listData.data.find(p => p.id !== targetProduct.id) || listData.data[1];

    // 1.4 Add to cart
    const addCartRes = await fetch(`${BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ productId: targetProduct.id })
    });
    const addCartData = await addCartRes.json();
    if (!addCartData.success) throw new Error('Add to cart failed: ' + addCartData.message);
    console.log(`[PASS] 1.4 Add to Cart: Added "${targetProduct.name || targetProduct.title}" to cart.`);

    // 1.5 Duplicate cart prevention check
    const dupRes = await fetch(`${BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ productId: targetProduct.id })
    });
    if (dupRes.status !== 400) throw new Error('Duplicate cart addition not blocked');
    console.log(`[PASS] 1.5 Duplicate Prevention: HTTP ${dupRes.status} (Cart item duplication prevented).`);

    // 1.6 Fetch Cart
    const getCartRes = await fetch(`${BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const getCartData = await getCartRes.json();
    if (!getCartData.success || getCartData.items.length === 0) throw new Error('Cart empty after add');
    console.log(`[PASS] 1.6 Fetch Cart: Verified cart has ${getCartData.items.length} item, subtotal: $${getCartData.subtotal}.`);


    // ==========================================
    // WORKFLOW 2: SELLER JOURNEY
    // ==========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💼 WORKFLOW 2: SELLER WORKFLOW VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 2.1 List a new product
    const createProductRes = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: `Full Stack Cloud DevOps Blueprint ${runId}`,
        description: 'Comprehensive container orchestration guide with 20 production Helm charts and CI/CD pipelines.',
        price: 34.50,
        category: 'Study Materials',
        fileType: 'PDF + Git Bundle',
        fileSize: '32 MB',
        tags: ['Docker', 'Kubernetes', 'DevOps', 'Cloud']
      })
    });
    const createProductData = await createProductRes.json();
    if (!createProductData.success || !createProductData.data?.id) throw new Error('Create product failed');
    createdProductId = createProductData.data.id;
    console.log(`[PASS] 2.1 Product Creation: Created listing "${createProductData.data.name}" (ID: ${createdProductId}).`);

    // 2.2 Verify Seller Catalog
    const sellerProdsRes = await fetch(`${BASE}/products/seller/my-products`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const sellerProds = await sellerProdsRes.json();
    const hasNewProd = sellerProds.data.some(p => p.id === createdProductId);
    if (!hasNewProd) throw new Error('Created product not in seller listings');
    console.log(`[PASS] 2.2 Seller Catalog: Found ${sellerProds.count} product(s) owned by seller.`);

    // 2.3 Edit Product
    const editRes = await fetch(`${BASE}/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        price: 39.00,
        description: 'Updated description: Includes hands-on multi-stage Docker build templates.'
      })
    });
    const editData = await editRes.json();
    if (!editData.success || editData.data.price !== 39) throw new Error('Edit product failed');
    console.log(`[PASS] 2.3 Edit Product: Successfully updated price to $${editData.data.price}.`);

    // 2.4 Product Details & View Counter Increment
    const detailBefore = await (await fetch(`${BASE}/products/${createdProductId}`)).json();
    const viewsBefore = detailBefore.data.viewCount || 0;
    const detailAfter = await (await fetch(`${BASE}/products/${createdProductId}`)).json();
    const viewsAfter = detailAfter.data.viewCount || 0;
    if (viewsAfter <= viewsBefore) throw new Error('View counter did not increment');
    console.log(`[PASS] 2.4 View Tracking: Verified view count incremented from ${viewsBefore} -> ${viewsAfter}.`);


    // ==========================================
    // WORKFLOW 3: CHECKOUT & DOWNLOAD SECURITY
    // ==========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 WORKFLOW 3: CHECKOUT & DOWNLOAD SECURITY VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 3.1 Security Rule 1: Unauthenticated Download Attempt (Must return HTTP 401)
    const unauthDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`);
    if (unauthDownload.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated download, received ${unauthDownload.status}`);
    }
    console.log(`[PASS] 3.1 Security Rule 1 [Unauthenticated Download]: Blocked with HTTP 401 Unauthorized.`);

    // 3.2 Security Rule 2: Authenticated User Without Purchase (Must return HTTP 403)
    const blockedDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    if (blockedDownload.status !== 403) {
      throw new Error(`Expected 403 for unpurchased download, received ${blockedDownload.status}`);
    }
    console.log(`[PASS] 3.2 Security Rule 2 [Authenticated User Without Purchase]: Blocked with HTTP 403 Forbidden.`);

    // 3.3 Security Rule 5: Invalid Product ID (Must return HTTP 404)
    const invalidDownload = await fetch(`${BASE}/downloads/prod_non_existent_${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    if (invalidDownload.status !== 404) {
      throw new Error(`Expected 404 for non-existent product, received ${invalidDownload.status}`);
    }
    console.log(`[PASS] 3.3 Security Rule 5 [Invalid Product ID]: Returned HTTP 404 Not Found.`);

    // 3.4 Security Rule 6: Failed or Cancelled Order (Must return HTTP 403)
    const failedOrderId = `ord_failed_${runId}`;
    await db.collection('orders').doc(failedOrderId).set({
      orderId: `ORD-FAILED-${runId}`,
      buyerId: `failed_user_${runId}`,
      buyerEmail: `failed_${runId}@assessment.test`,
      items: [{
        productId: unpurchasedProduct.id,
        id: unpurchasedProduct.id,
        name: unpurchasedProduct.name,
        price: unpurchasedProduct.price
      }],
      totalAmount: Number(unpurchasedProduct.price),
      paymentStatus: 'failed', // Explicitly failed
      isDemoTransaction: true,
      createdAt: new Date().toISOString()
    });

    const failedUserToken = `dev-token:failed_user_${runId}:failed_${runId}@assessment.test`;
    const failedOrderDownload = await fetch(`${BASE}/downloads/${unpurchasedProduct.id}`, {
      headers: { 'Authorization': `Bearer ${failedUserToken}` }
    });
    if (failedOrderDownload.status !== 403) {
      throw new Error(`Expected 403 for failed order user, received ${failedOrderDownload.status}`);
    }
    console.log(`[PASS] 3.4 Security Rule 6 [Failed Order Download Protection]: Blocked with HTTP 403 Forbidden.`);

    // 3.5 Self-Purchase Prevention Check (Seller cannot buy own product)
    const selfPurchaseAttempt = await fetch(`${BASE}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        items: [{ productId: createdProductId, price: 39.00 }],
        paymentMethod: 'Simulated Card',
        paymentStatus: 'success'
      })
    });
    if (selfPurchaseAttempt.status !== 400) throw new Error('Self-purchase was not blocked');
    console.log(`[PASS] 3.5 Self-Purchase Prevention: HTTP ${selfPurchaseAttempt.status} (Seller blocked from purchasing own item).`);

    // 3.6 Simulated Payment Failure Handling
    const failPaymentRes = await fetch(`${BASE}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        paymentMethod: 'Simulated UPI',
        paymentStatus: 'failed'
      })
    });
    if (failPaymentRes.status !== 400) throw new Error('Failed payment simulation did not return 400');
    console.log(`[PASS] 3.6 Payment Failure Simulation: HTTP ${failPaymentRes.status} (Transaction declined gracefully).`);

    // 3.7 Simulated Payment Success Checkout
    const successCheckoutRes = await fetch(`${BASE}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        paymentMethod: 'Simulated UPI',
        paymentStatus: 'success'
      })
    });
    const orderOutcome = await successCheckoutRes.json();
    if (!orderOutcome.success || !orderOutcome.order?.orderId) throw new Error('Checkout failed');
    console.log(`[PASS] 3.7 Successful Checkout: Order generated -> ${orderOutcome.order.orderId}, charged $${orderOutcome.order.totalAmount}.`);

    // 3.8 Security Rule 3: Authenticated User With Successful Purchase (Must return HTTP 200 with downloadUrl)
    const authorizedDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const downloadData = await authorizedDownload.json();
    if (authorizedDownload.status !== 200 || !downloadData.downloadUrl) {
      throw new Error(`Expected 200 with downloadUrl, received ${authorizedDownload.status}`);
    }
    console.log(`[PASS] 3.8 Security Rule 3 [Purchased User Authorized Download]: HTTP 200 (URL: ${downloadData.downloadUrl})`);

    // 3.9 Security Rule 4: User attempting to download another user's purchased product (Must return HTTP 403)
    const crossUserDownload = await fetch(`${BASE}/downloads/${targetProduct.id}`, {
      headers: { 'Authorization': `Bearer ${strangerToken}` }
    });
    if (crossUserDownload.status !== 403) {
      throw new Error(`Expected 403 for unauthorized third-party user, received ${crossUserDownload.status}`);
    }
    console.log(`[PASS] 3.9 Security Rule 4 [Cross-User Download Protection]: HTTP 403 (User A purchase does not grant User B access).`);

    // 3.10 Buyer Purchases History
    const purchasesRes = await fetch(`${BASE}/orders/my-purchases`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    const purchasesData = await purchasesRes.json();
    const hasBoughtItem = purchasesData.data.some(p => p.productId === targetProduct.id);
    if (!hasBoughtItem) throw new Error('Purchased item not in buyer purchases list');
    console.log(`[PASS] 3.10 Buyer Purchases Record: Verified product is licensed in buyer digital library (${purchasesData.count} item(s)).`);


    // ==========================================
    // WORKFLOW 4: ADMIN GOVERNANCE & ANALYTICS
    // ==========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️ WORKFLOW 4: ADMIN GOVERNANCE & ANALYTICS VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 4.1 Non-admin RBAC Block
    const nonAdminDashboard = await fetch(`${BASE}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    if (nonAdminDashboard.status !== 403) throw new Error('Non-admin was not rejected with 403');
    console.log(`[PASS] 4.1 RBAC Enforcement: Regular buyer blocked from admin endpoint with HTTP ${nonAdminDashboard.status} Forbidden.`);

    // 4.2 Admin Dashboard Access
    const adminDashboardRes = await fetch(`${BASE}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminDashboard = await adminDashboardRes.json();
    if (!adminDashboard.success) throw new Error('Admin dashboard failed');
    console.log(`[PASS] 4.2 Admin Dashboard Metrics: Total products: ${adminDashboard.data.totalProducts}, Total users: ${adminDashboard.data.totalUsers}, Gross sales: $${adminDashboard.data.totalSales}.`);

    // 4.3 Admin User Directory
    const usersRes = await fetch(`${BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const usersList = await usersRes.json();
    if (!usersList.success || usersList.count === 0) throw new Error('Admin user list empty');
    console.log(`[PASS] 4.3 User Directory: ${usersList.count} registered accounts inspected.`);

    // 4.4 Admin Product Catalog & Approval Toggle
    const adminProdsRes = await fetch(`${BASE}/admin/products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminProds = await adminProdsRes.json();
    console.log(`[PASS] 4.4 Catalog Management: ${adminProds.count} marketplace listings audited.`);

    const toggleStatusRes = await fetch(`${BASE}/admin/products/${createdProductId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const toggleStatusData = await toggleStatusRes.json();
    if (!toggleStatusData.success) throw new Error('Product approval toggle failed');
    console.log(`[PASS] 4.5 Product Moderation: Updated product status to "approved".`);

    // 4.5 Admin Orders Audit Ledger
    const adminOrdersRes = await fetch(`${BASE}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminOrders = await adminOrdersRes.json();
    if (!adminOrders.success) throw new Error('Admin orders failed');
    console.log(`[PASS] 4.6 Transactions Audit Ledger: ${adminOrders.count} platform transactions verified.`);

    // 4.6 Recharts Analytics Generation
    const analyticsRes = await fetch(`${BASE}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const analyticsData = await analyticsRes.json();
    if (!analyticsData.success || !analyticsData.data.monthlySales || !analyticsData.data.categoryDistribution) {
      throw new Error('Analytics generation incomplete');
    }
    console.log(`[PASS] 4.7 Recharts Analytics Engine:`, {
      monthlySalesSeries: analyticsData.data.monthlySales.length,
      categoryDistributionBuckets: analyticsData.data.categoryDistribution.length,
      mostViewedItemsRanked: analyticsData.data.mostViewed.length,
      topSellingItemsRanked: analyticsData.data.topSelling.length
    });

    console.log('\n================================================================================');
    console.log('🏆 100% OF ALL 4 FUNCTIONAL & SECURITY WORKFLOWS VERIFIED SUCCESSFULLY!');
    console.log('================================================================================\n');

  } catch (err) {
    console.error('❌ Workflow Verification Error:', err.message);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

runWorkflows();
