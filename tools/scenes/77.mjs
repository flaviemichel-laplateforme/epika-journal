/**
 * The favourites (#77): the hearts, the invitation of a visitor and « Mes favoris », against Epika's production with
 * its fake API; the favourites routes (called by the browser) are played by page.route with the kept slugs in memory,
 * as in Epika's e2e/favorites.spec.ts. Fictitious person only (Camille Martin, camille.martin@example.com).
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", roles: ["ROLE_USER"], emailVerified: true };
const SEARCH = "/recherche?ville=Toulon";
const HOUR = 3600 * 1000;

/** A card of « Mes favoris », in the shape of the API (docs/search.md). */
function card(number, inHours, cancelled = false) {
    const start = new Date(Date.now() + inHours * HOUR);

    return {
        slug: `evenement-${number}`,
        title: `Concert n° ${number}`,
        city: "Toulon",
        start: start.toISOString(),
        end: new Date(start.getTime() + 2 * HOUR).toISOString(),
        otherDates: 0,
        cancelled,
        free: true,
        priceKnown: true,
        categoryLabel: "Musique",
        categorySlug: "musique",
    };
}

/** Logged in as Camille, keeping these events: the favourites API played in memory, as the real one answers. */
async function logIn(page, kept = [], cards = []) {
    const slugs = new Set(kept);
    await page.route("**/api/me", (route) => route.fulfill({ json: camille }));
    await page.route("**/api/me/favorites/slugs", (route) => route.fulfill({ json: { slugs: [...slugs] } }));
    await page.route(/\/api\/me\/favorites(\?.*)?$/, (route) => route.fulfill({ json: { items: cards, totalItems: cards.length, page: 1, itemsPerPage: 20 } }));
    await page.route(/\/api\/me\/favorites\/(?!slugs$)[^/?]+$/, (route) => {
        const slug = decodeURIComponent(route.request().url().split("/").pop());
        route.request().method() === "PUT" ? slugs.add(slug) : slugs.delete(slug);

        return route.fulfill({ status: 204 });
    });
}

/** Opens a page and waits until the hearts answer: the account corner of the header shows once React runs. */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("link", { name: /^(Se connecter|Mon espace)$/ }).first().waitFor();
}

/** Brings the first result card to the middle of the screen. */
async function showFirstCard(page) {
    await page.getByRole("heading", { name: "Concert n° 1", exact: true }).evaluate((element) => element.closest("article").scrollIntoView({ block: "center" }));
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "coeurs",
        caption: "Un cœur sur chaque carte : rond blanc, icône navy, comme « Retour » et « Partager », lisible sur n'importe quelle photo. Plein, l'événement est gardé.",
        alt: "Les résultats de la recherche à Toulon, chaque carte avec son cœur en haut à droite ; les cœurs des concerts n° 2 et 3 sont pleins.",
        async play(page) {
            await logIn(page, ["evenement-2", "evenement-3"]);
            await open(page, SEARCH);
            await page.getByRole("button", { name: "Ajouter « Concert n° 2 » aux favoris", pressed: true }).waitFor();
            await showFirstCard(page);
            await rest(page);
        },
    },
    {
        name: "ajoute",
        caption: "Un toucher suffit : le cœur se remplit tout de suite, sans recharger la page, et « Ajouté à vos favoris » est affiché et lu par le lecteur d'écran. Si l'API refuse, le cœur revient et le message dit pourquoi.",
        alt: "Le cœur du concert n° 1 rempli, avec la bulle « Ajouté à vos favoris. » juste en dessous.",
        async play(page) {
            await logIn(page);
            await open(page, SEARCH);
            await showFirstCard(page);
            await page.getByRole("button", { name: "Ajouter « Concert n° 1 » aux favoris" }).click();
            await page.getByRole("status").filter({ hasText: "Ajouté à vos favoris." }).waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "invitation",
        caption: "Sans compte, le cœur invite à se connecter, sans quitter la page. « Se connecter » y ramène ensuite ; Échap ferme la fenêtre et rend le focus au cœur.",
        alt: "La fenêtre « Gardez vos événements préférés » ouverte au-dessus de la recherche, avec « Se connecter » et « Créer un compte ».",
        async play(page) {
            await open(page, SEARCH);
            await showFirstCard(page);
            await page.getByRole("button", { name: "Ajouter « Concert n° 1 » aux favoris" }).click();
            await page.getByRole("dialog", { name: "Gardez vos événements préférés" }).waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "fiche",
        caption: "Sur la fiche, le cœur rejoint « Retour » et « Partager » en haut de la photo. Son nom ne change jamais, « Ajouter « Plongée sous-marine » aux favoris » : c'est aria-pressed qui dit s'il est plein.",
        alt: "La fiche « Plongée sous-marine » avec, en haut de l'image, « Retour » à gauche, puis le cœur plein et « Partager » à droite.",
        async play(page) {
            // No real photo: the placeholder of Epika stands in for the picture of OpenAgenda.
            await page.route("https://img.openagenda.com/**", (route) => route.fulfill({ status: 404 }));
            await logIn(page, ["plongee"]);
            await open(page, "/evenements/plongee");
            await page.getByRole("button", { name: "Ajouter « Plongée sous-marine » aux favoris", pressed: true }).waitFor();
            await rest(page);
        },
    },
    {
        name: "mes-favoris",
        caption: "« Mes favoris », depuis « Mon espace » : les événements à venir gardés, avec les cartes de la recherche. Un événement annulé depuis garde son bandeau, et son cœur pour pouvoir le retirer.",
        alt: "La page « Mes favoris » : « À venir (3) », trois cartes aux cœurs pleins, dont le concert n° 4 marqué « Annulé ».",
        async play(page) {
            await logIn(page, ["evenement-3", "evenement-4", "evenement-7"], [card(3, 20), card(4, 26, true), card(7, 50)]);
            await open(page, "/mon-espace/favoris");
            await page.getByRole("heading", { level: 2, name: "À venir (3)" }).waitFor();
            await page.getByRole("button", { name: "Ajouter « Concert n° 4 » aux favoris", pressed: true }).waitFor();
            await rest(page);
        },
    },
];
