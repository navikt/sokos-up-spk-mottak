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
  const [activeAlert, setActiveAlert] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [disabled, setDisabled] = useState(false);

  const handleButtonClick = async (buttonId, action) => {
    setDisabled(true);
    try {
      const data = await action();
      setActiveAlert({ id: buttonId, type: "success", message: data });
    } catch (error) {
      setActiveAlert({
        id: buttonId,
        type: "error",
        message: `Feil oppstod: ${error.message || error}`,
      });
    }
    setTimeout(() => setActiveAlert(null), 10000);
    setTimeout(() => setDisabled(false), 10000);
  };

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
              onClick={() => handleButtonClick(1, postReadAndParseFile)}
              disabled={disabled}
            />
            <ActionButton
              title="Send Utbetaling Transaksjon"
              buttonText="Knapp to"
              buttonId={2}
              activeAlert={activeAlert}
              onClick={() =>
                handleButtonClick(2, postSendUtbetalingTransaksjon)
              }
              disabled={disabled}
            />
            <ActionButton
              title="Send Trekk Transaksjon"
              buttonText="Knapp tre"
              buttonId={3}
              activeAlert={activeAlert}
              onClick={() => handleButtonClick(3, postSendTrekkTransaksjon)}
              disabled={disabled}
            />
            <ActionButton
              title="Start Grensesnitt Avstemming"
              buttonText="Knapp fire"
              buttonId={4}
              activeAlert={activeAlert}
              onClick={() => handleButtonClick(4, postAvstemming)}
              disabled={disabled}
            />
          </VStack>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
