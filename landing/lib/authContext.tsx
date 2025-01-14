"use client";

import { getAuth, onAuthStateChanged, signOut as signout } from "firebase/auth";
import { destroyCookie, setCookie } from "nookies";
import React, { createContext, useContext, useEffect, useState } from "react";
import firebaseApp from "./firebaseConfig/init";
import { useUpdateUser } from "./network/users";
export type TIdTokenResult = {
  name: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      email: string[];
    };
    sign_in_provider: string;
  };
  uid: string;
  claims: {
    name: string;
    picture: string;
    iss: string;
    aud: string;
    auth_time: number;
    user_id: string;
    sub: string;
    iat: number;
    exp: number;
    email: string;
    email_verified: boolean;
    firebase: {
      identities: {
        [key: string]: string[];
      };
      sign_in_provider: string;
    };
  };
};

type Props = {
  children: React.ReactNode;
};

type UserContext = {
  user: TIdTokenResult | null;
  loading: boolean;
};

const authContext = createContext<UserContext>({
  user: null,
  loading: true,
});

export default function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<TIdTokenResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { mutateAsync } = useUpdateUser();
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      //user returned from firebase not the state
      if (user && user.emailVerified) {
        mutateAsync({
          emailVerified: true,
          user_id: user.uid,
        });
      }

      if (user) {
        // Save token for backend calls
        user.getIdToken().then((token) =>
          setCookie(null, "idToken", token, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          }),
        );

        // Save decoded token on the state
        user
          .getIdTokenResult()
          .then((result) => setUser(result as unknown as TIdTokenResult));
      }
      if (!user) setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <authContext.Provider value={{ user, loading }}>
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => useContext(authContext);

export const signOut = async () => {
  const auth = getAuth();
  destroyCookie(null, "idToken");
  await signout(auth);
};
