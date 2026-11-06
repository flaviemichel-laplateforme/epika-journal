/**
 * The theme choice, shared by every page: three buttons in the top bar (Clair / Sombre / Auto).
 * Light and dark set data-theme on <html>; Auto removes it, so the device decides (prefers-color-scheme in styles.css).
 * The choice is kept in localStorage. The tiny inline script in each page's <head> applies it BEFORE the first paint
 * (no flash of the wrong theme); this file only builds the buttons and handles the clicks.
 * Without JavaScript there is no button and the theme follows the device.
 */
const KEY = "epika-journal-theme";
const CHOICES = [
    { value: "light", label: "Clair", name: "Thème : clair" },
    { value: "dark", label: "Sombre", name: "Thème : sombre" },
    { value: "auto", label: "Auto", name: "Thème : automatique (suit l'appareil)" },
];

// Storage can throw (private browsing, blocked site data): every access is guarded, the page works without it.
const read = () => {
    try {
        const value = localStorage.getItem(KEY);
        return value === "light" || value === "dark" ? value : "auto";
    } catch {
        return "auto";
    }
};
const write = (value) => {
    try {
        if (value === "auto") {
            localStorage.removeItem(KEY);
        } else {
            localStorage.setItem(KEY, value);
        }
    } catch {
        // Not saved: the choice still applies until the page is closed.
    }
};

const bar = document.querySelector(".topnav .inner");
if (bar) {
    const group = document.createElement("div");
    group.className = "theme";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Thème");

    const buttons = CHOICES.map((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice.label;
        button.setAttribute("aria-label", choice.name);
        button.addEventListener("click", () => apply(choice.value, true));
        group.append(button);
        return { button, value: choice.value };
    });

    // Apply a choice: the attribute on <html>, the pressed state of the buttons, and (on a click) the storage.
    function apply(value, save) {
        if (value === "auto") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", value);
        }
        buttons.forEach((item) => item.button.setAttribute("aria-pressed", String(item.value === value)));
        if (save) {
            write(value);
        }
    }

    bar.append(group);
    apply(read(), false);

    // Another tab changed the choice: follow it.
    window.addEventListener("storage", (event) => {
        if (event.key === KEY) {
            apply(read(), false);
        }
    });
}
