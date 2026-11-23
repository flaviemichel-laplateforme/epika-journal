/**
 * The events of an organizer (#81): the only screens it changed, both in its first pull request — the probation that
 * limits nothing any more (« Ma structure »), and a complete profile asked at every publication, no longer « the first »
 * (« Ma structure » and « Mon profil public »). Against Epika's production with the account routes replaced by
 * page.route, as in the scenes of #79 and #80 (the fake API has no account routes).
 * Fictitious person only (Camille Martin). The Ville de Paris is a public body: its name and SIRET are public data of
 * the State's company directory. Each scene starts from a fresh browser.
 */

const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", phone: null, city: null, roles: ["ROLE_USER"], emailVerified: true };

/** Approved automatically on 19/11/2026: on probation for 30 days; its profile not filled yet. */
const paris = {
    name: "Ville de Paris",
    slug: "ville-de-paris",
    type: "government",
    registrationNumber: "21750001600019",
    postalCode: "75004",
    city: "Paris",
    status: "approved",
    lastDecision: { status: "approved", reason: null, processedAt: "2026-11-19T10:00:00+01:00", automatic: true },
    trust: { level: "probation", probationEndsAt: "2026-12-19T10:00:00+01:00" },
    description: null,
    logoUrl: null,
    crestUrl: null,
    street: null,
    website: null,
    facebookUrl: null,
    instagramUrl: null,
    profileComplete: false,
    missingProfileFields: ["description", "image"],
};

const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

async function logIn(page) {
    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: paris.name, slug: paris.slug, status: paris.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(paris)));
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "periode-d-essai",
        caption: "Validée automatiquement grâce à son SIRET, la structure est à l'essai pendant 30 jours. Elle ne limite plus rien : l'équipe d'Epika peut relire ses événements. Et l'encadré « Profil public » ne parle plus d'un « premier » événement : le profil complet est demandé à chaque publication.",
        alt: "La page « Ma structure » de la Ville de Paris, validée : « Jusqu'au 19 décembre 2026, elle est à l'essai : pendant cette période, l'équipe d'Epika peut relire vos événements. », puis l'encadré « Profil public » : « Pour publier un événement, votre profil doit être complet. Il manque : une description d'au moins 80 caractères, un logo ou un blason. »",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure");
            const nextSteps = page.getByRole("heading", { level: 3, name: "Et maintenant ?" });
            await nextSteps.waitFor();
            await nextSteps.evaluate((element) => element.scrollIntoView({ block: "start" }));
            await rest(page);
        },
    },
    {
        name: "profil-pour-publier",
        caption: "« Mon profil public » : un profil complet est nécessaire pour publier ses événements, à chaque publication. Chaque élément qui manque mène à son champ.",
        alt: "Le haut de la page « Mon profil public » : « État du profil », « Un profil complet est nécessaire pour publier vos événements. Il manque : » puis la liste : une description d'au moins 80 caractères, un logo ou un blason.",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure/profil");
            await page.getByRole("heading", { level: 2, name: "État du profil" }).waitFor();
            await page.evaluate(() => window.scrollTo(0, 0));
            await rest(page);
        },
    },
];
