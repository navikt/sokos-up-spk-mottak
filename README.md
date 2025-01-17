# Spk-mottak dashboard mikrofrontend

Dashboard for [sokos-spk-mottak](https://github.com/navikt/sokos-up-spk-mottak).

Denne mikrofrontend gjør det mulig å kunne rekjøre jobber som er satt i `sokos-spk-mottak`.

## Miljøer

- [Q1-miljø](https://utbetalingsportalen.intern.dev.nav.no/spk-mottak)
- [QX-miljø](https://utbetalingsportalen-qx.intern.nav.no/spk-mottak)
- [Prod-miljø](https://utbetalingsportalen.intern.nav.no/spk-mottak)

## Tilganger

### Hvordan få tilgang

For å få tilgang til skjermbildet:

- `0000-GA-SOKOS-MF-SPK-MOTTAK-ADMIN` (applikasjon i Utbetalingsportalen)

Tilgang fås ved ta kontakt med din identansvarlig. Det kan noen ganger være en strevsomt å få på plass tilganger
i identrutinene. Det er derfor viktig å benytte riktig begrep i kommunikasjon med dem.

### Beskrivelse av AD-grupper og hva de heter i identrutinen

| Navn Identrutinen                               | AD-gruppe                         | Beskrivelse                               |
| ----------------------------------------------- | --------------------------------- | ----------------------------------------- |
| Utbetalingsportalen - spk-mottak - Admintilgang | 0000-GA-SOKOS-MF-SPK-MOTTAK-ADMIN | Admin tilgang for å manuelt trigge jobber |

## Kom i gang

1. Installere [Node.js](https://nodejs.dev/en/)
2. Installer [pnpm](https://pnpm.io/)
3. Installere dependencies `pnpm install`
4. Start appen lokalt `pnpm run dev` (Mock Service Worker) eller mot backend lokalt `pnpm run dev:backend` [sokos-spk-mottak](https://github.com/navikt/sokos-spk-mottak)
5. Appen nås på <http://localhost:5173/oppdragsinfo>

NB! Anbefaler sette opp [ModHeader](https://modheader.com/) extension på Chrome for å sende med Obo-token i `Authorization` header når du kjører mot backend lokalt da den krever at token inneholder NavIdent.

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på Github.
Interne henvendelser kan sendes via Slack i kanalen #po-utbetaling.
