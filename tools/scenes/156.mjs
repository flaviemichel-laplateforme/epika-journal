/**
 * The strip of days (#156), against Epika's production with its fake API: the results around Toulon. The days are those
 * of the shot, in Paris. Fictitious events only.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** A day from today in Paris, « YYYY-MM-DD ». */
const day = (days) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(Date.now() + days * 24 * 3600 * 1000));

/** Opens a page and waits until React runs: the account corner of the header shows then. */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("link", { name: /^(Se connecter|Mon espace)$/ }).first().waitFor();
}

/** The strip to the middle of the screen, nothing hovered. */
async function showStrip(page) {
    await page.getByRole("group", { name: "Un jour :" }).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "bande",
        caption: "Les 14 prochains jours au-dessus des résultats, sur une ligne qui défile sur le côté : un jour en un toucher, sans ouvrir les filtres. Le mois s'affiche au premier jour et à chaque 1er.",
        alt: "Les résultats autour de Toulon avec, au-dessus, la bande des jours : « dim. 15 nov. », « lun. 16 », « mar. 17 »…",
        async play(page) {
            await open(page, "/recherche?ville=Toulon");
            await showStrip(page);
        },
    },
    {
        name: "jour-choisi",
        caption: "Le jour touché est pressé, en navy plein, et devient une pastille « Le … ». Le filtre Date dit la même chose : jamais deux choix de date à la fois. Le toucher de nouveau revient à toutes les dates.",
        alt: "La bande avec le troisième jour pressé en navy, et la pastille « Le … » au-dessus.",
        async play(page, _context, format) {
            await open(page, `/recherche?ville=Toulon&du=${day(2)}&au=${day(2)}`);
            if (format === "desktop") {
                // The page from its top: the filter Date of the column, the chip and the strip together.
                await page.evaluate(() => window.scrollTo(0, 300));
                await page.mouse.move(0, 0);

                return;
            }
            await showStrip(page);
        },
    },
];
