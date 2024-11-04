import React, { useState } from "react";
import { HStack, Heading, VStack } from "@navikt/ds-react";
import {
  useGetAvstemming,
  useGetReadParseFile,
  useGetSendTrekkTransaksjon,
  useGetSendUtbetalingTransaksjon,
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

  const { data: readParseFileData, error: readParseFileError } =
    useGetReadParseFile();
  const { data: utbetalingData, error: utbetalingError } =
    useGetSendUtbetalingTransaksjon();
  const { data: trekkData, error: trekkError } = useGetSendTrekkTransaksjon();
  const { data: avstemmingData, error: avstemmingError } = useGetAvstemming();

  const handleButtonClick = async (buttonId: number) => {
    setDisabled(true);

    let result;
    switch (buttonId) {
      case 1:
        result = {
          success: !readParseFileError,
          data: readParseFileData,
          error: readParseFileError,
        };
        break;
      case 2:
        result = {
          success: !utbetalingError,
          data: utbetalingData,
          error: utbetalingError,
        };
        break;
      case 3:
        result = { success: !trekkError, data: trekkData, error: trekkError };
        break;
      case 4:
        result = {
          success: !avstemmingError,
          data: avstemmingData,
          error: avstemmingError,
        };
        break;
      default:
        return;
    }

    if (result.success) {
      setActiveAlert({ id: buttonId, type: "success", message: result.data });
    } else {
      setActiveAlert({
        id: buttonId,
        type: "error",
        message: `Feil oppstod: ${result.error}`,
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
              onClick={handleButtonClick}
              disabled={disabled}
            />
            <ActionButton
              title="Send Utbetaling Transaksjon"
              buttonText="Knapp to"
              buttonId={2}
              activeAlert={activeAlert}
              onClick={handleButtonClick}
              disabled={disabled}
            />
            <ActionButton
              title="Send Trekk Transaksjon"
              buttonText="Knapp tre"
              buttonId={3}
              activeAlert={activeAlert}
              onClick={handleButtonClick}
              disabled={disabled}
            />
            <ActionButton
              title="Start Grensesnitt Avstemming"
              buttonText="Knapp fire"
              buttonId={4}
              activeAlert={activeAlert}
              onClick={handleButtonClick}
              disabled={disabled}
            />
          </VStack>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
