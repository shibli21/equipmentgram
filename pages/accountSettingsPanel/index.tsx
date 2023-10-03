import { NextPage } from "next";
import React, { useState } from "react";
import { useAuth } from "../../lib/authContext";

const AccountSettingsPanel: NextPage = () => {
  const { user } = useAuth();
  if (!user) return <h1>You need to login</h1>;
  return <div className="flex flex-wrap">TODO: Account Settings Panel</div>;
};

export default AccountSettingsPanel;
