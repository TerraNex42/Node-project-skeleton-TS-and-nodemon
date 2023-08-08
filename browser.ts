import puppeteer from "puppeteer";

export async function goToSofia() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(
    "https://sofia-briefing.aviation-civile.gouv.fr/sofia/pages/homepage.html"
  );
  await page.waitForSelector("#id_but_preparation");

  await page.click("#id_but_preparation");
  await page.waitForSelector(
    "#inner-target > section:nth-child(3) > div > div > p:nth-child(3) > a"
  );
  await page.click(
    "#inner-target > section:nth-child(3) > div > div > p:nth-child(3) > a"
  );
  await page.waitForSelector(
    "#inner-target > section.wrapper-section.wrapper-section-padding-bottom > div > div > p.border-bottom.pb-3.disabled > a"
  );
  await page.click(
    "#inner-target > section.wrapper-section.wrapper-section-padding-bottom > div > div > p.border-bottom.pb-3.disabled > a"
  );
  await page.waitForSelector("#id_notam_type_checkbox > label:nth-child(4)");
  await page.click("#id_notam_type_checkbox > label:nth-child(4)");
  await page.click("#id_departureTime_notam_fir_val");
}