import { EnvelopeIcon } from "@heroicons/react/20/solid";
import * as yup from "yup";
import dayjs, { Dayjs, isDayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addQueryParameters,
  toTitleCase,
  usePersistentState,
} from "../../lib/utils";
import { TextEditor } from "./TextEditor";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import AddressInput from "./AddressAutoComplete";
import { EquipmentManufacturer, EquipmentType, USStates } from "./formUtils";
import { useAuth } from "../../lib/authContext";
import { useRouter } from "next/router";
import {
  InspectionReportStatus,
  useAddInspectionRequest,
} from "../../lib/network/inspection-requests";
import classNames from "classnames";
import { Step } from "./StepWidget";
import {
  DocumentData,
  DocumentReference,
  FieldValue,
  serverTimestamp,
} from "@firebase/firestore";

export type InspectionRequestObject = {
  user_id: string;
  inspectorRef?: DocumentReference<DocumentData>;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  mobile: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  date: Date;
  equipmentType: EquipmentType;
  equipmentManufacturer: EquipmentManufacturer;
  equipmentModel?: string;
  equipmentSerialNumber: string;
  readFAQReceipt: boolean;
  notes?: string;
  step: Step;
  created: FieldValue;
  reportStatus?: InspectionReportStatus;
};

const schema = yup.object().shape({
  user_id: yup.string().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  businessName: yup.string(),
  email: yup.string().email().required(),
  mobile: yup.string().required(),
  streetAddress: yup.string().required(),
  city: yup.string().required(),
  state: yup.string().required(),
  postalCode: yup.string().required(),
  date: yup.date().required(),
  equipmentType: yup.string().required(),
  equipmentManufacturer: yup.string().required(),
  equipmentModel: yup.string(),
  equipmentSerialNumber: yup.string().required(),
  readFAQReceipt: yup.boolean().required(),
  notes: yup.string(),
});

export const InspectionRequestForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [date, setDate, wipeDate] = usePersistentState<Dayjs>(
    "InspectionRequestForm/date",
    dayjs(new Date()),
  );
  const [notes, _, wipeNotes] = usePersistentState(
    "InspectionRequestForm/notes",
    useMemo(() => withReact(createEditor()), []),
  );
  const [streetAddress, setStreetAddress, wipeStreetAddress] =
    usePersistentState("InspectionRequestForm/streetAddress", "");
  const [city, setCity, wipeCity] = usePersistentState(
    "InspectionRequestForm/city",
    "",
  );
  const [state, setState, wipeState] = usePersistentState(
    "InspectionRequestForm/state",
    "",
  );
  const [postalCode, setPostalCode, wipePostalCode] = usePersistentState(
    "InspectionRequestForm/postalCode",
    "",
  );
  const [firstName, setFirstName, wipeFirstName] = usePersistentState(
    "InspectionRequestForm/firstName",
    "",
  );
  const [lastName, setLastName, wipeLastName] = usePersistentState(
    "InspectionRequestForm/lastName",
    "",
  );
  const [businessName, setBusinessName, wipeBusinessName] = usePersistentState(
    "InspectionRequestForm/businessName",
    "",
  );
  const [email, setEmail, wipeEmail] = usePersistentState(
    "InspectionRequestForm/email",
    "",
  );
  const [mobile, setMobile, wipeMobile] = usePersistentState(
    "InspectionRequestForm/mobile",
    "",
  );
  const [
    equipmentSerialNumber,
    setEquipmentSerialNumber,
    wipeEquipmentSerialNumber,
  ] = usePersistentState("InspectionRequestForm/equipmentSerialNumber", "");
  const [equipmentModel, setEquipmentModel, wipeEquipmentModel] =
    usePersistentState("InspectionRequestForm/equipmentModel", "");
  const [equipmentType, setEquipmentType, wipeEquipmentType] =
    usePersistentState(
      "InspectionRequestForm/equipmentType",
      EquipmentType.Backhoe,
    );
  const [
    equipmentManufacturer,
    setEquipmentManufacturer,
    wipeEquipmentManufacturer,
  ] = usePersistentState(
    "InspectionRequestForm/equipmentManufacturer",
    EquipmentManufacturer.CATERPILLAR_CE,
  );

  const [readFAQReceipt, setReadFAQReceipt, wipeReadFAQReceipt] =
    usePersistentState("InspectionRequestForm/readFAQReceipt", false);

  const {
    mutateAsync,
    isLoading: isMutationLoading,
    isError: isMutationError,
  } = useAddInspectionRequest();

  const { user } = useAuth();
  const router = useRouter();
  const { fromSignin } = router.query;

  const notesPlaceholder: Descendant[] = [
    {
      // @ts-ignore
      type: "paragraph",
      children: [{ text: "This is a Rich Text Editor." }],
    },
    {
      // @ts-ignore
      type: "paragraph",
      children: [{ text: "" }],
    },
    {
      // @ts-ignore
      type: "paragraph",
      children: [
        { text: "You can add paragraphs, bullet lists, images, etc." },
      ],
    },
    {
      // @ts-ignore
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];

  // This function handles form submission by sending the form data to Firebase
  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (!user?.uid) {
      console.error("User not logged in");
      let path = addQueryParameters("/signin", {
        redirect: router.asPath,
        reffererMsg: `${encodeURIComponent(
          `You must be logged in to submit an inspection request. Please sign in to continue.`,
        )}`,
      });
      router.push(path);
      return;
    }

    const inspectionRequest: InspectionRequestObject = {
      user_id: user.uid,
      firstName,
      lastName,
      businessName,
      email,
      mobile,
      streetAddress,
      city,
      state,
      postalCode,
      readFAQReceipt,
      date: isDayjs(date) ? date?.toDate() : date ? date : new Date(),
      equipmentType,
      equipmentManufacturer,
      equipmentModel,
      equipmentSerialNumber,
      notes: notes ? JSON.stringify(notes) : undefined,
      step: Step.Schedule,
      created: serverTimestamp(),
    };

    try {
      console.log("before validation ", inspectionRequest);
      const res = await schema.validate(inspectionRequest);
      await mutateAsync(inspectionRequest);
      // Clear form
      wipeDate();
      wipeNotes();
      wipeStreetAddress();
      wipeCity();
      wipeState();
      wipePostalCode();
      wipeFirstName();
      wipeLastName();
      wipeBusinessName();
      wipeEmail();
      wipeMobile();
      wipeEquipmentSerialNumber();
      wipeEquipmentModel();
      wipeEquipmentType();
      wipeEquipmentManufacturer();
      wipeReadFAQReceipt();
    } catch (e) {
      console.error("Mutation failed", e);
    }
  };

  const genEquipmentTypes = () => {
    const equipmentTypes = Object.entries(EquipmentType);
    return equipmentTypes.map(([equipmentKey, equipmentType]) => (
      <option key={equipmentType} value={equipmentType}>
        {equipmentType}
      </option>
    ));
  };

  const genEquipmentManufacturers = () => {
    const equipmentManufacturers = Object.entries(EquipmentManufacturer);
    return equipmentManufacturers.map(
      ([equipmentManufacturerkey, equipmentManufacturer]) => (
        <option key={equipmentManufacturer} value={equipmentManufacturer}>
          {equipmentManufacturer}
        </option>
      ),
    );
  };

  const genUSAStates = () => {
    const states = Object.entries(USStates);
    return states.map(([statekey, state]) => (
      <option key={state} value={state}>
        {state}
      </option>
    ));
  };

  useEffect(() => {
    // Give local storage time to load
    setTimeout(() => {
      if (fromSignin && formRef?.current) {
        if (formRef.current.checkValidity()) {
          console.log("Form is valid");
          onSubmit(new Event("submit"));
        } else {
          console.log("Form is invalid");
          formRef.current.reportValidity();
          // To get the specific validation error messages:
          const errors = formRef.current.querySelectorAll(":invalid");
          errors.forEach((error) => {
            // @ts-ignore
            console.log("Invalid Form: ", error.validationMessage);
          });
        }
      }
    }, 500);
  }, [
    fromSignin,
    formRef.current,
    firstName,
    lastName,
    businessName,
    email,
    mobile,
    streetAddress,
    city,
    state,
    postalCode,
    readFAQReceipt,
    date,
    equipmentType,
    equipmentManufacturer,
    equipmentModel,
    equipmentSerialNumber,
    notes,
  ]);

  return (
    <div className="py-2 lg:py-[10px]">
      <div className="container mx-auto">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto mb-[60px] max-w-[510px] text-center lg:mb-20">
              <span className="block mb-2 text-lg font-semibold text-primary">
                Read Our FAQ
              </span>
              <h2 className="text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">
                Inspection Request Form
              </h2>
              <p className="text-base text-body-color">
                Fill the form below to request a heavy equipment inspection.
              </p>
            </div>
          </div>
        </div>
        <div>
          {/* @ts-ignore */}
          <form onSubmit={onSubmit} ref={formRef}>
            <div className="flex flex-wrap justify-center -mx-4">
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      required
                      id="firstName"
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="pl-12 text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4"
                    />
                    <span className="absolute -translate-y-1/2 top-1/2 left-4">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.72039 12.8864C4.50179 12.105 5.5616 11.666 6.66667 11.666H13.3333C14.4384 11.666 15.4982 12.105 16.2796 12.8864C17.061 13.6678 17.5 14.7276 17.5 15.8327V17.4993C17.5 17.9596 17.1269 18.3327 16.6667 18.3327C16.2064 18.3327 15.8333 17.9596 15.8333 17.4993V15.8327C15.8333 15.1696 15.5699 14.5338 15.1011 14.0649C14.6323 13.5961 13.9964 13.3327 13.3333 13.3327H6.66667C6.00363 13.3327 5.36774 13.5961 4.8989 14.0649C4.43006 14.5338 4.16667 15.1696 4.16667 15.8327V17.4993C4.16667 17.9596 3.79357 18.3327 3.33333 18.3327C2.8731 18.3327 2.5 17.9596 2.5 17.4993V15.8327C2.5 14.7276 2.93899 13.6678 3.72039 12.8864Z"
                            fill="#637381"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.0007 3.33268C8.61994 3.33268 7.50065 4.45197 7.50065 5.83268C7.50065 7.21339 8.61994 8.33268 10.0007 8.33268C11.3814 8.33268 12.5006 7.21339 12.5006 5.83268C12.5006 4.45197 11.3814 3.33268 10.0007 3.33268ZM5.83398 5.83268C5.83398 3.5315 7.69946 1.66602 10.0007 1.66602C12.3018 1.66602 14.1673 3.5315 14.1673 5.83268C14.1673 8.13387 12.3018 9.99935 10.0007 9.99935C7.69946 9.99935 5.83398 8.13387 5.83398 5.83268Z"
                            fill="#637381"
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={lastName}
                      required
                      id="lastName"
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="pl-12 text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4"
                    />
                    <span className="absolute -translate-y-1/2 top-1/2 left-4">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.72039 12.8864C4.50179 12.105 5.5616 11.666 6.66667 11.666H13.3333C14.4384 11.666 15.4982 12.105 16.2796 12.8864C17.061 13.6678 17.5 14.7276 17.5 15.8327V17.4993C17.5 17.9596 17.1269 18.3327 16.6667 18.3327C16.2064 18.3327 15.8333 17.9596 15.8333 17.4993V15.8327C15.8333 15.1696 15.5699 14.5338 15.1011 14.0649C14.6323 13.5961 13.9964 13.3327 13.3333 13.3327H6.66667C6.00363 13.3327 5.36774 13.5961 4.8989 14.0649C4.43006 14.5338 4.16667 15.1696 4.16667 15.8327V17.4993C4.16667 17.9596 3.79357 18.3327 3.33333 18.3327C2.8731 18.3327 2.5 17.9596 2.5 17.4993V15.8327C2.5 14.7276 2.93899 13.6678 3.72039 12.8864Z"
                            fill="#637381"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.0007 3.33268C8.61994 3.33268 7.50065 4.45197 7.50065 5.83268C7.50065 7.21339 8.61994 8.33268 10.0007 8.33268C11.3814 8.33268 12.5006 7.21339 12.5006 5.83268C12.5006 4.45197 11.3814 3.33268 10.0007 3.33268ZM5.83398 5.83268C5.83398 3.5315 7.69946 1.66602 10.0007 1.66602C12.3018 1.66602 14.1673 3.5315 14.1673 5.83268C14.1673 8.13387 12.3018 9.99935 10.0007 9.99935C7.69946 9.99935 5.83398 8.13387 5.83398 5.83268Z"
                            fill="#637381"
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full px-4">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    id="businessName"
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="My Business LLC"
                    className="text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 md:px-[18px]"
                  />
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <EnvelopeIcon
                        className="w-5 h-5 text-body-color"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block pl-12 text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <label htmlFor="country" className="sr-only">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        autoComplete="country"
                        className="h-full py-0 pl-3 bg-transparent border-transparent rounded-md pr-7 text-body-color focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option>US</option>
                        <option>CA</option>
                        <option>EU</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      name="phone-number"
                      id="phone-number"
                      value={mobile}
                      required
                      onChange={(e) => setMobile(e.target.value)}
                      className="block w-full pl-16 m:text-sm text-body-color placeholder:text-body-color/50 focus:border-primary rounded border border-[#EBEBEB] bg-white py-3 text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4"
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <AddressInput
                    onAddressSelect={(address) => {
                      setStreetAddress(address?.streetAddress);
                      setCity(address?.city);
                      setState(address?.state);
                      setPostalCode(address?.zipCode);
                    }}
                    placeholder="Search for your address"
                    address={streetAddress}
                    setAddress={setStreetAddress}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-3 px-4 md:w-1/2 md:flex-row">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    required
                    id="city"
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 md:px-[18px]"
                  />
                </div>
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="text-body-color placeholder:text-body-color/50 focus:border-primary rounded border border-[#EBEBEB] bg-white py-3 pl-6 pr-[34px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 w-max-content"
                  >
                    {genUSAStates()}
                  </select>
                </div>
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    required
                    id="postalCode"
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12345"
                    className="text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 md:px-[18px]"
                  />
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    When will the inspection take place?
                    <span className="text-red-500">*</span>
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disablePast
                      label="Inspection Day"
                      value={date}
                      onChange={(newValue) => {
                        setDate(newValue!);
                      }}
                      className="[&>label]:mt-1 [&>label]:text-body-color/50 text-body-color w-full rounded border border-[#EBEBEB] bg-white text-base leading-relaxed outline-none [&>div>input]:py-4 md:[&>div>input]:py-[18px] outline-none"
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Equipment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="equipmentType"
                    value={equipmentType}
                    onChange={(e) =>
                      setEquipmentType(e.target.value as EquipmentType)
                    }
                    className="text-body-color focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 pl-6 pr-[34px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 w-max-content"
                  >
                    {genEquipmentTypes()}
                  </select>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Equipment Manufacturer{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="equipmentManufacturer"
                    value={equipmentManufacturer}
                    // @ts-ignore
                    onChange={(e: Event) =>
                      setEquipmentManufacturer(
                        // @ts-ignore
                        e.target.value as EquipmentType,
                      )
                    }
                    className="text-body-color focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 pl-6 pr-[34px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 w-max-content"
                  >
                    {genEquipmentManufacturers()}
                  </select>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Equipment Serial Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={equipmentSerialNumber}
                    onChange={(e) => setEquipmentSerialNumber(e.target.value)}
                    placeholder="##########"
                    className="text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 md:px-[18px]"
                  />
                </div>
              </div>
              <div className="w-full px-4">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Equipment Model
                  </label>
                  <input
                    type="text"
                    value={equipmentModel}
                    onChange={(e) => setEquipmentModel(e.target.value)}
                    placeholder="420F2 IT"
                    className="text-body-color placeholder:text-body-color/50 focus:border-primary w-full rounded border border-[#EBEBEB] bg-white py-3 px-[14px] text-base leading-relaxed outline-none focus-visible:shadow-none md:py-4 md:px-[18px]"
                  />
                </div>
              </div>
              <div className="w-full px-4">
                <div className="mb-7 lg:mb-9">
                  <label className="block mb-3 text-base font-medium text-black md:mb-5">
                    Notes or Special Instructions
                  </label>
                  {/* <TextEditor editor={notes} initialValue={notesPlaceholder} /> */}
                </div>
              </div>
              <div className="w-full px-4">
                <label
                  htmlFor="readFAQReceipt"
                  className="text-body-color mb-12 flex cursor-pointer items-center text-base md:mb-[70px]"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      id="readFAQReceipt"
                      checked={readFAQReceipt}
                      required
                      onChange={(e) => {
                        console.log("hello", e.target.checked);
                        setReadFAQReceipt(e.target.checked);
                      }}
                    />
                    <div className="p-4 box mr-4 flex h-5 w-5 items-center justify-center rounded border border-[#E2E2E2]">
                      <span className="opacity-0">
                        <svg
                          viewBox="0 0 11 8"
                          width={15}
                          height={12}
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="m10.091.952-.004-.006-.006-.005A.45.45 0 0 0 9.43.939L4.162 6.23 1.585 3.636a.45.45 0 0 0-.652 0 .472.472 0 0 0 0 .657l.002.002L3.58 6.958a.8.8 0 0 0 .567.242.775.775 0 0 0 .567-.242l5.333-5.356a.474.474 0 0 0 .044-.65ZM4.234 6.301 4.232 6.3Z"
                            fill="#3056D3"
                            stroke="#3056D3"
                            strokeWidth={0.4}
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                  I agree that I have read and understood EquipmentGram&apos;s
                  inspection terms and conditions by reading the FAQ and other
                  information on the website.
                </label>
              </div>
              <div className="w-full px-4 sm:w-8/12 lg:w-4/12">
                <div className="text-center">
                  <button
                    type="submit"
                    className={classNames(
                      "bg-primary block w-full rounded py-5 px-10 text-center text-base font-semibold text-white transition hover:bg-opacity-90",
                      isMutationLoading && "animate-ellipsis",
                    )}
                  >
                    {isMutationLoading ? "Submitting" : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
