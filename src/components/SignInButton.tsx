import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState, useEffect } from 'react';

export default function SignInButton() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <button onClick={handleSignOut} className="w-full bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
        Sign Out
      </button>
    );
  }

  return (
    <button onClick={handleSignIn} className="w-full bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
      Sign In with Google
    </button>
  );
}
