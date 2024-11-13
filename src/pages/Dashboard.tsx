import React, { useState } from "react";
import { HStack, Heading, VStack } from "@navikt/ds-react";
import jobTaskInfoData from "../../mock/jobtaskinfo.json";
import {
  postAvstemming,
  postReadAndParseFile,
  postSendTrekkTransaksjon,
  postSendUtbetalingTransaksjon,
} from "../api/apiService";
import { JobTaskInfo } from "../types/JobTaskInfo";
import JobCard from "./components/JobCard";

const Dashboard = () => {
  const [activeAlert, setActiveAlert] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [disabledButtons, setDisabledButtons] = useState<{
    [key: number]: boolean;
  }>({});

  const jobTasks: JobTaskInfo[] = jobTaskInfoData;

  const handleButtonClick = async (
    buttonId: number,
    action: () => Promise<unknown>,
  ) => {
    setDisabledButtons((prev) => ({ ...prev, [buttonId]: true }));
    try {
      const data = (await action()) as string;
      setActiveAlert({ id: buttonId, type: "success", message: data });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ukjent feil oppstod";
      setActiveAlert({
        id: buttonId,
        type: "error",
        message: `Feil oppstod: ${errorMessage}`,
      });
    }
    setTimeout(() => setActiveAlert(null), 10000);
    setTimeout(
      () => setDisabledButtons((prev) => ({ ...prev, [buttonId]: false })),
      10000,
    );
  };

  return (
    <>
      <VStack align="center">
        <HStack margin="6" paddingBlock="6" gap="24">
          <Heading spacing size="large">
            SPK Mottak Dashboard
          </Heading>
        </HStack>
      </VStack>

      <VStack gap="16" align="stretch">
        {jobTasks && jobTasks.length > 0 ? (
          <>
            <JobCard
              title="Read and Parse File"
              buttonText="Start"
              buttonId={1}
              activeAlert={activeAlert}
              onClick={() => handleButtonClick(1, postReadAndParseFile)}
              disabled={disabledButtons[1] || false}
              jobTaskInfo={jobTasks.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "readParseFileAndValidateTransactions",
              )}
            />
            <JobCard
              title="Send Utbetaling Transaksjon"
              buttonText="Start"
              buttonId={2}
              activeAlert={activeAlert}
              onClick={() =>
                handleButtonClick(2, postSendUtbetalingTransaksjon)
              }
              disabled={disabledButtons[2] || false}
              jobTaskInfo={jobTasks.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "sendUtbetalingTransaksjonToOppdragZ",
              )}
            />
            <JobCard
              title="Send Trekk Transaksjon"
              buttonText="Start"
              buttonId={3}
              activeAlert={activeAlert}
              onClick={() => handleButtonClick(3, postSendTrekkTransaksjon)}
              disabled={disabledButtons[3] || false}
              jobTaskInfo={jobTasks.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "sendTrekkTransaksjonToOppdragZ",
              )}
            />
            <JobCard
              title="Grensesnitt Avstemming"
              buttonText="Start"
              buttonId={4}
              activeAlert={activeAlert}
              onClick={() => handleButtonClick(4, postAvstemming)}
              disabled={disabledButtons[4] || false}
              jobTaskInfo={jobTasks.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "grensesnittAvstemming",
              )}
            />
          </>
        ) : (
          <Heading size="small">No job task data available.</Heading>
        )}
      </VStack>
    </>
  );
};

export default Dashboard;
