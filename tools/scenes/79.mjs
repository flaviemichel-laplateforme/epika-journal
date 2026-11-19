/**
 * Declare my organization (#79): « Ma structure » in each of its states, against Epika's production with the account
 * routes replaced by page.route, as in Epika's e2e/organization.spec.ts (the fake API has no account routes).
 * Fictitious person only (Camille Martin, camille.martin@example.com). The Ville de Paris and the commune of La Farlède
 * are public bodies: their names and SIRET are public data of the State's company directory.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

const camille = {
    id: 1,
    email: "camille.martin@example.com",
    firstName: "Camille",
    lastName: "Martin",
    phone: null,
    city: null,
    roles: ["ROLE_USER"],
    emailVerified: true,
};

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const none = { status: 404, contentType: "application/problem+json", body: JSON.stringify({ status: 404, detail: "Aucune structure déclarée." }) };

const paris = {
    name: "Ville de Paris",
    slug: "ville-de-paris",
    type: "government",
    registrationNumber: "21750001600019",
    postalCode: "75004",
    city: "Paris",
    status: "approved",
    lastDecision: { status: "approved", reason: null, processedAt: "2026-11-19T10:00:00+01:00", automatic: true },
    trust: { level: "probation", probationEndsAt: "2026-12-19T10:00:00+01:00", weeklyEventQuota: 3 },
};
const mairie = {
    name: "Mairie",
    slug: "mairie",
    type: "government",
    registrationNumber: "21830054900019",
    postalCode: "83210",
    city: "La Farlède",
    status: "pending",
    lastDecision: null,
    trust: null,
};
const association = {
    name: "Les Amis du Vieux Moulin",
    slug: "les-amis-du-vieux-moulin",
    type: "nonprofit",
    registrationNumber: "W831000123",
    postalCode: "83210",
    city: "La Farlède",
    status: "rejected",
    lastDecision: { status: "rejected", reason: "Le numéro RNA ne correspond pas au nom déclaré : vérifiez-le sur votre récépissé de déclaration.", processedAt: "2026-11-18T15:00:00+01:00", automatic: false },
    trust: null,
};

/**
 * Logged in as Camille, with this organization (or none). A declaration answers `answer` (or never, to shoot the check
 * in progress); GET /api/me/organization then gives what was answered.
 */
async function logIn(page, initial, { answer = null, hang = false } = {}) {
    let organization = initial;
    const summary = () => (organization === null ? null : { name: organization.name, slug: organization.slug, status: organization.status });
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: summary() })));
    await page.route("**/api/me/organization", (route) => {
        if (route.request().method() === "GET") {
            return route.fulfill(organization === null ? none : json(organization));
        }
        if (hang) {
            return new Promise(() => {});
        }
        organization = answer;

        return route.fulfill(json(organization, 201));
    });
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

async function open(page) {
    await page.goto("/mon-espace/structure");
    await page.getByRole("heading", { level: 2 }).first().waitFor();
}

async function fill(page, { name, type, number, postalCode, city }) {
    await page.getByRole("textbox", { name: /Nom de la structure/ }).fill(name);
    await page.getByRole("radio", { name: type }).check();
    await page.getByRole("textbox", { name: /Numéro d'identification/ }).fill(number);
    await page.getByRole("textbox", { name: /Code postal/ }).fill(postalCode);
    await page.getByRole("textbox", { name: /Ville/ }).fill(city);
}

const parisForm = { name: "Ville de Paris", type: "Collectivité ou mairie", number: "217 500 016 00019", postalCode: "75004", city: "Paris" };

async function centre(locator) {
    await locator.evaluate((element) => element.scrollIntoView({ block: "center" }));
}

export const scenes = [
    {
        name: "declarer",
        caption: "« Ma structure », sans structure : cinq champs seulement. Le texte sous le numéro change avec le type, et annonce qu'un SIRET au nom de l'annuaire peut être validé tout de suite.",
        alt: "Le formulaire « Déclarer ma structure » rempli : « Ville de Paris », le type « Collectivité ou mairie » coché, le SIRET avec son aide, le code postal 75004 et la ville Paris.",
        async play(page, context, format) {
            await logIn(page, null);
            await open(page);
            await fill(page, parisForm);
            // On a desktop, the whole form down to its button; on a phone, the type and the hint of the number.
            await centre(format === "desktop" ? page.getByRole("textbox", { name: /Numéro d'identification/ }) : page.getByRole("radio", { name: "Collectivité ou mairie" }));
            await rest(page);
        },
    },
    {
        name: "verification",
        caption: "Pendant l'envoi, Epika interroge l'annuaire des entreprises de l'État : le bouton dit « Vérification… », et une phrase l'annonce aussi aux lecteurs d'écran. Cela prend une seconde, sept au pire.",
        alt: "Le bouton « Vérification… » désactivé, et sous lui la phrase « Vérification de votre numéro auprès de l'annuaire des entreprises… Cela peut prendre quelques secondes. »",
        async play(page) {
            await logIn(page, null, { hang: true });
            await open(page);
            await fill(page, parisForm);
            await page.getByRole("button", { name: "Déclarer ma structure" }).click();
            const button = page.getByRole("button", { name: "Vérification…" });
            await button.waitFor();
            await centre(button);
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "validee-a-l-essai",
        caption: "Le SIRET correspond au nom de l'annuaire : la structure est validée à l'instant, sans attendre personne. Elle est à l'essai pendant 30 jours, à 3 événements par semaine, et la page le dit en toutes lettres.",
        alt: "« Ville de Paris » avec le badge « Validée », la frise terminée, et sous « Et maintenant ? » : « Jusqu'au 19 décembre 2026, elle est à l'essai : vous pourrez publier jusqu'à 3 événements par semaine. »",
        async play(page, context, format) {
            await logIn(page, null, { answer: paris });
            await open(page);
            await fill(page, parisForm);
            await page.getByRole("button", { name: "Déclarer ma structure" }).click();
            const probation = page.getByText("Jusqu'au 19 décembre 2026", { exact: false });
            await probation.waitFor();
            // On a phone the probation is below the steps: brought to the middle of the screen.
            if (format === "desktop") {
                await page.evaluate(() => window.scrollTo(0, 0));
            } else {
                await centre(probation);
            }
            await rest(page);
        },
    },
    {
        name: "en-attente",
        caption: "« Mairie » avec le SIRET de La Farlède : le numéro existe, mais le nom n'est pas celui de l'annuaire (« Commune de La Farlède »). Epika ne refuse jamais seul : la structure attend un administrateur, qui reçoit la raison par e-mail.",
        alt: "« Mairie » avec le badge « En attente de validation », la frise sur l'étape « Vérification », « Et maintenant ? », le récapitulatif et le bouton « Corriger ma déclaration ».",
        async play(page) {
            await logIn(page, null, { answer: mairie });
            await open(page);
            await fill(page, { name: "Mairie", type: "Collectivité ou mairie", number: "21830054900019", postalCode: "83210", city: "La Farlède" });
            await page.getByRole("button", { name: "Déclarer ma structure" }).click();
            await page.getByRole("button", { name: "Corriger ma déclaration" }).waitFor();
            await page.evaluate(() => window.scrollTo(0, 0));
            await rest(page);
        },
    },
    {
        name: "numero-invalide",
        caption: "Une faute de frappe dans le SIRET : la clé de contrôle ne tombe pas juste. L'erreur s'affiche sous le champ, qui reçoit le focus, et rien n'est envoyé, ni à Epika ni à l'annuaire.",
        alt: "Le champ « Numéro d'identification » en erreur, avec le message « Numéro invalide (faute de frappe ?) ».",
        async play(page) {
            await logIn(page, null);
            await open(page);
            await fill(page, { ...parisForm, number: "21750001600018" });
            await page.getByRole("button", { name: "Déclarer ma structure" }).click();
            const error = page.getByText("Numéro invalide (faute de frappe ?)");
            await error.waitFor();
            await centre(error);
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "refusee",
        caption: "Refusée par un administrateur : le motif est écrit en clair, et le formulaire est pré-rempli. On corrige, puis « Renvoyer pour validation » : la structure repasse en attente, et le refus reste dans l'historique.",
        alt: "« Les Amis du Vieux Moulin » avec le badge « Refusée », le motif sur fond rouge clair, « Et maintenant ? » et le formulaire pré-rempli.",
        async play(page) {
            await logIn(page, association);
            await open(page);
            await page.getByText("Motif :").waitFor();
            await rest(page);
        },
    },
    {
        name: "suspendue",
        caption: "Suspendue : ses événements ne sont plus visibles, et plus rien n'est modifiable. Le motif est affiché, avec le chemin pour contacter l'équipe.",
        alt: "« Les Amis du Vieux Moulin » avec le badge « Suspendue », le motif « Événements trompeurs signalés à plusieurs reprises. » et « Et maintenant ? ».",
        async play(page) {
            await logIn(page, {
                ...association,
                status: "suspended",
                lastDecision: { status: "suspended", reason: "Événements trompeurs signalés à plusieurs reprises.", processedAt: "2026-11-19T09:00:00+01:00", automatic: false },
            });
            await open(page);
            await page.getByText("Motif :").waitFor();
            await rest(page);
        },
    },
];
