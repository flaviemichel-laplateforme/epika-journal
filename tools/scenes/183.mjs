/**
 * The bottom navigation of a phone (#183), against Epika's production with its fake API: « plongee » is an imported
 * event with a booking link. Fictitious events only. On a desktop the bar is not there: the header stays as it was.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/**
 * Opens a page and waits until React runs and knows who is logged in. The account corner of the header is attached,
 * not visible: under 640 px it gives way to the bottom navigation.
 */
async function open(page, path) {
    await page.goto(path);
    await page.getByRole("banner").getByRole("link", { name: /^(Se connecter|Mon espace)$/, includeHidden: true }).first().waitFor({ state: "attached" });
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "accueil",
        caption: "Sur téléphone, la barre du bas : Accueil, Événements, Favoris, Compte, chacun avec son icône et son nom. La page courante est en turquoise, avec un trait au-dessus et un texte en gras. Sur ordinateur, rien ne change : l'en-tête garde son lien « Se connecter ».",
        alt: "L'accueil, avec en bas de l'écran du téléphone une barre navy à quatre entrées, « Accueil » en turquoise.",
        async play(page) {
            await open(page, "/");
        },
    },
    {
        name: "evenements",
        caption: "Sur la page de résultats, « Événements » est l'entrée courante. L'en-tête du téléphone tient sur une ligne : le coin du compte a laissé sa place à « Compte », en bas.",
        alt: "Les résultats autour de Toulon, avec la barre du bas où « Événements » est en turquoise.",
        async play(page) {
            await open(page, "/recherche?ville=Toulon");
        },
    },
    {
        name: "fiche",
        caption: "Sur une fiche, la barre « Réserver » reste posée contre la barre de navigation, et le pied de page passe dessous. Aucune entrée n'est courante : la fiche n'est aucune des quatre pages.",
        alt: "Le bas d'une fiche d'événement : « Signaler un problème », puis la barre « Gratuit · Voir sur OpenAgenda », posée sur la barre navy à quatre entrées.",
        async play(page) {
            await open(page, "/evenements/plongee");
            await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
            await page.mouse.move(0, 0);
        },
    },
];
