const { auth, db } = require('../config/firebase');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * CLI Tool: Assign custom claim { admin: true } to an existing Firebase user
 * 
 * Usage:
 *   node server/scripts/set-admin.js <user_email>
 */
async function setAdminRole() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('❌ Error: Please specify the user email address.');
    console.log('Usage: node server/scripts/set-admin.js <user_email>');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking up Firebase user by email: ${targetEmail}...`);

    let uid = null;
    let userRecord = null;

    if (auth && typeof auth.getUserByEmail === 'function') {
      try {
        userRecord = await auth.getUserByEmail(targetEmail);
        uid = userRecord.uid;
      } catch (err) {
        // User not in live auth, check local Firestore store
      }
    }

    // Query user in Firestore
    if (!uid) {
      const snapshot = await db.collection('users').where('email', '==', targetEmail).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs ? snapshot.docs[0] : snapshot[0];
        uid = doc.id;
        userRecord = doc.data();
      }
    }

    if (!uid) {
      console.error(`❌ User with email "${targetEmail}" was not found in Firebase Authentication or Firestore.`);
      console.log('👉 Tip: Register the account first through the app signup or Google Sign-In, then rerun this command.');
      process.exit(1);
    }

    // 1. Assign custom claim { admin: true } via Firebase Admin SDK
    if (auth && typeof auth.setCustomUserClaims === 'function') {
      await auth.setCustomUserClaims(uid, { admin: true });
      console.log(`🔐 Successfully assigned custom user claim { admin: true } to UID: ${uid}`);
    }

    // 2. Update user profile document in Cloud Firestore
    await db.collection('users').doc(uid).set({
      role: 'admin',
      admin: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ User "${targetEmail}" (UID: ${uid}) has been granted full Administrator privileges.`);
    console.log('🎉 The user can now log in via /admin/login or standard login and access the Admin Control Center.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to assign administrator role:', err.message);
    process.exit(1);
  }
}

setAdminRole();
