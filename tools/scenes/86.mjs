/**
 * The views of each event (#86): « Mes événements » with the views of every event once online and the counting rule
 * said once; the step « Vérifier » of a published event; a draft back from published, which keeps its views. Against
 * Epika's production with the account and event routes replaced by page.route, as in the scenes of #85. Fictitious
 * person (Camille Martin), organization (Comité des fêtes du village) and counts; La Farlède is a real town, public.
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
    viewCount: 0,
    ...changes,
});

/** Each case once: published with many views, published with few, a draft never online, one back to draft, cancelled. */
const EVENTS = [
    line(1, "Bal du village", { status: "published", slug: "bal-du-village-la-farlede", firstPublishedAt: "2026-11-20T10:00:00+01:00", viewCount: 1240 }),
    line(2, "Marché de Noël", { status: "published", nextOccurrenceStart: "2026-12-19T09:00:00+01:00", lastOccurrenceEnd: "2026-12-20T18:00:00+01:00", occurrenceCount: 2, firstPublishedAt: "2026-11-15T10:00:00+01:00", viewCount: 312 }),
    line(3, "Vide-grenier de printemps", { nextOccurrenceStart: "2027-04-11T07:00:00+02:00", lastOccurrenceEnd: "2027-04-11T17:00:00+02:00" }),
    line(4, "Concert de la chorale", { nextOccurrenceStart: "2027-01-23T20:30:00+01:00", lastOccurrenceEnd: "2027-01-23T22:30:00+01:00", firstPublishedAt: "2026-11-10T10:00:00+01:00", viewCount: 1 }),
    line(5, "Loto du comité", { status: "cancelled", nextOccurrenceStart: "2026-12-06T14:00:00+01:00", lastOccurrenceEnd: "2026-12-06T18:00:00+01:00", firstPublishedAt: "2026-11-05T10:00:00+01:00", viewCount: 87 }),
];

const BAL = {
    id: 1,
    slug: "bal-du-village-la-farlede",
    status: "published",
    publicUrl: "/evenements/bal-du-village-la-farlede",
    timezone: "Europe/Paris",
    title: "Bal du village",
    shortDescription: "Grand bal sur la place, avec un orchestre et une buvette.",
    description: "Le comité des fêtes vous invite au bal de fin d'année : valses, rock et chansons françaises jusqu'à une heure du matin.",
    primarySubcategory: "bal-et-soiree-dansante",
    subcategories: [],
    occurrences: [{ startAt: "2026-12-12T21:00:00+01:00", endAt: "2026-12-13T01:00:00+01:00" }],
    venueName: "Salle des fêtes",
    address: "Place de la Mairie",
    postalCode: "83210",
    city: "La Farlède",
    placedOnMap: true,
    latitude: 43.1627,
    longitude: 6.0415,
    price: "0.00",
    priceDetails: null,
    minimumAge: null,
    maximumAge: null,
    practicalInfo: null,
    accessibility: "Salle de plain-pied, accessible en fauteuil roulant.",
    catering: "Buvette et crêpes sur place.",
    parkingAccess: null,
    equipmentProvided: null,
    physicalRequirements: null,
    contactPhone: null,
    contactEmail: null,
    bookingMode: "external_link",
    externalBookingUrl: "https://billetterie.example.org/bal-du-village",
    cancellationReason: null,
    firstPublishedAt: "2026-11-20T10:00:00+01:00",
    publicationBlockers: [],
    canPublish: false,
    allowedActions: ["edit", "unpublish", "cancel"],
    photos: [],
    programPdfUrl: null,
    programSteps: [],
    viewCount: 1240,
};

/** The concert, back to draft after a week online: its views stay. */
const CHORALE = {
    ...BAL,
    id: 4,
    slug: "concert-de-la-chorale-la-farlede",
    status: "draft",
    publicUrl: null,
    title: "Concert de la chorale",
    shortDescription: "La chorale du village chante Noël à l'église.",
    primarySubcategory: "concert",
    occurrences: [{ startAt: "2027-01-23T20:30:00+01:00", endAt: "2027-01-23T22:30:00+01:00" }],
    firstPublishedAt: "2026-11-10T10:00:00+01:00",
    canPublish: true,
    allowedActions: ["edit", "publish"],
    viewCount: 1,
};

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

/** Camille logged in, managing the comité. */
async function logIn(page) {
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: comite.name, slug: comite.slug, status: comite.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(comite)));
    await page.route(/\/api\/me\/organization\/events\?/, (route) => route.fulfill(json({ items: EVENTS, totalItems: EVENTS.length, page: 1, itemsPerPage: 20 })));
    await page.route(/\/api\/me\/organization\/events\/1$/, (route) => route.fulfill(json(BAL)));
    await page.route(/\/api\/me\/organization\/events\/4$/, (route) => route.fulfill(json(CHORALE)));
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

export const scenes = [
    {
        name: "les-vues-dans-la-liste",
        caption: "« Mes événements » sert de tableau de bord : chaque événement déjà mis en ligne dit combien de fois sa page publique a été ouverte. Un brouillon jamais publié n'en dit rien. La règle de comptage est écrite une fois, au-dessus de la liste.",
        alt: "La page « Mes événements » : la règle « Une vue correspond à une ouverture de la page publique, une fois par onglet. Vos propres visites ne sont pas comptées lorsque votre session est ouverte. », puis les cartes : « Bal du village », Publié, « 1 240 vues » avec une icône d'œil ; « Marché de Noël », Publié, « 312 vues » ; « Vide-grenier de printemps », Brouillon, sans nombre de vues.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements");
            await scrollTo(page, page.getByText(/^Une vue correspond/));
            await rest(page);
        },
    },
    {
        name: "un-brouillon-et-un-evenement-annule",
        caption: "Plus bas : le concert, revenu en brouillon après une semaine en ligne, garde sa vue (« 1 vue », au singulier) ; le loto annulé garde les siennes. Ce que les visiteurs ont fait reste vrai.",
        alt: "La suite de la liste : « Concert de la chorale », Brouillon · déjà publié, « 1 vue » ; « Loto du comité », Annulé, « 87 vues ».",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements");
            await scrollTo(page, page.getByRole("article", { name: "Concert de la chorale" }));
            await rest(page);
        },
    },
    {
        name: "verifier-un-evenement-en-ligne",
        caption: "À l'étape « Vérifier » d'un événement en ligne, sous son état : « 1 240 vues de la page publique », avec la même règle de comptage, écrite en clair.",
        alt: "L'étape « Vérifier et publier » du « Bal du village » : l'encadré « Votre événement est en ligne » avec « Voir la page publique » et « Voir mes événements », puis « 1 240 vues de la page publique » avec une icône d'œil et la phrase « Une vue correspond à une ouverture de la page publique, une fois par onglet. Vos propres visites ne sont pas comptées lorsque votre session est ouverte. », puis le récapitulatif.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements/1?etape=verifier");
            await scrollTo(page, page.getByRole("heading", { name: "Votre événement est en ligne" }));
            await rest(page);
        },
    },
];
