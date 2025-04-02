import React, { useEffect, useState } from "react";
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

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    if (fromDate && toDate)
      onDateChange(
        fromDate ? tilNorskDato(fromDate) : null,
        toDate ? tilNorskDato(toDate) : null,
      );
  }, [fromDate, toDate, onDateChange]);

  useEffect(() => {
    if (selectedRange?.from) {
      setFromDate(selectedRange.from);
    }
    if (selectedRange?.to) {
      setToDate(selectedRange.to);
    }
  }, [selectedRange]);

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
