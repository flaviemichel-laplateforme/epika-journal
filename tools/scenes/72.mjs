/**
 * The results page (#72), against Epika's fake API: 45 events around Toulon (the first 12 free), « zzz » finds nothing,
 * « Nullepart » is unknown, « Mende » has too few events (RG-23). The same selectors as Epika's e2e/search.spec.ts.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** Opens a results address, once the number of results is written. */
async function open(page, address) {
    await page.goto(address);
    await page.getByRole("status").first().waitFor();
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
        name: "resultats",
        caption: "Autour de Toulon : le nombre de résultats, le rayon réellement cherché (« Dans un rayon de 20 km ») et les cartes, avec la barre de recherche en haut.",
        alt: "La page « Événements à Toulon » : « 45 événements · page 1 sur 3 », le rayon de 20 km et les premières cartes.",
        async play(page) {
            await open(page, "/recherche?ville=Toulon");
        },
    },
    {
        name: "filtres",
        caption: "Sur ordinateur, les filtres sont dans la colonne et s'appliquent aussitôt. Sur téléphone, un panneau : les choix sont un brouillon, et le bouton dit combien d'événements il va montrer avant de valider.",
        alt: "Les filtres : la colonne de gauche sur ordinateur, le panneau « Filtres » avec « Voir les 12 événements » sur téléphone.",
        async play(page, _context, format) {
            await open(page, "/recherche?ville=Toulon");
            if (format === "mobile") {
                await page.getByRole("button", { name: "Filtres" }).click();
                const panel = page.getByRole("dialog", { name: "Filtres" });
                await panel.getByText("Gratuit uniquement", { exact: true }).click();
                await panel.getByRole("button", { name: "Voir les 12 événements" }).waitFor();
            } else {
                await page.getByRole("complementary").getByText("Gratuit uniquement", { exact: true }).click();
                await page.getByRole("button", { name: "Gratuit : retirer ce filtre" }).waitFor();
            }
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "filtres-actifs",
        caption: "Chaque filtre actif est une pastille que l'on retire d'un clic, et l'adresse de la page les garde tous : un lien de recherche se partage.",
        alt: "Les filtres actifs (« Gratuit », « Musique ») sous forme de pastilles à retirer, au-dessus des résultats.",
        async play(page) {
            await open(page, "/recherche?ville=Toulon&gratuit=1&categorie=musique");
            await page.getByRole("button", { name: "Gratuit : retirer ce filtre" }).waitFor();
        },
    },
    {
        name: "affichage",
        caption: "« Liste » ou « Cartes », au choix du visiteur, et « Plus proche d'abord » autour d'une ville. Trié par date, la liste se range par jour.",
        alt: "Les boutons « Liste » et « Cartes », le bouton « Plus proche d'abord » et les résultats en liste.",
        async play(page) {
            await open(page, "/recherche?ville=Toulon");
            await page.getByRole("group", { name: "Affichage des résultats" }).getByRole("button", { name: /Liste/ }).click();
            await page.getByRole("button", { name: /Plus proche d'abord/ }).click();
            await page.getByRole("status").first().waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "pagination",
        caption: "Vingt résultats par page, avec de vrais liens : la page courante est marquée, et « Retour » du navigateur fonctionne.",
        alt: "La pagination en bas de la page de résultats, avec la page 1 marquée comme page courante.",
        async play(page) {
            await open(page, "/recherche?ville=Toulon");
            await bring(page, page.getByRole("navigation", { name: "Pagination" }), 500);
        },
    },
    {
        name: "aucun-resultat",
        caption: "Aucun résultat : un message clair et une issue, jamais une page vide.",
        alt: "Le message « Aucun événement trouvé » avec le lien « Voir tous les événements à venir ».",
        async play(page) {
            await page.goto("/recherche?q=zzz");
            await page.getByRole("heading", { name: "Aucun événement trouvé" }).waitFor();
        },
    },
    {
        name: "ailleurs",
        caption: "Trop peu d'événements, même à 100 km (RG-23) : la page le dit et propose des idées ailleurs en France.",
        alt: "La section « Ailleurs en France », avec six cartes d'événements, sous le message qui dit qu'il y a peu d'événements près de Mende.",
        async play(page) {
            await page.goto("/recherche?ville=Mende");
            await bring(page, page.getByRole("region", { name: "Ailleurs en France" }), 120);
        },
    },
    {
        name: "ville-inconnue",
        caption: "Une ville inconnue est signalée sous son champ, et le champ le dit aux lecteurs d'écran.",
        alt: "Le champ « Où ? » avec « Nullepart » et le message « Aucune commune ne porte ce nom. » dessous.",
        async play(page) {
            await page.goto("/recherche?ville=Nullepart");
            await page.getByText("Aucune commune ne porte ce nom.", { exact: false }).first().waitFor();
        },
    },
];
