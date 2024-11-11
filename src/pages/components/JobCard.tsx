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
            <div key={index} className={styles.taskDetailsRow}>
              {Object.entries(task).map(([key, value], i) => {
                if (key === "taskId") return null;
                return (
                  <div key={i} className={styles.taskDetailItem}>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>{" "}
                    {typeof value === "boolean"
                      ? value
                        ? "True"
                        : "False"
                      : value || "N/A"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <div className={styles.buttonAndAlertContainer}>
        {activeAlert && activeAlert.id === buttonId && (
          <div className={styles.alertWrapper}>
            <Alert
              size="small"
              variant={activeAlert.type}
              className={styles.alert}
            >
              {activeAlert.message}
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
