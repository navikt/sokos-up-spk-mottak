import React from "react";
import { Alert, Button, Heading } from "@navikt/ds-react";
import { JobTaskInfo } from "../../types/JobTaskInfo";
import styles from "../Dashboard.module.css";

type JobCardAttributes = {
  alertMessage: string | null;
  alertType: "success" | "error" | "info" | null;
  isAlertVisible: boolean;
  isJobRunning: boolean;
  isLoading: boolean;
  isButtonDisabled: boolean;
};

interface JobCardProps {
  title: string;
  jobTaskInfo?: JobTaskInfo;
  children?: React.ReactNode;
  className?: string;
  onStartClick: () => void;
  attributes: JobCardAttributes;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  attributes,
  jobTaskInfo,
  children,
  className,
  onStartClick,
}) => {
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
      </div>
      {children}
      <div className={styles.buttonAndAlertContainer}>
        {attributes.isAlertVisible && (
          <div className={styles.alertWrapper}>
            <Alert
              size="small"
              variant={attributes.alertType || "success"}
              className={styles.alert}
            >
              {attributes.alertMessage ||
                "Jobb har startet, sjekk logger for status"}
            </Alert>
          </div>
        )}
        {attributes.isJobRunning && (
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
            onClick={onStartClick}
            disabled={
              attributes.isButtonDisabled ||
              attributes.isLoading ||
              attributes.isJobRunning
            }
            loading={attributes.isLoading}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
