export interface PrayerApiResponse {
  code: number;
  status: string;
  data: {
    times: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
          ar: string;
        };
        month: {
          number: number;
          en: string;
          ar: string;
          days: number;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
        holidays: unknown[];
        adjustedHolidays: unknown[];
        method: string;
      };
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
      };
    };
    qibla: {
      direction: {
        degrees: number;
        from: string;
        clockwise: boolean;
      };
      distance: {
        value: number;
        unit: string;
      };
    };
    prohibited_times: {
      sunrise: {
        start: string;
        end: string;
      };
      noon: {
        start: string;
        end: string;
      };
      sunset: {
        start: string;
        end: string;
      };
    };
    timezone: {
      name: string;
      utc_offset: string;
      abbreviation: string;
    };
  };
}
