export default [
  {
    url: "/spk-mottak-api/api/v1/readParseFileAndValidateTransactions",
    method: "GET",
    response: () => {
      const message = "ReadAndParseFile av filer har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },

  { 
    url: "/spk-mottak-api/api/v1/sendUtbetalingTransaksjonToOppdragZ",
    method: "GET",
    response: () => {
      const message = "SendUtbetalingTransaksjonTilOppdrag har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },

  {
    url: "/spk-mottak-api/api/v1/sendTrekkTransaksjonToOppdragZ",
    method: "GET",
    response: () => {
      const message = "SendTrekkTransaksjonTilOppdrag har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },
  
  {
    url: "/spk-mottak-api/api/v1/avstemming",
    method: "GET",
    response: () => {
      const message = "GrensesnittAvstemming har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },
];
