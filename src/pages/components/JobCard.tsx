import { ExternalLinkIcon } from "@navikt/aksel-icons";
import {
	BodyShort,
	Button,
	Heading,
	InlineMessage,
	Link,
} from "@navikt/ds-react";
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

function buildGrafanaExploreUrl(params: {
	containerName: string;
	clusterName: string;
	detectedLevel: string;
}): string {
	const { containerName, clusterName, detectedLevel } = params;

	const ds =
		clusterName === "prod-gcp" ||
		clusterName === "prod-fss" ||
		clusterName === "prod"
			? "prod-gcp-loki"
			: "dev-gcp-loki";

	const base =
		"https://grafana.nav.cloud.nais.io/a/grafana-lokiexplore-app/explore/service_name";

	return (
		`${base}/${encodeURIComponent(containerName)}/logs?patterns=[]&from=now-24h&to=now` +
		`&var-filters=service_name%7C%3D%7C${encodeURIComponent(containerName)}` +
		`&var-ds=${encodeURIComponent(ds)}` +
		`&var-levels=detected_level%7C%3D%7C${encodeURIComponent(detectedLevel.toLowerCase())}`
	);
}

const JobCard: React.FC<JobCardProps> = (props: JobCardProps) => {
	return (
		<div className={styles["job-card-container"]}>
			<div className={styles["title-container"]}>
				<Heading size="small" level="2">
					{props.title}
				</Heading>
			</div>
			<div className={styles["task-details-container"]}>
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
								href={buildGrafanaExploreUrl({
									containerName: "sokos-spk-mottak",
									clusterName:
										getEnvironment() === "production" ? "prod-gcp" : "dev-gcp",
									detectedLevel: "error",
								})}
								target="_blank"
								aria-label="Sjekk error logger (åpnes i ny fane)"
							>
								Sjekk error logger
								<ExternalLinkIcon title="Lenke til logger" />
							</Link>
						</>
					)}
				</BodyShort>
			</div>
			{props.children}
			<div className={styles["button-and-alert-container"]}>
				{props.attributes.isAlertVisible && (
					<div className={styles["alert-wrapper"]}>
						<InlineMessage
							role="alert"
							size="small"
							status={
								props.jobTaskInfo
									? props.attributes.alertType || "success"
									: "error"
							}
							className={styles["small-alert"]}
						>
							{props.jobTaskInfo === undefined ||
							props.attributes.alertType === "error" ? (
								<span>Jobb kan ikke kjøres, sjekk logger for status</span>
							) : (
								<span>Jobb har startet, sjekk logger for status</span>
							)}
						</InlineMessage>
					</div>
				)}
				{props.attributes.isJobRunning && (
					<div className={styles["alert-wrapper"]}>
						<InlineMessage
							role="alert"
							size="small"
							status="info"
							className={styles["small-alert"]}
						>
							Jobb holder på, sjekk logger for status
						</InlineMessage>
					</div>
				)}
				<div className={styles["button-wrapper"]}>
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

export default JobCard;
