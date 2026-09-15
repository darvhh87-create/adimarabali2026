const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const toast = (message) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
};

function openModal(id) {
    const m = $("#" + id);
    if (!m) return;
    m.classList.remove("hidden");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal(id) {
    const m = $("#" + id);
    if (!m) return;
    m.classList.add("hidden");
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

$$("[data-scroll]").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.scroll;
        const element = document.querySelector(target);
        if (element) element.scrollIntoView({ behavior: "smooth" });
    });
});

const menuBtn = $("#menuBtn");
const nav = $("#nav");

if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
}

$$(".nav a").forEach(a => {
    a.addEventListener("click", () => {
        if (nav) nav.classList.remove("open");
    });
});

const sections = $$("main section[id]");
const navLinks = $$(".nav a");

if (sections.length && navLinks.length) {
    const observerNav = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => {
                    a.classList.toggle(
                        "active",
                        a.getAttribute("href") === "#" + entry.target.id
                    );
                });
            }
        });
    }, { rootMargin: "-35% 0px -55% 0px" });

    sections.forEach(section => observerNav.observe(section));
}

const revealElements = $$(".reveal");

if (revealElements.length) {
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.08 });

    revealElements.forEach(element => revealObs.observe(element));
}

const counters = $$("[data-counter]");
let counted = false;

if (counters.length) {
    const counterObs = new IntersectionObserver(entries => {
        if (counted) return;

        if (entries.some(entry => entry.isIntersecting)) {
            counted = true;

            counters.forEach(element => {
                const rawValue = (element.dataset.counter || "0").replace(",", ".");
                const target = Number(rawValue);
                const duration = 1300;
                const start = performance.now();

                const tick = now => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);

                    const current = target * eased;
                    element.textContent = current.toLocaleString("id-ID", {
                        minimumFractionDigits: Number.isInteger(target) ? 0 : 2,
                        maximumFractionDigits: Number.isInteger(target) ? 0 : 2
                    });

                    if (progress < 1) requestAnimationFrame(tick);
                };

                requestAnimationFrame(tick);
            });
        }
    }, { threshold: 0.4 });

    counterObs.observe(counters[0]);
}

const filters = $$(".filter");
const cards = $$(".product-card");
const search = $("#productSearch");
const empty = $("#noProducts");

let activeFilter = "all";

function filterProducts() {
    if (!cards.length) return;

    const q = search ? search.value.toLowerCase().trim() : "";
    let visible = 0;

    cards.forEach(card => {
        const category = card.dataset.category || "";
        const name = card.dataset.name || "";

        const matchCat =
            activeFilter === "all" || category === activeFilter;

        const matchSearch =
            name.toLowerCase().includes(q);

        const show = matchCat && matchSearch;

        card.classList.toggle("hidden", !show);

        if (show) visible++;
    });

    if (empty) {
        empty.classList.toggle("hidden", visible !== 0);
    }
}

filters.forEach(filter => {
    filter.addEventListener("click", () => {
        filters.forEach(item => item.classList.remove("active"));
        filter.classList.add("active");
        activeFilter = filter.dataset.filter || "all";
        filterProducts();
    });
});

if (search) {
    search.addEventListener("input", filterProducts);
}

let selectedPrice = 50000;
let quantity = 1;

$$(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedPrice = Number(btn.dataset.price) || 0;
        quantity = 1;

        const productName = $("#modalProduct");
        const qty = $("#qty");

        if (productName) {
            productName.textContent = btn.dataset.product || "Produk";
        }

        if (qty) qty.textContent = quantity;

        updateTotal();
        openModal("productModal");
    });
});

function updateTotal() {
    const total = $("#modalTotal");
    if (!total) return;

    total.textContent =
        "Rp " + (selectedPrice * quantity).toLocaleString("id-ID");
}

const plus = $("#plus");

if (plus) {
    plus.addEventListener("click", () => {
        quantity++;
        const qty = $("#qty");
        if (qty) qty.textContent = quantity;
        updateTotal();
    });
}

const minus = $("#minus");

if (minus) {
    minus.addEventListener("click", () => {
        if (quantity > 1) quantity--;
        const qty = $("#qty");
        if (qty) qty.textContent = quantity;
        updateTotal();
    });
}

const confirmOrder = $("#confirmOrder");

if (confirmOrder) {
    confirmOrder.addEventListener("click", () => {
        closeModal("productModal");
        toast("✓ Pesanan berhasil disimulasikan — tidak ada transaksi nyata.");
    });
}

$$(".read-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const modalNews = $("#modalNews");
        if (modalNews) modalNews.textContent = btn.dataset.news || "";
        openModal("newsModal");
    });
});

$$("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

$$(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal(modal.id);
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        $$(".modal:not(.hidden)").forEach(modal => closeModal(modal.id));
    }
});

const chartSelect = $("#chartSelect");

if (chartSelect) {
    chartSelect.addEventListener("change", event => {
        toast(
            "Data periode " +
            event.target.value +
            " ditampilkan sebagai simulasi prototype."
        );
    });
}

const contactForm = $("#contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const nameInput = $("#name");
        const name = nameInput ? nameInput.value.trim() : "";

        toast(
            `✓ Terima kasih, ${name || "Anda"}! Kolaborasi berhasil disimulasikan.`
        );

        contactForm.reset();
    });
}

filterProducts();

/* ==========================================================
   GREEN CIRCULAR BUSINESS PLATFORM — DASHBOARD DATA JS
   Fully scoped to avoid collisions with BIONIC EcoHub JS.
========================================================== */
(() => {
    const initEcoPlatform = () => {
        const root = document.getElementById("eco-platform");
        if (!root) return;

        const searchInput = document.getElementById("ecoFeatureSearch");
        const cards = Array.from(root.querySelectorAll(".eco-platform-card"));
        const count = document.getElementById("ecoFeatureCount");
        const empty = document.getElementById("ecoFeatureEmpty");
        const detailButtons = Array.from(root.querySelectorAll(".eco-platform-detail"));
        const modals = Array.from(document.querySelectorAll(".eco-platform-modal"));
        const closeButtons = Array.from(document.querySelectorAll(".eco-platform-modal-close"));
        const reveals = Array.from(root.querySelectorAll(".eco-platform-reveal"));

        const setBodyLock = () => {
            const anyOpen = modals.some(modal => modal.classList.contains("eco-platform-active"));
            document.body.style.overflow = anyOpen ? "hidden" : "";
        };

        const closeModal = modal => {
            if (!modal) return;
            modal.classList.remove("eco-platform-active");
            modal.setAttribute("aria-hidden", "true");
            setBodyLock();
        };

        const openModal = id => {
            const modal = document.getElementById(id);
            if (!modal) return;
            modals.forEach(item => {
                if (item !== modal) {
                    item.classList.remove("eco-platform-active");
                    item.setAttribute("aria-hidden", "true");
                }
            });
            modal.classList.add("eco-platform-active");
            modal.setAttribute("aria-hidden", "false");
            setBodyLock();
        };

        const filterCards = () => {
            const keyword = (searchInput ? searchInput.value : "").toLowerCase().trim();
            let visible = 0;

            cards.forEach(card => {
                const searchable = (card.dataset.search || card.textContent || "").toLowerCase();
                const match = searchable.includes(keyword);
                card.hidden = !match;
                if (match) visible++;
            });

            if (count) count.textContent = String(visible);
            if (empty) empty.classList.toggle("eco-platform-active", visible === 0);
        };

        if (searchInput) searchInput.addEventListener("input", filterCards);

        detailButtons.forEach(button => {
            button.addEventListener("click", () => openModal(button.dataset.modal));
        });

        closeButtons.forEach(button => {
            button.addEventListener("click", () => closeModal(button.closest(".eco-platform-modal")));
        });

        modals.forEach(modal => {
            modal.addEventListener("click", event => {
                if (event.target === modal) closeModal(modal);
            });
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                modals.forEach(closeModal);
            }
        });

        if ("IntersectionObserver" in window && reveals.length) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("eco-platform-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08 });
            reveals.forEach(item => observer.observe(item));
        } else {
            reveals.forEach(item => item.classList.add("eco-platform-visible"));
        }

        filterCards();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initEcoPlatform, { once: true });
    } else {
        initEcoPlatform();
    }
})();