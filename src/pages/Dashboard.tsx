import React, { useState } from "react";
import { HStack, Heading, VStack } from "@navikt/ds-react";
import {
  postAvstemming,
  postReadAndParseFile,
  postSendTrekkTransaksjon,
  postSendUtbetalingTransaksjon,
} from "../api/apiService";
import ActionButton from "./ActionButton";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [activeAlert] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [disabled] = useState(false);

  return (
    <>
      <div className={styles.dashboard__header}>
        <VStack align="center">
          <HStack margin="6" paddingBlock="6" gap="24">
            <Heading spacing size="large">
              SPK Mottak Dashboard
            </Heading>
          </HStack>
        </VStack>

        <div className={styles.actionButtonContainer}>
          <VStack gap="16" align="stretch">
            <ActionButton
              title="Start Read and Parse File"
              buttonText="Knapp en"
              buttonId={1}
              activeAlert={activeAlert}
              onClick={postReadAndParseFile}
              disabled={disabled}
            />
            <ActionButton
              title="Send Utbetaling Transaksjon"
              buttonText="Knapp to"
              buttonId={2}
              activeAlert={activeAlert}
              onClick={postSendUtbetalingTransaksjon}
              disabled={disabled}
            />
            <ActionButton
              title="Send Trekk Transaksjon"
              buttonText="Knapp tre"
              buttonId={3}
              activeAlert={activeAlert}
              onClick={postSendTrekkTransaksjon}
              disabled={disabled}
            />
            <ActionButton
              title="Start Grensesnitt Avstemming"
              buttonText="Knapp fire"
              buttonId={4}
              activeAlert={activeAlert}
              onClick={postAvstemming}
              disabled={disabled}
            />
          </VStack>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
