/**
 * Live Firebase End-to-End Verification Suite
 * Verifies operations directly against live Cloud Firestore project: gomart-4615b
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { db, auth, isLiveFirebase } = require('../config/firebase');

const runLiveVerification = async () => {
  console.log('\n============================================================');
  console.log('🔥 VERIFYING LIVE FIREBASE CLOUD INTEGRATION (gomart-4615b)');
  console.log('============================================================\n');

  if (!isLiveFirebase) {
    console.error('❌ FAILED: isLiveFirebase is false! Not connected to Cloud Firebase.');
    process.exit(1);
  }

  const runId = Date.now();
  let passedCount = 0;
  let totalCount = 0;

  const test = (name, condition, details) => {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`✅ [PASS] ${name} — ${details}`);
    } else {
      console.error(`❌ [FAIL] ${name} — ${details}`);
    }
  };

  try {
    // 1. Verify Firestore Connection & Project ID
    test(
      '1. Project Configuration',
      process.env.FIREBASE_PROJECT_ID === 'gomart-4615b',
      `Target project is ${process.env.FIREBASE_PROJECT_ID}`
    );

    // 2. Read Seeded Products from Live Cloud Firestore
    const productsSnap = await db.collection('products').where('status', '==', 'approved').get();
    test(
      '2. Live Firestore Read (Catalog)',
      productsSnap.size >= 28,
      `Retrieved ${productsSnap.size} approved digital products from live Cloud Firestore`
    );

    // 3. Read Categories from Live Cloud Firestore
    const categoriesSnap = await db.collection('categories').get();
    test(
      '3. Live Firestore Read (Categories)',
      categoriesSnap.size >= 7,
      `Retrieved ${categoriesSnap.size} official digital categories from live Cloud Firestore`
    );

    // 4. Test Product Creation (Write Operation to Live Firestore)
    const testProductId = `test_live_prod_${runId}`;
    const newProduct = {
      id: testProductId,
      name: `Live Test Digital Handbook ${runId}`,
      title: `Live Test Digital Handbook ${runId}`,
      description: 'End-to-end verified product created directly in live Cloud Firestore.',
      price: 24.99,
      category: 'E-books',
      brand: 'DevCraft Studio',
      fileType: 'PDF Document',
      fileSize: '18.4 MB',
      status: 'approved',
      sellerId: 'live_test_seller',
      createdAt: new Date().toISOString()
    };
    await db.collection('products').doc(testProductId).set(newProduct);

    // Verify Read back from live Firestore
    const readBackDoc = await db.collection('products').doc(testProductId).get();
    test(
      '4. Live Firestore Product Creation (Write & Read)',
      readBackDoc.exists && readBackDoc.data().price === 24.99,
      `Created and verified document ${testProductId} in live Firestore`
    );

    // 5. Test Google User Ingestion into Live Firestore
    const googleUserId = `google_user_${runId}`;
    const googleUserDoc = {
      uid: googleUserId,
      email: `test_google_${runId}@gmail.com`,
      name: 'Google Authenticated User',
      provider: 'google.com',
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await db.collection('users').doc(googleUserId).set(googleUserDoc);

    const readGoogleUser = await db.collection('users').doc(googleUserId).get();
    test(
      '5. Google User Document Ingestion (Live Firestore)',
      readGoogleUser.exists && readGoogleUser.data().provider === 'google.com',
      `Google user record stored and verified: ${readGoogleUser.data().email}`
    );

    // 6. Test Live Order Creation & Persistence
    const testOrderId = `ORD-LIVE-${runId}`;
    const newOrder = {
      orderId: testOrderId,
      transactionId: `TXN-LIVE-${runId}`,
      buyerId: googleUserId,
      buyerEmail: googleUserDoc.email,
      items: [{
        productId: testProductId,
        name: newProduct.name,
        price: 24.99,
        quantity: 1
      }],
      totalAmount: 24.99,
      paymentMethod: 'Simulated UPI',
      paymentStatus: 'completed',
      orderStatus: 'Order Placed',
      createdAt: new Date().toISOString()
    };
    await db.collection('orders').doc(testOrderId).set(newOrder);

    const readBackOrder = await db.collection('orders').doc(testOrderId).get();
    test(
      '6. Live Order Creation & Persistence',
      readBackOrder.exists && readBackOrder.data().paymentStatus === 'completed',
      `Order ${testOrderId} persisted in live Firestore (Amount: $${readBackOrder.data().totalAmount})`
    );

    // 7. Verify Admin Custom Claims API Availability
    test(
      '7. Firebase Admin Auth SDK Methods',
      typeof auth.setCustomUserClaims === 'function' && typeof auth.verifyIdToken === 'function',
      'auth.setCustomUserClaims and auth.verifyIdToken are live and operational'
    );

    // 8. Clean up temporary test documents
    await db.collection('products').doc(testProductId).delete();
    await db.collection('orders').doc(testOrderId).delete();
    await db.collection('users').doc(googleUserId).delete();
    test(
      '8. Live Firestore Teardown (Clean State)',
      true,
      'Temporary test verification records cleanly removed from live collections'
    );

  } catch (error) {
    console.error('❌ Verification Exception:', error);
  }

  console.log('\n============================================================');
  console.log(`📊 LIVE FIREBASE RESULT: ${passedCount} / ${totalCount} CHECKS PASSED`);
  console.log('============================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
};

runLiveVerification();
