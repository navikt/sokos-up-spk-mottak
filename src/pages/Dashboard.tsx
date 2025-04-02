import React, { useEffect, useState } from "react";
import { Alert, HStack, Heading, Loader, VStack } from "@navikt/ds-react";
import {
  postAvstemming,
  postReadAndParseFile,
  postSendAvregningsretur,
  postSendTrekkTransaksjon,
  postSendUtbetalingTransaksjon,
  useGetjobTaskInfo,
} from "../api/apiService";
import { AvstemmingRequest } from "../api/models/AvstemmingRequest";
import { TaskInfoState, TaskInfoStateRecord } from "../types/TaskInfoState";
import { toIsoDate } from "../util/datoUtil";
import styles from "./Dashboard.module.css";
import DateRangePicker from "./components/DateRangePicker";
import JobCard from "./components/JobCard";

const Dashboard = () => {
  const { data, error, mutate } = useGetjobTaskInfo();
  const isLoading = !data && !error;

  const [alert, setAlert] = useState<{
    id: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [taskInfoStates, setTaskInfoStates] = useState<TaskInfoStateRecord>({});

  const [loadingButtons, setLoadingButtons] = useState<{
    [key: string]: boolean;
  }>({});

  const [alertVisibility, setalertVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  const [dateRange, setDateRange] = useState<{
    fromDate: string | null;
    toDate: string | null;
  }>({
    fromDate: null,
    toDate: null,
  });

  const handleStartJob = async (taskId: string) => {
    setLoadingButtons((prev) => ({
      ...prev,
      [taskId]: true,
    }));

    setalertVisibility((prev) => ({
      ...prev,
      [taskId]: true,
    }));

    const currentTime = Date.now();

    localStorage.setItem(`${taskId}_timestamp`, currentTime.toString());

    setTaskInfoStates((prev) => {
      const newState = {
        ...prev,
        [taskId]: { disabled: true, timestamp: currentTime },
      };
      localStorage.setItem("disabledButtons", JSON.stringify(newState));
      return newState;
    });

    let apiPromise: Promise<unknown>;

    switch (taskId) {
      case "readParseFileAndValidateTransactions":
        apiPromise = postReadAndParseFile();
        break;
      case "sendUtbetalingTransaksjonToOppdragZ":
        apiPromise = postSendUtbetalingTransaksjon();
        break;
      case "sendTrekkTransaksjonToOppdragZ":
        apiPromise = postSendTrekkTransaksjon();
        break;
      case "writeAvregningsreturFile":
        apiPromise = postSendAvregningsretur();
        break;
      case "grensesnittAvstemming": {
        const request: AvstemmingRequest = {
          fromDate: dateRange.fromDate
            ? toIsoDate(dateRange.fromDate)
            : undefined,
          toDate: dateRange.toDate ? toIsoDate(dateRange.toDate) : undefined,
        };
        apiPromise = postAvstemming(request);
        break;
      }
      default:
        apiPromise = Promise.reject(new Error("Unknown task ID"));
    }

    await apiPromise
      .then((data) => {
        setAlert({
          id: taskId,
          type: "success",
          message: data as string,
        });
        mutate();
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";

        setAlert({
          id: taskId,
          type: "error",
          message: `Error occurred: ${errorMessage}`,
        });
      });

    setTimeout(() => {
      setLoadingButtons((prev) => ({ ...prev, [taskId]: false }));
      setalertVisibility((prev) => ({ ...prev, [taskId]: false }));
      localStorage.removeItem(`${taskId}_timestamp`);

      setTaskInfoStates((prev) => {
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
    // Helper function to handle button state restoration
    const restoreButtonState = (key: string, timestamp: number) => {
      const now = Date.now();
      const elapsedTime = now - timestamp;

      if (elapsedTime < 30000) {
        // Still disabled - set UI state
        setLoadingButtons((prev) => ({ ...prev, [key]: true }));
        setalertVisibility((prev) => ({ ...prev, [key]: true }));

        // Calculate remaining time and set timeout to re-enable
        const remainingTime = 30000 - elapsedTime;
        return setTimeout(() => resetButtonState(key), remainingTime);
      }

      // Time already elapsed, reset state
      resetButtonState(key);
      return null;
    };

    // Helper function to reset a button's state
    const resetButtonState = (key: string) => {
      setLoadingButtons((prev) => ({ ...prev, [key]: false }));
      setalertVisibility((prev) => ({ ...prev, [key]: false }));
      localStorage.removeItem(`${key}_timestamp`);

      setTaskInfoStates((prev) => {
        const newState = {
          ...prev,
          [key]: { disabled: false, timestamp: 0 },
        };
        localStorage.setItem("disabledButtons", JSON.stringify(newState));
        return newState;
      });
    };

    // Restore disabled button states from localStorage
    const timeouts: { [key: string]: NodeJS.Timeout } = {};
    const disabledState = localStorage.getItem("disabledButtons");

    if (disabledState) {
      const parsedState: TaskInfoStateRecord = JSON.parse(disabledState);
      const newDisabledState = { ...parsedState };

      Object.entries(parsedState).forEach(
        ([key, buttonState]: [string, TaskInfoState]) => {
          if (buttonState.disabled) {
            newDisabledState[key] = { ...buttonState };
            const timeout = restoreButtonState(key, buttonState.timestamp);
            if (timeout) timeouts[key] = timeout;
          } else {
            newDisabledState[key] = { disabled: false, timestamp: 0 };
          }
        },
      );

      setTaskInfoStates(newDisabledState);
    }

    // Check for active tasks in localStorage based on task data
    if (data) {
      data.forEach((task) => {
        const savedTimestamp = localStorage.getItem(
          `${task.taskName}_timestamp`,
        );
        if (savedTimestamp) {
          const savedTime = parseInt(savedTimestamp);
          const timeout = restoreButtonState(task.taskName, savedTime);
          if (timeout) timeouts[task.taskName] = timeout;
        }
      });
    }

    // Clean up timeouts on unmount
    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
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
  const writeAvregningTaskInfo = taskMap["writeAvregningsreturFile"];

  return (
    <>
      <VStack align="center">
        <HStack margin="4">
          <Heading size="medium">SPK Mottak Dashboard</Heading>
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
        <VStack gap="4" align="stretch">
          {isLoading ? (
            <VStack align="center" style={{ marginTop: "2rem" }}>
              <Loader size="large" title="Laster inn..." />
            </VStack>
          ) : (
            <>
              <JobCard
                title="Les inn fil og valider transaksjoner"
                attributes={{
                  alertType:
                    alert?.id === readTaskInfo?.taskName ? alert?.type : "info",
                  isAlertVisible: alertVisibility[readTaskInfo?.taskName],
                  isJobRunning: !!readTaskInfo?.isPicked,
                  isLoading: loadingButtons[readTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStates[readTaskInfo?.taskName]?.disabled || false,
                }}
                jobTaskInfo={readTaskInfo}
                onStartClick={() => handleStartJob(readTaskInfo?.taskName)}
              />
              <JobCard
                title="Send utbetalingtransaksjoner"
                attributes={{
                  alertType:
                    alert?.id === utbetalingTaskInfo?.taskName
                      ? alert?.type
                      : "info",
                  isAlertVisible: alertVisibility[utbetalingTaskInfo?.taskName],
                  isJobRunning: !!utbetalingTaskInfo?.isPicked,
                  isLoading: loadingButtons[utbetalingTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStates[utbetalingTaskInfo?.taskName]?.disabled ||
                    false,
                }}
                jobTaskInfo={utbetalingTaskInfo}
                onStartClick={() =>
                  handleStartJob(utbetalingTaskInfo?.taskName)
                }
              />

              <JobCard
                title="Send trekktransaksjoner"
                attributes={{
                  alertType:
                    alert?.id === trekkTaskInfo?.taskName
                      ? alert?.type
                      : "info",
                  isAlertVisible: alertVisibility[trekkTaskInfo?.taskName],
                  isJobRunning: !!trekkTaskInfo?.isPicked,
                  isLoading: loadingButtons[trekkTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStates[trekkTaskInfo?.taskName]?.disabled || false,
                }}
                jobTaskInfo={trekkTaskInfo}
                onStartClick={() => handleStartJob(trekkTaskInfo?.taskName)}
              />

              <JobCard
                title="Send avregningsretur"
                attributes={{
                  alertType:
                    alert?.id === writeAvregningTaskInfo?.taskName
                      ? alert?.type
                      : "info",
                  isAlertVisible:
                    alertVisibility[writeAvregningTaskInfo?.taskName],
                  isJobRunning: !!writeAvregningTaskInfo?.isPicked,
                  isLoading: loadingButtons[writeAvregningTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStates[writeAvregningTaskInfo?.taskName]
                      ?.disabled || false,
                }}
                jobTaskInfo={writeAvregningTaskInfo}
                onStartClick={() =>
                  handleStartJob(writeAvregningTaskInfo?.taskName)
                }
              />

              <JobCard
                title="Grensesnittavstemming"
                attributes={{
                  alertType:
                    alert?.id === avstemmingTaskInfo?.taskName
                      ? alert?.type
                      : "info",
                  isAlertVisible: alertVisibility[avstemmingTaskInfo?.taskName],
                  isJobRunning: !!avstemmingTaskInfo?.isPicked,
                  isLoading: loadingButtons[avstemmingTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStates[avstemmingTaskInfo?.taskName]?.disabled ||
                    false,
                }}
                jobTaskInfo={avstemmingTaskInfo}
                onStartClick={() =>
                  handleStartJob(avstemmingTaskInfo?.taskName)
                }
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
