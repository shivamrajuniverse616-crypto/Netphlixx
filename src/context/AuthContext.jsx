import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('free');
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        try {
          // Fetch or create user document in Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // New user
            await setDoc(userRef, {
              email: user.email,
              role: 'free',
              createdAt: new Date().toISOString(),
              watchlist: []
            });
            setUserRole('free');
            setWatchlist([]);
          } else {
            // Existing user
            const data = userSnap.data();
            setUserRole(data.role || 'free');
            setWatchlist(data.watchlist || []);
          }

          // Listen for realtime updates to role/watchlist
          unsubDoc = onSnapshot(userRef, (docSnap) => {
             if(docSnap.exists()){
                const data = docSnap.data();
                setUserRole(data.role || 'free');
                setWatchlist(data.watchlist || []);
             }
          });
        } catch (error) {
          console.error("Firestore Auth Sync Error:", error);
          // Fallback to free if db fails
          setUserRole('free');
          setWatchlist([]);
        }

      } else {
        setCurrentUser(null);
        setUserRole('free');
        setWatchlist([]);
        if (unsubDoc) {
           unsubDoc();
           unsubDoc = null;
        }
      }
      setLoading(false);
    });

    return () => {
       unsubscribe();
       if (unsubDoc) unsubDoc();
    };
  }, []);

  const toggleWatchlist = async (item) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const inList = watchlist.some(m => m.id === item.id);
      let newList;
      if (inList) {
        newList = watchlist.filter(m => m.id !== item.id);
      } else {
        newList = [{
          id: item.id,
          title: item.title || item.name,
          name: item.title || item.name,
          type: item.type || item.media_type || 'movie',
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path
        }, ...watchlist];
      }
      await setDoc(userRef, { watchlist: newList }, { merge: true });
    } catch (error) {
      console.error("Watchlist Toggle Error:", error);
    }
  };

  const value = {
    currentUser,
    userRole,
    watchlist,
    loading,
    toggleWatchlist
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
