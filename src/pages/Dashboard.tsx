import { useState } from "react";
import { Alert, Button, HStack, Heading, VStack } from "@navikt/ds-react";
import styles from "./Dashboard.module.css";

const fetchReadParseFile = async () => {
  try {
    const response = await fetch(
      "/spk-mottak-api/api/v1/readParseFileAndValidateTransactions",
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error };
  }
};

const fetchSendUtbetalingTransaksjon = async () => {
  try {
    const response = await fetch(
      "/spk-mottak-api/api/v1/sendUtbetalingTransaksjonToOppdragZ",
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error };
  }
};

const fetchSendTrekkTransaksjon = async () => {
  try {
    const response = await fetch(
      "/spk-mottak-api/api/v1/sendTrekkTransaksjonToOppdragZ",
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error };
  }
};

const fetchAvstemming = async () => {
  try {
    const response = await fetch("/spk-mottak-api/api/v1/avstemming");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error };
  }
};

const TemplatePage = () => {
  const [activeAlert, setActiveAlert] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [disabled, setDisabled] = useState(false);

  const handleButtonClick = async (buttonId: number) => {
    setDisabled(true);

    let result;
    switch (buttonId) {
      case 1:
        result = await fetchReadParseFile();
        break;
      case 2:
        result = await fetchSendUtbetalingTransaksjon();
        break;
      case 3:
        result = await fetchSendTrekkTransaksjon();
        break;
      case 4:
        result = await fetchAvstemming();
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

    setTimeout(() => {
      setActiveAlert(null);
    }, 10000);

    setTimeout(() => {
      setDisabled(false);
    }, 10000);
  };

  return (
    <>
      <div className={styles.template__header}>
        <VStack align="center">
          <HStack margin="6" paddingBlock="6" gap="24">
            <Heading spacing size="large">
              SPK Mottak Dashboard
            </Heading>
          </HStack>
        </VStack>

        <VStack gap="16" align="center">
          <HStack gap="16">
            <Heading size="medium">Start Read and Parse File</Heading>
            <Button
              variant="primary"
              onClick={() => handleButtonClick(1)}
              disabled={disabled}
            >
              Knapp en
            </Button>
            {activeAlert && activeAlert.id === 1 && (
              <Alert
                variant={activeAlert.type}
                className={styles.animatedAlert}
              >
                {activeAlert.message}
              </Alert>
            )}
          </HStack>

          <HStack gap="16">
            <Heading size="medium">Send Utbetaling Transaksjon</Heading>
            <Button
              variant="primary"
              onClick={() => handleButtonClick(2)}
              disabled={disabled}
            >
              Knapp to
            </Button>
            {activeAlert && activeAlert.id === 2 && (
              <Alert
                variant={activeAlert.type}
                className={styles.animatedAlert}
              >
                {activeAlert.message}
              </Alert>
            )}
          </HStack>

          <HStack gap="16">
            <Heading size="medium">Send Trekk Transaksjon</Heading>
            <Button
              variant="primary"
              onClick={() => handleButtonClick(3)}
              disabled={disabled}
            >
              Knapp tre
            </Button>
            {activeAlert && activeAlert.id === 3 && (
              <Alert
                variant={activeAlert.type}
                className={styles.animatedAlert}
              >
                {activeAlert.message}
              </Alert>
            )}
          </HStack>

          <HStack gap="16">
            <Heading size="medium">Start Grensesnitt Avstemming</Heading>
            <Button
              variant="primary"
              onClick={() => handleButtonClick(4)}
              disabled={disabled}
            >
              Knapp fire
            </Button>
            {activeAlert && activeAlert.id === 4 && (
              <Alert
                variant={activeAlert.type}
                className={styles.animatedAlert}
              >
                {activeAlert.message}
              </Alert>
            )}
          </HStack>
        </VStack>
      </div>
    </>
  );
};

export default TemplatePage;
