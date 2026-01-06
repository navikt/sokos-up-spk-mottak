import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, Link } from "@navikt/ds-react";
import type React from "react";
import type { JobTaskInfo } from "../../types/JobTaskInfo";
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

export const JobCard: React.FC<JobCardProps> = (props: JobCardProps) => {
	return (
		<div className={styles.jobCardContainer}>
			<div className={styles.titleContainer}>
				<Heading size="small">{props.title}</Heading>
			</div>
			<div className={styles.taskDetailsContainer}>
				<BodyShort size="small">
					<b>Planlagt kjøringstidspunkt:</b>{" "}
					{isoDatoTilNorskDato(props.jobTaskInfo?.executionTime)}
				</BodyShort>
				<BodyShort size="small">
					<b>Jobb Kjører:</b> {props.jobTaskInfo?.isPicked ? "Ja" : "Nei"}
				</BodyShort>
				<BodyShort size="small">
					<b>Siste vellykkede kjøringstidspunkt:</b>{" "}
					{isoDatoTilNorskDato(props.jobTaskInfo?.lastSuccess) || "N/A"}
				</BodyShort>
				<BodyShort size="small">
					<b>Sist kjørt av:</b> {props.jobTaskInfo?.ident}
				</BodyShort>
				<BodyShort size="small">
					<b>Siste mislykkede kjøringstidspunkt:</b>{" "}
					{isoDatoTilNorskDato(props.jobTaskInfo?.lastFailure) || "N/A"}
					{props.jobTaskInfo?.lastFailure && (
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
			{props.children}
			<div className={styles.buttonAndAlertContainer}>
				{props.attributes.isAlertVisible && (
					<div className={styles.alertWrapper}>
						<Alert
							size="small"
							variant={
								props.jobTaskInfo
									? props.attributes.alertType || "success"
									: "error"
							}
							className={styles.smallAlert}
						>
							{props.jobTaskInfo === undefined ||
							props.attributes.alertType === "error" ? (
								<span>Jobb kan ikke kjøres, sjekk logger for status</span>
							) : (
								<span>Jobb har startet, sjekk logger for status</span>
							)}
						</Alert>
					</div>
				)}
				{props.attributes.isJobRunning && (
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
						onClick={props.onStartClick}
						disabled={
							props.attributes.isButtonDisabled ||
							props.attributes.isLoading ||
							props.attributes.isJobRunning
						}
						loading={props.attributes.isLoading}
					>
						Start
					</Button>
				</div>
			</div>
		</div>
	);
};
