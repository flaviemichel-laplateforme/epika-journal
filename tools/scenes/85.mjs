/**
 * « Mes événements » (#85): the list of an organization's events, its filter, the three windows that ask first, what is
 * said after an action, a suspended event; then the two fixes found while trying it (a refused publication, an address
 * not found on the map). Against Epika's production with the account and event routes replaced by page.route, as in
 * the scenes of #79 to #82. Fictitious person (Camille Martin) and organization (Comité des fêtes du village); La
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

const line = (id, title, changes = {}) => ({
    id,
    title,
    slug: `evenement-${id}`,
    status: "draft",
    nextOccurrenceStart: "2026-12-12T21:00:00+01:00",
    lastOccurrenceEnd: "2026-12-13T01:00:00+01:00",
    occurrenceCount: 1,
    firstPublishedAt: null,
    ...changes,
});

/** Six events, each case of the list once. */
const EVENTS = [
    line(1, "Bal du village", { status: "published", slug: "bal-du-village-la-farlede", firstPublishedAt: "2026-11-20T10:00:00+01:00" }),
    line(2, "Marché de Noël", { status: "published", nextOccurrenceStart: "2026-12-19T09:00:00+01:00", lastOccurrenceEnd: "2026-12-20T18:00:00+01:00", occurrenceCount: 2, firstPublishedAt: "2026-11-15T10:00:00+01:00" }),
    line(3, "Vide-grenier de printemps", { nextOccurrenceStart: "2027-04-11T07:00:00+02:00", lastOccurrenceEnd: "2027-04-11T17:00:00+02:00" }),
    line(4, "Concert de la chorale", { nextOccurrenceStart: "2027-01-23T20:30:00+01:00", lastOccurrenceEnd: "2027-01-23T22:30:00+01:00", firstPublishedAt: "2026-11-10T10:00:00+01:00" }),
    line(5, "Loto du comité", { status: "cancelled", nextOccurrenceStart: "2026-12-06T14:00:00+01:00", lastOccurrenceEnd: "2026-12-06T18:00:00+01:00", firstPublishedAt: "2026-11-05T10:00:00+01:00" }),
    line(6, "Tournoi de pétanque", { status: "suspended", nextOccurrenceStart: "2027-05-08T09:00:00+02:00", lastOccurrenceEnd: "2027-05-08T18:00:00+02:00", firstPublishedAt: "2026-11-01T10:00:00+01:00" }),
    line(7, "Fête de la Saint-Jean", { status: "published", nextOccurrenceStart: null, lastOccurrenceEnd: "2026-06-24T23:30:00+02:00", firstPublishedAt: "2026-05-20T10:00:00+02:00" }),
];

/** A draft of #82, for the two fixes of the form. */
const DRAFT = {
    id: 42,
    slug: "bal-du-village-la-farlede",
    status: "draft",
    publicUrl: null,
    timezone: "Europe/Paris",
    title: "Bal du village",
    shortDescription: "Grand bal sur la place, avec l'orchestre Les Copains d'abord et une buvette.",
    description: null,
    primarySubcategory: "bal-et-soiree-dansante",
    subcategories: [],
    occurrences: [{ startAt: "2026-12-12T21:00:00+01:00", endAt: "2026-12-13T01:00:00+01:00" }],
    venueName: "Salle des fêtes",
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
    externalBookingUrl: null,
    cancellationReason: null,
    firstPublishedAt: null,
};

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const problem = (body, status) => ({ status, contentType: "application/problem+json", body: JSON.stringify({ status, ...body }) });
const EMPTY_TILE = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/** Camille logged in, managing the comité; its events held in memory, changed as the API would. */
async function logIn(page) {
    const state = { events: EVENTS.map((event) => ({ ...event })) };
    await page.route("https://data.geopf.fr/**", (route) => route.fulfill({ contentType: "image/png", body: EMPTY_TILE }));
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: comite.name, slug: comite.slug, status: comite.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(comite)));
    await page.route(/\/api\/me\/organization\/events\?/, (route) => {
        const query = new URL(route.request().url()).searchParams;
        const status = query.get("status");
        const kept = state.events.filter((event) => status === null || event.status === status);

        return route.fulfill(json({ items: kept, totalItems: kept.length, page: 1, itemsPerPage: 20 }));
    });
    await page.route(/\/api\/me\/organization\/events\/\d+$/, (route) => {
        if (route.request().method() !== "DELETE") {
            return route.fallback();
        }
        const id = Number(route.request().url().split("/").at(-1));
        state.events = state.events.filter((event) => event.id !== id);

        return route.fulfill({ status: 204 });
    });
}

/** Camille on the form of a draft; « placed » says whether the address may be put on the map. */
async function logInOnDraft(page, { placed = true } = {}) {
    const state = { event: { ...DRAFT } };
    const view = () => {
        const blockers = [];
        if (!state.event.externalBookingUrl) {
            blockers.push({ code: "booking_link", field: "externalBookingUrl", message: "Indiquez le lien de réservation." });
        }
        const onMap = placed && Boolean(state.event.address);

        return {
            ...state.event,
            placedOnMap: onMap,
            latitude: onMap ? 43.1627 : null,
            longitude: onMap ? 6.0415 : null,
            publicationBlockers: blockers,
            canPublish: blockers.length === 0,
            allowedActions: ["edit", "publish", "delete"],
        };
    };
    await page.route("https://data.geopf.fr/**", (route) => route.fulfill({ contentType: "image/png", body: EMPTY_TILE }));
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: comite.name, slug: comite.slug, status: comite.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(comite)));
    await page.route("**/api/me/organization/events/42", (route) => {
        if (route.request().method() === "PATCH") {
            state.event = { ...state.event, ...route.request().postDataJSON() };
        }

        return route.fulfill(json(view()));
    });
    await page.route("**/api/me/organization/events/42/publication", (route) =>
        route.fulfill(problem({ violations: view().publicationBlockers.map((blocker) => ({ propertyPath: blocker.field, message: blocker.message, code: blocker.code })) }, 422)),
    );
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

async function openList(page, query = "") {
    await page.goto(`/mon-espace/structure/evenements${query}`);
    await page.getByRole("heading", { level: 2 }).first().waitFor();
}

export const scenes = [
    {
        name: "la-liste",
        caption: "« Mes événements » : chaque événement de la structure, son statut en mots, sa prochaine date, et les boutons de ce qu'on peut en faire. Le filtre par statut est en haut, le total juste dessous.",
        alt: "La page « Mes événements » : le bouton « Créer un événement », les filtres Tous (choisi), Brouillons, Publiés, Annulés, Suspendus, « 7 événements. », puis les cartes « Bal du village » (Publié, prochaine date samedi 12 décembre à 21:00, boutons Modifier, Voir la page publique, Repasser en brouillon, Annuler) et « Marché de Noël » (Publié, 2 dates au total).",
        async play(page) {
            await logIn(page);
            await openList(page);
            await rest(page);
        },
    },
    {
        name: "les-brouillons",
        caption: "Le filtre « Brouillons » : il est dans l'adresse de la page (« ?statut=brouillons »). Un brouillon jamais publié peut être supprimé ; celui qui a déjà été en ligne le dit, et ne peut plus l'être.",
        alt: "La liste filtrée sur « Brouillons », « 2 brouillons. » : « Vide-grenier de printemps » (Brouillon, boutons Vérifier et publier, Modifier, Supprimer) et « Concert de la chorale » (Brouillon · déjà publié, boutons Vérifier et publier, Modifier, et la phrase « Cet événement a déjà été en ligne : il ne peut pas être supprimé. »).",
        async play(page) {
            await logIn(page);
            await openList(page, "?statut=brouillons");
            await rest(page);
        },
    },
    {
        name: "repasser-en-brouillon",
        caption: "« Repasser en brouillon » demande d'abord. La fenêtre dit ce qui va se passer ; le premier focus est sur « Garder tel quel » : un Entrée par réflexe ne change rien.",
        alt: "La fenêtre « Repasser en brouillon ? » par-dessus la liste : « « Bal du village » ne sera plus visible des visiteurs. Vous pourrez le republier. », les boutons « Repasser en brouillon » et « Garder tel quel ».",
        async play(page) {
            await logIn(page);
            await openList(page);
            await page.getByRole("button", { name: "Repasser en brouillon : Bal du village" }).click();
            await page.getByRole("dialog").waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "annuler-avec-un-motif",
        caption: "Annuler un événement publié demande son motif : l'événement reste visible, marqué « Annulé », avec ce motif, pour que les visiteurs sachent pourquoi.",
        alt: "La fenêtre « Annuler l'événement ? » : « « Marché de Noël » reste visible, marqué Annulé, avec votre motif. Il ne pourra plus être modifié. », le champ « Motif de l'annulation » rempli avec « La place est réservée pour des travaux. » et son compteur, les boutons « Annuler l'événement » et « Garder tel quel ».",
        async play(page) {
            await logIn(page);
            await openList(page);
            await page.getByRole("button", { name: "Annuler : Marché de Noël" }).click();
            await page.getByRole("textbox", { name: "Motif de l'annulation" }).fill("La place est réservée pour des travaux.");
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "supprimer-un-brouillon",
        caption: "Supprimer un brouillon : la fenêtre le dit sans détour, et le bouton porte le verbe exact, « Supprimer le brouillon », jamais un vague « Confirmer ».",
        alt: "La fenêtre « Supprimer ce brouillon ? » : « « Vide-grenier de printemps » sera supprimé définitivement. », le bouton rouge « Supprimer le brouillon » et « Garder tel quel ».",
        async play(page) {
            await logIn(page);
            await openList(page, "?statut=brouillons");
            await page.getByRole("button", { name: "Supprimer : Vide-grenier de printemps" }).click();
            await page.getByRole("dialog").waitFor();
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "c-est-fait",
        caption: "Une fois l'action faite, la liste le dit (« « Vide-grenier de printemps » est supprimé. ») avec le nouveau total ; un lecteur d'écran l'entend aussi, et le focus revient en haut de la liste.",
        alt: "La liste « Brouillons » après la suppression : la ligne « « Vide-grenier de printemps » est supprimé. 1 brouillon. », puis la seule carte restante, « Concert de la chorale ».",
        async play(page) {
            await logIn(page);
            await openList(page, "?statut=brouillons");
            await page.getByRole("button", { name: "Supprimer : Vide-grenier de printemps" }).click();
            await page.getByRole("button", { name: "Supprimer le brouillon" }).click();
            await page.getByRole("status").filter({ hasText: "est supprimé" }).waitFor();
            await page.getByRole("heading", { level: 2, name: "Vide-grenier de printemps" }).waitFor({ state: "detached" });
            await rest(page);
        },
    },
    {
        name: "annules-suspendus-termines",
        caption: "Ce qu'on ne peut plus changer : un événement annulé garde sa page publique ; un événement suspendu par l'équipe d'Epika l'explique et n'a aucun bouton ; un événement passé dit « Terminé le … ».",
        alt: "Le bas de la liste « Tous » : « Loto du comité » (Annulé, bouton Voir la page publique), « Tournoi de pétanque » (Suspendu, « Suspendu par l'équipe d'Epika : il n'est plus visible et ne peut pas être modifié. Contactez l'équipe d'Epika. », aucun bouton) et « Fête de la Saint-Jean » (Publié, « Terminé le mercredi 24 juin à 23:30 »).",
        async play(page) {
            await logIn(page);
            await openList(page);
            await scrollTo(page, page.getByRole("heading", { level: 2, name: "Loto du comité" }));
            await rest(page);
        },
    },
    {
        name: "publication-refusee",
        caption: "Trouvé en essayant : un clic sur « Publier » alors qu'il manque une information semblait ne rien faire. Maintenant, une alerte le dit tout de suite et reçoit le focus ; la liste de ce qui manque est juste dessous.",
        alt: "L'étape « Vérifier et publier » après un clic sur « Publier » : l'alerte rouge « Publication impossible : il manque encore 1 information, listée ci-dessous. », puis l'encadré « Presque prêt : une information manque pour publier » avec « Indiquez le lien de réservation. · Tarif et réservation ».",
        async play(page) {
            await logInOnDraft(page);
            await page.goto("/mon-espace/structure/evenements/42?etape=verifier");
            await page.getByRole("button", { name: "Publier l'événement" }).click();
            await page.getByRole("alert").filter({ hasText: "Publication impossible" }).waitFor();
            await page.evaluate(() => window.scrollTo(0, 0));
            await rest(page);
        },
    },
    {
        name: "adresse-introuvable",
        caption: "Trouvé en essayant : une adresse que la carte ne trouve pas n'était signalée qu'à la fin. Maintenant, c'est dit tout de suite, à l'étape « Le lieu », là où on la corrige. Le brouillon est enregistré quand même.",
        alt: "L'étape « Le lieu » : l'alerte rouge « Adresse enregistrée, mais nous ne l'avons pas trouvée sur la carte. Vérifiez le numéro, la rue et le code postal, puis continuez. Sans position sur la carte, l'événement ne pourra pas être publié. », puis le titre de l'étape « Le lieu » et ses champs.",
        async play(page) {
            await logInOnDraft(page, { placed: false });
            await page.goto("/mon-espace/structure/evenements/42?etape=lieu");
            await page.getByRole("heading", { level: 1, name: "Le lieu" }).waitFor();
            await page.getByRole("textbox", { name: /^Adresse/ }).fill("141 avenue de la République");
            await page.getByRole("button", { name: /^Suivant/ }).click();
            await page.getByRole("alert").filter({ hasText: "pas trouvée sur la carte" }).waitFor();
            await page.evaluate(() => window.scrollTo(0, 0));
            await rest(page);
        },
    },
];
