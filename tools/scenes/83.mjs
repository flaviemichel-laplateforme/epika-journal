/**
 * The dates of an event (#83): the list in « L'essentiel », adding a date, the wizard « Répéter chaque semaine » (the
 * concerts of Advent, Tuesday to Sunday), the dates added, a refusal of the wizard, the past dates, the live card and the
 * summary of « Vérifier ». Against Epika's production with the account and event routes replaced by page.route, as in
 * the scenes of #82 and #85. Fictitious person (Camille Martin) and organization (Comité des fêtes du village); La
 * Farlède is a real town, public. Each scene starts from a fresh browser.
 */

const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", phone: null, city: null, roles: ["ROLE_USER"], emailVerified: true };

const comite = {
    name: "Comité des fêtes du village",
    slug: "comite-des-fetes-du-village",
    type: "nonprofit",
    registrationNumber: "W831000000",
    postalCode: "83210",
    city: "La Farlède",
    status: "approved",
    lastDecision: { status: "approved", reason: null, processedAt: "2026-11-18T10:00:00+01:00", automatic: false },
    trust: { level: "confirmed", probationEndsAt: null },
    description: "Le comité organise le bal d'été, le marché de Noël et le vide-grenier du village, toute l'année, avec ses bénévoles.",
    logoUrl: null,
    crestUrl: null,
    street: null,
    website: null,
    facebookUrl: null,
    instagramUrl: null,
    profileComplete: true,
    missingProfileFields: [],
};

/** A past concert, then the first concerts of Advent to come (Tuesdays and Saturdays of December). */
const OVER = { startAt: "2026-11-14T18:00:00+01:00", endAt: "2026-11-14T19:00:00+01:00" };
const COMING = [
    { startAt: "2026-12-01T18:00:00+01:00", endAt: "2026-12-01T19:00:00+01:00" },
    { startAt: "2026-12-05T18:00:00+01:00", endAt: "2026-12-05T19:00:00+01:00" },
    { startAt: "2026-12-08T18:00:00+01:00", endAt: "2026-12-08T19:00:00+01:00" },
];

const ADVENT = {
    id: 42,
    slug: "concerts-de-l-avent-la-farlede",
    status: "draft",
    publicUrl: null,
    timezone: "Europe/Paris",
    title: "Concerts de l'Avent",
    shortDescription: "Chaque soir de l'Avent, une heure de musique à l'église : la chorale, l'école de musique et des invités.",
    description: null,
    primarySubcategory: "concert",
    subcategories: [],
    venueName: "Église Saint-Joseph",
    address: "Place de la Mairie",
    postalCode: "83210",
    city: "La Farlède",
    price: "0.00",
    priceDetails: null,
    minimumAge: null,
    maximumAge: null,
    practicalInfo: null,
    accessibility: null,
    catering: null,
    parkingAccess: null,
    equipmentProvided: null,
    physicalRequirements: null,
    contactPhone: null,
    contactEmail: null,
    bookingMode: "external_link",
    externalBookingUrl: "https://comite.example.org/avent",
    cancellationReason: null,
    firstPublishedAt: null,
};

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const EMPTY_TILE = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/** Camille on the form of her concerts; its dates held in memory, replaced by a PATCH as the API does. */
async function logIn(page, occurrences = [OVER, ...COMING]) {
    const state = { occurrences };
    const view = () => ({
        ...ADVENT,
        occurrences: state.occurrences,
        placedOnMap: true,
        latitude: 43.1627,
        longitude: 6.0415,
        publicationBlockers: [],
        canPublish: true,
        allowedActions: ["edit", "publish", "delete"],
    });
    await page.route("https://data.geopf.fr/**", (route) => route.fulfill({ contentType: "image/png", body: EMPTY_TILE }));
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: comite.name, slug: comite.slug, status: comite.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(comite)));
    await page.route("**/api/me/organization/events/42", (route) => {
        if (route.request().method() === "PATCH") {
            const body = route.request().postDataJSON();
            if (Array.isArray(body.occurrences)) {
                state.occurrences = body.occurrences;
            }
        }

        return route.fulfill(json(view()));
    });
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

/** Brings an element to the top of the screen. */
async function scrollTo(page, locator) {
    await locator.waitFor();
    await locator.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -16));
}

async function openDates(page) {
    await page.goto("/mon-espace/structure/evenements/42?etape=essentiel");
    await page.getByRole("heading", { level: 2, name: "Dates" }).waitFor();
}

const panel = (page) => page.getByRole("group", { name: "Répéter chaque semaine" });
const pill = (page, short) => panel(page).locator("label").filter({ hasText: new RegExp(`^${short}$`) });

/** The wizard filled for Advent: Tuesday to Sunday, 18:00 to 19:00, all December. */
async function fillAdvent(page) {
    await page.getByRole("button", { name: "Répéter chaque semaine" }).click();
    for (const short of ["Mer", "Jeu", "Ven", "Sam", "Dim"]) {
        await pill(page, short).click();
    }
    await panel(page).getByLabel("Au", { exact: true }).fill("2026-12-31");
}

export const scenes = [
    {
        name: "la-liste-des-dates",
        caption: "Dans « L'essentiel », les dates de l'événement : une ligne par date à venir, qui se modifie sur place, avec « Supprimer » ; le nombre de dates en haut. Les dates déjà passées sont à part, en bas, et ne se modifient plus.",
        alt: "La section « Dates » de l'étape « L'essentiel » : « 4 dates · 100 au plus », puis les lignes « Date 1 » (1er décembre 2026, 18:00 à 19:00), « Date 2 » (5 décembre) et « Date 3 » (8 décembre), chacune avec ses champs Jour, Début, Fin et un bouton Supprimer ; sur ordinateur, on voit aussi plus bas les boutons « Ajouter une date » et « Répéter chaque semaine », puis « 1 date passée » déplié : « Du samedi 14 novembre à 18:00 au samedi 14 novembre à 19:00 ».",
        async play(page) {
            await logIn(page);
            await openDates(page);
            await page.locator("details").evaluate((details) => (details.open = true));
            await scrollTo(page, page.getByRole("heading", { level: 2, name: "Dates" }));
            await rest(page);
        },
    },
    {
        name: "ajouter-une-date",
        caption: "« Ajouter une date » : une nouvelle ligne, déjà aux heures de la dernière date, et le curseur sur son jour : il ne reste qu'à le choisir.",
        alt: "Le bas de la liste des dates : la ligne « Date 4 » ajoutée, son champ Jour vide et entouré (il a le focus), de 18:00 à 19:00, puis les boutons « Ajouter une date » et « Répéter chaque semaine ».",
        async play(page) {
            await logIn(page);
            await openDates(page);
            await page.getByRole("button", { name: "Ajouter une date" }).click();
            await page.getByRole("group", { name: "Date 4", exact: true }).getByLabel(/^Jour/).waitFor();
            await page.evaluate(() => window.scrollBy(0, 0));
            await scrollTo(page, page.getByRole("group", { name: "Date 3", exact: true }));
            // The focus stays on the new day, as after the click: leaving it empty would show its error.
            await page.getByRole("group", { name: "Date 4", exact: true }).getByLabel(/^Jour/).focus();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "repeter-chaque-semaine",
        caption: "« Répéter chaque semaine » : les jours en pastilles, les heures, la période. Pour un concert chaque soir du mardi au dimanche, tout le mois de décembre, l'assistant annonce avant d'ajouter : 24 dates nouvelles, 3 déjà prévues.",
        alt: "Le panneau « Répéter chaque semaine » : les pastilles Mar, Mer, Jeu, Ven, Sam et Dim cochées, Lun non cochée, De 18:00 À 19:00, Du 01/12/2026 Au 31/12/2026, la ligne « 24 dates seront ajoutées. 3 sont déjà prévues. », les boutons « Ajouter ces dates » et « Fermer sans ajouter ».",
        async play(page) {
            await logIn(page);
            await openDates(page);
            await fillAdvent(page);
            await scrollTo(page, page.getByRole("heading", { level: 3, name: "Répéter chaque semaine" }));
            await rest(page);
        },
    },
    {
        name: "les-dates-ajoutees",
        caption: "Une fois ajoutées, les dates rejoignent la liste dans l'ordre du calendrier, et c'est dit : 28 dates en tout. Elles s'enregistrent avec l'étape, comme le reste du formulaire.",
        alt: "La section « Dates » après l'ajout : « 28 dates · 100 au plus », puis les lignes Date 1 (1er décembre), Date 2 (2 décembre), Date 3 (3 décembre)…, toutes de 18:00 à 19:00.",
        async play(page) {
            await logIn(page);
            await openDates(page);
            await fillAdvent(page);
            await panel(page).getByRole("button", { name: "Ajouter ces dates" }).click();
            await page.getByText("28 dates · 100 au plus").waitFor();
            await scrollTo(page, page.getByRole("heading", { level: 2, name: "Dates" }));
            await rest(page);
        },
    },
    {
        name: "un-refus-de-l-assistant",
        caption: "L'assistant refuse ce que l'événement ne pourrait pas garder, et dit pourquoi sous le bouton : ici, tous les jours jusqu'à fin mars, cela ferait 122 dates, alors qu'un événement en a 100 au plus.",
        alt: "Le panneau « Répéter chaque semaine » avec les sept jours cochés, du 01/12/2026 au 31/03/2027, et le message rouge « Cela ferait 122 dates : un événement en a 100 au plus. Raccourcissez la période, ou cochez moins de jours. »",
        async play(page) {
            await logIn(page);
            await openDates(page);
            await page.getByRole("button", { name: "Répéter chaque semaine" }).click();
            for (const short of ["Lun", "Mer", "Jeu", "Ven", "Sam", "Dim"]) {
                await pill(page, short).click();
            }
            await panel(page).getByLabel("Au", { exact: true }).fill("2027-03-31");
            await panel(page).getByRole("button", { name: "Ajouter ces dates" }).click();
            await panel(page).getByText(/^Cela ferait/).waitFor();
            await scrollTo(page, page.getByRole("heading", { level: 3, name: "Répéter chaque semaine" }));
            await rest(page);
        },
    },
    {
        name: "verifier",
        caption: "À l'étape « Vérifier », le résumé dit combien de dates l'événement a, et la prochaine : « 4 dates, prochaine : mardi 1er décembre à 18:00 ».",
        alt: "Le récapitulatif de l'étape « Vérifier et publier » : la ligne « L'essentiel » dit « Concerts de l'Avent · Concert · 4 dates, prochaine : mardi 1er décembre à 18:00 », avec un lien Modifier, puis les autres étapes.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements/42?etape=verifier");
            await page.getByRole("heading", { level: 1, name: "Vérifier et publier" }).waitFor();
            await scrollTo(page, page.getByText(/4 dates, prochaine/));
            await rest(page);
        },
    },
];
