import jobtaskinfo from './jobtaskinfo.json'

export default [
  {
    url: "/spk-mottak-api/api/v1/readParseFileAndValidateTransactions",
    method: "POST",
    response: () => {
      const message = "ReadAndParseFile av filer har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },

  { 
    url: "/spk-mottak-api/api/v1/sendUtbetalingTransaksjonToOppdragZ",
    method: "POST",
    response: () => {
      const message = "SendUtbetalingTransaksjonTilOppdrag har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },

  {
    url: "/spk-mottak-api/api/v1/sendTrekkTransaksjonToOppdragZ",
    method: "POST",
    response: () => {
      const message = "SendTrekkTransaksjonTilOppdrag har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },
  
  {
    url: "/spk-mottak-api/api/v1/avstemming",
    method: "POST",
    response: () => {
      const message = "GrensesnittAvstemming har startet, sjekk logger for status";
      console.log(message);
      return message;
    },
  },

  {
    url: "/spk-mottak-api/api/v1/jobTaskInfo",
    method: "GET",
    response: () => jobtaskinfo
  },

];

