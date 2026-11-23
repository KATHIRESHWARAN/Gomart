const { auth, db } = require('../config/firebase');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * CLI Tool: Create a new Administrator account directly via Firebase Admin SDK
 * 
 * Usage:
 *   node server/scripts/create-admin.js <email> <password> <displayName>
 */
async function createAdminAccount() {
  const email = process.argv[2];
  const password = process.argv[3];
  const displayName = process.argv[4] || 'Go Mart Administrator';

  if (!email || !password) {
    console.error('❌ Error: Email and password are required.');
    console.log('Usage: node server/scripts/create-admin.js <email> <password> [displayName]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    console.log(`🔐 Creating Administrator account for: ${email}...`);

    let uid = null;

    if (auth && typeof auth.createUser === 'function') {
      try {
        const user = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: true
        });
        uid = user.uid;
        console.log(`✅ Created Firebase Auth record: UID = ${uid}`);
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          const existing = await auth.getUserByEmail(email);
          uid = existing.uid;
          console.log(`ℹ️ User already exists in Firebase Auth: UID = ${uid}`);
        } else {
          throw err;
        }
      }

      // Set custom claims { admin: true }
      await auth.setCustomUserClaims(uid, { admin: true });
      console.log(`✅ Assigned custom claim: { admin: true }`);
    } else {
      // Local dev emulation fallback
      uid = 'admin_' + Date.now();
    }

    // Create / Update Firestore user document
    await db.collection('users').doc(uid).set({
      uid,
      email,
      name: displayName,
      role: 'admin',
      admin: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Cloud Firestore record synchronized for: ${email}`);
    console.log(`🎉 Administrator account "${email}" is ready for immediate access!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create administrator account:', err.message);
    process.exit(1);
  }
}

createAdminAccount();
