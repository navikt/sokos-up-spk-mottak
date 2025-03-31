import React, { useEffect, useState } from "react";
import { Alert, Button, Heading } from "@navikt/ds-react";
import { JobTaskInfo } from "../../types/JobTaskInfo";
import styles from "../Dashboard.module.css";

interface JobCardProps {
  title: string;
  activeAlert: {
    id: string;
    type: "success" | "error";
    message: string;
  } | null;
  onClick: (id: string) => void;
  disabled: boolean;
  jobTaskInfo?: JobTaskInfo;
  children?: React.ReactNode;
  className?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  activeAlert,
  onClick,
  jobTaskInfo,
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
    const savedTimestamp = localStorage.getItem(
      `${jobTaskInfo?.taskName}_timestamp`,
    );

    if (savedTimestamp) {
      const savedTime = parseInt(savedTimestamp);
      const currentTime = Date.now();

      if (currentTime - savedTime < 30000) {
        setIsLoading(true);
        setIsAlertVisible(true);
      } else {
        localStorage.removeItem(`${jobTaskInfo?.taskName}_timestamp`);
      }
    }
  }, [jobTaskInfo?.taskName]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const savedTimestamp = localStorage.getItem(
        `${jobTaskInfo?.taskName}_timestamp`,
      );
      if (savedTimestamp) {
        setIsAlertVisible(false);
        localStorage.removeItem(`${jobTaskInfo?.taskName}_timestamp`);
        setIsLoading(false);

        setDisabledButtons((prevState) => ({
          ...prevState,
          [jobTaskInfo?.taskName ?? ""]: false,
        }));
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [jobTaskInfo?.taskName]);

  const isJobRunning = jobTaskInfo?.isPicked;

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
        Oppgavenavn: {jobTaskInfo?.taskName}
        <br />
        Planlagt kjøringstidspunkt: {jobTaskInfo?.executionTime}
        <br />
        Jobb Kjører: {jobTaskInfo?.isPicked ? "Ja" : "Nei"}
        <br />
        Siste vellykkede kjøringstidspunkt:{jobTaskInfo?.lastSuccess}
        <br />
        Siste mislykkede kjøringstidspunkt:{jobTaskInfo?.lastFailure}
        <br />
        Sist kjørt av: {jobTaskInfo?.ident}
        <br />
        {/* {Object.entries(labelTranslations).map(([key, label]) => {
          const task = jobTaskInfo?.find((task) => task[key] !== undefined);
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
        })}*/}
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
              {activeAlert?.id === jobTaskInfo?.taskName
                ? activeAlert?.message
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
            onClick={() => handleStartClick(jobTaskInfo?.taskName ?? "")}
            disabled={
              isJobRunning ||
              disabledButtons[jobTaskInfo?.taskName ?? ""] ||
              isLoading
            }
            loading={isLoading}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
