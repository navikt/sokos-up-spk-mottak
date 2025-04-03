import React from "react";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, Link } from "@navikt/ds-react";
import { JobTaskInfo } from "../../types/JobTaskInfo";
import { isoDatoTilNorskDato } from "../../util/datoUtil";
import { getEnvironment } from "../../util/environment";
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
          {jobTaskInfo?.lastFailure && (
            <>
              <br />
              <Link
                href={`https://logs.adeo.no/app/discover#/?_g=(time:(from:now-1d,to:now))&_a=(filters:!((query:(match_phrase:(application:'sokos-spk-mottak'))),(query:(match_phrase:(cluster:'${getEnvironment() === "production" ? "prod-fss" : "dev-fss"}'))),(query:(match_phrase:(level:'Error')))))`}
                target="_blank"
              >
                Sjekk error logger
                <ExternalLinkIcon title="Lenke til logger" />
              </Link>
            </>
          )}
        </BodyShort>
      </div>
      {children}
      <div className={styles.buttonAndAlertContainer}>
        {attributes.isAlertVisible && (
          <div className={styles.alertWrapper}>
            <Alert
              size="small"
              variant={
                jobTaskInfo ? attributes.alertType || "success" : "error"
              }
              className={styles.smallAlert}
            >
              {(jobTaskInfo == null || attributes.alertType === "error") && (
                <span>Jobb kan ikke kjøres, sjekk logger for status</span>
              )}
              {jobTaskInfo && attributes.alertType !== "error" && (
                <span>Jobb har startet, sjekk logger for status</span>
              )}
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
