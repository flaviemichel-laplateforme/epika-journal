/**
 * The home page (#71), against Epika's fake API: 6 national picks (« Concert n° 101 » to 106, imported without a known
 * price) and the categories. The same selectors as Epika's e2e/home.spec.ts.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** The home page, once its header and its search fields are there. */
async function openHome(page) {
    await page.goto("/");
    await page.getByLabel("Quoi ?").waitFor();
}

/** Scrolls an element to the top of the screen, a little below the edge, and moves the mouse away (no hover left). */
async function bring(page, locator, above = 16) {
    await locator.evaluate((element, margin) => {
        window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - margin);
    }, above);
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "bandeau",
        caption: "L'ouverture : un titre, une phrase, et déjà les deux champs de la recherche. Sur un téléphone, le bandeau est compact pour que la suite se voie.",
        alt: "Le haut de la page d'accueil d'Epika : le titre « Trouvez votre prochaine sortie », les champs « Quoi ? » et « Où ? » et le bouton « Rechercher ».",
        async play(page) {
            await openHome(page);
        },
    },
    {
        name: "recherche",
        caption: "« Quoi ? » et « Où ? » forment un vrai formulaire : il ouvre la page de résultats même sans JavaScript.",
        alt: "Les champs « Quoi ? » et « Où ? » remplis avec « concert » et « Toulon ».",
        async play(page) {
            await openHome(page);
            await page.getByLabel("Quoi ?").fill("concert");
            await page.getByLabel("Où ?").fill("Toulon");
            await page.evaluate(() => document.activeElement?.blur());
        },
    },
    {
        name: "raccourcis",
        caption: "Quatre raccourcis (Aujourd'hui, Ce week-end, Gratuit, En famille) ouvrent les résultats déjà filtrés. Pas de panneau de filtres ici : les filtres demandent d'avoir les résultats sous les yeux.",
        alt: "La ligne de raccourcis de recherche : « Aujourd'hui », « Ce week-end », « Gratuit » et « En famille (6-11 ans) ».",
        async play(page) {
            await openHome(page);
            await bring(page, page.getByRole("list", { name: "Raccourcis de recherche" }), 260);
        },
    },
    {
        name: "categories",
        caption: "Une tuile par catégorie, lue dans l'API : une icône navy sur le pastel de la catégorie, et « Tout voir ». Ce sont de vrais liens.",
        alt: "La section « Explorer par catégorie » : une tuile par catégorie, avec son icône.",
        async play(page) {
            await openHome(page);
            await bring(page, page.getByRole("region", { name: "Explorer par catégorie" }));
        },
    },
    {
        name: "a-la-une",
        caption: "« À la une en ce moment » dit d'où viennent les événements (« Partout en France »), puis montre des cartes avec leur prix, leur prochaine date et le nombre d'autres dates. Sur téléphone, les cartes forment une rangée à faire glisser : la suivante dépasse sur le bord, et au clavier Tab atteint chaque carte.",
        alt: "La section « À la une en ce moment », avec la mention « Partout en France » et les cartes d'événements, à tarif « voir la fiche » et avec leurs autres dates.",
        async play(page) {
            await openHome(page);
            const featured = page.getByRole("region", { name: "À la une en ce moment" });
            await bring(page, featured);
            // On a phone the row is moved by one card; on a computer there is no row, the grid stays as it is.
            await featured.getByRole("list").evaluate((row) => {
                if (row.scrollWidth > row.clientWidth) {
                    row.scrollTo({ left: row.clientWidth * 0.8, behavior: "instant" });
                }
            });
        },
    },
    {
        name: "fiche",
        caption: "Un clic sur une carte ouvre la fiche de l'événement.",
        alt: "La fiche « Concert n° 101 », ouverte depuis la carte de l'accueil.",
        async play(page) {
            await openHome(page);
            await page.getByRole("region", { name: "À la une en ce moment" }).getByRole("link", { name: "Concert n° 101", exact: true }).click();
            await page.getByRole("heading", { level: 1, name: "Concert n° 101" }).waitFor();
        },
    },
];
