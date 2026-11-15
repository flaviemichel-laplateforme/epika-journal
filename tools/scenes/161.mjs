/**
 * Choosing dates (#161), against Epika's production with its fake API: the results around Toulon. The days are counted
 * from the day of the shot, in Paris, so that they are always to come. Fictitious events only.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** A day from today in Paris, « YYYY-MM-DD ». */
const day = (days) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(Date.now() + days * 24 * 3600 * 1000));

/** Opens a page and waits until React runs: the account corner of the header shows then. */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("link", { name: /^(Se connecter|Mon espace)$/ }).first().waitFor();
}

/** The filters: the column on a computer, the « Filtres » panel on a phone. */
async function filters(page, format) {
    if (format === "mobile") {
        await page.getByRole("button", { name: /^Filtres/ }).first().click();

        return page.getByRole("dialog", { name: "Filtres" });
    }

    return page.getByRole("complementary");
}

/** Ticks « Choisir des dates » and types the days; the group « Date » to the middle of the screen. */
async function chooseDays(page, format, start, end) {
    const scope = await filters(page, format);
    await scope.getByText("Choisir des dates", { exact: true }).click();
    await scope.getByLabel("Du", { exact: true }).fill(start);
    if (format !== "mobile") {
        await page.waitForURL(new RegExp(`du=${start}`));
    }
    await scope.getByLabel("Au", { exact: true }).fill(end);
    await scope.getByRole("group", { name: "Date" }).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await page.mouse.move(0, 0);

    return scope;
}

export const scenes = [
    {
        name: "champs",
        caption: "« Choisir des dates » ouvre deux champs, « Du » et « Au » : les champs date du navigateur, utilisables au clavier, avec le calendrier du téléphone. Un seul jour suffit aussi (« Dès le », « Jusqu'au »).",
        alt: "Le groupe « Date » des filtres, « Choisir des dates » coché, et les champs « Du » et « Au » remplis.",
        async play(page, _context, format) {
            await open(page, "/recherche?ville=Toulon");
            await chooseDays(page, format, day(7), day(14));
            await page.evaluate(() => document.activeElement?.blur());
        },
    },
    {
        name: "erreur",
        caption: "Une fin avant le début est dite sous « Au », avec les mots de l'API, et rien n'est envoyé : les résultats restent ceux de la dernière recherche valable.",
        alt: "Le champ « Au » encadré de rouge, avec le message « La date de fin est avant la date de début. ».",
        async play(page, _context, format) {
            await open(page, "/recherche?ville=Toulon");
            const scope = await chooseDays(page, format, day(14), day(7));
            await scope.getByText("La date de fin est avant la date de début.").waitFor();
            await page.evaluate(() => document.activeElement?.blur());
        },
    },
    {
        name: "pastille",
        caption: "Les dates choisies deviennent une pastille, « Du … au … », et une adresse qu'on peut partager. La retirer revient à « Toutes les dates ».",
        alt: "Les résultats autour de Toulon avec la pastille « Du … au … » au-dessus des cartes.",
        async play(page) {
            await open(page, `/recherche?ville=Toulon&du=${day(7)}&au=${day(14)}`);
            await page.getByRole("button", { name: /^Du .+ : retirer ce filtre$/ }).evaluate((element) => element.scrollIntoView({ block: "center" }));
            await page.mouse.move(0, 0);
        },
    },
];
