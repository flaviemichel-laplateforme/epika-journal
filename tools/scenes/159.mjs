/**
 * The communes suggested in « Où ? » (#159), against Epika's production with its fake API: « saint-den » answers the
 * two Saint-Denis, « toul » Toulouse, Toulon and Toul. Fictitious events only.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** Opens a page and waits until React runs: the account corner of the header shows then. */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("link", { name: /^(Se connecter|Mon espace)$/ }).first().waitFor();
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
        name: "homonymes",
        caption: "Sur l'accueil, « saint-den » : les deux Saint-Denis, chacun avec son département et son code postal. La flèche du bas surligne le second, d'un fond turquoise et d'un contour navy.",
        alt: "L'accueil, avec « saint-den » tapé dans « Où ? » et, dessous, la liste : « Saint-Denis (974) La Réunion · 97400 » et « Saint-Denis (93) Seine-Saint-Denis · 93200 », le second surligné.",
        async play(page) {
            await open(page, "/");
            await type(page, "saint-den", 2);
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("ArrowDown");
            // The field with its label and the list, a little room above.
            await page.getByRole("combobox", { name: "Où ?" }).evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 120));
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "grandes-villes-d-abord",
        caption: "Sur la page de résultats, « toul » : Toulouse et Toulon avant Toul, les noms qui commencent par ce qui est tapé d'abord, les plus importants en tête. La liste passe au-dessus des barres collantes.",
        alt: "La page de résultats, avec « toul » tapé dans « Où ? » et la liste : « Toulouse (31) », « Toulon (83) », « Toul (54) », par-dessus la barre de tri.",
        async play(page, _context, format) {
            await open(page, "/recherche?ville=Toulon");
            if (format === "mobile") {
                // On a phone, the search card is folded to one line once something is searched.
                await page.getByRole("button", { name: /Modifier/ }).click();
            }
            await type(page, "toul", 3);
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "ville-choisie",
        caption: "Saint-Denis (93) choisi puis cherché : l'adresse garde la ville et son code postal (ville=Saint-Denis&cp=93200), et la recherche part du bon Saint-Denis.",
        alt: "La page de résultats « Événements à Saint-Denis », avec « Saint-Denis » dans le champ « Où ? ».",
        async play(page) {
            await open(page, "/recherche?ville=Saint-Denis&cp=93200");
            await page.mouse.move(0, 0);
        },
    },
];
