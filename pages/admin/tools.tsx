import { NextPage } from "next";
import React, { useState } from "react";
import { AdminLayout, Tab } from "../../components/layout/admin";
import { useAuth } from "../../lib/authContext";
import {
  useInspectionRequests,
  useInspectionRequestsForUser,
} from "../../lib/network/inspection-requests";

const Inspectors: NextPage = () => {
  const { user } = useAuth();
  const {
    data: allInspectionRequests,
    isLoading: isAllInspectionRequestsLoading,
  } = useInspectionRequests();

  const {
    data: allInspectionRequestsForUser,
    isLoading: isAllInspectionRequestsLoadingForUser,
  } = useInspectionRequestsForUser(user?.uid);

  if (!user) return <h1>U need to login</h1>;

  return (
    <AdminLayout currentTab={Tab.Tools}>
      <div className="flex flex-wrap">TODO: Inspectors page</div>
    </AdminLayout>
  );
};

export default Inspectors;
