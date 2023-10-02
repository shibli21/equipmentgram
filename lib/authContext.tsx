import {
  Auth,
  User,
  getAuth,
  onAuthStateChanged,
  signOut as signout,
} from "firebase/auth";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import React, { useEffect, useState } from "react";
import firebaseApp from "./firebaseConfig/init";
import { useUpdateUser } from "./network/users";

const auth: Auth = getAuth(firebaseApp);
interface AuthContextProps {
  user: User | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  user: null,
});

export const useAuth = () => React.useContext(AuthContext);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}: AuthContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { mutateAsync } = useUpdateUser();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const cookies = parseCookies();
      if (!cookies.idToken) {
        setUser(null);
      }

      if (user) {
        setUser(user);

        if (user.emailVerified) {
          mutateAsync({
            emailVerified: true,
            user_id: user.uid,
          });
        }

        user.getIdToken().then((token) =>
          setCookie(null, "idToken", token, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          }),
        );
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mutateAsync]);

  return (
    <AuthContext.Provider value={{ user }}>
      {loading ? (
        <div className="flex items-center justify-center w-screen h-full text-2xl">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const signOut = async () => {
  const auth = getAuth();
  destroyCookie(null, "idToken");
  await signout(auth);
};
