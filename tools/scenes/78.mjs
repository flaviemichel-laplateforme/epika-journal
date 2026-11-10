/**
 * The participant space (#78): « Mon espace » with its three boxes, against Epika's production with the account routes
 * replaced by page.route, as in Epika's e2e/account.spec.ts (the fake API has no account routes). Fictitious person
 * only (Camille Martin, camille.martin@example.com).
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const camille = {
    id: 1,
    email: "camille.martin@example.com",
    firstName: "Camille",
    lastName: "Martin",
    phone: "0612345678",
    city: "Toulon",
    roles: ["ROLE_USER"],
    emailVerified: true,
};

const json = (body) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const problem = (status, body) => ({ status, contentType: "application/problem+json", body: JSON.stringify({ status, ...body }) });

/** Logged in as this account: GET /api/me reads it, PATCH /api/me merges the body into it, as the API does. */
async function logIn(page, account = camille) {
    let current = { ...account };
    await page.route("**/api/me", (route) => {
        if (route.request().method() === "PATCH") {
            current = { ...current, ...route.request().postDataJSON() };
        }

        return route.fulfill(json(current));
    });
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

/** Opens « Mon espace » and brings the box with this heading to the middle of the screen. */
async function showBox(page, heading) {
    await page.goto("/mon-espace");
    const box = page.locator("section", { has: page.getByRole("heading", { level: 2, name: heading }) });
    await box.waitFor();
    await box.evaluate((element) => element.scrollIntoView({ block: "center" }));

    return box;
}

async function openDeletion(page) {
    const box = await showBox(page, "Supprimer mon compte");
    await box.getByRole("button", { name: "Supprimer mon compte" }).click();
    const dialog = page.getByRole("dialog", { name: "Supprimer mon compte" });
    await dialog.waitFor();

    return dialog;
}

export const scenes = [
    {
        name: "mes-informations",
        caption: "« Mon espace » : une seule page, un cadre par tâche. « Mes informations » est pré-rempli, le téléphone écrit comme on le lit ; l'e-mail est affiché, pas modifiable.",
        alt: "La page « Mon espace » de Camille, avec le cadre « Mes informations » : prénom, nom, téléphone, ville par défaut et adresse e-mail.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace");
            await page.getByRole("heading", { level: 2, name: "Mes informations" }).waitFor();
            await rest(page);
        },
    },
    {
        name: "enregistre",
        caption: "Enregistré : le message est annoncé sans déplacer le focus, et le salut change aussitôt. Il disparaît dès qu'un champ est modifié, puisqu'il ne serait plus vrai.",
        alt: "Le message « Vos informations sont enregistrées. » au-dessus du formulaire, et « Bonjour Cam ! » en haut de la page.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace");
            await page.getByLabel("Prénom").fill("Cam");
            await page.getByRole("button", { name: "Enregistrer" }).click();
            await page.getByRole("status").filter({ hasText: "Vos informations sont enregistrées." }).waitFor();
            await rest(page);
        },
    },
    {
        name: "mot-de-passe",
        caption: "« Mot de passe » : la page prévient avant que tous les appareils seront déconnectés. Le nouveau mot de passe a sa jauge de force, et il est demandé deux fois.",
        alt: "Le cadre « Mot de passe » rempli : mot de passe actuel, nouveau mot de passe avec la jauge « forte », et sa confirmation.",
        async play(page) {
            await logIn(page);
            const box = await showBox(page, "Mot de passe");
            await box.getByLabel("Mot de passe actuel", { exact: true }).fill("Correct-Horse-Battery-Staple-77");
            await box.getByLabel("Nouveau mot de passe", { exact: true }).fill("lavande-velo-ocean-42");
            await box.getByLabel("Confirmer le nouveau mot de passe", { exact: true }).fill("lavande-velo-ocean-42");
            await rest(page);
        },
    },
    {
        name: "confirmation-differente",
        caption: "Une confirmation différente : rien n'est envoyé, l'erreur est sous la confirmation, qui reçoit le focus. Seuls l'actuel et le nouveau partent vers l'API.",
        alt: "Le message « Les deux mots de passe ne sont pas identiques. » sous le champ de confirmation.",
        async play(page) {
            await logIn(page);
            const box = await showBox(page, "Mot de passe");
            await box.getByLabel("Mot de passe actuel", { exact: true }).fill("Correct-Horse-Battery-Staple-77");
            await box.getByLabel("Nouveau mot de passe", { exact: true }).fill("lavande-velo-ocean-42");
            await box.getByLabel("Confirmer le nouveau mot de passe", { exact: true }).fill("lavande-velo-ocean-24");
            await box.getByRole("button", { name: "Changer le mot de passe" }).click();
            const error = box.getByText("Les deux mots de passe ne sont pas identiques.");
            await error.waitFor();
            await error.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "suppression",
        caption: "« Supprimer mon compte » ouvre une fenêtre qui dit ce qui est effacé et ce qui reste sans rien qui vous désigne, puis demande le mot de passe. Sur un téléphone, elle monte du bas.",
        alt: "La fenêtre « Supprimer mon compte » : ce qui est effacé, ce qui reste, le champ mot de passe, « Supprimer définitivement mon compte » et « Annuler ».",
        async play(page) {
            await logIn(page);
            await openDeletion(page);
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "suppression-refusee",
        caption: "Un refus de l'API (une structure avec des événements à venir, RG-17) : la raison s'affiche dans la fenêtre, en alerte, et reçoit le focus.",
        alt: "Dans la fenêtre, l'alerte « Votre structure a des événements à venir : votre compte ne peut pas être supprimé… ».",
        async play(page) {
            await logIn(page);
            await page.route("**/api/me/deletion", (route) =>
                route.fulfill(problem(409, { detail: "Votre structure a des événements à venir : votre compte ne peut pas être supprimé avant le transfert ou la clôture de la structure." })),
            );
            const dialog = await openDeletion(page);
            await dialog.getByLabel("Mot de passe", { exact: true }).fill("Correct-Horse-Battery-Staple-77");
            await dialog.getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
            await dialog.getByRole("alert").waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "administrateur",
        caption: "Un administrateur lit pourquoi il ne peut pas supprimer son compte ici : ses décisions de modération gardent leur auteur, et Epika ne doit jamais rester sans administrateur.",
        alt: "Le cadre « Supprimer mon compte » d'un administrateur : l'explication, sans bouton.",
        async play(page) {
            await logIn(page, { ...camille, roles: ["ROLE_USER", "ROLE_ADMIN"] });
            await showBox(page, "Supprimer mon compte");
            await rest(page);
        },
    },
    {
        name: "compte-supprime",
        caption: "Après la suppression : une page statique, sans aucune donnée. Le compte est anonymisé, les appareils déconnectés, et un e-mail part à l'ancienne adresse.",
        alt: "La page « Votre compte a été supprimé », avec le lien « Retour à l'accueil ».",
        async play(page) {
            await page.goto("/compte-supprime");
            await page.getByRole("heading", { level: 1, name: "Votre compte a été supprimé" }).waitFor();
            await rest(page);
        },
    },
];
