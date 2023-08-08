import puppeteer from "puppeteer";
import { goToSofia } from "./browser";
import sofia from "./connection";
import { includes } from "lodash";

//goToSofia()

async function run () {
    const sofialive = new sofia();
    await sofialive.connection();
    console.log(sofialive.JSESSION_ID);
    await sofialive.getNotamAirport(["LFDM","LFPG","LFPO","LFBP"]);
    const listReturned = sofialive.getListAirportsPresent();
    if(includes(listReturned,"LFBP")){
        const NOTAMs = sofialive.getlistNOTAMByAirport("LFBP")
        console.log(NOTAMs);
    }
    if (includes(listReturned, "LFDA")) {
        const NOTAMs = sofialive.getlistNOTAMByAirport("LFDA");
        console.log(NOTAMs);
    }
}
run()