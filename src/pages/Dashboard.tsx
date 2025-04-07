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
import { useStore } from "../store/AppState";
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

  const { taskInfoStateRecord, setTaskInfoStateItem, removeTaskInfoStateItem } =
    useStore();
  const [loadingButtons, setLoadingButtons] = useState<{
    [key: string]: boolean;
  }>({});
  const [alertVisibility, setalertVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  const [dateRange, setDateRange] = useState({
    fromDate: null as string | null,
    toDate: null as string | null,
  });

  const handleStartJob = async (taskId: string) => {
    setLoadingButtons((prev) => ({ ...prev, [taskId]: true }));
    setalertVisibility((prev) => ({ ...prev, [taskId]: true }));

    const currentTime = Date.now();
    setTaskInfoStateItem(taskId, { disabled: true, timestamp: currentTime });

    const apiPromises: Record<string, () => Promise<unknown>> = {
      readParseFileAndValidateTransactions: postReadAndParseFile,
      sendUtbetalingTransaksjonToOppdragZ: postSendUtbetalingTransaksjon,
      sendTrekkTransaksjonToOppdragZ: postSendTrekkTransaksjon,
      writeAvregningsreturFile: postSendAvregningsretur,
      grensesnittAvstemming: () => {
        const request: AvstemmingRequest = {
          fromDate: dateRange.fromDate
            ? toIsoDate(dateRange.fromDate)
            : undefined,
          toDate: dateRange.toDate ? toIsoDate(dateRange.toDate) : undefined,
        };
        return postAvstemming(request);
      },
    };

    await (
      apiPromises[taskId]
        ? apiPromises[taskId]()
        : Promise.reject(new Error("Unknown task ID"))
    )
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
      removeTaskInfoStateItem(taskId);
    }, 30000);
  };

  // Check for stored timestamps on initial load
  useEffect(() => {
    // Track timeouts for cleanup
    const timeouts: Record<string, number> = {};

    // Single function to handle button state reset
    const resetButtonState = (key: string) => {
      setLoadingButtons((prev) => ({ ...prev, [key]: false }));
      setalertVisibility((prev) => ({ ...prev, [key]: false }));
      removeTaskInfoStateItem(key);
    };

    const processTask = (taskId: string, timestamp: number) => {
      const now = Date.now();
      const elapsedTime = now - timestamp;

      if (elapsedTime < 30000) {
        // Still within disabled period - set UI state
        setLoadingButtons((prev) => ({ ...prev, [taskId]: true }));
        setalertVisibility((prev) => ({ ...prev, [taskId]: true }));

        // Schedule reset
        const remainingTime = 30000 - elapsedTime;
        timeouts[taskId] = window.setTimeout(
          () => resetButtonState(taskId),
          remainingTime,
        );
      } else {
        // Already expired
        resetButtonState(taskId);
      }
    };

    // Process tasks from state record
    if (taskInfoStateRecord) {
      Object.entries(taskInfoStateRecord).forEach(([taskId, state]) => {
        if (state.disabled) {
          processTask(taskId, state.timestamp);
        }
      });
    }

    if (Array.isArray(data)) {
      data.forEach((task) => {
        const savedTimestamp = taskInfoStateRecord[task.taskName]?.timestamp;
        if (savedTimestamp) {
          processTask(task.taskName, savedTimestamp);
        }
      });
    }

    // Clean up all timeouts on unmount
    return () => {
      Object.values(timeouts).forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
    };
  }, [data, taskInfoStateRecord, removeTaskInfoStateItem]);

  const taskMap = Array.isArray(data)
    ? data.reduce(
        (acc, task) => {
          acc[task.taskName] = task;
          return acc;
        },
        {} as Record<string, (typeof data)[0]>,
      )
    : {};

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
                    alert?.id === readTaskInfo?.taskName
                      ? alert?.type || null
                      : "info",
                  isAlertVisible: alertVisibility[readTaskInfo?.taskName],
                  isJobRunning: !!readTaskInfo?.isPicked,
                  isLoading: loadingButtons[readTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStateRecord[readTaskInfo?.taskName]?.disabled ||
                    false,
                }}
                jobTaskInfo={readTaskInfo}
                onStartClick={() => handleStartJob(readTaskInfo?.taskName)}
              />
              <JobCard
                title="Send utbetalingtransaksjoner"
                attributes={{
                  alertType:
                    alert?.id === utbetalingTaskInfo?.taskName
                      ? alert?.type || null
                      : "info",
                  isAlertVisible: alertVisibility[utbetalingTaskInfo?.taskName],
                  isJobRunning: !!utbetalingTaskInfo?.isPicked,
                  isLoading: loadingButtons[utbetalingTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStateRecord[utbetalingTaskInfo?.taskName]
                      ?.disabled || false,
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
                      ? alert?.type || null
                      : "info",
                  isAlertVisible: alertVisibility[trekkTaskInfo?.taskName],
                  isJobRunning: !!trekkTaskInfo?.isPicked,
                  isLoading: loadingButtons[trekkTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStateRecord[trekkTaskInfo?.taskName]?.disabled ||
                    false,
                }}
                jobTaskInfo={trekkTaskInfo}
                onStartClick={() => handleStartJob(trekkTaskInfo?.taskName)}
              />

              <JobCard
                title="Send avregningsretur"
                attributes={{
                  alertType:
                    alert?.id === writeAvregningTaskInfo?.taskName
                      ? alert?.type || null
                      : "info",
                  isAlertVisible:
                    alertVisibility[writeAvregningTaskInfo?.taskName],
                  isJobRunning: !!writeAvregningTaskInfo?.isPicked,
                  isLoading: loadingButtons[writeAvregningTaskInfo?.taskName],
                  isButtonDisabled:
                    taskInfoStateRecord[writeAvregningTaskInfo?.taskName]
                      ?.disabled || false,
                }}
                jobTaskInfo={writeAvregningTaskInfo}
                onStartClick={() =>
                  handleStartJob(writeAvregningTaskInfo?.taskName)
                }
              />

              <div className={styles.bottomSpacing}>
                <JobCard
                  title="Grensesnittavstemming"
                  attributes={{
                    alertType:
                      alert?.id === avstemmingTaskInfo?.taskName
                        ? alert?.type || null
                        : "info",
                    isAlertVisible:
                      alertVisibility[avstemmingTaskInfo?.taskName],
                    isJobRunning: !!avstemmingTaskInfo?.isPicked,
                    isLoading: loadingButtons[avstemmingTaskInfo?.taskName],
                    isButtonDisabled:
                      taskInfoStateRecord[avstemmingTaskInfo?.taskName]
                        ?.disabled || false,
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
              </div>
            </>
          )}
        </VStack>
      )}
    </>
  );
};

export default Dashboard;
