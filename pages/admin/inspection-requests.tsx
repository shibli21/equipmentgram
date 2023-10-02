import { NextPage } from "next";
import React, { useState } from "react";
import { InspectionItem } from "../../components/admin/InspectionItem";
import { Step } from "../../components/forms/StepWidget";
import { AdminLayout, Tab } from "../../components/layout/admin";
import { useAuth } from "../../lib/authContext";
import {
  useInspectionRequests,
  useInspectionRequestsForUser,
} from "../../lib/network/inspection-requests";

const InspectionRequests: NextPage = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.InspectionRequests);
  const [sortByName, setSortByName] = useState<boolean>(false);
  const [sortBySubmitted, setSortBySubmitted] = useState<boolean>(false);
  const [sortByWaitTime, setSortByWaitTime] = useState<boolean>(false);
  const [selectedSteps, setSelectedSteps] = useState<Step[]>([]);
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
    <AdminLayout currentTab={Tab.InspectionRequests}>
      <div className="flex flex-wrap -mx-4">
        <div className="w-full px-4 lg:w-4/12">
          <div className="mb-8 rounded-lg shadow-card border-[#e7e7e7] bg-white">
            <div className="border-b border-[#e7e7e7] py-4 px-8 lg:px-6 xl:px-8">
              <h3 className="text-base font-semibold text-body-color sm:text-lg lg:text-base xl:text-lg">
                Filter by Step
              </h3>
            </div>
            <div className="px-8 space-y-4 py-9 lg:px-6 xl:px-8">
              {Object.values(Step)
                .slice(1)
                .map((step) => (
                  <div key={step}>
                    <label
                      htmlFor={`checkbox-${step}`}
                      className="flex items-center text-black cursor-pointer select-none"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`checkbox-${step}`}
                          className="sr-only"
                          checked={selectedSteps.includes(step)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSteps([...selectedSteps, step]);
                            } else {
                              setSelectedSteps(
                                selectedSteps.filter((s) => s !== step),
                              );
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
                      {step}
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <div className="mb-8 rounded-lg shadow-card border-[#e7e7e7] bg-white">
            <div className="border-b border-[#e7e7e7] py-4 px-8 lg:px-6 xl:px-8">
              <h3 className="text-base font-semibold text-body-color sm:text-lg lg:text-base xl:text-lg">
                Sort By
              </h3>
            </div>
            <div className="px-8 space-y-4 py-9 lg:px-6 xl:px-8">
              <div key="Name">
                <label
                  htmlFor={`checkbox-Name`}
                  className="flex items-center text-black cursor-pointer select-none"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`checkbox-Name`}
                      className="sr-only"
                      checked={sortByName}
                      onChange={(e) => setSortByName(e.target.checked)}
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
                  Name
                </label>
              </div>
              <div key="Submitted">
                <label
                  htmlFor={`checkbox-Submitted`}
                  className="flex items-center text-black cursor-pointer select-none"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`checkbox-Submitted`}
                      className="sr-only"
                      checked={sortBySubmitted}
                      onChange={(e) => setSortBySubmitted(e.target.checked)}
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
                  Submitted
                </label>
              </div>
              <div key="WaitTime">
                <label
                  htmlFor={`checkbox-WaitTime`}
                  className="flex items-center text-black cursor-pointer select-none"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`checkbox-WaitTime`}
                      className="sr-only"
                      checked={sortByWaitTime}
                      onChange={(e) => setSortByWaitTime(e.target.checked)}
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
                  Wait Time
                </label>
              </div>
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
                {allInspectionRequests?.map((inspection) => (
                  <InspectionItem inspection={inspection} key={inspection.id} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InspectionRequests;
