import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { NextPage } from "next";
import React from "react";
import { AdminLayout, Tab } from "../../components/layout/admin";
import { useAuth } from "../../lib/authContext";
import {
  InspectionReportStatus,
  useGetInspectionFormsByStatus,
  useUpdateInspectionFormStatus,
} from "../../lib/network/forms";
import { Button } from "@mantine/core";

const InspectorReports: NextPage = () => {
  const { user } = useAuth();
  const { data, refetch } = useGetInspectionFormsByStatus(
    InspectionReportStatus.FilledForm,
  );
  const { mutateAsync, isLoading } = useUpdateInspectionFormStatus(
    InspectionReportStatus.Approved,
  );

  if (!user) return <h1>U need to login</h1>;

  return (
    <AdminLayout currentTab={Tab.InspectionReports}>
      {data && data.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Customer Email</TableCell>
                <TableCell> Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{d.createdByUser?.display_name}</TableCell>
                  <TableCell>{d.createdByUser?.email}</TableCell>
                  <TableCell>Waiting for approval</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>
                    <Button
                      loading={isLoading}
                      variant="outlined"
                      onClick={async () => {
                        mutateAsync(d.id);
                        refetch({});
                      }}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <h1>No pending reports to approve</h1>
      )}
    </AdminLayout>
  );
};

export default InspectorReports;
