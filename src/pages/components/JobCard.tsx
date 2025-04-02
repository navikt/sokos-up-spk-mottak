import React from "react";
import { Alert, BodyShort, Button, Heading } from "@navikt/ds-react";
import { JobTaskInfo } from "../../types/JobTaskInfo";
import { isoDatoTilNorskDato } from "../../util/datoUtil";
import styles from "./JobCard.module.css";

type JobCardAttributes = {
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
  onStartClick: () => void;
  attributes: JobCardAttributes;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  attributes,
  jobTaskInfo,
  children,
  onStartClick,
}) => {
  return (
    <div className={styles.jobCardContainer}>
      <div className={styles.titleContainer}>
        <Heading size="small">{title}</Heading>
      </div>
      <div className={styles.taskDetailsContainer}>
        <BodyShort size="small">
          <b>Planlagt kjøringstidspunkt:</b>{" "}
          {isoDatoTilNorskDato(jobTaskInfo?.executionTime)}
        </BodyShort>
        <BodyShort size="small">
          <b>Jobb Kjører:</b> {jobTaskInfo?.isPicked ? "Ja" : "Nei"}
        </BodyShort>
        <BodyShort size="small">
          <b>Siste vellykkede kjøringstidspunkt:</b>{" "}
          {isoDatoTilNorskDato(jobTaskInfo?.lastSuccess) || "N/A"}
        </BodyShort>
        <BodyShort size="small">
          <b>Sist kjørt av:</b> {jobTaskInfo?.ident}
        </BodyShort>
        <BodyShort size="small">
          <b>Siste mislykkede kjøringstidspunkt:</b>{" "}
          {isoDatoTilNorskDato(jobTaskInfo?.lastFailure) || "N/A"}
        </BodyShort>
      </div>
      {children}
      <div className={styles.buttonAndAlertContainer}>
        {attributes.isAlertVisible && (
          <div className={styles.alertWrapper}>
            <Alert
              size="small"
              variant={attributes.alertType || "success"}
              className={styles.smallAlert}
            >
              Jobb har startet, sjekk logger for status
            </Alert>
          </div>
        )}
        {attributes.isJobRunning && (
          <div className={styles.alertWrapper}>
            <Alert size="small" variant="info" className={styles.smallAlert}>
              Jobb holder på, sjekk logger for status
            </Alert>
          </div>
        )}
        <div className={styles.buttonWrapper}>
          <Button
            variant="primary"
            size="small"
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
