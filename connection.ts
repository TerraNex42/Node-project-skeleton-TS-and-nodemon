import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";
import { trimEnd, trim } from "lodash";
import { format, add, formatRFC3339 } from "date-fns";

type ADNotam = {
  code: string;
  name: string;
  aerodromes_services: [];
  aire_mouvement: [];
  aire_trafic: [];
  balisage: [];
  aides_atter_instal_radionav_GNSS: [];
  procedures: [];
  organisation_espace_services_circulation: [];
  meteorologie_equipements: [];
  reglementation_espace_aerien: [];
  avertissements_navigation: [];
  obstacles: [];
  autres_info: [];
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

  async getNotamAirport(oaciCode: string) {
    const options: AxiosRequestConfig = {
      method: "POST",
      url: "https://sofia-briefing.aviation-civile.gouv.fr/sofia",
      params: {
        ":operation": "postAeroPibRequest",
        traffic: "I",
        "aero[]": ["LFPG", 'LFDA'],
        typeVol: "LA",
        departure_date: format(add(new Date(), { minutes: 2 }), "dd-MM-yyyy"),
        departure_time: format(add(new Date(), { minutes: 2 }), "HHmm"),
        lang: "fr",
        duration: "1200",
        valid_from: formatRFC3339(add(new Date(), { minutes: 2 })),
      },
      headers: {
        "Cookie": this._JSESSION_ID
      }
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

  //get airport present in the object
  //return a array of notam per airport present

}

function extractCookie(str: string): string {
  let result;
  result = trim(str, ";Path=/;HttpOnly");
  return result;
}
