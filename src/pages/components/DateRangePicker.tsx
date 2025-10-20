import React, { useEffect } from "react";
import { DatePicker, HStack, useRangeDatepicker } from "@navikt/ds-react";
import { tilNorskDato } from "../../util/datoUtil";
import styles from "./DateRangePicker.module.css";

const DateRangePicker: React.FC<{
  onDateChange: (fromDate: string | null, toDate: string | null) => void;
}> = ({ onDateChange }) => {
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    useRangeDatepicker({
      fromDate: new Date("2024-01-01"),
      toDate: new Date(),
      onRangeChange: () => {},
    });

  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to)
      onDateChange(
        tilNorskDato(selectedRange.from),
        tilNorskDato(selectedRange.to),
      );
  }, [selectedRange, onDateChange]);

  return (
    <DatePicker {...datepickerProps}>
      <HStack wrap gap="4" justify="center">
        <DatePicker.Input
          {...fromInputProps}
          label="Fra"
          size="small"
          className={styles.customDatePickerInput}
          onKeyDown={(e) => e.preventDefault()}
        />
        <DatePicker.Input
          {...toInputProps}
          label="Til"
          size="small"
          className={styles.customDatePickerInput}
          onKeyDown={(e) => e.preventDefault()}
        />
      </HStack>
    </DatePicker>
  );
};

export default DateRangePicker;
