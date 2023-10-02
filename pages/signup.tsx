import type { NextPage } from "next";
import Head from "next/head";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { useState } from "react";
import { useAuth } from "../lib/authContext";
import React from "react";
import { Button, Select, Text, TextInput } from "@mantine/core";
import { UserType, useSetUser } from "../lib/network/users";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { USStates } from "../components/forms/formUtils";

const schema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email().required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Home: NextPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { mutateAsync } = useSetUser();
  const { getInputProps, onSubmit, values } = useForm({
    validate: yupResolver(schema),
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      nameOfBusiness: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      jobTitle: "",
    },
  });

  if (user) return <h1>Authenticated</h1>;

  const auth = getAuth();

  async function createUserCredentials() {
    createUserWithEmailAndPassword(auth, values.email, values.password).then(
      (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("success", user);
        mutateAsync({
          user_id: user.uid,
          email: user?.email!,
          display_name: values.firstName + " " + values.lastName,
          firstName: values.firstName,
          lastName: values.lastName,
          address: {
            city: values.city,
            state: values.state,
            zip: values.zipCode,
            line1: values.addressLine1,
            line2: values.addressLine2,
          },
          nameOfBusiness: values.nameOfBusiness,
          jobTitle: values.jobTitle,
          photoURL: user?.photoURL!,
          phoneNumber: user?.phoneNumber!,
          emailVerified: user?.emailVerified!,
          type: UserType.customer,
        });

        sendEmailVerification(auth.currentUser!).then(() => {
          console.log("email sent");
        });
      },
    );
  }

  function loginWithGoogle() {
    const googleProvider = new GoogleAuthProvider();

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log("sign with google", user);
        // ...
      })
      .catch((error) => {
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
        <title>Signup</title>
      </Head>

      <div className="w-1/2 m-auto">
        <h1 className="mb-8 text-2xl">Individual Registration</h1>
        <form onSubmit={onSubmit(createUserCredentials)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="First Name"
              placeholder="First Name"
              {...getInputProps("firstName")}
            />
            <TextInput
              label="Last Name"
              placeholder="Last Name"
              {...getInputProps("lastName")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Email"
              type="email"
              placeholder="Email"
              {...getInputProps("email")}
            />
            <TextInput
              label="Phone"
              placeholder="Phone"
              {...getInputProps("phone")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Username"
              placeholder="To be used when logging into account"
              {...getInputProps("username")}
            />
            <TextInput
              type="password"
              label="Password"
              placeholder="To be used when logging into account"
              {...getInputProps("password")}
            />
          </div>

          <TextInput
            label="Name Of Business"
            {...getInputProps("nameOfBusiness")}
          />
          <TextInput
            label="Address"
            placeholder="Address Line 1"
            {...getInputProps("addressLine1")}
          />
          <TextInput
            placeholder="Address Line 2"
            {...getInputProps("addressLine2")}
          />

          <div className="grid grid-cols-8 gap-4">
            <TextInput
              placeholder="City"
              className="col-span-3"
              {...getInputProps("city")}
            />
            <Select
              placeholder="State"
              data={Object.entries(USStates).map(([statekey, state]) => ({
                value: state,
                label: state,
              }))}
              className="col-span-3"
              {...getInputProps("state")}
            />

            <TextInput
              placeholder="Zip Code"
              className="col-span-2"
              {...getInputProps("zipCode")}
            />
          </div>
          <TextInput label="Job/Job Title" {...getInputProps("jobTitle")} />

          <button
            type="submit"
            className="inline-flex items-center justify-center px-10 py-2 text-base font-normal text-center text-white bg-primary hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Submit
          </button>
        </form>
        {/* <div>
          <button onClick={() => loginWithGoogle()}>Login with Google</button>
        </div> */}
      </div>
    </>
  );
};

export default Home;

const genUSAStates = () => {
  const states = Object.entries(USStates);
  return states.map(([statekey, state]) => (
    <option key={state} value={state}>
      {state}
    </option>
  ));
};
