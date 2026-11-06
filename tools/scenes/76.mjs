/**
 * « Signaler un événement » (#76), against Epika's fake API: the event « atelier-poterie », a report answered 201, or 429
 * (Retry-After: 348, six minutes) for « trop@example.com ». The same steps as Epika's e2e/report.spec.ts.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** A fictitious account: the window then asks no e-mail. */
const jane = { id: 1, email: "jane@example.com", firstName: "Jane", lastName: "Doe", city: null, roles: ["ROLE_USER"], emailVerified: true };

/** The button at the bottom of the event page, in the middle of the screen. */
async function showButton(page) {
    await page.goto("/evenements/atelier-poterie");
    const trigger = page.getByRole("button", { name: "Signaler un problème sur cet événement" });
    await trigger.evaluate((button) => button.scrollIntoView({ block: "center" }));

    return trigger;
}

/** Opens the window, once the page knows who is there (the send button waits for it). */
async function openReport(page) {
    await (await showButton(page)).click();
    const dialog = page.getByRole("dialog", { name: "Signaler un problème" });
    await dialog.getByRole("button", { name: "Envoyer le signalement" }).waitFor();
    await page.waitForFunction(() => !document.querySelector("dialog[open] button[type=submit]")?.disabled);

    return dialog;
}

async function fill(dialog, email) {
    await dialog.getByRole("radio", { name: "Informations erronées (date, lieu, prix)" }).check();
    await dialog.getByLabel("Décrivez le problème").fill("L'atelier a lieu à 14 h, et non à 10 h comme indiqué.");
    if (email) {
        await dialog.getByLabel("Adresse e-mail").fill(email);
    }
}

/** The mouse away from the window: no hover highlight left where the last click was, once the content scrolled. */
async function rest(page) {
    await page.mouse.move(0, 0);
}

/** The bottom of the window (e-mail and send button) in view: on a phone, the sheet scrolls. */
async function showSendButton(dialog) {
    await dialog.getByRole("button", { name: "Envoyer le signalement" }).evaluate((button) => button.scrollIntoView({ block: "end" }));
}

export const scenes = [
    {
        name: "bouton",
        caption: "En bas de la fiche, après la source : « Signaler un problème sur cet événement ». Pas de drapeau sur les cartes.",
        alt: "Le bas de la fiche « Atelier poterie », avec le bouton souligné et son icône de drapeau.",
        async play(page) {
            await showButton(page);
        },
    },
    {
        name: "fenetre",
        caption: "La fenêtre rappelle l'événement et sa date, puis propose cinq sujets. Sur un téléphone, elle monte du bas de l'écran.",
        alt: "La fenêtre « Signaler un problème » ouverte, avec le titre de l'événement, sa date et la liste des sujets.",
        async play(page) {
            await openReport(page);
        },
    },
    {
        name: "erreurs",
        caption: "Un envoi vide : chaque erreur s'affiche sous son champ, et le focus va sur le premier sujet.",
        alt: "Les messages « Choisissez un sujet. » et « Décrivez le problème. » sous leurs champs.",
        async play(page) {
            const dialog = await openReport(page);
            await dialog.getByRole("button", { name: "Envoyer le signalement" }).click();
            await dialog.getByText("Choisissez un sujet.").waitFor();
            await dialog.getByText("Choisissez un sujet.").evaluate((error) => error.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "rempli",
        caption: "Sans compte, l'adresse e-mail est demandée, et le formulaire dit à quoi elle sert : uniquement au suivi.",
        alt: "Le formulaire rempli : un sujet coché, le message, son compteur et l'adresse e-mail.",
        async play(page) {
            const dialog = await openReport(page);
            await fill(dialog, "camille.martin@example.com");
            await showSendButton(dialog);
            // No focus ring nor caret on the last field typed in.
            await page.evaluate(() => document.activeElement?.blur());
            await rest(page);
        },
    },
    {
        name: "confirmation",
        caption: "Envoyé : la confirmation remplace le formulaire et reçoit le focus, pour être lue tout de suite.",
        alt: "Le message « Merci, votre signalement a été envoyé. L'équipe d'Epika va le vérifier. » et le bouton « Fermer ».",
        async play(page) {
            const dialog = await openReport(page);
            await fill(dialog, "camille.martin@example.com");
            await dialog.getByRole("button", { name: "Envoyer le signalement" }).click();
            await dialog.getByRole("heading", { name: "Merci, votre signalement a été envoyé." }).waitFor();
            await rest(page);
        },
    },
    {
        name: "connecte",
        caption: "Connecté, aucune adresse n'est demandée : l'API prend celle du compte.",
        alt: "Le formulaire d'une personne connectée : le sujet, le message et le bouton d'envoi, sans champ e-mail.",
        async play(page) {
            await page.route("**/api/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(jane) }));
            const dialog = await openReport(page);
            await fill(dialog, null);
            await showSendButton(dialog);
            await page.evaluate(() => document.activeElement?.blur());
            await rest(page);
        },
    },
    {
        name: "limite",
        caption: "Trop d'envois : l'alerte donne le délai renvoyé par l'API, en minutes, et reçoit le focus.",
        alt: "L'alerte « Trop de signalements envoyés. Réessayez dans 6 minutes. » en haut du formulaire.",
        async play(page) {
            const dialog = await openReport(page);
            await fill(dialog, "trop@example.com");
            await dialog.getByRole("button", { name: "Envoyer le signalement" }).click();
            const alert = page.getByRole("alert").filter({ hasText: "Trop de signalements envoyés" });
            await alert.waitFor();
            await alert.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
];
