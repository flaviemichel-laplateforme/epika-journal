/**
 * The event form of an organizer (#82): the six steps, the pills, the live card, « Vérifier » with what is missing and
 * the Google preview, the preview of the page and the publication. Against Epika's production with the account and
 * event routes replaced by page.route, as in the scenes of #79 to #81 (the fake API has no account routes).
 * Fictitious person (Camille Martin) and organization (Comité des fêtes du village); La Farlède is a real town, public.
 * Each scene starts from a fresh browser.
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

/** A draft with everything a visitor needs. */
const READY = {
    id: 42,
    slug: "bal-du-village-la-farlede",
    status: "draft",
    publicUrl: null,
    timezone: "Europe/Paris",
    title: "Bal du village",
    shortDescription: "Grand bal sur la place, avec l'orchestre Les Copains d'abord et une buvette.",
    description: "Le comité des fêtes vous invite au bal de fin d'année : valses, rock et chansons françaises jusqu'à une heure du matin.",
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
    firstPublishedAt: null,
};

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const EMPTY_TILE = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/** What stops the publication, as the API computes it, for the fields shown. */
function blockersOf(event) {
    const blockers = [];
    if (!event.shortDescription) {
        blockers.push({ code: "short_description", field: "shortDescription", message: "Ajoutez une description courte : elle s'affiche sous le titre et dans les résultats de Google." });
    }
    if (!event.address) {
        blockers.push({ code: "address", field: "address", message: "Indiquez une adresse que nous savons placer sur la carte." });
    }
    if (event.bookingMode !== "contact" && !event.externalBookingUrl) {
        blockers.push({ code: "booking_link", field: "externalBookingUrl", message: "Indiquez le lien de réservation." });
    }

    return blockers;
}

/** Camille logged in, managing the comité; the event held in memory as the API would. */
async function logIn(page, event = READY) {
    const state = { event: { ...event } };
    const view = () => {
        const published = state.event.status === "published";
        const blockers = published ? [] : blockersOf(state.event);
        const placed = Boolean(state.event.address);

        return {
            ...state.event,
            placedOnMap: placed,
            latitude: placed ? 43.1627 : null,
            longitude: placed ? 6.0415 : null,
            publicUrl: published ? `/evenements/${state.event.slug}` : null,
            publicationBlockers: blockers,
            canPublish: !published && blockers.length === 0,
            allowedActions: published ? ["edit", "unpublish", "cancel"] : ["edit", "publish", "delete"],
        };
    };
    await page.route("https://data.geopf.fr/**", (route) => route.fulfill({ contentType: "image/png", body: EMPTY_TILE }));
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: comite.name, slug: comite.slug, status: comite.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(comite)));
    await page.route("**/api/me/organization/events/42", (route) => route.fulfill(json(view())));
    await page.route("**/api/me/organization/events/42/publication", (route) => {
        state.event = { ...state.event, status: "published", firstPublishedAt: "2026-11-25T10:00:00+01:00" };

        return route.fulfill(json(view()));
    });
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

/** Brings a heading to the top of the screen. */
async function scrollTo(page, locator) {
    await locator.waitFor();
    await locator.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -16));
}

/** Opens a step of the draft. */
async function openStep(page, step) {
    await page.goto(`/mon-espace/structure/evenements/42?etape=${step}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
}

export const scenes = [
    {
        name: "creer-un-evenement",
        caption: "« Créer un événement » : six étapes, la barre de progression en haut sur ordinateur, « Étape 1 sur 6 » sur téléphone. La première étape demande seulement ce qu'il faut pour créer le brouillon : un titre, une catégorie, une première date.",
        alt: "Le haut du formulaire « Créer un événement » : la progression des étapes (les six en ligne sur ordinateur, « Étape 1 sur 6 » et une barre sur téléphone), puis la carte de l'étape « L'essentiel » avec le champ « Titre de l'événement » et son compteur.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements/nouveau");
            await page.getByRole("heading", { level: 1, name: "L'essentiel" }).waitFor();
            await page.getByRole("textbox", { name: /^Titre/ }).fill("Bal du village");
            await rest(page);
        },
    },
    {
        name: "la-categorie",
        caption: "La catégorie en trois temps : les mêmes tuiles qu'à l'accueil, puis la sous-catégorie principale en pastilles, comme les filtres de la recherche, puis jusqu'à deux sous-catégories secondaires.",
        alt: "La section « Catégorie » : les tuiles Musique et Sport, Musique choisie (anneau et coche), puis « Sous-catégorie principale » avec les pastilles Concert et Bal et soirée dansante, cette dernière cochée, et « Ajouter une sous-catégorie secondaire ».",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements/nouveau");
            await page.getByText("Musique", { exact: true }).click();
            await page.locator("label").filter({ hasText: /^Bal et soirée dansante$/ }).click();
            await scrollTo(page, page.getByRole("group", { name: "Catégorie", exact: true }));
            await rest(page);
        },
    },
    {
        name: "la-premiere-date",
        caption: "Une fin plus tôt que le début, c'est le lendemain : un bal de 21 h à 1 h se tape tel quel, et le formulaire dit ce qu'il a compris : « Se termine le dimanche 13 décembre à 01:00 ».",
        alt: "La section « Première date » remplie : jour 12/12/2026, début 21:00, fin 01:00 avec l'aide « Après minuit ? Indiquez l'heure, par exemple 01:00 : elle compte pour le lendemain. », puis l'écho « Se termine le dimanche 13 décembre à 01:00. » et le bouton « Créer le brouillon et continuer ».",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements/nouveau");
            await page.getByLabel(/^Jour/).fill("2026-12-12");
            await page.getByLabel(/^Début/).fill("21:00");
            await page.getByLabel(/^Fin/).fill("01:00");
            await scrollTo(page, page.getByRole("group", { name: /Première date/ }));
            await rest(page);
        },
    },
    {
        name: "tarif-et-reservation",
        caption: "Le tarif et la réservation en pastilles : le prix n'apparaît que pour « Payant », les détails pour « Plusieurs tarifs », et l'aide de la réservation suit le choix.",
        alt: "L'étape « Tarif et réservation » : les pastilles Gratuit, Payant (choisie), Non précisé, le champ « Prix d'une entrée, en euros » à 8, la pastille « Plusieurs tarifs » cochée avec ses détails, puis « Comment réserver ? » avec « Sur votre site » choisie et son lien.",
        async play(page) {
            await logIn(page);
            await openStep(page, "tarif");
            await page.getByText("Payant", { exact: true }).click();
            await page.getByRole("textbox", { name: /^Prix/ }).fill("8");
            await page.getByText("Plusieurs tarifs (prévente, réduit…)").click();
            await page.getByRole("textbox", { name: /^Détails du tarif/ }).fill("6 € en prévente, gratuit pour les moins de 12 ans.");
            await rest(page);
        },
    },
    {
        name: "plus-d-infos",
        caption: "« Pour aller plus loin » : l'accessibilité toujours visible, le reste à la demande. Chaque pastille de « Je veux préciser : » fait apparaître son champ ; la retirer garde ce qui a été tapé.",
        alt: "L'étape « Pour aller plus loin » : le champ « Accessibilité » rempli, puis « Je veux préciser : » avec les pastilles Âge conseillé, Infos pratiques, Restauration (cochée), Stationnement et accès, Matériel fourni, Condition physique, et le champ « Restauration » rempli.",
        async play(page) {
            await logIn(page);
            await openStep(page, "infos");
            await scrollTo(page, page.getByRole("textbox", { name: /^Accessibilité/ }));
            await rest(page);
        },
    },
    {
        name: "ce-qui-manque",
        caption: "« Vérifier » : ce qui manque pour publier, dans les mots de l'API ; chaque manque mène à son étape et à son champ. Le brouillon, lui, est déjà enregistré.",
        alt: "L'étape « Vérifier et publier » : « Presque prêt : 2 informations manquent pour publier », « Ajoutez une description courte… · Présentation », « Indiquez le lien de réservation. · Tarif et réservation », puis le récapitulatif de chaque étape avec « Modifier ».",
        async play(page) {
            await logIn(page, { ...READY, shortDescription: null, externalBookingUrl: null });
            await openStep(page, "verifier");
            await rest(page);
        },
    },
    {
        name: "dans-google",
        caption: "« Dans les résultats de Google » : le titre et la description que la page donnera aux moteurs de recherche, faits par les mêmes fonctions que la vraie page. Un aperçu indicatif : Google choisit ce qu'il affiche.",
        alt: "La section « Dans les résultats de Google » : une ligne de résultat avec Epika, l'adresse epika.events › evenements › bal-du-village-la-farlede, le titre « Bal du village, samedi 12 décembre à La Farlède — Epika » et la description courte, puis la mention « Aperçu indicatif ».",
        async play(page) {
            await logIn(page);
            await openStep(page, "verifier");
            await scrollTo(page, page.getByRole("heading", { name: "Dans les résultats de Google" }));
            await rest(page);
        },
    },
    {
        name: "l-apercu",
        caption: "L'aperçu de la page, avant de publier : la vraie page publique, dessinée par ses propres composants, sous un bandeau qui dit où en est l'événement, avec « Publier ».",
        alt: "La page « Aperçu de votre événement » : le bandeau « Brouillon. Voici ce que verront les visiteurs une fois l'événement publié. », le bouton « Publier l'événement », « Revenir à la vérification », puis le début de la page publique du « Bal du village ».",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/evenements/42/apercu");
            await page.getByRole("heading", { level: 1, name: "Aperçu de votre événement" }).waitFor();
            await rest(page);
        },
    },
    {
        name: "en-ligne",
        caption: "Publié : « Votre événement est en ligne », dit à l'écran et aux lecteurs d'écran, avec sa page publique. Rien ne bouge sans que l'organisatrice le décide.",
        alt: "L'étape « Vérifier et publier » après la publication : « Votre événement est en ligne. » dans la ligne d'état, l'encadré « Votre événement est en ligne », « Les visiteurs le trouvent dans la recherche et sur sa page. », les liens « Voir la page publique » et « Retour à Ma structure ».",
        async play(page) {
            await logIn(page);
            await openStep(page, "verifier");
            await page.getByRole("button", { name: "Publier l'événement" }).click();
            await page.getByRole("heading", { name: "Votre événement est en ligne" }).waitFor();
            await page.evaluate(() => window.scrollTo(0, 0));
            await rest(page);
        },
    },
    {
        name: "l-apercu-de-la-carte",
        caption: "Sur un grand écran, l'aperçu de la carte suit la saisie, à droite du formulaire : notre carte d'événement, rien de cliquable. Fermé par défaut ; sur un téléphone, il n'est pas chargé du tout.",
        alt: "L'étape « Présentation » : la description courte et son compteur ; sur ordinateur, à droite, « Aperçu de votre carte » avec la carte du « Bal du village » (Gratuit, Musique, samedi 12 décembre, La Farlède) et « Aperçu indicatif ».",
        async play(page) {
            await page.addInitScript(() => window.localStorage.setItem("epika.apercu-masque", "0"));
            await logIn(page);
            await openStep(page, "presentation");
            await rest(page);
        },
    },
];
