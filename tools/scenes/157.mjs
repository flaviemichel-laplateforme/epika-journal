/**
 * The organizer on the cards (#157), against Epika's production with its fake API: every card of the search says
 * « Par Association des concerts du Var ». The long name is played through « Mes favoris », whose cards the browser
 * asks for (page.route), as in Epika's e2e/favorites.spec.ts. Fictitious people and organizations only.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", roles: ["ROLE_USER"], emailVerified: true };

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

export const scenes = [
    {
        name: "cartes",
        caption: "Sous le titre de chaque carte, « Par » et le nom de la structure : en texte simple, pas en lien, pour que la carte garde un seul lien, son titre.",
        alt: "Les résultats de la recherche à Toulon : chaque carte dit « Par Association des concerts du Var » sous son titre.",
        async play(page) {
            await open(page, "/recherche?ville=Toulon");
            await page.getByRole("heading", { name: "Concert n° 1", exact: true }).evaluate((element) => element.closest("article").scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "nom-long",
        caption: "Un nom long n'est jamais coupé : il passe à la ligne, et laisse la place du cœur.",
        alt: "Une carte de « Mes favoris » dont la structure s'appelle « Association culturelle et sportive des habitants du quartier Saint-Jean-du-Var », écrit en entier sur plusieurs lignes.",
        async play(page) {
            const start = new Date(Date.now() + 30 * 3600 * 1000);
            const card = {
                slug: "evenement-1",
                title: "Concert n° 1",
                organizerName: "Association culturelle et sportive des habitants du quartier Saint-Jean-du-Var",
                city: "Toulon",
                start: start.toISOString(),
                end: new Date(start.getTime() + 2 * 3600 * 1000).toISOString(),
                otherDates: 0,
                cancelled: false,
                free: true,
                priceKnown: true,
                categoryLabel: "Musique",
                categorySlug: "musique",
            };
            await page.route("**/api/me", (route) => route.fulfill({ json: camille }));
            await page.route("**/api/me/favorites/slugs", (route) => route.fulfill({ json: { slugs: ["evenement-1"] } }));
            await page.route(/\/api\/me\/favorites(\?.*)?$/, (route) => route.fulfill({ json: { items: [card], totalItems: 1, page: 1, itemsPerPage: 20 } }));
            await open(page, "/mon-espace/favoris");
            await page.getByRole("heading", { level: 3, name: "Concert n° 1" }).waitFor();
            await rest(page);
        },
    },
    {
        name: "page-structure",
        caption: "Sur la page d'une structure, ses cartes ne répètent pas son nom : on sait déjà qui organise.",
        alt: "La page du club de plongée et ses événements à venir, dont les cartes n'ont pas de ligne « Par ».",
        async play(page) {
            await open(page, "/structures/club-de-plongee");
            await page.locator("article").first().evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
];
