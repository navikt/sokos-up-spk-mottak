import React, { useEffect, useState } from "react";
import { Alert, Button, Heading, Link } from "@navikt/ds-react";
import { isIsoDate, isoDatoTilNorskDato } from "../../util/datoUtil";
import { getEnvironment } from "../../util/environment";
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
  className?: string;
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
  jobTaskInfo = [],
  children,
  className,
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
    onClick(id);

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

  const isJobRunning = jobTaskInfo.some((task) => task.isPicked === true);

  useEffect(() => {
    if (isJobRunning) {
      setIsJobRunningAlertVisible(true);
    } else {
      setIsJobRunningAlertVisible(false);
    }
  }, [isJobRunning]);

  return (
    <div className={`${styles.jobCardContainer} ${className || ""}`}>
      <div className={styles.titleContainer}>
        <Heading size="medium">{title}</Heading>
      </div>
      <div className={styles.taskDetailsContainer}>
        {Object.entries(labelTranslations).map(([key, label]) => {
          const task = jobTaskInfo.find((task) => task[key] !== undefined);
          let displayValue = task ? task[key] : "N/A";

          if (typeof displayValue === "boolean") {
            displayValue = displayValue ? "Ja" : "Nei";
          } else if (
            typeof displayValue === "string" &&
            isIsoDate(displayValue)
          ) {
            displayValue = isoDatoTilNorskDato(displayValue);
          }

          return (
            <div key={key} className={styles.taskDetailItem}>
              <strong className={styles.taskDetailKey}>{label}:</strong>{" "}
              <span className={styles.taskDetailValue}>
                {displayValue}
                {key === "lastFailure" && displayValue !== "N/A" && (
                  <>
                    <br />
                    <Link
                      href={`https://logs.adeo.no/app/discover#/?_g=(time:(from:now-1d,to:now))&_a=(filters:!((query:(match_phrase:(application:'sokos-spk-mottak'))),(query:(match_phrase:(cluster:'${getEnvironment() === "production" ? "prod-fss" : "dev-fss"}'))),(query:(match_phrase:(level:'Error')))))`}
                      target="_blank"
                    >
                      Sjekk error logger
                    </Link>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
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
