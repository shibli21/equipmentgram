import { getDoc } from "@firebase/firestore";
import type { NextPage } from "next";
import React, { useEffect } from "react";
import {
  InspectionRequestForm,
  InspectionRequestObject,
} from "../components/forms/InspectionRequestForm";
import { Step, StepWidget } from "../components/forms/StepWidget";
import { useAuth } from "../lib/authContext";
import {
  InspectionRequestObjectWithId,
  useInspectionRequestsForUser,
} from "../lib/network/inspection-requests";
import { User } from "../lib/network/users";

const InspectionRequest: NextPage = () => {
  const { user } = useAuth();

  const { data: inspectionRequestsForUser } = useInspectionRequestsForUser(
    user?.uid,
  );
  const [inspectionRequest, setInspectionRequest] = React.useState<
    InspectionRequestObjectWithId | undefined
  >(undefined);
  const [inspector, setInspector] = React.useState<User | undefined>(undefined);
  const [step, setStep] = React.useState<Step>(Step.Request);

  // Modify the step based on server side state
  useEffect(() => {
    // If use is not logged in, or has not inspection requests, they are in the request state
    if (inspectionRequestsForUser && inspectionRequestsForUser?.length === 0) {
      setStep(Step.Request);
    } else {
      const inspectionRequest = inspectionRequestsForUser?.[0];
      setInspectionRequest(inspectionRequest);
      switch (inspectionRequest?.step) {
        case Step.Schedule:
          setStep(Step.Schedule);
          break;
        case Step.Inspection:
          setStep(Step.Inspection);
          break;
        case Step.Results:
          setStep(Step.Results);
          break;
        case Step.Complete:
          setStep(Step.Complete);
          break;
        default:
          setStep(Step.Request);
          break;
      }
    }
  }, [inspectionRequestsForUser]);

  useEffect(() => {
    if (inspectionRequest?.inspectorRef) {
      getDoc(inspectionRequest.inspectorRef).then((doc) =>
        setInspector(doc.data() as User),
      );
    }
  }, [inspectionRequest]);

  return (
    <div className="container">
      <section className="overflow-hidden py-10 lg:py-[80px]">
        <div className="px-4 mx-auto sm:container">
          <StepWidget step={step} />
        </div>
      </section>
      {step === Step.Request && <InspectionRequestForm />}
      {step === Step.Schedule && (
        <section className="flex items-center justify-center py-2 bg-gray">
          <div className="container mx-auto">
            <div className="mx-auto max-w-[600px] rounded-[10px] bg-white p-10 text-center shadow-card md:py-[55px] md:px-[70px]">
              <div className="mx-auto text-center mb-14">
                <img
                  src="/schedule.svg"
                  alt="Schedule image"
                  className="w-full max-w-full mx-auto"
                />
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-black sm:text-3xl">
                We have received your request.
              </h2>
              <p className="mb-5 text-base text-body-color">
                Please allow 24-48 hours for us to review your request and
                schedule your inspection. We will send you an email with the
                details of your inspection once it has been scheduled.
              </p>
              <a
                href="javascript:void(0)"
                className="inline-flex items-center text-base font-medium text-primary hover:text-black"
              >
                <span className="pl-2 transform rotate-180">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    className="fill-current"
                  >
                    <path d="M19.2188 8.90632L17.0625 6.34382C16.875 6.12507 16.5312 6.09382 16.2813 6.28132C16.0625 6.46882 16.0313 6.81257 16.2188 7.06257L18.25 9.46882H0.9375C0.625 9.46882 0.375 9.71882 0.375 10.0313C0.375 10.3438 0.625 10.5938 0.9375 10.5938H18.25L16.2188 13.0001C16.0313 13.2188 16.0625 13.5626 16.2813 13.7813C16.375 13.8751 16.5 13.9063 16.625 13.9063C16.7813 13.9063 16.9375 13.8438 17.0313 13.7188L19.1875 11.1563C19.75 10.4688 19.75 9.53132 19.2188 8.90632Z" />
                  </svg>
                </span>
                Cancel Inspection Request
              </a>
            </div>
          </div>
        </section>
      )}
      {step === Step.Inspection && (
        <section className="flex items-center justify-center py-2 bg-gray">
          <div className="container mx-auto">
            <div className="mx-auto max-w-[600px] rounded-[10px] bg-white p-10 text-center shadow-card md:py-[55px] md:px-[70px]">
              <div className="mx-auto text-center mb-14">
                <img
                  src="/inspector.svg"
                  alt="Inspector image"
                  className="w-full max-w-full mx-auto"
                />
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-black sm:text-3xl">
                An inspector is on their way!
              </h2>
              <p className="mb-5 text-base text-body-color">
                {inspector?.display_name || "The Inspector"} will be arriving at
                your property {inspectionRequest?.streetAddress} at 10:00 AM on{" "}
                {/* @ts-ignore */}
                {inspectionRequest?.date?.toDate().toLocaleDateString()}. Please
                be available to meet them at the front door.
              </p>
              <a
                href="javascript:void(0)"
                className="inline-flex items-center text-base font-medium text-primary hover:text-black"
              >
                <span className="pl-2 transform rotate-180">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    className="fill-current"
                  >
                    <path d="M19.2188 8.90632L17.0625 6.34382C16.875 6.12507 16.5312 6.09382 16.2813 6.28132C16.0625 6.46882 16.0313 6.81257 16.2188 7.06257L18.25 9.46882H0.9375C0.625 9.46882 0.375 9.71882 0.375 10.0313C0.375 10.3438 0.625 10.5938 0.9375 10.5938H18.25L16.2188 13.0001C16.0313 13.2188 16.0625 13.5626 16.2813 13.7813C16.375 13.8751 16.5 13.9063 16.625 13.9063C16.7813 13.9063 16.9375 13.8438 17.0313 13.7188L19.1875 11.1563C19.75 10.4688 19.75 9.53132 19.2188 8.90632Z" />
                  </svg>
                </span>
                Cancel Inspection Request
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default InspectionRequest;
