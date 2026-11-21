/**
 * The profile of an organization (#80): « Mon profil public » and the box of « Ma structure », against Epika's
 * production with the account routes replaced by page.route, as in Epika's e2e/organization-profile.spec.ts (the fake
 * API has no account routes). Fictitious person (Camille Martin) and fictitious association (« Comité des fêtes du
 * Vieux Moulin »); the logo is drawn for the journal (80-logo.png). Each scene starts from a fresh browser.
 */
import { readFileSync } from "node:fs";

const LOGO = readFileSync(new URL("./80-logo.png", import.meta.url));
const MEDIA = "https://api.epika.test/media/organizations/";
const DESCRIPTION =
    "Le comité anime le village toute l'année : la fête de la Saint-Jean et son feu, le marché de Noël, le vide-grenier du printemps et le bal du 14 juillet. Bénévoles bienvenus !";

const camille = { id: 1, email: "camille.martin@example.com", firstName: "Camille", lastName: "Martin", phone: null, city: null, roles: ["ROLE_USER"], emailVerified: true };

const base = {
    name: "Comité des fêtes du Vieux Moulin",
    slug: "comite-des-fetes-du-vieux-moulin",
    type: "nonprofit",
    registrationNumber: "W831000123",
    postalCode: "83210",
    city: "La Farlède",
    status: "approved",
    lastDecision: { status: "approved", reason: null, processedAt: "2026-11-18T10:00:00+01:00", automatic: false },
    trust: { level: "confirmed", probationEndsAt: null, weeklyEventQuota: null },
    description: null,
    logoUrl: null,
    crestUrl: null,
    street: "1 place de la Mairie",
    website: null,
    facebookUrl: null,
    instagramUrl: null,
};

/** Logged in as Camille, managing this organization; the routes of the profile answer as the API does. */
async function logIn(page, initial = {}, { refuseImage = false } = {}) {
    let organization = { ...base, ...initial };
    const answer = () => {
        const missing = [(organization.description ?? "").trim().length < 80 ? "description" : null, organization.logoUrl ? null : "image"].filter(Boolean);

        return { ...organization, profileComplete: missing.length === 0, missingProfileFields: missing };
    };
    const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

    await page.route("**/api/me", (route) => route.fulfill(json({ ...camille, organization: { name: organization.name, slug: organization.slug, status: organization.status } })));
    await page.route("**/api/me/organization", (route) => route.fulfill(json(answer())));
    await page.route("**/api/me/organization/profile", (route) => {
        organization = { ...organization, ...route.request().postDataJSON() };

        return route.fulfill(json(answer()));
    });
    await page.route("**/api/me/organization/logo", (route) => {
        if (refuseImage) {
            return route.fulfill(json({ status: 422, violations: [{ propertyPath: "file", message: "L'image est trop petite : au moins 100 pixels de côté, pour rester nette." }] }, 422));
        }
        organization = { ...organization, logoUrl: `${MEDIA}logo.webp` };

        return route.fulfill(json(answer()));
    });
    await page.route(`${MEDIA}**`, (route) => route.fulfill({ contentType: "image/png", body: LOGO }));
}

/** No caret, no hover, no focus ring left by the script in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

async function openProfile(page) {
    await page.goto("/mon-espace/structure/profil");
    await page.getByRole("heading", { level: 2, name: "Aperçu de ma fiche" }).waitFor();
}

const section = (page, name) => page.locator("section", { has: page.getByRole("heading", { level: 2, name }) });

async function chooseLogo(page) {
    await page.getByLabel("Choisir un logo").setInputFiles({ name: "logo-comite.png", mimeType: "image/png", buffer: LOGO });
    await page.getByRole("checkbox", { name: "Je détiens les droits sur cette image." }).check();
}

export const scenes = [
    {
        name: "ma-structure",
        caption: "Dans « Ma structure », un nouvel encadré « Profil public » : ce qui manque encore pour publier un premier événement, et le chemin pour le compléter.",
        alt: "La page « Ma structure » d'une association validée, avec l'encadré « Profil public » : « Il manque : une description d'au moins 80 caractères, un logo » et le bouton « Compléter mon profil ».",
        async play(page) {
            await logIn(page);
            await page.goto("/mon-espace/structure");
            const box = page.getByRole("heading", { level: 3, name: "Profil public" });
            await box.waitFor();
            await box.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "profil-a-completer",
        caption: "« Mon profil public » : en haut, ce qui manque, chaque élément menant à son champ. Puis ce qui a été vérifié à la validation (le nom, le type, le numéro), qui ne se change plus ici.",
        alt: "Le haut de la page « Mon profil public » : « État du profil » avec la liste de ce qui manque, puis « Ce qui a été vérifié » avec le nom, le type et le numéro.",
        async play(page) {
            await logIn(page);
            await openProfile(page);
            await page.evaluate(() => window.scrollTo(0, 0));
            await rest(page);
        },
    },
    {
        name: "logo-choisi",
        caption: "Un logo choisi : son aperçu tel que les visiteurs le verront, en entier dans un carré. La case des droits n'est jamais cochée d'avance : on la coche pour chaque image.",
        alt: "La section « Logo » : l'aperçu du logo choisi, le champ du fichier, la case « Je détiens les droits sur cette image. » cochée et le bouton « Enregistrer le logo ».",
        async play(page) {
            await logIn(page);
            await openProfile(page);
            await chooseLogo(page);
            await section(page, "Logo").evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "logo-enregistre",
        caption: "Enregistré : le serveur l'a vérifié et réduit en WebP sans ses métadonnées. La page annonce que le profil est maintenant complet, et la case se décoche.",
        alt: "La section « Logo » après l'envoi : le logo actuel, la case décochée, le bouton « Retirer le logo » et le message « Logo enregistré. Votre profil est complet. ».",
        async play(page) {
            await logIn(page, { description: DESCRIPTION });
            await openProfile(page);
            await chooseLogo(page);
            await page.getByRole("button", { name: "Enregistrer le logo" }).click();
            const done = page.getByText("Logo enregistré. Votre profil est complet.");
            await done.waitFor();
            await done.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await rest(page);
        },
    },
    {
        name: "logo-refuse",
        caption: "Une image refusée par le serveur : la raison s'affiche sous le champ, qui reçoit le focus, dans des mots qui disent quoi faire.",
        alt: "Le champ du logo en erreur, avec le message « L'image est trop petite : au moins 100 pixels de côté, pour rester nette. ».",
        async play(page) {
            await logIn(page, {}, { refuseImage: true });
            await openProfile(page);
            await chooseLogo(page);
            await page.getByRole("button", { name: "Enregistrer le logo" }).click();
            const error = page.getByText("L'image est trop petite : au moins 100 pixels de côté, pour rester nette.");
            await error.waitFor();
            await error.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await page.mouse.move(0, 0);
        },
    },
    {
        name: "texte",
        caption: "La présentation, avec son compteur, les coordonnées et les liens. La rue reste privée : seule la ville apparaît sur la page publique.",
        alt: "La section « Présentation et coordonnées » remplie : la présentation avec son compteur, le code postal, la ville, la rue avec « Jamais affichée sur votre page publique », le site web et la page Facebook.",
        async play(page) {
            await logIn(page);
            await openProfile(page);
            await page.getByRole("textbox", { name: "Présentation" }).fill(DESCRIPTION);
            await page.getByRole("textbox", { name: /Site web/ }).fill("https://comite-vieux-moulin.example.org");
            await page.getByRole("textbox", { name: /Facebook/ }).fill("https://www.facebook.com/comite.vieux.moulin");
            await page.getByRole("button", { name: "Enregistrer le profil" }).click();
            await page.getByText("Votre profil est enregistré.", { exact: true }).waitFor();
            await section(page, "Présentation et coordonnées").evaluate((element) => element.scrollIntoView({ block: "start" }));
            await rest(page);
        },
    },
    {
        name: "apercu",
        caption: "« Aperçu de ma fiche » : le bandeau même de la page publique, sans copie. Ce que la gérante voit ici est exactement ce que verront les visiteurs.",
        alt: "La section « Aperçu de ma fiche » : le logo du comité dans un carré arrondi, le nom, « Association », « 83210 La Farlède », les liens « Site web » et « Facebook », puis la présentation.",
        async play(page) {
            await logIn(page, {
                description: DESCRIPTION,
                logoUrl: `${MEDIA}logo.webp`,
                website: "https://comite-vieux-moulin.example.org",
                facebookUrl: "https://www.facebook.com/comite.vieux.moulin",
            });
            await openProfile(page);
            await section(page, "Aperçu de ma fiche").evaluate((element) => element.scrollIntoView({ block: "start" }));
            await rest(page);
        },
    },
];
