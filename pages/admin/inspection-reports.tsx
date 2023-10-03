import { NextPage } from "next";
import React, { useState } from "react";
import { AdminLayout, Tab } from "../../components/layout/admin";
import { useAuth } from "../../lib/authContext";
import {
  useInspectionRequests,
  useInspectionRequestsForUser,
} from "../../lib/network/inspection-requests";
import {
  InspectionReportStatus,
  useGetInspectionFormsByStatus,
  useUpdateInspectionFormStatus,
} from "../../lib/network/forms";
import { Button } from "@mui/material";

const InspectorReports: NextPage = () => {
  const { user } = useAuth();
  const { data, refetch } = useGetInspectionFormsByStatus(
    InspectionReportStatus.FilledForm,
  );
  const { mutateAsync } = useUpdateInspectionFormStatus(
    InspectionReportStatus.Approved,
  );

  if (!user) return <h1>U need to login</h1>;

  return (
    <AdminLayout currentTab={Tab.InspectionReports}>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Customer Email</th>z<th>Report Status</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((d, i) => (
            <tr key={i}>
              <td>{d.createdByUser?.display_name}</td>
              <td>{d.createdByUser?.email}</td>
              <td>{d.reportStatus}</td>
              <td>{d.type}</td>
              <td>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    mutateAsync(d.id);
                    refetch();
                  }}
                >
                  Approve
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default InspectorReports;
