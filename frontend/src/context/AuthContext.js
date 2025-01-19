"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        checkTokenExpiry(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const checkTokenExpiry = async (user) => {
  const tokenResult = await getIdTokenResult(user);
  const expirationTime = new Date(tokenResult.expirationTime).getTime();
  const currentTime = new Date().getTime();
  const timeLeft = expirationTime - currentTime;

  console.log("Token expires in:", timeLeft, "ms");

  if (timeLeft <= 0) {
    await signOut(auth);
  }
};
