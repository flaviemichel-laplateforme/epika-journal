/**
 * The table of contents of an issue page (.toc, styles in styles.css). Without this script it is an open list of links.
 * With it: folded on a phone (and folded again once a section is chosen), always open on a computer, and the section
 * being read marked aria-current="true" (highlighted, and said « actuel » by screen readers).
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

    links.forEach((link) =>
        link.addEventListener("click", () => {
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
            if (section && section.getBoundingClientRect().top <= line) {
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
}
