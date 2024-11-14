import React from "react";
import { Alert, Button, Heading } from "@navikt/ds-react";
import styles from "../Dashboard.module.css";

interface JobCardProps {
  title: string;
  buttonText: string;
  buttonId: number;
  activeAlert: {
    id: number;
    type: "success" | "error";
    message: string;
  } | null;
  onClick: (id: number) => void;
  disabled: boolean;
  jobTaskInfo?: Record<string, string | boolean>[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
};

const labelTranslations: Record<string, string> = {
  taskName: "Oppgavenavn",
  executionTime: "Planlagt kjøringstid",
  isPicked: "Er valgt",
  lastSuccess: "Siste vellykkede kjøring",
  lastFailure: "Siste mislykkede kjøring",
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
                if (typeof value === "boolean") {
                  displayValue = value ? "✓" : "✗";
                } else if (typeof value === "string" && value.endsWith("Z")) {
                  displayValue = formatDate(value);
                } else {
                  displayValue = value || "N/A";
                }

                // Translate labels to Norwegian if available
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
            onClick={() => onClick(buttonId)}
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
