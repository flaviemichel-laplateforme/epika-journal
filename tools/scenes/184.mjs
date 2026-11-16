/**
 * The next favourites on the home page (#184), against Epika's production with its fake API; the session and the
 * favourites routes (called by the browser) are played by page.route, as in Epika's e2e/session.ts. Fictitious person
 * only (Camille Martin, camille.martin@example.com).
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", roles: ["ROLE_USER"], emailVerified: true };
const HOUR = 3600 * 1000;

/** A card of the favourites, in the shape of the API (docs/search.md). */
function card(number, inHours) {
    const start = new Date(Date.now() + inHours * HOUR);

    return {
        slug: `evenement-${number}`,
        title: `Concert n° ${number}`,
        organizerName: "Association des concerts du Var",
        city: "Toulon",
        start: start.toISOString(),
        end: new Date(start.getTime() + 2 * HOUR).toISOString(),
        otherDates: 0,
        cancelled: false,
        free: true,
        priceKnown: true,
        subcategoryLabel: "Concert",
        subcategorySlug: "concert",
        categoryLabel: "Musique",
        categorySlug: "musique",
    };
}

/** Logged in as Camille, with five favourites to come: the API answers the first `itemsPerPage`, as the real one. */
async function logIn(page) {
    const cards = [card(4, 30), card(9, 52), card(14, 75), card(21, 110), card(30, 160)];
    await page.route("**/api/me", (route) => route.fulfill({ json: camille }));
    await page.route("**/api/me/favorites/slugs", (route) => route.fulfill({ json: { slugs: cards.map((item) => item.slug) } }));
    await page.route(/\/api\/me\/favorites(\?.*)?$/, (route) => {
        const perPage = Number(new URL(route.request().url()).searchParams.get("itemsPerPage") ?? 20);

        return route.fulfill({ json: { items: cards.slice(0, perPage), totalItems: cards.length, page: 1, itemsPerPage: perPage } });
    });
}

/** Opens a page and waits until React runs: the account corner of the header shows then. */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("link", { name: /^(Se connecter|Mon espace)$/ }).first().waitFor();
}

/** A heading at the top of the screen, a little room above, nothing hovered. */
async function showFrom(page, heading) {
    await page.getByRole("heading", { level: 2, name: heading }).evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 24));
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "prochains-favoris",
        caption: "Camille est connectée : sous « À la une », ses trois prochains favoris, avec les cartes et les cœurs habituels, et « Voir tous mes favoris (5) ». Le bloc arrive en bas de page : rien de ce qui est déjà affiché ne bouge.",
        alt: "Le bas de l'accueil : « À la une en ce moment », puis « Vos prochains favoris » avec trois cartes de concerts aux cœurs pleins, et le lien « Voir tous mes favoris (5) ».",
        async play(page) {
            await logIn(page);
            await open(page, "/");
            await page.getByRole("heading", { level: 2, name: "Vos prochains favoris" }).waitFor();
            await showFrom(page, "Vos prochains favoris");
        },
    },
    {
        name: "visiteur",
        caption: "Un visiteur : l'accueil s'arrête à « À la une ». Pas de bloc vide, pas d'espace réservé, et pas une ligne de JavaScript du bloc téléchargée.",
        alt: "Le bas de l'accueil d'un visiteur : « À la une en ce moment » avec ses cartes, puis le pied de page.",
        async play(page) {
            await open(page, "/");
            // The very end of the page: « À la une », then the footer, nothing in between.
            await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
            await page.mouse.move(0, 0);
        },
    },
];
