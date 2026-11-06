/**
 * The page of an event (#74), against Epika's fake API: « plongee » imported from OpenAgenda (12 dates, a place on a
 * map, its source), « atelier-poterie » created on Epika (booking by contact), « masque » answering 404 as a hidden event
 * does. The same selectors as Epika's e2e/event-page.spec.ts.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** The event page, once its title is written. */
async function open(page, slug) {
    await page.goto(`/evenements/${slug}`);
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
        name: "entete",
        caption: "L'en-tête : l'image, les pastilles (prix, sous-catégorie, âge), le titre avec la date, l'organisateur et son lien « Voir le profil ». Sur téléphone, la barre de réservation reste en bas de l'écran.",
        alt: "Le haut de la fiche « Plongée » : les boutons de retour et de partage sur l'image, le titre, l'organisateur et le lieu.",
        async play(page) {
            await open(page, "plongee");
        },
    },
    {
        name: "dates",
        caption: "Trois dates d'abord ; « Voir les 9 autres dates » déplie celles qui sont déjà dans la page, puis « Voir plus de dates » charge la suite, par pages.",
        alt: "La section « Les dates (12) » dépliée, avec cinq dates et les boutons « Voir plus de dates » et « Réduire la liste ».",
        async play(page) {
            await open(page, "plongee");
            const dates = page.getByRole("region", { name: "Les dates (12)" });
            await dates.getByRole("button", { name: "Voir les 9 autres dates" }).click();
            await bring(page, dates, 16);
        },
    },
    {
        name: "lieu",
        caption: "Le lieu, avec une carte IGN qui ne se charge qu'en arrivant à cet endroit de la page : aucune tuile n'est demandée avant.",
        alt: "La section « Lieu » : l'adresse et la carte, avec le bouton « Ouvrir dans un plan ».",
        async play(page) {
            await open(page, "plongee");
            await bring(page, page.getByRole("heading", { level: 2, name: "Lieu" }), 16);
            await page.locator(".leaflet-tile-loaded").first().waitFor({ timeout: 8000 }).catch(() => {});
            await page.waitForTimeout(800);
        },
    },
    {
        name: "source",
        caption: "Un événement importé garde sa source : une ligne repliée dit l'essentiel (« Source : OpenAgenda · mis à jour le … »), et le détail (lien d'origine, licence) s'ouvre.",
        alt: "La zone « Source » dépliée : le lien vers l'événement d'origine, l'organisme et la licence.",
        async play(page) {
            await open(page, "plongee");
            const source = page.getByRole("region", { name: "Source" });
            await source.getByText(/^Source : OpenAgenda/).click();
            await bring(page, source, 260);
        },
    },
    {
        name: "contact",
        caption: "Epika ne prend pas de réservation : ici, « Contacter l'organisateur » ouvre une fenêtre avec l'appel et l'e-mail. Échap la ferme et rend le focus au bouton.",
        alt: "La fenêtre « Contacter l'organisateur », avec les boutons « Appeler » et « Écrire un e-mail ».",
        async play(page) {
            await open(page, "atelier-poterie");
            await page.getByRole("button", { name: "Contacter l'organisateur" }).filter({ visible: true }).first().click();
            await page.getByRole("dialog", { name: "Contacter l'organisateur" }).waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "introuvable",
        caption: "Un événement masqué ou supprimé répond une vraie erreur 404, pas une page vide avec un code 200 : les moteurs de recherche l'oublient.",
        alt: "La page « introuvable » d'Epika, affichée pour un événement masqué.",
        async play(page) {
            await page.goto("/evenements/masque");
            await page.getByRole("heading", { level: 1 }).first().waitFor();
        },
    },
];
