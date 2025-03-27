import React, { useEffect, useState } from "react";
import { Alert, HStack, Heading, Loader, VStack } from "@navikt/ds-react";
import {
  postAvstemming,
  postReadAndParseFile,
  postSendTrekkTransaksjon,
  postSendUtbetalingTransaksjon,
  useGetjobTaskInfo,
} from "../api/apiService";
import { AvstemmingRequest } from "../api/models/AvstemmingRequest";
import { JobTaskInfo } from "../types/JobTaskInfo";
import { toIsoDate } from "../util/datoUtil";
import styles from "./Dashboard.module.css";
import DateRangePicker from "./components/DateRangePicker";
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
  const [dateRange, setDateRange] = useState<{
    fromDate: string | null;
    toDate: string | null;
  }>({
    fromDate: null,
    toDate: null,
  });

  const { data, error } = useGetjobTaskInfo();

  const isLoading = !data && !error;

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
      {error ? (
        <VStack align="center" justify="center" gap="8">
          <Alert variant="error">
            Det oppstod en feil ved henting av data fra serveren. Vennligst prøv
            igjen senere.
          </Alert>
        </VStack>
      ) : (
        <VStack gap="16" align="stretch">
          {isLoading ? (
            <VStack align="center" style={{ marginTop: "2rem" }}>
              <Loader size="large" title="Laster inn..." />
            </VStack>
          ) : (
            <>
              <JobCard
                title="Les inn fil og valider transaksjoner"
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
                jobTaskInfo={data?.find(
                  (task: JobTaskInfo) =>
                    task.taskName === "readParseFileAndValidateTransactions",
                )}
              />
              <JobCard
                title="Send utbetalingtransaksjoner"
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
                jobTaskInfo={data?.find(
                  (task: JobTaskInfo) =>
                    task.taskName === "sendUtbetalingTransaksjonToOppdragZ",
                )}
              />
              <JobCard
                title="Send trekktransaksjoner"
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
                jobTaskInfo={data?.find(
                  (task: JobTaskInfo) =>
                    task.taskName === "sendTrekkTransaksjonToOppdragZ",
                )}
              />
              <div className={styles.spaceundergrensesnittavstemning}>
                <JobCard
                  title="Grensesnittavstemming"
                  buttonId="grensesnittAvstemming"
                  activeAlert={activeAlert}
                  onClick={() => {
                    const request: AvstemmingRequest = {
                      fromDate: dateRange.fromDate
                        ? toIsoDate(dateRange.fromDate)
                        : undefined,
                      toDate: dateRange.toDate
                        ? toIsoDate(dateRange.toDate)
                        : undefined,
                    };
                    return handleButtonClick("grensesnittAvstemming", () =>
                      postAvstemming(request),
                    );
                  }}
                  disabled={
                    disabledButtons["grensesnittAvstemming"]?.disabled || false
                  }
                  jobTaskInfo={data?.find(
                    (task: JobTaskInfo) =>
                      task.taskName === "grensesnittAvstemming",
                  )}
                  className={styles.grensesnittcard}
                >
                  <div className={styles.datePickerWrapper}>
                    <DateRangePicker
                      onDateChange={(fromDate, toDate) => {
                        if (
                          fromDate !== dateRange.fromDate ||
                          toDate !== dateRange.toDate
                        )
                          setDateRange(() => ({
                            fromDate,
                            toDate,
                          }));
                      }}
                    />
                  </div>
                </JobCard>
              </div>
            </>
          )}
        </VStack>
      )}
    </>
  );
};

export default Dashboard;
