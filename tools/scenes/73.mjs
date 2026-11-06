/**
 * « Autour de moi » (#73), against Epika's fake API: the commune near Toulon (43.13, 5.92 once rounded), none at sea.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** A browser whose geolocation always answers « permission denied », as in Epika's e2e tests. */
async function refuseGeolocation(page) {
    await page.addInitScript(() => {
        const geolocation = { getCurrentPosition: (_success, failure) => failure({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }) };
        Object.defineProperty(navigator, "geolocation", { value: geolocation });
    });
}

export const scenes = [
    {
        name: "accueil",
        caption: "L'accueil : « Autour de moi » est dans le bandeau de recherche, à côté des champs « Quoi ? » et « Où ? ».",
        alt: "La page d'accueil d'Epika, avec le bandeau de recherche et le bouton « Autour de moi ».",
        async play(page) {
            await page.goto("/");
            await page.getByRole("button", { name: "Autour de moi" }).waitFor();
        },
    },
    {
        name: "explication",
        caption: "Le premier clic explique ce qui va être demandé et ce que devient la position. Le navigateur n'a encore rien demandé.",
        alt: "Le panneau d'explication ouvert sous le bouton, avec « Me localiser » et « Annuler ».",
        async play(page) {
            await page.goto("/");
            await page.getByRole("button", { name: "Autour de moi" }).click();
            await page.getByRole("button", { name: "Me localiser" }).waitFor();
        },
    },
    {
        name: "resultats",
        caption: "Position accordée : la recherche s'ouvre autour de la commune trouvée, avec une adresse qui contient une ville et pas des coordonnées.",
        alt: "La page de résultats « Événements à Toulon ».",
        async play(page, context) {
            await context.grantPermissions(["geolocation"]);
            await context.setGeolocation({ latitude: 43.131234, longitude: 5.923456 });
            await page.goto("/");
            await page.getByRole("button", { name: "Autour de moi" }).click();
            await page.getByRole("button", { name: "Me localiser" }).click();
            await page.getByRole("heading", { level: 1, name: "Événements à Toulon" }).waitFor();
        },
    },
    {
        name: "refus",
        caption: "Position refusée : un message clair, et le curseur est déjà dans le champ « Où ? » pour taper une ville.",
        alt: "Le message « Vous n'avez pas autorisé la localisation » sous le bouton, le champ ville sélectionné.",
        async play(page) {
            await refuseGeolocation(page);
            await page.goto("/");
            await page.getByRole("button", { name: "Autour de moi" }).click();
            await page.getByRole("button", { name: "Me localiser" }).click();
            await page.getByRole("alert").filter({ hasText: "Vous n'avez pas autorisé la localisation" }).waitFor();
        },
    },
    {
        name: "en-mer",
        caption: "Une position sans commune française (en mer, à l'étranger) : un autre message, la même solution de rechange.",
        alt: "Le message « Aucune commune française n'a été trouvée à votre position ».",
        async play(page, context) {
            await context.grantPermissions(["geolocation"]);
            await context.setGeolocation({ latitude: 42.5, longitude: 5.5 });
            await page.goto("/");
            await page.getByRole("button", { name: "Autour de moi" }).click();
            await page.getByRole("button", { name: "Me localiser" }).click();
            await page.getByRole("alert").filter({ hasText: "Aucune commune française" }).waitFor();
        },
    },
];
