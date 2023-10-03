import { NextPage } from "next";
import React, { useState } from "react";
import { AdminLayout, Tab } from "../../components/layout/admin";
import { useAuth } from "../../lib/authContext";
import {
  useInspectionRequests,
  useInspectionRequestsForUser,
} from "../../lib/network/inspection-requests";

const InspectorReports: NextPage = () => {
  const { user } = useAuth();
  const {
    data: allInspectionRequests,
    isLoading: isAllInspectionRequestsLoading,
  } = useInspectionRequests();

  const {
    data: allInspectionRequestsForUser,
    isLoading: isAllInspectionRequestsLoadingForUser,
  } = useInspectionRequestsForUser(user?.uid as string);

  if (!user) return <h1>U need to login</h1>;

  return (
    <AdminLayout currentTab={Tab.InspectionReports}>
      <div className="flex flex-wrap -mx-4">TODO: Reports page</div>
    </AdminLayout>
  );
};

export default InspectorReports;
