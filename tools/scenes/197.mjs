/**
 * The communes suggested in « Où ? » once they come from Epika's own communes table (#197), against Epika's
 * production with its fake API. The fake API only knows « saint-den » and « toul »: the suggestions are answered here
 * (page.route, as for #59) with what the real API answered on 17/11/2026 from the official list of communes (public
 * data). Fictitious events only. Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** What GET /api/geo/communes answered on 17/11/2026, by question. */
const ANSWERS = {
    gre: [
        { city: "Grenoble", postcode: "38000", departmentCode: "38", departmentName: "Isère" },
        { city: "Grenade", postcode: "31330", departmentCode: "31", departmentName: "Haute-Garonne" },
        { city: "Gretz-Armainvilliers", postcode: "77220", departmentCode: "77", departmentName: "Seine-et-Marne" },
        { city: "Grenay", postcode: "62160", departmentCode: "62", departmentName: "Pas-de-Calais" },
        { city: "Grézieu-la-Varenne", postcode: "69290", departmentCode: "69", departmentName: "Rhône" },
        { city: "Grésy-sur-Aix", postcode: "73100", departmentCode: "73", departmentName: "Savoie" },
    ],
    "st eti": [
        { city: "Saint-Étienne", postcode: "42000", departmentCode: "42", departmentName: "Loire" },
        { city: "Saint-Étienne-du-Rouvray", postcode: "76800", departmentCode: "76", departmentName: "Seine-Maritime" },
        { city: "Saint-Étienne-de-Montluc", postcode: "44360", departmentCode: "44", departmentName: "Loire-Atlantique" },
        { city: "Saint-Étienne-au-Mont", postcode: "62360", departmentCode: "62", departmentName: "Pas-de-Calais" },
        { city: "Saint-Étienne-de-Tulmont", postcode: "82410", departmentCode: "82", departmentName: "Tarn-et-Garonne" },
        { city: "Saint-Étienne-lès-Remiremont", postcode: "88200", departmentCode: "88", departmentName: "Vosges" },
    ],
    toul: [
        { city: "Toulouse", postcode: "31000", departmentCode: "31", departmentName: "Haute-Garonne" },
        { city: "Toulon", postcode: "83000", departmentCode: "83", departmentName: "Var" },
        { city: "Toul", postcode: "54200", departmentCode: "54", departmentName: "Meurthe-et-Moselle" },
        { city: "Toulouges", postcode: "66350", departmentCode: "66", departmentName: "Pyrénées-Orientales" },
        { city: "Toulenne", postcode: "33210", departmentCode: "33", departmentName: "Gironde" },
        { city: "Toulaud", postcode: "07130", departmentCode: "07", departmentName: "Ardèche" },
    ],
};

/** The suggestions answered from ANSWERS; any other question finds nothing. */
async function answerSuggestions(context) {
    await context.route("**/api/geo/communes?*", (route) => {
        const question = new URL(route.request().url()).searchParams.get("q") ?? "";

        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: ANSWERS[question] ?? [] }) });
    });
}

/**
 * Opens a page and waits until React runs: the account corner of the header is there then, although not visible
 * under 640 px, where it gives way to the bottom navigation (#183).
 */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("banner").getByRole("link", { name: /^(Se connecter|Mon espace)$/, includeHidden: true }).first().waitFor({ state: "attached" });
}

/** Types in « Où ? » key by key, as a person does, and waits for the list. */
async function type(page, text, count) {
    const field = page.getByRole("combobox", { name: "Où ?" });
    await field.click();
    await field.fill("");
    await field.pressSequentially(text, { delay: 40 });
    await page.getByRole("option").nth(count - 1).waitFor();
}

export const scenes = [
    {
        name: "grenoble",
        caption: "Sur l'accueil, « gre » : Grenoble arrive en premier. Avant, le service extérieur ne proposait que des communes nommées « Grès ».",
        alt: "L'accueil, avec « gre » tapé dans « Où ? » et la liste : « Grenoble (38) Isère · 38000 », puis Grenade, Gretz-Armainvilliers, Grenay, Grézieu-la-Varenne et Grésy-sur-Aix.",
        async play(page, context) {
            await answerSuggestions(context);
            await open(page, "/");
            await type(page, "gre", 6);
            // The field with its label and the list, a little room above.
            await page.getByRole("combobox", { name: "Où ?" }).evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 120));
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "abreviation",
        caption: "Sur la page de résultats, « st eti » : « st » est compris comme « Saint », et Saint-Étienne arrive en tête, devant les autres Saint-Étienne, de la plus peuplée à la moins peuplée.",
        alt: "La page de résultats, avec « st eti » tapé dans « Où ? » et la liste : « Saint-Étienne (42) Loire · 42000 », puis Saint-Étienne-du-Rouvray, Saint-Étienne-de-Montluc et d'autres Saint-Étienne.",
        async play(page, context, format) {
            await answerSuggestions(context);
            await open(page, "/recherche?ville=Toulon");
            if (format === "mobile") {
                // On a phone, the search card is folded to one line once something is searched.
                await page.getByRole("button", { name: /Modifier/ }).click();
            }
            await type(page, "st eti", 6);
            // The field and its whole list above the bottom navigation of a phone.
            await page.getByRole("combobox", { name: "Où ?" }).evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 120));
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "six-villes",
        caption: "« toul » : six villes au lieu de trois, toujours Toulouse, Toulon et Toul d'abord. La liste vient maintenant de la base d'Epika, en quelques millisecondes.",
        alt: "L'accueil, avec « toul » tapé dans « Où ? » et la liste : « Toulouse (31) », « Toulon (83) », « Toul (54) », « Toulouges (66) », « Toulenne (33) » et « Toulaud (07) ».",
        async play(page, context) {
            await answerSuggestions(context);
            await open(page, "/");
            await type(page, "toul", 6);
            await page.getByRole("combobox", { name: "Où ?" }).evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 120));
            await page.mouse.move(0, 0);
        },
    },
];
