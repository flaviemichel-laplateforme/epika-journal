/**
 * The imported images (#66, IMP-14), against Epika's fake API: the diving event has a photo at
 * https://img.openagenda.com/main/plongee-bapteme.jpg, which does not exist on OpenAgenda. Each scene serves an example
 * image for that address, drawn by the browser and saying it is an example: nothing real is shown or copied.
 * Each scene starts from a fresh browser; play() leaves the page as it must be shot.
 */

/** A sea-coloured example image (1200 × 800), drawn in a tab of its own, labelled as an example. */
async function exampleImage(context) {
    const tab = await context.newPage();
    await tab.setViewportSize({ width: 1200, height: 800 });
    await tab.setContent(`<body style="margin:0">
        <div style="width:1200px;height:800px;display:flex;align-items:center;justify-content:center;
            background:linear-gradient(160deg,#0e5a8a 0%,#1b8fb8 45%,#47c3c9 75%,#e0f7f5 100%);
            font:700 64px system-ui,sans-serif;color:#ffffff;text-shadow:0 2px 12px rgba(0,0,0,.35);text-align:center">
            Photo d'OpenAgenda<br>(exemple)
        </div></body>`);
    const image = await tab.screenshot({ type: "png" });
    await tab.close();

    return image;
}

/** No caret, no hover in the shot. */
async function rest(page) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
}

export const scenes = [
    {
        name: "photo-directe",
        caption: "La photo d'un événement importé est chargée par le navigateur directement depuis OpenAgenda, avec son crédit. Elle ne passe jamais par notre serveur : aucune copie n'est faite.",
        alt: "La fiche « Plongée sous-marine » avec sa photo d'exemple venue d'OpenAgenda et le crédit « © Club de plongée ».",
        async play(page, context) {
            const image = await exampleImage(context);
            await page.route("https://img.openagenda.com/**", (route) => route.fulfill({ contentType: "image/png", body: image }));
            await page.goto("/evenements/plongee");
            await page.getByText("© Club de plongée").waitFor();
            await page.waitForFunction(() => [...document.images].some((img) => img.src.startsWith("https://img.openagenda.com/") && img.complete && img.naturalWidth > 0));
            await rest(page);
        },
    },
    {
        name: "photo-manquante",
        caption: "Une photo qu'OpenAgenda ne sert plus (retirée par son auteur, ou OpenAgenda en panne) : l'image de remplacement d'Epika prend sa place, la page reste propre.",
        alt: "La fiche « Plongée sous-marine » avec l'image de remplacement d'Epika à la place de la photo.",
        async play(page) {
            await page.route("https://img.openagenda.com/**", (route) => route.fulfill({ status: 404 }));
            await page.goto("/evenements/plongee");
            await page.locator('img[src*="evenement-sans-photo.webp"]').first().waitFor();
            await rest(page);
        },
    },
    {
        name: "interrupteur",
        caption: "L'interrupteur global, reconstitué ici avec les messages exacts de la commande : « hide » masque toutes les photos importées d'un coup, sans redéployer ; « show » les rend. Rien n'est supprimé.",
        alt: "Un terminal qui montre la commande app:openagenda:images hide puis show, et leurs messages.",
        async play(page) {
            await page.setContent(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
                body { margin: 0; min-height: 100vh; background: #0d0c26; display: flex; align-items: center; justify-content: center; font-family: "Cascadia Mono", Consolas, monospace; }
                .term { width: min(92vw, 980px); background: #16153a; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.45); overflow: hidden; }
                .bar { background: #2e2c5a; padding: 10px 14px; display: flex; gap: 8px; }
                .bar i { width: 12px; height: 12px; border-radius: 50%; background: #aeadc9; opacity: .6; }
                pre { margin: 0; padding: 22px; color: #ecebf7; font-size: clamp(12px, 3.2vw, 17px); line-height: 1.7; white-space: pre-wrap; }
                .p { color: #5fd3d8; } .ok { color: #6ee2da; font-weight: 700; } .note { color: #ffc27a; }
            </style></head><body><div class="term"><div class="bar"><i></i><i></i><i></i></div><pre><span class="p">backend $</span> php bin/console app:openagenda:images hide

<span class="ok"> [OK] Images importées : masquées partout (fiches, cartes, partages).</span>

<span class="note"> ! [NOTE] Les photos restent enregistrées : rien n'est supprimé.</span>

<span class="p">backend $</span> php bin/console app:openagenda:images show

<span class="ok"> [OK] Images importées : affichées.</span>

<span class="note"> ! [NOTE] Les photos restent enregistrées : rien n'est supprimé.</span></pre></div></body></html>`);
            await rest(page);
        },
    },
];
