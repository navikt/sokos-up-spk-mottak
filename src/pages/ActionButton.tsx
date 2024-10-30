import React from "react";
import { Alert, Button, HStack, Heading } from "@navikt/ds-react";
import styles from "./Dashboard.module.css";

interface ActionButtonProps {
  title: string;
  buttonText: string;
  buttonId: number;
  activeAlert: {
    id: number;
    type: "success" | "error";
    message: string;
  } | null;
  onClick: (id: number) => void;
  disabled: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  buttonText,
  buttonId,
  activeAlert,
  onClick,
  disabled,
}) => (
  <HStack gap="16">
    <Heading size="small">{title}</Heading>
    <Button
      variant="primary"
      size="small"
      onClick={() => onClick(buttonId)}
      disabled={disabled}
      className={styles.buttonMargin}
    >
      {buttonText}
    </Button>
    {activeAlert && activeAlert.id === buttonId && (
      <Alert
        size="small"
        variant={activeAlert.type}
        className={styles.animatedAlert}
      >
        {activeAlert.message}
      </Alert>
    )}
  </HStack>
);

export default ActionButton;
