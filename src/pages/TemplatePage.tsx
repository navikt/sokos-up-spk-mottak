import { useState } from "react";
import { Alert, Button, HStack, Heading, VStack } from "@navikt/ds-react";
import styles from "./TemplatePage.module.css";

const TemplatePage = () => {
  const [activeAlert, setActiveAlert] = useState<number | null>(null);

  const handleButtonClick = (buttonId: number) => {
    setActiveAlert(buttonId);

    setTimeout(() => {
      setActiveAlert(null);
    }, 3000);
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
            <Heading size="medium">Dette er en overskrift i medium</Heading>
            <Button variant="primary" onClick={() => handleButtonClick(1)}>
              Knapp en
            </Button>
            {activeAlert === 1 && (
              <Alert variant="success" className={styles.animatedAlert}>
                Knapp en trykket!
              </Alert>
            )}
          </HStack>

          <HStack gap="16">
            <Heading size="medium">Dette er en overskrift i medium</Heading>
            <Button variant="primary" onClick={() => handleButtonClick(2)}>
              Knapp to
            </Button>
            {activeAlert === 2 && (
              <Alert variant="success" className={styles.animatedAlert}>
                Knapp to trykket!
              </Alert>
            )}
          </HStack>

          <HStack gap="16">
            <Heading size="medium">Dette er en overskrift i medium</Heading>
            <Button variant="primary" onClick={() => handleButtonClick(3)}>
              Knapp tre
            </Button>
            {activeAlert === 3 && (
              <Alert variant="success" className={styles.animatedAlert}>
                Knapp tre trykket!
              </Alert>
            )}
          </HStack>
        </VStack>
      </div>
    </>
  );
};

export default TemplatePage;
