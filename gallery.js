/**
 * Screenshot galleries ([data-gallery], styles in gallery.css). Without this script the slides still scroll sideways;
 * with it: « Précédente » / « Suivante » buttons, a « 2 / 5 » counter announced politely and the arrow keys on the track.
 * The slides stay plain list items: a screen reader already says « 2 sur 5 » (a role="group" on them would break the
 * list, flagged by axe). Never moves by itself.
 */
for (const gallery of document.querySelectorAll("[data-gallery]")) {
    const track = gallery.querySelector(".gallery-track");
    const slides = [...track.querySelectorAll(".slide")];
    const controls = gallery.querySelector(".gallery-controls");
    const previous = gallery.querySelector("[data-gallery-previous]");
    const next = gallery.querySelector("[data-gallery-next]");
    const count = gallery.querySelector(".gallery-count");

    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (index) => {
        const target = Math.max(0, Math.min(slides.length - 1, index));
        track.scrollTo({ left: target * track.clientWidth });
    };
    const update = () => {
        const index = current();
        count.textContent = `${index + 1} / ${slides.length}`;
        previous.disabled = index === 0;
        next.disabled = index === slides.length - 1;
    };

    previous.addEventListener("click", () => go(current() - 1));
    next.addEventListener("click", () => go(current() + 1));
    track.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            go(current() + (event.key === "ArrowRight" ? 1 : -1));
        }
    });
    let frame = 0;
    track.addEventListener("scroll", () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(update);
    });
    window.addEventListener("resize", () => go(current()));

    controls.hidden = false;
    update();
}
