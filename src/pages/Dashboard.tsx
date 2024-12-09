import React, { useEffect, useState } from "react";
import { HStack, Heading, VStack } from "@navikt/ds-react";
import {
  postAvstemming,
  postReadAndParseFile,
  postSendTrekkTransaksjon,
  postSendUtbetalingTransaksjon,
  useGetjobTaskInfo,
} from "../api/apiService";
import { JobTaskInfo } from "../types/JobTaskInfo";
import JobCard from "./components/JobCard";

const Dashboard = () => {
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [disabledButtons, setDisabledButtons] = useState<{
    [key: string]: { disabled: boolean; timestamp: number };
  }>({});

  const { data } = useGetjobTaskInfo();

  const handleButtonClick = async (
    buttonId: string,
    action: () => Promise<unknown>,
  ) => {
    const currentTime = Date.now();
    setDisabledButtons((prev) => {
      const newState = {
        ...prev,
        [buttonId]: { disabled: true, timestamp: currentTime },
      };
      localStorage.setItem("disabledButtons", JSON.stringify(newState));
      return newState;
    });

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
  };

  useEffect(() => {
    const disabledState = localStorage.getItem("disabledButtons");
    if (disabledState) {
      const parsedState = JSON.parse(disabledState);
      const now = Date.now();
      Object.keys(parsedState).forEach((key) => {
        const buttonState = parsedState[key];
        if (buttonState.disabled && now - buttonState.timestamp < 30000) {
          parsedState[key].disabled = true;
        } else {
          parsedState[key].disabled = false;
        }
      });
      setDisabledButtons(parsedState);
    }
  }, [data]);

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
        {data && data.length > 0 ? (
          <>
            <JobCard
              title="Les inn fil og valider transaksjoner"
              buttonText="Start"
              buttonId="readParseFileAndValidateTransactions"
              activeAlert={activeAlert}
              onClick={() =>
                handleButtonClick(
                  "readParseFileAndValidateTransactions",
                  postReadAndParseFile,
                )
              }
              disabled={
                disabledButtons["readParseFileAndValidateTransactions"]
                  ?.disabled || false
              }
              jobTaskInfo={data.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "readParseFileAndValidateTransactions",
              )}
            />
            <JobCard
              title="Send utbetalingtransaksjoner"
              buttonText="Start"
              buttonId="sendUtbetalingTransaksjonToOppdragZ"
              activeAlert={activeAlert}
              onClick={() =>
                handleButtonClick(
                  "sendUtbetalingTransaksjonToOppdragZ",
                  postSendUtbetalingTransaksjon,
                )
              }
              disabled={
                disabledButtons["sendUtbetalingTransaksjonToOppdragZ"]
                  ?.disabled || false
              }
              jobTaskInfo={data.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "sendUtbetalingTransaksjonToOppdragZ",
              )}
            />
            <JobCard
              title="Send trekktransaksjoner"
              buttonText="Start"
              buttonId="sendTrekkTransaksjonToOppdragZ"
              activeAlert={activeAlert}
              onClick={() =>
                handleButtonClick(
                  "sendTrekkTransaksjonToOppdragZ",
                  postSendTrekkTransaksjon,
                )
              }
              disabled={
                disabledButtons["sendTrekkTransaksjonToOppdragZ"]?.disabled ||
                false
              }
              jobTaskInfo={data.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "sendTrekkTransaksjonToOppdragZ",
              )}
            />
            <JobCard
              title="Grensesnittavstemming"
              buttonText="Start"
              buttonId="grensesnittAvstemming"
              activeAlert={activeAlert}
              onClick={() =>
                handleButtonClick("grensesnittAvstemming", postAvstemming)
              }
              disabled={
                disabledButtons["grensesnittAvstemming"]?.disabled || false
              }
              jobTaskInfo={data.filter(
                (task: JobTaskInfo) =>
                  task.taskName === "grensesnittAvstemming",
              )}
            />
          </>
        ) : (
          <Heading size="small">Ingen oppgaveinformasjon tilgjengelig</Heading>
        )}
      </VStack>
    </>
  );
};

export default Dashboard;
