const API_BASE = "http://localhost:3000";

async function fetchJSON(path, options = {}) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  return await res.json();
}

function checkAuth() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "../../pages/autenticacao/login.html";
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAuth()) return;
  try {
    const currentUserId = Number(localStorage.getItem("userId"));
    const user = await fetchJSON(`/users/${currentUserId}`);
    setupSidebar(user);
  } catch (e) {
    setupSidebar();
  }
});

function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (typeof key === 'number' || !isNaN(parseInt(key))) {
      return;
    }

    if (key === "class") {
      el.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (key === "dataset" && typeof value === "object") {
      Object.assign(el.dataset, value);
    } else {
      el.setAttribute(key, value);
    }
  });

  [].concat(children).forEach(child => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

function setupSidebar(user = null) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const userAvatar =
    (user && user.avatar) ||
    "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";
  const userName =
    (user && (user.name || user.username || "Usuário")) ||
    "Usuário";

  const navItems = [
    { href: "/pages/caronas/index.html", icon: createEl("i", { class: "fa fa-car" }), label: "Caronas" },
    { href: "/pages/encomendas/index.html", icon: createEl("img", { src: "/assets/images/encomendas.svg", class: "nav-link-icon", style: "max-width: 90%;" }), label: "Encomendas" },
    { href: "/pages/comunidades/index.html", icon: createEl("i", { class: "fa fa-users" }), label: "Comunidade" },
    { href: "/pages/viagens/index.html", icon: createEl("i", { class: "fa fa-bars" }), label: "Minhas viagens" },
  ];

  const sidebarContent = createEl("div", { class: "sidebar-container" }, [

    createEl("div", { class: "sidebar-header" }, [
      createEl("a", { href: "/index.html" }, [
        createEl("img", { src: "/assets/images/logo.png", alt: "Logo", class: "logo" })
      ])
    ]),

    createEl("div", { class: "community-selector d-flex align-items-center justify-content-between gap-2" }, [
      createEl("div", { class: "d-flex align-items-center gap-2" }, [
        createEl("i", { class: "bi bi-geo-alt-fill", style: { fontSize: "2rem", color: "black" } }),
        createEl("div", { class: "d-flex flex-column align-items-start gap-2" }, [
          createEl("span", {}, "Comunidade selecionada:"),
          createEl("div", { class: "d-flex align-items-center gap-2" }, [
            createEl("strong", { style: { fontSize: "1.2rem" } }, "Taquara")
          ])
        ])
      ]),
      createEl("img", { src: "/assets/images/repeat.svg", style: { fontSize: "2rem", transform: "rotate(180deg)" } })
    ]),

    createEl("nav", { class: "sidebar-nav" }, [
      createEl("ul", { class: "nav-list" }, navItems.map((item, index) =>
        createEl("li", { class: `nav-item${index === 0 ? ' active' : ''}` }, [
          createEl("a", { class: "nav-link", href: item.href }, [
            item.icon,
            createEl("span", {}, item.label)
          ])
        ])
      ))
    ]),

    createEl("div", { class: "sidebar-footer" }, [
      createEl("a", { href: "/pages/user/index.html", class: "user-profile d-flex align-items-center user-link gap-2" }, [
        createEl("div", { class: "user-avatar-container" }, [
          createEl("img", {
            src: userAvatar,
            class: "user-avatar",
            alt: "Foto do usuário"
          })
        ]),
        createEl("div", { class: "user-name-container" }, [
          createEl("span", { class: "user-name text-dark" }, userName)
        ])
      ])
    ])

  ]);

  sidebar.appendChild(sidebarContent);
}