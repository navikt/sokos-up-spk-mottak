import React, { useEffect, useState } from "react";
import { Alert, Button, Heading } from "@navikt/ds-react";
import { isoDatoTilNorskDato } from "../../util/datoUtil";
import styles from "../Dashboard.module.css";

interface JobCardProps {
  title: string;
  buttonText: string;
  buttonId: string;
  activeAlert: {
    id: string;
    type: "success" | "error";
    message: string;
  } | null;
  onClick: (id: string) => void;
  disabled: boolean;
  jobTaskInfo?: Record<string, string | boolean>[];
  children?: React.ReactNode;
}

const labelTranslations: Record<string, string> = {
  taskName: "Oppgavenavn",
  executionTime: "Planlagt kjøringstidspunkt",
  isPicked: "Jobb Kjører",
  lastSuccess: "Siste vellykkede kjøringstidspunkt",
  lastFailure: "Siste mislykkede kjøringstidspunkt",
  ident: "Sist kjørt av",
};

const JobCard: React.FC<JobCardProps> = ({
  title,
  buttonText,
  buttonId,
  activeAlert,
  onClick,
  jobTaskInfo,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isJobRunningAlertVisible, setIsJobRunningAlertVisible] =
    useState(false);
  const [disabledButtons, setDisabledButtons] = useState<{
    [key: string]: boolean;
  }>({});

  const handleStartClick = async (id: string) => {
    setIsLoading(true);
    await onClick(id);

    const currentTime = Date.now();
    localStorage.setItem(`${id}_timestamp`, currentTime.toString());
    setIsAlertVisible(true);
  };

  useEffect(() => {
    const savedTimestamp = localStorage.getItem(`${buttonId}_timestamp`);

    if (savedTimestamp) {
      const savedTime = parseInt(savedTimestamp);
      const currentTime = Date.now();

      if (currentTime - savedTime < 30000) {
        setIsLoading(true);
        setIsAlertVisible(true);
      } else {
        localStorage.removeItem(`${buttonId}_timestamp`);
      }
    }
  }, [buttonId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const savedTimestamp = localStorage.getItem(`${buttonId}_timestamp`);
      if (savedTimestamp) {
        setIsAlertVisible(false);
        localStorage.removeItem(`${buttonId}_timestamp`);
        setIsLoading(false);

        setDisabledButtons((prevState) => ({
          ...prevState,
          [buttonId]: false,
        }));
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [buttonId]);
  const isJobRunning = jobTaskInfo?.some((task) => task.isPicked === true);
  useEffect(() => {
    if (isJobRunning) {
      setIsJobRunningAlertVisible(true);
    } else {
      setIsJobRunningAlertVisible(false);
    }
  }, [isJobRunning]);

  return (
    <div className={styles.jobCardContainer}>
      <div className={styles.titleContainer}>
        <Heading size="medium">{title}</Heading>
      </div>

      {jobTaskInfo && jobTaskInfo.length > 0 && (
        <div className={styles.taskDetailsContainer}>
          {jobTaskInfo.map((task, index) => (
            <div key={index} className={styles.taskDetailsGrid}>
              {Object.entries(task).map(([key, value], i) => {
                if (key === "taskId") return null;

                let displayValue;
                if (key === "taskName") {
                  displayValue = value || "N/A";
                } else if (typeof value === "boolean") {
                  displayValue = value ? "Ja" : "Nei";
                } else if (typeof value === "string" && value.endsWith("Z")) {
                  displayValue = isoDatoTilNorskDato(value);
                } else {
                  displayValue = value || "N/A";
                }

                const label =
                  labelTranslations[key] ||
                  key.charAt(0).toUpperCase() + key.slice(1);

                return (
                  <div key={i} className={styles.taskDetailItem}>
                    <strong className={styles.taskDetailKey}>{label}:</strong>{" "}
                    <span className={styles.taskDetailValue}>
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {children}

      <div className={styles.buttonAndAlertContainer}>
        {isAlertVisible && (
          <div className={styles.alertWrapper}>
            <Alert
              size="small"
              variant={activeAlert?.type || "success"}
              className={styles.alert}
            >
              {activeAlert?.id === buttonId
                ? activeAlert.message
                : "Jobb har startet, sjekk logger for status"}
            </Alert>
          </div>
        )}
        {isJobRunningAlertVisible && (
          <div className={styles.alertWrapper}>
            <Alert size="small" variant="info" className={styles.alert}>
              Jobb holder på, sjekk logger for status
            </Alert>
          </div>
        )}
        <div className={styles.buttonWrapper}>
          <Button
            variant="primary"
            size="medium"
            onClick={() => handleStartClick(buttonId)}
            disabled={isJobRunning || disabledButtons[buttonId] || isLoading}
            loading={isLoading}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
