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

  // New state for tracking loading state per button
  const [loadingButtons, setLoadingButtons] = useState<{
    [key: string]: boolean;
  }>({});

  // New state for tracking alert visibility per button
  const [alertVisibility, setAlertVisibility] = useState<{
    [key: string]: boolean;
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

  // Move handleButtonClick logic here but enhance it
  const handleStartJob = (
    taskId: string,
    action: (body?: { fromDate?: string; toDate?: string }) => Promise<unknown>,
  ) => {
    // Set loading state
    setLoadingButtons((prev) => ({
      ...prev,
      [taskId]: true,
    }));

    // Set alert visibility
    setAlertVisibility((prev) => ({
      ...prev,
      [taskId]: true,
    }));

    const currentTime = Date.now();

    // Store timestamp in localStorage
    localStorage.setItem(`${taskId}_timestamp`, currentTime.toString());

    // Set disabled state
    setDisabledButtons((prev) => {
      const newState = {
        ...prev,
        [taskId]: { disabled: true, timestamp: currentTime },
      };
      localStorage.setItem("disabledButtons", JSON.stringify(newState));
      return newState;
    });

    // Prepare body if needed
    let body: { fromDate?: string; toDate?: string } | undefined = undefined;
    if (
      taskId === "grensesnittAvstemming" &&
      dateRange.fromDate &&
      dateRange.toDate
    ) {
      body = {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
      };
    }

    // Execute the action
    action(body)
      .then((data) => {
        setActiveAlert({
          id: taskId,
          type: "success",
          message: data as string,
        });
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";

        setActiveAlert({
          id: taskId,
          type: "error",
          message: `Error occurred: ${errorMessage}`,
        });
      });

    // Set a timeout to clear states after 30 seconds
    setTimeout(() => {
      setLoadingButtons((prev) => ({ ...prev, [taskId]: false }));
      setAlertVisibility((prev) => ({ ...prev, [taskId]: false }));
      localStorage.removeItem(`${taskId}_timestamp`);

      setDisabledButtons((prev) => {
        const newState = {
          ...prev,
          [taskId]: { disabled: false, timestamp: 0 },
        };
        localStorage.setItem("disabledButtons", JSON.stringify(newState));
        return newState;
      });
    }, 30000);
  };

  // Check for stored timestamps on initial load
  useEffect(() => {
    // Load disabled buttons from localStorage
    const disabledState = localStorage.getItem("disabledButtons");
    if (disabledState) {
      const parsedState = JSON.parse(disabledState);
      const now = Date.now();
      const newDisabledState = { ...parsedState };

      Object.keys(parsedState).forEach((key) => {
        const buttonState = parsedState[key];
        if (buttonState.disabled && now - buttonState.timestamp < 30000) {
          // Still disabled
          newDisabledState[key] = { ...buttonState };

          // Also set loading and alert visibility
          setLoadingButtons((prev) => ({ ...prev, [key]: true }));
          setAlertVisibility((prev) => ({ ...prev, [key]: true }));
        } else {
          // Enable button
          newDisabledState[key] = { disabled: false, timestamp: 0 };
        }
      });

      setDisabledButtons(newDisabledState);
    }

    // Check for active tasks in localStorage
    if (data) {
      data.forEach((task) => {
        const savedTimestamp = localStorage.getItem(
          `${task.taskName}_timestamp`,
        );
        if (savedTimestamp) {
          const savedTime = parseInt(savedTimestamp);
          const currentTime = Date.now();

          if (currentTime - savedTime < 30000) {
            setLoadingButtons((prev) => ({ ...prev, [task.taskName]: true }));
            setAlertVisibility((prev) => ({ ...prev, [task.taskName]: true }));
          } else {
            localStorage.removeItem(`${task.taskName}_timestamp`);
          }
        }
      });
    }
  }, [data]);

  const taskMap =
    data?.reduce(
      (acc, task) => {
        acc[task.taskName] = task;
        return acc;
      },
      {} as Record<string, (typeof data)[0]>,
    ) || {};

  const readTaskInfo = taskMap["readParseFileAndValidateTransactions"];
  const utbetalingTaskInfo = taskMap["sendUtbetalingTransaksjonToOppdragZ"];
  const trekkTaskInfo = taskMap["sendTrekkTransaksjonToOppdragZ"];
  const avstemmingTaskInfo = taskMap["grensesnittAvstemming"];

  return (
    <>
      <VStack align="center">
        <HStack margin="6" paddingBlock="6" gap="24">
          <Heading className={styles.tittel} spacing size="large">
            SPK Mottak Dashboard
          </Heading>
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
                attributes={{
                  alertMessage:
                    activeAlert?.id === readTaskInfo.taskName
                      ? activeAlert.message
                      : "Jobb har startet, sjekk logger for status",
                  alertType:
                    activeAlert?.id === readTaskInfo.taskName
                      ? activeAlert.type
                      : "info",
                  isAlertVisible: alertVisibility[readTaskInfo.taskName],
                  isJobRunning: !!readTaskInfo.isPicked,
                  isLoading: loadingButtons[readTaskInfo.taskName],
                  isButtonDisabled:
                    disabledButtons[readTaskInfo.taskName]?.disabled || false,
                }}
                jobTaskInfo={readTaskInfo}
                onStartClick={() =>
                  handleStartJob(readTaskInfo.taskName, postReadAndParseFile)
                }
              />
              <JobCard
                title="Send utbetalingtransaksjoner"
                attributes={{
                  alertMessage:
                    activeAlert?.id === utbetalingTaskInfo.taskName
                      ? activeAlert.message
                      : "Jobb har startet, sjekk logger for status",
                  alertType:
                    activeAlert?.id === utbetalingTaskInfo.taskName
                      ? activeAlert.type
                      : "info",
                  isAlertVisible: alertVisibility[utbetalingTaskInfo.taskName],
                  isJobRunning: !!utbetalingTaskInfo.isPicked,
                  isLoading: loadingButtons[utbetalingTaskInfo.taskName],
                  isButtonDisabled:
                    disabledButtons[utbetalingTaskInfo.taskName]?.disabled ||
                    false,
                }}
                jobTaskInfo={utbetalingTaskInfo}
                onStartClick={() =>
                  handleStartJob(
                    utbetalingTaskInfo.taskName,
                    postSendUtbetalingTransaksjon,
                  )
                }
              />

              <JobCard
                title="Send trekktransaksjoner"
                attributes={{
                  alertMessage:
                    activeAlert?.id === trekkTaskInfo.taskName
                      ? activeAlert.message
                      : "Jobb har startet, sjekk logger for status",
                  alertType:
                    activeAlert?.id === trekkTaskInfo.taskName
                      ? activeAlert.type
                      : "info",
                  isAlertVisible: alertVisibility[trekkTaskInfo.taskName],
                  isJobRunning: !!trekkTaskInfo.isPicked,
                  isLoading: loadingButtons[trekkTaskInfo.taskName],
                  isButtonDisabled:
                    disabledButtons[trekkTaskInfo.taskName]?.disabled || false,
                }}
                jobTaskInfo={trekkTaskInfo}
                onStartClick={() =>
                  handleStartJob(
                    trekkTaskInfo.taskName,
                    postSendTrekkTransaksjon,
                  )
                }
              />

              <JobCard
                title="Grensesnittavstemming"
                attributes={{
                  alertMessage:
                    activeAlert?.id === avstemmingTaskInfo.taskName
                      ? activeAlert.message
                      : "Jobb har startet, sjekk logger for status",
                  alertType:
                    activeAlert?.id === avstemmingTaskInfo.taskName
                      ? activeAlert.type
                      : "info",
                  isAlertVisible: alertVisibility[avstemmingTaskInfo.taskName],
                  isJobRunning: !!avstemmingTaskInfo.isPicked,
                  isLoading: loadingButtons[avstemmingTaskInfo.taskName],
                  isButtonDisabled:
                    disabledButtons[avstemmingTaskInfo.taskName]?.disabled ||
                    false,
                }}
                jobTaskInfo={avstemmingTaskInfo}
                className={styles.grensesnittcard}
                onStartClick={() => {
                  const request: AvstemmingRequest = {
                    fromDate: dateRange.fromDate
                      ? toIsoDate(dateRange.fromDate)
                      : undefined,
                    toDate: dateRange.toDate
                      ? toIsoDate(dateRange.toDate)
                      : undefined,
                  };
                  handleStartJob(avstemmingTaskInfo.taskName, () =>
                    postAvstemming(request),
                  );
                }}
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
            </>
          )}
        </VStack>
      )}
    </>
  );
};

export default Dashboard;
