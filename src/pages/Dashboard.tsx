import React, { useEffect, useState } from "react";
import { Alert, HStack, Heading, VStack } from "@navikt/ds-react";
import {
  postAvstemming,
  postReadAndParseFile,
  postSendTrekkTransaksjon,
  postSendUtbetalingTransaksjon,
  useGetjobTaskInfo,
} from "../api/apiService";
import { JobTaskInfo } from "../types/JobTaskInfo";
import styles from "./Dashboard.module.css";
import DateRangePicker from "./components/DateRangePicker";
import JobCard from "./components/JobCard";
import Body from "@navikt/ds-react/esm/table/Body";

const Dashboard = () => {
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [disabledButtons, setDisabledButtons] = useState<{
    [key: string]: { disabled: boolean; timestamp: number };
  }>({});
  const [dateRange, setDateRange] = useState<{
    fromDate: string | null;
    toDate: string | null;
  }>({
    fromDate: null,
    toDate: null,
  });

  const { data } = useGetjobTaskInfo();

  const handleButtonClick = async (
    buttonId: string,
    action: (body?: { fromDate?: string; toDate?: string }) => Promise<unknown>,
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

    let body: { fromDate?: string; toDate?: string } | undefined = undefined;

    if (buttonId === "grensesnittAvstemming") {
      if (dateRange.fromDate && dateRange.toDate) {
        body = {
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate,
        };
      }
    }
    try {
      const data = (await action(body)) as string;
      setActiveAlert({ id: buttonId, type: "success", message: data });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setActiveAlert({
        id: buttonId,
        type: "error",
        message: `Error occurred: ${errorMessage}`,
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
          <Heading className={styles.tittel} spacing size="large">
            SPK Mottak Dashboard
          </Heading>{" "}
          <div className={styles.responsivmelding}>
            <Alert variant="error">
              Siden er for liten til å vise innhold!
            </Alert>
          </div>
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
            <div className={styles.spaceundergrensesnittavstemning}>
              <JobCard
                title="Grensesnittavstemming"
                buttonText="Start"
                buttonId="grensesnittAvstemming"
                activeAlert={activeAlert}
                onClick={() => { 
                 return handleButtonClick("grensesnittAvstemming", postAvstemming)
                } }
                disabled={ 
                  disabledButtons["grensesnittAvstemming"]?.disabled || false
                }
                jobTaskInfo={data.filter(
                  (task: JobTaskInfo) =>
                    task.taskName === "grensesnittAvstemming",
                )}
                className={styles.grensesnittcard}
              >
                <div className={styles.datePickerWrapper}>
                  <DateRangePicker
                    onDateChange={(fromDate, toDate)=> {
                        if (fromDate != dateRange.fromDate || toDate != dateRange.toDate) setDateRange((prev) => ({ fromDate, toDate }));
                       }
                    }
                  />
                </div>
              </JobCard>
            </div>
          </>
        ) : (
          <Alert variant="info">Ingen jobbinformasjon tilgjengelig</Alert>
        )}
      </VStack>
    </>
  );
};

export default Dashboard;
