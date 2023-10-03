import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "@firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InspectionRequestObject } from "../../components/forms/InspectionRequestForm";
import { Step } from "../../components/forms/StepWidget";
import { db } from "../firebaseConfig/init";
import { UsersCollection } from "./users";

export const InspectionRequestsCollection = "inspection-requests";

export type InspectionRequestObjectWithId = InspectionRequestObject & {
  id: string;
};

export const useInspectionRequests = () => {
  return useQuery<InspectionRequestObjectWithId[], Error>(
    [InspectionRequestsCollection],
    async () => {
      const snapshot = await getDocs(
        collection(db, InspectionRequestsCollection),
      );
      return snapshot.docs.map(
        (doc) =>
          ({ id: doc.id, ...doc.data() }) as InspectionRequestObjectWithId,
      );
    },
  );
};

// Define a custom hook that uses useQuery to fetch all inspection requests for a given user
export const useInspectionRequestsForUser = (user_id: string | undefined) => {
  return useQuery<InspectionRequestObjectWithId[], Error>(
    [InspectionRequestsCollection, user_id],
    async () => {
      const q = await query(
        collection(db, InspectionRequestsCollection),
        where("user_id", "==", user_id),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({ id: doc.id, ...doc.data() }) as InspectionRequestObjectWithId,
      );
    },
    {
      enabled: !!user_id,
    },
  );
};

// Define a custom hook that uses useQuery to add inspection requests on firebase
export const useAddInspectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (inspectionRequest: InspectionRequestObject) =>
      addDoc(collection(db, InspectionRequestsCollection), inspectionRequest),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([InspectionRequestsCollection]);
        queryClient.refetchQueries([InspectionRequestsCollection]);
      },
    },
  );
};

export enum InspectionReportStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  FilledForm = "FilledForm",
}

// To add an inspector to an inspection request, we simply set the inspectorRef to the user document
// and set the step to "Inspection" to signify that the inspection request is ready to handle an inspection
export const useAddInspectorToInspectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      user_id,
      inspection_request_id,
    }: {
      user_id: string;
      inspection_request_id: string;
    }) => {
      const userDoc = doc(db, UsersCollection, user_id);
      return updateDoc(
        doc(db, InspectionRequestsCollection, inspection_request_id!),
        {
          inspectorRef: userDoc,
          step: Step.Inspection,
          reportStatus: InspectionReportStatus.Pending,
        },
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([InspectionRequestsCollection]);
        queryClient.refetchQueries([InspectionRequestsCollection]);
      },
    },
  );
};

// To remove an inspector from an inspection request, we simply set the inspectorRef to null
// and set the step to "schedule" to signify that the inspection request is ready to be scheduled
export const useRemoveInspectorFromInspectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ inspection_request_id }: { inspection_request_id: string }) => {
      return updateDoc(
        doc(db, InspectionRequestsCollection, inspection_request_id!),
        {
          inspectorRef: null,
          step: Step.Schedule,
        },
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([InspectionRequestsCollection]);
        queryClient.refetchQueries([InspectionRequestsCollection]);
      },
    },
  );
};
