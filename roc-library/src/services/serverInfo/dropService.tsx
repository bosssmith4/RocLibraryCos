import { RateSource } from "@/types/serverInfo";

// Hand-maintained. Write times as ISO strings with +07:00 (Thailand time).
export function dropService(): RateSource {
  return {
    base: {
      name: "Base",
      ratePercent: 100,
      DateFrom: null,
      DateTo: null,
      description: "Base drop rate applied to the server",
    },
    events: [
      {
        name: "Drop 25%",
        ratePercent: 25,
        DateFrom: new Date("2026-05-29T12:00:00+07:00"),
        DateTo: new Date("2026-06-04T06:00:00+07:00"),
        description: "Drop Up หยุดยาวนี้พรี่มีคูณ 25%",
      },
      {
        name: "5th Anniversary Boost Drop +20%",
        ratePercent: 20,
        DateFrom: new Date("2026-10-28T06:00:00+07:00"),
        DateTo: new Date("2027-01-13T05:59:00+07:00"),
        description: "5th Anniversary Boost: Drop Rate +20% (Additional)",
      },
    ],
  };
}
