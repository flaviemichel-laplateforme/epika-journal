/**
 * The table of contents of an issue page (.toc, styles in styles.css). Without this script it is an open list of links.
 * With it: folded on a phone (and folded again once a section is chosen), always open on a computer, and the section
 * being read marked aria-current="true" (highlighted, and said « actuel » by screen readers).
 * A section inside a folded part (the technical part, <details class="tech">) is unfolded when its link is chosen, or
 * when the page opens on its address; while folded, it is never the section being read.
 */
const toc = document.querySelector(".toc");
if (toc) {
    const details = toc.querySelector("details");
    const phone = window.matchMedia("(max-width: 860px)");
    const fold = () => {
        details.open = !phone.matches;
    };
    fold();
    phone.addEventListener("change", fold);

    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const sections = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));

    /** Unfolds the parts holding a section, before the browser goes to it. */
    const unfold = (section) => {
        for (let parent = section?.parentElement; parent; parent = parent.parentElement) {
            if (parent.tagName === "DETAILS") {
                parent.open = true;
            }
        }
    };
    if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        unfold(target);
        // Once unfolded, at once (not the smooth scroll of the page, which the loading of the page would stop).
        requestAnimationFrame(() => target?.scrollIntoView({ behavior: "instant" }));
    }

    links.forEach((link, index) =>
        link.addEventListener("click", () => {
            unfold(sections[index]);
            if (phone.matches) {
                details.open = false;
            }
        }),
    );

    // The current section: the last one whose top has passed the upper third of the screen; the last one at the bottom.
    const mark = () => {
        const line = window.innerHeight / 3;
        let current = 0;
        sections.forEach((section, index) => {
            // A folded section has no box: it is skipped.
            if (section && section.getClientRects().length > 0 && section.getBoundingClientRect().top <= line) {
                current = index;
            }
        });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = sections.length - 1;
        }
        links.forEach((link, index) => (index === current ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current")));
    };
    let frame = 0;
    window.addEventListener(
        "scroll",
        () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(mark);
        },
        { passive: true },
    );
    mark();
    // Unfolding or folding a part moves the sections below it.
    document.querySelectorAll("main details").forEach((part) => part.addEventListener("toggle", mark));
}
