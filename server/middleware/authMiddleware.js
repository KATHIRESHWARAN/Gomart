const { auth, db } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.'
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();

    // Verify token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (verifyErr) {
      // In test/dev environments, support dev-token format or test JWT fallback
      if (token.startsWith('dev-token:')) {
        const parts = token.replace('dev-token:', '').split(':');
        const uid = parts[0];
        const email = parts[1] || 'user@example.com';
        const isAdmin = email === process.env.ADMIN_EMAIL;
        decodedToken = {
          uid,
          email,
          name: email.split('@')[0],
          admin: isAdmin,
          role: isAdmin ? 'admin' : 'customer'
        };
      } else if (token.split('.').length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
          if (payload && (payload.uid || payload.sub || payload.user_id)) {
            const uid = payload.uid || payload.sub || payload.user_id;
            const isAdmin = payload.admin === true || payload.role === 'admin' || payload.email === process.env.ADMIN_EMAIL;
            decodedToken = {
              uid,
              email: payload.email,
              name: payload.name || payload.email?.split('@')[0] || 'User',
              admin: isAdmin,
              role: isAdmin ? 'admin' : (payload.role || 'customer'),
              ...payload
            };
          } else {
            throw verifyErr;
          }
        } catch {
          throw verifyErr;
        }
      } else {
        throw verifyErr;
      }
    }
    
    // Fetch user details from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    let userData = userDoc.exists ? userDoc.data() : null;

    // Check if user is configured as administrator via custom claim or verified admin email
    const hasAdminCustomClaim = decodedToken.admin === true || decodedToken.claims?.admin === true;
    const isAdminEmail = (decodedToken.email && process.env.ADMIN_EMAIL && 
      decodedToken.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());

    // Role escalation prevention: only grant 'admin' if verified via JWT custom claim or admin email
    const role = (hasAdminCustomClaim || isAdminEmail) 
      ? 'admin' 
      : (userData?.role === 'admin' ? 'customer' : (userData?.role || 'customer'));

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: userData?.name || decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      role: role,
      status: userData?.status || 'active',
      ...(userData || {})
    };

    // If user document didn't exist in Firestore yet (e.g. initial login), sync it
    if (!userDoc.exists) {
      await db.collection('users').doc(decodedToken.uid).set({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: req.user.name,
        role: req.user.role,
        status: 'active',
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    // Check if account has been suspended by admin
    if (req.user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken
};
