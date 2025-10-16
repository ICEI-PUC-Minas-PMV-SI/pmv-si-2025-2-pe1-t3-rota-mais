document.addEventListener("DOMContentLoaded", () => {
  
  setupSidebar();
});

function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
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

function setupSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const navItems = [
    { href: "/pages/caronas/caronas.html", icon: createEl("i", { class: "fa fa-car" }), label: "Caronas" },
    { href: "/pages/encomendas/encomendas.html", icon: createEl("img", { src: "/assets/images/encomendas.svg", class: "nav-link-icon", style: "max-width: 90%;" }), label: "Encomendas" },
    { href: "#", icon: createEl("i", { class: "fa fa-users" }), label: "Comunidade" },
    { href: "#", icon: createEl("i", { class: "fa fa-bars" }), label: "Minhas viagens" }
  ];

  const sidebarContent = createEl("div", { class: "sidebar-container" }, [

    // Header
    createEl("div", { class: "sidebar-header" }, [
      createEl("a", { href: "/index.html" }, [
        createEl("img", { src: "/assets/images/logo.png", alt: "Logo", class: "logo" })
      ])
    ]),

    // Community selector
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

    // Navigation
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

    // Footer
    createEl("div", { class: "sidebar-footer" }, [
      createEl("div", { class: "user-profile d-flex" }, [
        createEl("div", { class: "user-avatar-container" }, [
          createEl("img", {
            src: "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png",
            class: "user-avatar"
          })
        ]),
        createEl("div", { class: "user-name-container" }, [
          createEl("span", { class: "user-name" }, " João Silva ")
        ])
      ])
    ])

  ]);

  sidebar.appendChild(sidebarContent);
  setupSidebarNavigation();
}
