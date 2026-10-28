import { RateSource } from "@/types/serverInfo";

// Hand-maintained. Write times as ISO strings with +07:00 (Thailand time).
export function expService(): RateSource {
  return {
    base: {
      name: "Base",
      ratePercent: 100,
      DateFrom: null,
      DateTo: null,
      description: "Base Server Exp 100%",
    },
    events: [
      {
        name: "Exp Up 100%",
        ratePercent: 100,
        DateFrom: new Date("2026-05-29T12:00:00+07:00"),
        DateTo: new Date("2026-06-04T06:00:00+07:00"),
        description: "Exp Up หยุดยาวนี้พรี่มีคูณ 100%",
      },
      {
        name: "5th Anniversary Boost EXP +125%",
        ratePercent: 125,
        DateFrom: new Date("2026-10-28T06:00:00+07:00"),
        DateTo: new Date("2027-01-13T05:59:00+07:00"),
        description: "5th Anniversary Boost: EXP Bonus +125% (Additional)",
      },
    ],
  };
}
