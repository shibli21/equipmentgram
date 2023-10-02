import { doc, getDoc } from "@firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuth } from "../lib/authContext";
import { db } from "../lib/firebaseConfig/init";
import {
  User,
  UserType,
  UsersCollection,
  useSetUser,
} from "../lib/network/users";
import { addQueryParameters } from "../lib/utils";

const Home: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { mutateAsync } = useSetUser();
  const { user } = useAuth();

  const { redirect, reffererMsg } = query;

  if (user) return <h1>Authenticated</h1>;

  const auth = getAuth();

  function doRedirect() {
    if (redirect) {
      router.push(
        addQueryParameters(redirect as string, {
          fromSignin: "true",
        }),
      );
    }
  }

  function login() {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        doRedirect();
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log("error", errorMessage);
        window.alert(errorMessage);
      });
  }

  function loginWithGoogle() {
    const googleProvider = new GoogleAuthProvider();

    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const docRef = doc(db, UsersCollection, result.user.uid);
        const snapshot = await getDoc(docRef);
        const userDataFromDb = snapshot.data() as User;
        const user = result.user;

        mutateAsync({
          user_id: user.uid,
          email: user?.email!,
          display_name: user?.displayName!,
          photoURL: user?.photoURL!,
          phoneNumber: user?.phoneNumber!,
          emailVerified: user?.emailVerified!,
          type: userDataFromDb?.type ? userDataFromDb.type : UserType.customer,
        });

        if (!user?.emailVerified) {
          sendEmailVerification(auth.currentUser!).then(() => {
            console.log("email sent");
          });
        }

        doRedirect();
      })
      .catch((error) => {
        console.log(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  return (
    <>
      <Head>
        <title>Signin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-1/3 m-auto my-24 space-y-1 divide-y-4 h-1/3">
        {reffererMsg && <p>{reffererMsg}</p>}
        <div className="space-y-1">
          <label>Email</label>
          <br />
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="border border-current "
          />
          <br />
          <label>Password</label>
          <br />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="border border-current "
          />
          <br />
          <button
            className="inline-flex items-center justify-center px-10 py-2 text-base font-normal text-center text-white bg-primary hover:bg-opacity-90 lg:px-8 xl:px-10"
            onClick={() => login()}
          >
            Login
          </button>
          <br />
          <br />
        </div>
        <div>
          <br />
          <button
            className="inline-flex items-center justify-center px-10 py-2 text-base font-normal text-center text-white bg-secondary hover:bg-opacity-90 lg:px-8 xl:px-10"
            onClick={() => loginWithGoogle()}
          >
            Login with Google
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
