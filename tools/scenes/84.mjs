/**
 * The photos and the programme of an event (#84): the step « Photos et programme » empty, a photo being added (its
 * preview, its credit, the box of the rights), a refusal, the list of photos, a removal asked first, the programme and
 * its PDF, the preview of the page, the summary of « Vérifier ». Against Epika's production with the account and event
 * routes replaced by page.route, as in the scenes of #82 and #83. Fictitious person (Camille Martin), organization
 * (Comité des fêtes du village) and event; La Farlède is a real town, public. The « photos » are drawings made here
 * (SVG), never real pictures: this site is public.
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

const BAL = {
    id: 42,
    slug: "bal-du-village-la-farlede",
    status: "draft",
    publicUrl: null,
    timezone: "Europe/Paris",
    title: "Bal du village",
    shortDescription: "Grand bal sur la place, avec un orchestre et une buvette.",
    description: "Le comité des fêtes vous invite au bal de fin d'année : valses, rock et chansons françaises jusqu'à une heure du matin.",
    primarySubcategory: "bal-et-soiree-dansante",
    subcategories: [],
    occurrences: [{ startAt: "2026-12-12T20:00:00+01:00", endAt: "2026-12-13T01:00:00+01:00" }],
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
    firstPublishedAt: null,
    publicationBlockers: [],
    canPublish: true,
    allowedActions: ["edit", "publish", "delete"],
};

const MEDIA = "https://media.epika.test/events";

const PHOTOS = [
    { id: 1, url: `${MEDIA}/lampions.svg`, caption: "La place du village sous les lampions", credit: "Comité des fêtes du village", primary: true, position: 0 },
    { id: 2, url: `${MEDIA}/orchestre.svg`, caption: "L'orchestre sur la scène", credit: "Comité des fêtes du village", primary: false, position: 1 },
    { id: 3, url: `${MEDIA}/piste.svg`, caption: null, credit: "Camille Martin", primary: false, position: 2 },
];

const PROGRAMME = [
    { label: "Ouverture des portes et de la buvette", startsAt: "2026-12-12T20:00:00+01:00" },
    { label: "Initiation aux danses de salon", startsAt: "2026-12-12T20:30:00+01:00" },
    { label: "Le bal, avec l'orchestre", startsAt: "2026-12-12T21:30:00+01:00" },
    { label: "Dernière valse", startsAt: "2026-12-13T00:45:00+01:00" },
];

/** The drawings served as the photos: a night square under lanterns, a stage, a dance floor at sunset. */
function lanterns() {
    const colours = ["#e76f51", "#f4a261", "#e9c46a", "#2a9d8f", "#f4f1de"];
    const garland = (y0, sag, count) =>
        Array.from({ length: count }, (_, index) => {
            const t = (index + 0.5) / count;
            const x = t * 1600;
            const y = y0 + sag * 4 * t * (1 - t);
            return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 18}" stroke="#f4f1de" stroke-width="3"/><ellipse cx="${x}" cy="${y + 52}" rx="28" ry="36" fill="${colours[index % colours.length]}"/>`;
        }).join("");
    const windows = [180, 420, 1180, 1420].map((x) => `<rect x="${x}" y="560" width="70" height="90" rx="6" fill="#f6c453"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
<defs><linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1b3d"/><stop offset="1" stop-color="#3b4b80"/></linearGradient></defs>
<rect width="1600" height="1000" fill="url(#ciel)"/>
<circle cx="1300" cy="140" r="60" fill="#f4f1de" opacity="0.9"/>
<rect x="80" y="420" width="460" height="420" fill="#24304f"/><polygon points="60,430 310,300 560,430" fill="#1b2440"/>
<rect x="1060" y="420" width="460" height="420" fill="#24304f"/><polygon points="1040,430 1290,300 1540,430" fill="#1b2440"/>
${windows}
<path d="M0 200 Q800 560 1600 200" stroke="#f4f1de" stroke-width="3" fill="none"/>
${garland(200, 360, 13)}
<rect y="840" width="1600" height="160" fill="#2b2d42"/>
</svg>`;
}

function orchestra() {
    const musician = (x, height) => `<circle cx="${x}" cy="${700 - height - 40}" r="34" fill="#140a0c"/><rect x="${x - 45}" y="${700 - height}" width="90" height="${height}" rx="30" fill="#140a0c"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
<defs><radialGradient id="salle" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stop-color="#9b2c3a"/><stop offset="1" stop-color="#2b0a10"/></radialGradient></defs>
<rect width="1600" height="1000" fill="url(#salle)"/>
<polygon points="380,0 470,0 700,700 300,700" fill="#fff4d6" opacity="0.18"/>
<polygon points="1130,0 1220,0 1300,700 900,700" fill="#fff4d6" opacity="0.18"/>
<polygon points="760,0 840,0 1000,700 600,700" fill="#fff4d6" opacity="0.22"/>
${musician(480, 200)}${musician(800, 230)}${musician(1120, 190)}
<rect x="980" y="560" width="230" height="40" rx="12" fill="#c9a227"/>
<rect y="700" width="1600" height="300" fill="#5c3d2e"/><rect y="700" width="1600" height="16" fill="#7a5240"/>
</svg>`;
}

function danceFloor() {
    const tree = (x) => `<rect x="${x - 14}" y="430" width="28" height="260" fill="#5b3a29"/><circle cx="${x}" cy="380" r="120" fill="#2d6a4f"/><circle cx="${x - 70}" cy="430" r="80" fill="#40916c"/>`;
    const couple = (x) => `<circle cx="${x}" cy="610" r="26" fill="#1d1d2c"/><rect x="${x - 30}" y="640" width="60" height="150" rx="22" fill="#1d1d2c"/><circle cx="${x + 70}" cy="600" r="26" fill="#1d1d2c"/><path d="M${x + 30} 630 h80 l30 170 h-140 z" fill="#1d1d2c"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
<defs><linearGradient id="soir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a261"/><stop offset="1" stop-color="#e76f51"/></linearGradient></defs>
<rect width="1600" height="1000" fill="url(#soir)"/>
<circle cx="800" cy="560" r="170" fill="#f6d365" opacity="0.8"/>
${tree(160)}${tree(1440)}
<rect y="790" width="1600" height="210" fill="#6d4c41"/>
${couple(420)}${couple(760)}${couple(1080)}
</svg>`;
}

const PICTURES = { "lampions.svg": lanterns(), "orchestre.svg": orchestra(), "piste.svg": danceFloor() };

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const EMPTY_TILE = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/** Camille on her « Bal du village »; its photos, PDF and programme held in memory, changed as the API would. */
async function logIn(page, { photos = [], pdf = false, steps = [] } = {}) {
    const state = { photos: photos.map((photo) => ({ ...photo })), pdf: pdf ? `${MEDIA}/programme-du-bal.pdf` : null, steps };
    const view = () => ({ ...BAL, photos: state.photos, programPdfUrl: state.pdf, programSteps: state.steps });
    await page.route("https://media.epika.test/**", (route) => {
        const name = new URL(route.request().url()).pathname.split("/").pop();
        return route.fulfill({ contentType: "image/svg+xml", body: PICTURES[name] ?? PICTURES["lampions.svg"] });
    });
    await page.route("https://data.geopf.fr/**", (route) => route.fulfill({ contentType: "image/png", body: EMPTY_TILE }));
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: comite.name, slug: comite.slug, status: comite.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(comite)));
    await page.route("**/api/me/organization/events/42", (route) => route.fulfill(json(view())));
}

/** The drawing of the dance floor as a PNG file, the way a phone would hand over a picture. */
async function pictureFile(page) {
    const svg = PICTURES["piste.svg"];
    const dataUrl = await page.evaluate(
        (source) =>
            new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 800;
                    canvas.height = 500;
                    canvas.getContext("2d").drawImage(image, 0, 0, 800, 500);
                    resolve(canvas.toDataURL("image/png"));
                };
                image.onerror = reject;
                image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
            }),
        svg,
    );
    return { name: "IMG_2041.png", mimeType: "image/png", buffer: Buffer.from(dataUrl.split(",")[1], "base64") };
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

async function openStep(page) {
    await page.goto("/mon-espace/structure/evenements/42?etape=photos");
    await page.getByRole("heading", { level: 1, name: "Photos et programme" }).waitFor();
}

const uploadPanel = (page) => page.getByRole("group", { name: "Ajouter une photo" });

/** Every photo of the list drawn before the shot. */
async function photosLoaded(page) {
    await page.waitForFunction(() => [...document.querySelectorAll("li img")].every((image) => image.complete && image.naturalWidth > 0));
}

export const scenes = [
    {
        name: "l-etape-photos-et-programme",
        caption: "Une nouvelle étape du formulaire, entre « Présentation » et « Le lieu » : les photos, le programme et son PDF. Tout y est facultatif ; un événement sans photo garde l'image par défaut.",
        alt: "L'étape « Photos et programme », troisième sur sept : la section « Photos » (0 / 10, « Facultatif : ajoutez jusqu'à 10 photos. La première sera l'image des cartes de l'événement. », bouton « Ajouter une photo »), puis le début de la section « Programme » (« Facultatif · 30 étapes au plus »).",
        async play(page) {
            await logIn(page);
            await openStep(page);
            await rest(page);
        },
    },
    {
        name: "ajouter-une-photo",
        caption: "« Ajouter une photo » : le fichier et son aperçu tout de suite, le crédit (obligatoire), une légende, et la case des droits, jamais cochée d'avance : l'accord est donné pour chaque photo, et son moment est gardé.",
        alt: "Le panneau « Ajouter une photo » : l'aperçu de l'image choisie (un dessin de couples qui dansent au coucher du soleil), le champ « La photo » (« JPEG, PNG ou WebP, 10 Mo au plus. », fichier IMG_2041.png), « Crédit » rempli avec « Camille Martin », « Légende » avec « La piste de danse au coucher du soleil », la case cochée « Je détiens les droits sur cette photo, et les personnes reconnaissables ont donné leur accord. », et les boutons « Envoyer la photo » et « Fermer sans envoyer ».",
        async play(page) {
            const file = await pictureFile(page);
            await logIn(page, { photos: PHOTOS.slice(0, 2) });
            await openStep(page);
            await page.getByRole("button", { name: "Ajouter une photo" }).click();
            await uploadPanel(page).getByLabel(/^La photo/).setInputFiles(file);
            await uploadPanel(page).getByRole("img", { name: "Aperçu de la photo choisie" }).waitFor();
            await uploadPanel(page).getByLabel(/^Crédit/).fill("Camille Martin");
            await uploadPanel(page).getByLabel(/^Légende/).fill("La piste de danse au coucher du soleil");
            await uploadPanel(page).getByText(/^Je détiens les droits/).click();
            await scrollTo(page, page.getByRole("heading", { level: 3, name: "Ajouter une photo" }));
            await rest(page);
        },
    },
    {
        name: "un-envoi-incomplet",
        caption: "Rien ne part tant qu'il manque quelque chose : chaque oubli est dit sous son champ, et le curseur va sur le premier à corriger.",
        alt: "Le panneau « Ajouter une photo » avec trois messages rouges : « Choisissez une photo à envoyer. » sous le champ du fichier, « Indiquez le crédit de la photo (son auteur ou son ayant droit). » sous le crédit, « Confirmez que vous détenez les droits sur cette photo et l'accord des personnes reconnaissables. » sous la case.",
        async play(page) {
            await logIn(page);
            await openStep(page);
            await page.getByRole("button", { name: "Ajouter une photo" }).click();
            await uploadPanel(page).getByRole("button", { name: "Envoyer la photo" }).click();
            await uploadPanel(page).getByText("Choisissez une photo à envoyer.").waitFor();
            await scrollTo(page, page.getByRole("heading", { level: 3, name: "Ajouter une photo" }));
            await rest(page);
        },
    },
    {
        name: "les-photos",
        caption: "Les photos de l'événement : la première est l'image des cartes, une autre peut le devenir. « Monter » et « Descendre » changent l'ordre, « Modifier » change la légende et le crédit sur place.",
        alt: "La section « Photos », 3 / 10 : trois lignes avec leur miniature. La première, des lampions sur la place la nuit, porte la pastille « Image principale », sa légende « La place du village sous les lampions » et « Crédit : Comité des fêtes du village », avec les boutons Monter (grisé), Descendre, Modifier, Supprimer. La deuxième, l'orchestre sur la scène, a en plus « Choisir comme image principale ». La troisième, « Sans légende », crédit Camille Martin.",
        async play(page) {
            await logIn(page, { photos: PHOTOS });
            await openStep(page);
            await photosLoaded(page);
            await scrollTo(page, page.getByRole("heading", { level: 2, name: "Photos" }));
            await rest(page);
        },
    },
    {
        name: "supprimer-une-photo",
        caption: "Supprimer demande d'abord, sur place : le curseur est sur « Garder », pour qu'un appui sur Entrée par réflexe ne supprime rien.",
        alt: "La deuxième photo, l'orchestre sur la scène, avec à la place de ses boutons un encadré rose « Supprimer cette photo ? » et les boutons « Supprimer la photo » et « Garder ».",
        async play(page) {
            await logIn(page, { photos: PHOTOS });
            await openStep(page);
            await photosLoaded(page);
            await page.getByRole("button", { name: "Supprimer : photo 2" }).click();
            await page.getByRole("button", { name: "Garder" }).waitFor();
            await scrollTo(page, page.getByRole("listitem", { name: "Photo 2" }));
            await rest(page);
        },
    },
    {
        name: "le-programme-et-son-pdf",
        caption: "Le programme, étape par étape, chacune avec son heure si elle en a une ; dessous, le PDF du programme, qui s'ouvre dans un nouvel onglet, et peut être remplacé ou retiré.",
        alt: "La section « Programme » avec « Étape 1 » (Ouverture des portes et de la buvette, 12/12/2026, 20:00), « Étape 2 » (Initiation aux danses de salon, 20:30), « Étape 3 » (Le bal, avec l'orchestre, 21:30), chacune avec ses champs Libellé, Jour et Heure et un bouton Supprimer ; sur ordinateur, plus bas, « Étape 4 » (Dernière valse, 13/12/2026, 00:45), « Ajouter une étape », puis « PDF du programme » avec le lien « Voir le PDF du programme » et les boutons Remplacer et Retirer.",
        async play(page) {
            await logIn(page, { pdf: true, steps: PROGRAMME });
            await openStep(page);
            await scrollTo(page, page.getByRole("heading", { level: 2, name: "Programme", exact: true }));
            await rest(page);
        },
    },
    {
        name: "l-apercu-avec-les-photos",
        caption: "L'aperçu de la page, avant de publier : l'image principale en tête, avec son crédit, et les autres photos dans le carrousel, comme le verront les visiteurs.",
        alt: "La page « Aperçu de votre événement » : le bandeau « Brouillon. Voici ce que verront les visiteurs une fois l'événement publié. » avec « Publier l'événement », puis la grande image des lampions sur la place la nuit, son crédit « © Comité des fêtes du village », les flèches et trois points du carrousel, et le début de la page du « Bal du village ».",
        async play(page) {
            await logIn(page, { photos: PHOTOS, pdf: true, steps: PROGRAMME });
            await page.goto("/mon-espace/structure/evenements/42/apercu");
            await page.getByRole("heading", { level: 1, name: "Aperçu de votre événement" }).waitFor();
            const primary = page.getByRole("img", { name: "La place du village sous les lampions" }).first();
            await primary.waitFor();
            await page.waitForFunction(() => [...document.querySelectorAll("main img")].every((image) => image.complete));
            await scrollTo(page, page.getByText("Voici ce que verront les visiteurs", { exact: false }).first());
            await rest(page);
        },
    },
    {
        name: "l-apercu-du-programme",
        caption: "Plus bas dans l'aperçu, le « Programme détaillé », heure par heure, et le lien pour télécharger le programme en PDF.",
        alt: "La section « Programme détaillé » de l'aperçu : 20:00 Ouverture des portes et de la buvette, 20:30 Initiation aux danses de salon, 21:30 Le bal, avec l'orchestre, 00:45 Dernière valse, puis le lien « Télécharger le programme (PDF) ».",
        async play(page) {
            await logIn(page, { photos: PHOTOS, pdf: true, steps: PROGRAMME });
            await page.goto("/mon-espace/structure/evenements/42/apercu");
            await scrollTo(page, page.getByRole("heading", { name: "Programme détaillé" }));
            await rest(page);
        },
    },
    {
        name: "verifier",
        caption: "À l'étape « Vérifier », le résumé dit ce que l'étape contient : « 3 photos · programme en 4 étapes · PDF du programme ».",
        alt: "Le récapitulatif de l'étape « Vérifier et publier » : la ligne « Photos et programme » dit « 3 photos · programme en 4 étapes · PDF du programme », avec un lien Modifier, entre « Présentation » et « Le lieu ».",
        async play(page) {
            await logIn(page, { photos: PHOTOS, pdf: true, steps: PROGRAMME });
            await page.goto("/mon-espace/structure/evenements/42?etape=verifier");
            await page.getByRole("heading", { level: 1, name: "Vérifier et publier" }).waitFor();
            await scrollTo(page, page.getByText(/programme en 4 étapes/));
            await rest(page);
        },
    },
];
