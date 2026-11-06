/**
 * The account pages (#59), against Epika's production with the API replaced by page.route, as in Epika's e2e tests
 * (registration.spec.ts, login.spec.ts, password-reset.spec.ts): the fake API has no account routes. Fictitious people
 * only (Camille Martin, camille.martin@example.com).
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const problem = (status, body) => ({ status, contentType: "application/problem+json", body: JSON.stringify({ status, ...body }) });
const expired = problem(400, { type: "/problems/expired-link", detail: "Ce lien a expiré." });

/** Moves the focus out of any field and the mouse away: no caret, no hover in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

/** Fills the registration form with a fictitious person (a date of birth left out when `without` says so). */
async function fillRegistration(page) {
    await page.getByLabel("Prénom").fill("Camille");
    await page.getByLabel("Nom", { exact: true }).fill("Martin");
    await page.getByLabel("Adresse e-mail").fill("camille.martin@example.com");
    await page.getByLabel("Jour").fill("27");
    await page.getByLabel("Mois").fill("03");
    await page.getByLabel("Année").fill("2007");
    await page.getByLabel("J'accepte les conditions générales d'utilisation et la politique de confidentialité.").check();
}

export const scenes = [
    {
        name: "inscription",
        caption: "L'inscription : prénom, nom, e-mail, date de naissance en trois champs dans un groupe étiqueté, et l'acceptation des conditions. Pas encore de mot de passe : il se choisit après la vérification de l'e-mail.",
        alt: "Le formulaire d'inscription d'Epika, avec ses champs et le bouton « Créer mon compte ».",
        async play(page) {
            await page.goto("/inscription");
            await page.getByRole("button", { name: "Créer mon compte" }).waitFor();
        },
    },
    {
        name: "inscription-erreurs",
        caption: "Un envoi incomplet : un résumé compte ce qui reste à corriger, chaque erreur s'affiche sous son champ, et le focus va sur le premier champ en erreur.",
        alt: "Le formulaire d'inscription envoyé vide, avec le résumé des erreurs et les messages sous chaque champ.",
        async play(page) {
            await page.goto("/inscription");
            await page.getByRole("button", { name: "Créer mon compte" }).click();
            await page.getByRole("alert").filter({ hasText: /erreur|corriger/i }).first().waitFor();
            await rest(page);
        },
    },
    {
        name: "verifiez-votre-boite",
        caption: "« Vérifiez votre boîte mail » : le titre reçoit le focus, le renvoi de l'e-mail est bloqué 60 secondes, et « Changer l'adresse » ramène au formulaire rempli.",
        alt: "L'écran « Vérifiez votre boîte mail », avec l'adresse e-mail saisie et le bouton de renvoi.",
        async play(page) {
            await page.route("**/api/register", (route) => route.fulfill({ status: 202 }));
            await page.goto("/inscription");
            await fillRegistration(page);
            await page.getByRole("button", { name: "Créer mon compte" }).click();
            await page.getByRole("heading", { name: "Vérifiez votre boîte mail" }).waitFor();
            await rest(page);
        },
    },
    {
        name: "mot-de-passe",
        caption: "Le lien reçu par e-mail mène au choix du mot de passe, avec une jauge de robustesse calculée comme celle de Symfony côté serveur, et annoncée aux lecteurs d'écran.",
        alt: "La page « Activer mon compte », avec un mot de passe saisi et la jauge « Robustesse : forte ».",
        async play(page) {
            await page.goto("/inscription/confirmation#token=exemple");
            await page.getByLabel("Mot de passe", { exact: true }).fill("lavande-velo-ocean-42");
            await page.getByText("Robustesse : forte").waitFor();
            await rest(page);
        },
    },
    {
        name: "lien-expire",
        caption: "Un lien expiré ou déjà utilisé a son propre écran, avec un moyen d'en recevoir un nouveau. Sans jeton dans l'adresse, le lien est dit invalide.",
        alt: "L'écran « Ce lien a expiré », avec le lien « Recevoir un nouveau lien ».",
        async play(page) {
            await page.route("**/api/register/complete", (route) => route.fulfill(expired));
            await page.goto("/inscription/confirmation#token=ancien");
            await page.getByLabel("Mot de passe", { exact: true }).fill("lavande-velo-ocean-42");
            await page.getByRole("button", { name: "Activer mon compte" }).click();
            await page.getByRole("heading", { name: "Ce lien a expiré" }).waitFor();
            await rest(page);
        },
    },
    {
        name: "connexion",
        caption: "La connexion : un bouton œil affiche le mot de passe (son état est dit par aria-pressed), et un lien mène au mot de passe oublié.",
        alt: "La page de connexion, avec le mot de passe affiché grâce au bouton œil et le lien « Mot de passe oublié ? ».",
        async play(page) {
            await page.goto("/connexion");
            await page.getByLabel("Adresse e-mail").fill("camille.martin@example.com");
            await page.getByLabel("Mot de passe", { exact: true }).fill("lavande-velo-ocean-42");
            await page.getByRole("button", { name: "Afficher le mot de passe" }).click();
            await rest(page);
        },
    },
    {
        name: "connexion-erreur",
        caption: "Une erreur de connexion reste vague (« Adresse e-mail ou mot de passe incorrect. ») pour ne jamais révéler quelles adresses ont un compte. Elle est annoncée et reçoit le focus.",
        alt: "La page de connexion avec l'alerte « Adresse e-mail ou mot de passe incorrect. » en haut du formulaire.",
        async play(page) {
            await page.route("**/api/login", (route) => route.fulfill(problem(401, { detail: "Invalid credentials." })));
            await page.goto("/connexion");
            await page.getByLabel("Adresse e-mail").fill("camille.martin@example.com");
            await page.getByLabel("Mot de passe", { exact: true }).fill("mauvais");
            await page.getByRole("button", { name: "Se connecter" }).click();
            await page.getByRole("alert").filter({ hasText: "Adresse e-mail ou mot de passe incorrect." }).waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "mot-de-passe-oublie",
        caption: "Mot de passe oublié : on donne son e-mail, et la réponse est la même que l'adresse ait un compte ou non. Le lien reçu mène à « Nouveau mot de passe ».",
        alt: "La page « Mot de passe oublié », avec un champ e-mail rempli et le bouton « Envoyer le lien ».",
        async play(page) {
            await page.goto("/mot-de-passe/oublie");
            await page.getByLabel("Adresse e-mail").fill("camille.martin@example.com");
            await rest(page);
        },
    },
    {
        name: "mon-espace",
        caption: "Connecté, l'en-tête propose « Mon espace » et « Se déconnecter ». L'espace est derrière une garde : un visiteur est renvoyé à la connexion, puis ramené ici.",
        alt: "La page « Mon espace », avec la salutation et les informations du compte.",
        async play(page) {
            const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", city: null, roles: ["ROLE_USER"], emailVerified: true };
            await page.route("**/api/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(camille) }));
            await page.goto("/mon-espace");
            await page.getByRole("heading", { level: 1 }).first().waitFor();
            await page.getByText("camille.martin@example.com").first().waitFor();
            await rest(page);
        },
    },
];
