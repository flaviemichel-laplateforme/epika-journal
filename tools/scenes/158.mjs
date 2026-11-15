/**
 * Several age bands (#158), against Epika's production with its fake API: the results around Toulon, with « 3-5 ans »
 * and « 6-11 ans » ticked. Fictitious events only.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const BOTH = "/recherche?ville=Toulon&age=3-5&age=6-11";

/** Opens a page and waits until React runs: the account corner of the header shows then. */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("link", { name: /^(Se connecter|Mon espace)$/ }).first().waitFor();
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

/** The group « Âge »: in the column on a computer, in the « Filtres » panel on a phone. */
async function ageGroup(page, format) {
    if (format === "mobile") {
        await page.getByRole("button", { name: /^Filtres/ }).first().click();

        return page.getByRole("dialog").getByRole("group", { name: "Âge" });
    }

    return page.getByRole("complementary").getByRole("group", { name: "Âge" });
}

export const scenes = [
    {
        name: "cases",
        caption: "Les âges deviennent des cases à cocher : une famille avec un enfant de 4 ans et un de 8 coche « 3-5 ans » et « 6-11 ans ». L'aide le dit : aucune case cochée, c'est tous les âges.",
        alt: "Le groupe « Âge » des filtres, avec l'aide « Une ou plusieurs tranches ; aucune case cochée : tous les âges. » et les cases « 3-5 ans » et « 6-11 ans » cochées.",
        async play(page, _context, format) {
            await open(page, BOTH);
            const group = await ageGroup(page, format);
            await group.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "pastilles",
        caption: "Une pastille par tranche au-dessus des résultats, chacune avec son bouton « retirer ce filtre ». Un événement s'affiche s'il convient à l'une des tranches.",
        alt: "Les résultats autour de Toulon avec deux pastilles, « 3-5 ans » et « 6-11 ans », au-dessus des cartes.",
        async play(page) {
            await open(page, BOTH);
            await page.getByRole("button", { name: "3-5 ans : retirer ce filtre" }).evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "une-retiree",
        caption: "Retirer « 3-5 ans » ne retire que cette tranche : « 6-11 ans » reste, dans la pastille comme dans l'adresse de la page.",
        alt: "Les résultats autour de Toulon avec une seule pastille, « 6-11 ans ».",
        async play(page) {
            await open(page, BOTH);
            await page.getByRole("button", { name: "3-5 ans : retirer ce filtre" }).click();
            await page.waitForURL(/age=6-11$/);
            await page.getByRole("button", { name: "6-11 ans : retirer ce filtre" }).evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
];
