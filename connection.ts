import axios, { AxiosRequestConfig } from "axios";
import { trim, filter, forEach } from "lodash";
import { format, add, formatRFC3339 } from "date-fns";

type ADNotam = {
  code: string;
  name: string;
  aerodromes_services: NOTAM[];
  aire_mouvement: NOTAM[];
  aire_trafic: NOTAM[];
  balisage: NOTAM[];
  aides_atter_instal_radionav_GNSS: NOTAM[];
  procedures: NOTAM[];
  organisation_espace_services_circulation: NOTAM[];
  meteorologie_equipements: NOTAM[];
  reglementation_espace_aerien: NOTAM[];
  avertissements_navigation: NOTAM[];
  obstacles: NOTAM[];
  autres_info: NOTAM[];
};

type FormatedNotam = {
  code: string;
  startValidity: string;
  endValidity: string;
  text: string;
};

type NOTAM = {
  pibSection: string;
  id: string;
  nof: string;
  series: string;
  number: number;
  year: number;
  type: string;
  qLine: {
    fir: string;
    code23: string;
    code45: string;
    traffic: string;
    purpose: string;
    scope: string;
    lower: number;
    upper: number;
  };
  coordinates: string;
  radius: number;
  itemA: string;
  startValidity: string;
  endValidity: string;
  startValidityFormat: string;
  endValidityFormat: string;
  itemE: string;
  multiLanguage: {
    itemE: string;
  };
  marker: string;
  valid: string;
};

export default class sofia {
  private _JSESSION_ID: string | undefined = undefined;
  private _code: number | undefined = undefined;
  private _notamlist: ADNotam[] = [];

  constructor() {}

  get JSESSION_ID(): string | undefined {
    return this._JSESSION_ID;
  }

  get code(): number | undefined {
    return this._code;
  }

  get notamlist() {
    return this._notamlist;
  }

  async connection() {
    try {
      const response = await axios.get(
        "https://sofia-briefing.aviation-civile.gouv.fr/sofia/pages/prepavol.html"
      );
      if (response.headers["set-cookie"]) {
        const cookie = response.headers["set-cookie"][0];
        this._JSESSION_ID = extractCookie(cookie);
        this._code = response.status;
      }
    } catch (e: any) {
      console.log(axios.isAxiosError(e));
      if (axios.isAxiosError(e)) {
        console.log(e.status);
        console.error(e.response);
      } else {
        console.log(e);
      }
    }
  }

  async getNotamAirport(oaciCode: string[]) {
    const options: AxiosRequestConfig = {
      method: "POST",
      url: "https://sofia-briefing.aviation-civile.gouv.fr/sofia",
      params: {
        ":operation": "postAeroPibRequest",
        traffic: "I",
        "aero[]": oaciCode,
        typeVol: "LA",
        departure_date: format(add(new Date(), { minutes: 2 }), "dd-MM-yyyy"),
        departure_time: format(add(new Date(), { minutes: 2 }), "HHmm"),
        lang: "fr",
        duration: "1200",
        valid_from: formatRFC3339(add(new Date(), { minutes: 2 })),
      },
      headers: {
        Cookie: this._JSESSION_ID,
      },
    };
    try {
      const request = await axios.request(options);
      if (request.data["status.message"]) {
        const serializeData = JSON.parse(request.data["status.message"]);
        serializeData.listnotams.AD.forEach((AD: ADNotam) => {
          this._notamlist.push(AD);
        });
      }
    } catch (e: any) {
      console.log(axios.isAxiosError(e));
      if (axios.isAxiosError(e)) {
        console.log(e.status);
        console.error(e.response);
      } else {
        console.log(e);
      }
    }
  }
  getListAirportsPresent(): string[] {
    let listAirport: string[] = [];
    this._notamlist.forEach((element) => {
      listAirport.push(element.code);
    });
    return listAirport;
  }

  getlistNOTAMByAirport(airport: string) {
    let formatedNotamlist: FormatedNotam[] = [];
    const listNotam = filter(this._notamlist, (o) => {
      return o.code == airport;
    });
    forEach(listNotam[0], function (value) {
      if (typeof value != "string") {
        forEach(value, function (el) {
          console.log(el);
          formatedNotamlist.push({
            code: el.itemA,
            startValidity: el.startValidity,
            endValidity: el.endValidity,
            text: el.multiLanguage.itemE,
          });
        });
      }
    });
    return formatedNotamlist;
  }
}

function extractCookie(str: string): string {
  let result;
  result = trim(str, ";Path=/;HttpOnly");
  return result;
}
