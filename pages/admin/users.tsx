import { NextPage } from "next";
import React, { useState } from "react";
import { UserItem } from "../../components/admin/UserItem";
import { AdminLayout, Tab } from "../../components/layout/admin";
import { useAuth } from "../../lib/authContext";
import {
  useInspectionRequests,
  useInspectionRequestsForUser,
} from "../../lib/network/inspection-requests";
import { UserType, useUsers } from "../../lib/network/users";
import { useQueryState } from "../../lib/utils";

const Inspectors: NextPage = () => {
  const [types, setTypes] = useQueryState<UserType[]>("types", [
    UserType.admin,
    UserType.inspector,
    UserType.customer,
  ]);
  const [userIds] = useQueryState<string[]>("selected", [""]);
  const { user } = useAuth();
  const { data: users } = useUsers();

  const selectedUsers = users?.filter((u) => userIds.includes(u.user_id));
  console.log("selectedUsers", selectedUsers);
  console.log("userId", userIds);

  if (!user) return <h1>U need to login</h1>;

  return (
    <AdminLayout currentTab={Tab.Users}>
      <div className="flex flex-wrap -mx-4">
        <div className="w-full px-4 lg:w-4/12">
          <div className="mb-8 rounded-lg shadow-card border-[#e7e7e7] bg-white">
            <div className="border-b border-[#e7e7e7] py-4 px-8 lg:px-6 xl:px-8">
              <h3 className="text-base font-semibold text-body-color sm:text-lg lg:text-base xl:text-lg">
                Filter by Type
              </h3>
            </div>
            <div className="px-8 space-y-4 py-9 lg:px-6 xl:px-8">
              {Object.values(UserType).map((userType) => (
                <div key={userType}>
                  <label
                    htmlFor={`checkbox-${userType}`}
                    className="flex items-center text-black cursor-pointer select-none"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`checkbox-${userType}`}
                        className="sr-only"
                        checked={types.includes(userType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTypes([...types, userType]);
                          } else {
                            setTypes(types.filter((t) => t !== userType));
                          }
                        }}
                      />
                      <div className="flex items-center justify-center w-5 h-5 mr-4 border rounded box">
                        <span className="opacity-0">
                          <svg
                            width="11"
                            height="8"
                            viewBox="0 0 11 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                              fill="#3056D3"
                              stroke="#3056D3"
                              stroke-width="0.4"
                            ></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                    {userType}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full px-4 lg:w-8/12">
          <div className="h-full items-center justify-center rounded-lg border-[#e7e7e7]">
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul
                role="list"
                className="flex flex-col divide-y divide-gray-200"
              >
                {selectedUsers?.map((user) => (
                  <UserItem user={user} emphasize={true} key={user.id} />
                ))}
                {users
                  ?.filter((u) => types.includes(u.type))
                  .map((user) => <UserItem user={user} key={user.id} />)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Inspectors;
