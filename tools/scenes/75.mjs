/**
 * The page of an organization (#75), against Epika's fake API: « club-de-plongee » complete (25 events to come, two pages
 * of 20), « association-exemple » imported with its name only, « atelier-de-la-terre » without an event to come.
 * The same selectors as Epika's e2e/organization-page.spec.ts.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** An organization page, once its name is written. */
async function open(page, address) {
    await page.goto(address);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
}

/** Scrolls an element near the top of the screen, and moves the mouse away (no hover left). */
async function bring(page, locator, above = 16) {
    await locator.evaluate((element, margin) => {
        window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - margin);
    }, above);
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "bandeau",
        caption: "Le bandeau d'une structure complète : son logo ou ses initiales, son nom, son type en toutes lettres et sa ville, ses liens en pastilles, sa description.",
        alt: "Le bandeau de « Club de plongée » : les initiales, le nom, « Association », la ville, les liens « Site web », « Facebook » et « Instagram ».",
        async play(page) {
            await open(page, "/structures/club-de-plongee");
        },
    },
    {
        name: "evenements",
        caption: "Les événements à venir de la structure, avec les mêmes cartes que la recherche : vingt par page, et de vrais liens entre les pages.",
        alt: "La section « Événements à venir (25) » avec ses cartes.",
        async play(page) {
            await open(page, "/structures/club-de-plongee");
            await bring(page, page.getByRole("region", { name: "Événements à venir (25)" }), 16);
        },
    },
    {
        name: "pagination",
        caption: "La page 2 reste une vraie page : son adresse, son titre et sa balise canonique sont les siens.",
        alt: "La deuxième page des événements de la structure, avec cinq cartes.",
        async play(page) {
            await open(page, "/structures/club-de-plongee?page=2");
            await bring(page, page.getByRole("region", { name: "Événements à venir (25)" }), 16);
        },
    },
    {
        name: "nom-seul",
        caption: "Une structure importée d'OpenAgenda n'a souvent que son nom : on n'affiche que ce qui est connu, sans trou ni « non renseigné ».",
        alt: "La page de « Association exemple » : des initiales, le nom et trois événements, sans lien ni description.",
        async play(page) {
            await open(page, "/structures/association-exemple");
        },
    },
    {
        name: "sans-evenement",
        caption: "Sans événement à venir : un message clair et un chemin vers la recherche.",
        alt: "Le message « Aucun événement à venir pour le moment » et le lien « Découvrir d'autres événements ».",
        async play(page) {
            await open(page, "/structures/atelier-de-la-terre");
            await page.getByRole("heading", { level: 2, name: "Aucun événement à venir pour le moment" }).waitFor();
            await bring(page, page.getByRole("heading", { level: 2, name: "Aucun événement à venir pour le moment" }), 220);
        },
    },
    {
        name: "introuvable",
        caption: "Une structure qui n'existe pas répond une vraie erreur 404. Une page d'événements au-delà de la dernière aussi.",
        alt: "La page « introuvable » d'Epika, affichée pour une structure qui n'existe pas.",
        async play(page) {
            await page.goto("/structures/n-existe-pas");
            await page.getByRole("heading", { level: 1 }).first().waitFor();
        },
    },
];
