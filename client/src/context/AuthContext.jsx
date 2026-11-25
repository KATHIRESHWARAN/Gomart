import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  updateFirebaseProfile,
  isLiveFirebaseConfigured 
} from '../services/firebase';
import { userService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eproducts_auth_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('eproducts_auth_token', token);
    } else {
      localStorage.removeItem('eproducts_auth_token');
    }
  }, [token]);

  // Load user profile on startup
  useEffect(() => {
    const initAuth = async () => {
      if (isLiveFirebaseConfigured()) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const idToken = await firebaseUser.getIdToken();
              const tokenResult = await firebaseUser.getIdTokenResult();
              setToken(idToken);

              let profileData = null;
              try {
                const profileRes = await userService.getMe();
                profileData = profileRes.data.data;
              } catch (e) {
                // Initial registration sync
              }

              const hasAdminClaim = Boolean(tokenResult.claims.admin || profileData?.role === 'admin');

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || profileData?.name || firebaseUser.email.split('@')[0],
                avatar: firebaseUser.photoURL || profileData?.avatar || '',
                role: hasAdminClaim ? 'admin' : (profileData?.role || 'customer'),
                admin: hasAdminClaim,
                ...(profileData || {})
              });
            } catch (err) {
              console.error('Failed to restore Firebase session:', err);
              setUser(null);
              setToken(null);
            }
          } else {
            setUser(null);
            setToken(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } else {
        // Dev persistence fallback
        const storedToken = localStorage.getItem('eproducts_auth_token');
        if (storedToken) {
          try {
            const res = await userService.getMe();
            setUser(res.data.data);
          } catch (err) {
            localStorage.removeItem('eproducts_auth_token');
            setUser(null);
          }
        }
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Cache user to local storage for instant offline render
  useEffect(() => {
    if (user) {
      localStorage.setItem('eproducts_cached_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eproducts_cached_user');
    }
  }, [user]);

  /**
   * User Signup (Always assigns 'customer' role for security)
   */
  const signup = async (name, email, password, confirmPassword) => {
    if (!name || !email || !password) {
      throw new Error('Please fill in all required fields.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      if (isLiveFirebaseConfigured()) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateFirebaseProfile(cred.user, { displayName: name });
        const idToken = await cred.user.getIdToken();
        setToken(idToken);

        const profilePayload = {
          name,
          email,
          role: 'customer' // Strict role enforcement
        };
        await userService.updateProfile(profilePayload);
        const meRes = await userService.getMe();
        setUser(meRes.data.data);
      } else {
        const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const devToken = `dev-token:${uid}:${email}`;
        setToken(devToken);
        localStorage.setItem('eproducts_auth_token', devToken);

        const meRes = await userService.getMe();
        const profile = { ...meRes.data.data, name, role: 'customer' };
        setUser(profile);
      }
      toast.success('Account created successfully! Welcome to E-Products.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to sign up.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * User Login with Email & Password
   */
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    setLoading(true);
    try {
      if (isLiveFirebaseConfigured()) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken();
        const tokenResult = await cred.user.getIdTokenResult();
        
        // Immediately persist token for outgoing requests
        localStorage.setItem('eproducts_auth_token', idToken);
        setToken(idToken);

        let profileData = null;
        try {
          const meRes = await userService.getMe();
          profileData = meRes.data?.data || null;
        } catch (apiErr) {
          console.warn('Backend profile sync notice:', apiErr.message);
        }

        const hasAdminClaim = Boolean(
          tokenResult.claims.admin || 
          profileData?.role === 'admin' ||
          email.toLowerCase() === 'admin@eproducts.com'
        );

        const userData = {
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || profileData?.name || email.split('@')[0],
          role: hasAdminClaim ? 'admin' : (profileData?.role || 'customer'),
          admin: hasAdminClaim,
          ...(profileData || {})
        };
        setUser(userData);
      } else {
        const isAdmin = email.toLowerCase() === 'admin@eproducts.com';
        const uid = isAdmin ? 'admin_root_user' : 'usr_' + btoa(email).replace(/=/g, '').slice(0, 10);
        const devToken = `dev-token:${uid}:${email}`;
        localStorage.setItem('eproducts_auth_token', devToken);
        setToken(devToken);

        let profileData = null;
        try {
          const meRes = await userService.getMe();
          profileData = meRes.data?.data || null;
        } catch (apiErr) {
          console.warn('Backend dev sync notice:', apiErr.message);
        }

        setUser(profileData || { uid, email, name: email.split('@')[0], role: isAdmin ? 'admin' : 'customer', admin: isAdmin });
      }
      toast.success('Welcome back to E-Products!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google Authentication Login
   */
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isLiveFirebaseConfigured()) {
        const cred = await signInWithPopup(auth, googleProvider);
        const idToken = await cred.user.getIdToken();
        const tokenResult = await cred.user.getIdTokenResult();
        
        // Immediately persist token for outgoing requests
        localStorage.setItem('eproducts_auth_token', idToken);
        setToken(idToken);

        let profileData = null;
        try {
          const meRes = await userService.getMe();
          profileData = meRes.data?.data || null;
        } catch (apiErr) {
          console.warn('Backend profile sync notice:', apiErr.message);
        }

        const hasAdminClaim = Boolean(
          tokenResult.claims.admin || 
          profileData?.role === 'admin' ||
          cred.user.email?.toLowerCase() === 'admin@eproducts.com'
        );

        const userData = {
          uid: cred.user.uid,
          name: cred.user.displayName || profileData?.name || cred.user.email?.split('@')[0],
          email: cred.user.email,
          avatar: cred.user.photoURL || profileData?.avatar || '',
          role: hasAdminClaim ? 'admin' : (profileData?.role || 'customer'),
          admin: hasAdminClaim,
          ...(profileData || {})
        };

        setUser(userData);
        toast.success(`Signed in as ${cred.user.displayName || cred.user.email}!`);
        return true;
      } else {
        throw new Error('Google Sign-In requires active Firebase credentials.');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in popup was closed.');
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        const msg = `Domain "${currentDomain}" is not authorized. Please add "${currentDomain}" to Firebase Console > Authentication > Settings > Authorized Domains.`;
        toast.error(msg, { autoClose: 8000 });
        const friendlyErr = new Error(msg);
        friendlyErr.code = error.code;
        throw friendlyErr;
      } else {
        toast.error(error.message || 'Google authentication was cancelled or failed.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Forgot Password / Password Reset Email
   */
  const resetPassword = async (email) => {
    if (!email) {
      throw new Error('Please enter your registered email address.');
    }
    try {
      if (isLiveFirebaseConfigured()) {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent! Check your inbox.');
        return true;
      } else {
        toast.info('Password reset simulation triggered for ' + email);
        return true;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email.');
      throw error;
    }
  };

  /**
   * Dedicated Admin Portal Login
   */
  const adminLogin = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter administrator credentials.');
    }

    setLoading(true);
    try {
      await login(email, password);
      const res = await userService.getMe();
      const currentUser = res.data.data;

      // Verify custom claims or role
      if (currentUser.role !== 'admin' && !currentUser.admin && currentUser.email !== 'admin@eproducts.com') {
        await logout();
        throw new Error('Access denied. Administrator privileges required.');
      }
      toast.success('Admin authentication verified.');
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Administrator authentication failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      if (isLiveFirebaseConfigured()) {
        await signOut(auth);
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('eproducts_auth_token');
      localStorage.removeItem('eproducts_cached_user');
      toast.info('You have logged out.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Update Profile
   */
  const updateUserProfile = async (data) => {
    try {
      const res = await userService.updateProfile(data);
      setUser(prev => ({ ...prev, ...res.data.data }));
      toast.success('Profile updated successfully.');
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
      throw error;
    }
  };

  const isAdmin = Boolean(user?.role === 'admin' || user?.admin === true || user?.email === 'admin@eproducts.com');

  const value = {
    user,
    token,
    loading,
    isAdmin,
    signup,
    login,
    loginWithGoogle,
    resetPassword,
    adminLogin,
    logout,
    updateUserProfile,
    refreshUser: async () => {
      if (token) {
        const res = await userService.getMe();
        setUser(res.data.data);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
