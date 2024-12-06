import React, { useEffect } from "react";
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
}

const labelTranslations: Record<string, string> = {
  taskName: "Oppgavenavn",
  executionTime: "Planlagt kjøringstidspunkt",
  isPicked: "Jobb Kjører",
  lastSuccess: "Siste vellykkede kjøringstidspunkt",
  lastFailure: "Siste mislykkede kjøringstidspunkt",
};

const JobCard: React.FC<JobCardProps> = ({
  title,
  buttonText,
  buttonId,
  activeAlert,
  onClick,
  disabled,
  jobTaskInfo,
}) => {
  const isButtonDisabled = jobTaskInfo?.some((task) =>
    Object.values(task).some(
      (value) => typeof value === "boolean" && value === true,
    ),
  );
  const buttonDisabled = disabled || isButtonDisabled;

  const handleStartClick = async (id: string) => {
    await onClick(id);

    const currentTime = Date.now();
    localStorage.setItem(`${id}_timestamp`, currentTime.toString());

    setTimeout(() => {
      localStorage.removeItem(`${id}_timestamp`);
    }, 15000);
  };

  useEffect(() => {
    const savedTimestamp = localStorage.getItem(`${buttonId}_timestamp`);

    if (savedTimestamp) {
      const savedTime = parseInt(savedTimestamp);
      const currentTime = Date.now();

      if (currentTime - savedTime < 15000) {
        setTimeout(() => {
          localStorage.removeItem(`${buttonId}_timestamp`);
        }, 15000);
      } else {
        localStorage.removeItem(`${buttonId}_timestamp`);
      }
    }
  }, [buttonId, jobTaskInfo]);

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

      <div className={styles.buttonAndAlertContainer}>
        {((activeAlert && activeAlert.id === buttonId) || buttonDisabled) && (
          <div className={styles.alertWrapper}>
            <Alert
              size="small"
              variant={activeAlert?.type || "success"}
              className={styles.alert}
            >
              {activeAlert?.id === buttonId
                ? activeAlert.message
                : "Jobb holder på, sjekk logger for status"}
            </Alert>
          </div>
        )}
        <div className={styles.buttonWrapper}>
          <Button
            variant="primary"
            size="medium"
            onClick={() => handleStartClick(buttonId)}
            disabled={buttonDisabled}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
