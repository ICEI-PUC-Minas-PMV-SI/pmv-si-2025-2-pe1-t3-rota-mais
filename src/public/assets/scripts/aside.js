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

  if (!localStorage.getItem("selectedCommunityId")) {
    localStorage.setItem("selectedCommunityId", "1");
    localStorage.setItem("selectedCommunity", "Centro");
  }

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
    { href: "/pages/user/index.html", icon: createEl("img", { src: userAvatar, class: "user-avatar", style: { width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" } }), label: userName, class: "user-nav", style: { padding: "6px 10px", marginTop: "-10px" }}
  ];

  const sidebarContent = createEl("div", { class: "sidebar-container" }, [

    createEl("div", { class: "sidebar-header" }, [
      createEl("a", { href: "/pages/caronas/index.html" }, [
        createEl("img", { src: "/assets/images/logo.png", alt: "Logo", class: "logo" })
      ])
    ]),

    createEl("div", { class: "community-selector d-flex align-items-center justify-content-between gap-2", id: "community-selector-btn", style: { cursor: "pointer" } }, [
      createEl("div", { class: "d-flex align-items-center gap-2" }, [
        createEl("i", { class: "bi bi-geo-alt-fill", style: { fontSize: "2rem", color: "black" } }),
        createEl("div", { class: "d-flex flex-column align-items-start gap-2" }, [
          createEl("span", {}, "Comunidade selecionada:"),
          createEl("div", { class: "d-flex align-items-center gap-2" }, [
            createEl("strong", { id: "selected-community-name", style: { fontSize: "1.2rem" } }, localStorage.getItem("selectedCommunity") || "Taquara")
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
  
  const communitySelectorBtn = document.getElementById("community-selector-btn");
  if (communitySelectorBtn) {
    communitySelectorBtn.addEventListener("click", () => {
      openCommunityModal();
    });
  }
}

async function openCommunityModal() {
  try {
    const comunidades = await fetchJSON("/comunidades");
    
    const modal = createEl("div", {
      class: "community-modal-overlay",
      style: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999"
      }
    });

    const modalContent = createEl("div", {
      class: "community-modal-content",
      style: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflow: "auto",
        position: "relative"
      }
    });

    const title = createEl("h2", {
      style: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginBottom: "20px",
        color: "black"
      }
    }, "Selecionar local");

    const closeBtn = createEl("button", {
      style: {
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        color: "#666"
      }
    }, "×");
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    const searchContainer = createEl("div", {
      style: {
        position: "relative",
        marginBottom: "20px"
      }
    });

    const searchInput = createEl("input", {
      type: "text",
      id: "community-search-input",
      placeholder: "Digite o nome da comunidade...",
      style: {
        width: "100%",
        padding: "12px 40px 12px 16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "1rem",
        outline: "none"
      }
    });
    
    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = "#0d6efd";
    });
    
    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = "#ddd";
    });

    const searchIcon = createEl("i", {
      class: "bi bi-search",
      style: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#666",
        cursor: "pointer",
        fontSize: "1.2rem"
      }
    });

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchIcon);

    const resultsContainer = createEl("div", {
      id: "community-results",
      style: {
        maxHeight: "400px",
        overflowY: "auto"
      }
    });

    function renderResults(filteredComunidades) {
      resultsContainer.innerHTML = "";
      
      if (filteredComunidades.length === 0) {
        const noResults = createEl("div", {
          style: {
            padding: "20px",
            textAlign: "center",
            color: "#666"
          }
        }, "Nenhuma comunidade encontrada");
        resultsContainer.appendChild(noResults);
        return;
      }

      filteredComunidades.forEach(comunidade => {
        const resultItem = createEl("div", {
          class: "community-result-item",
          style: {
            padding: "12px 16px",
            cursor: "pointer",
            borderRadius: "8px",
            marginBottom: "4px",
            transition: "background-color 0.2s",
            border: "1px solid transparent"
          }
        });

        resultItem.innerHTML = `
          <div style="font-weight: 500; color: #333; font-size: 1rem;">${comunidade.nome}</div>
        `;

        resultItem.addEventListener("mouseenter", () => {
          resultItem.style.backgroundColor = "#f0f0f0";
        });

        resultItem.addEventListener("mouseleave", () => {
          resultItem.style.backgroundColor = "transparent";
        });

        resultItem.addEventListener("click", () => {
          selectCommunity(comunidade);
          document.body.removeChild(modal);
        });

        resultsContainer.appendChild(resultItem);
      });
    }

    function filterComunidades(searchTerm) {
      const filtered = comunidades.filter(comunidade =>
        comunidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      renderResults(filtered);
    }

    searchInput.addEventListener("input", (e) => {
      filterComunidades(e.target.value);
    });

    searchIcon.addEventListener("click", () => {
      filterComunidades(searchInput.value);
    });

    renderResults(comunidades);

    modalContent.appendChild(title);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(searchContainer);
    modalContent.appendChild(resultsContainer);
    modal.appendChild(modalContent);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    document.body.appendChild(modal);

    searchInput.focus();
  } catch (error) {
    console.error("Erro ao carregar comunidades:", error);
    if (typeof Swal !== 'undefined') {
      Swal.fire("Erro", "Não foi possível carregar as comunidades.", "error");
    } else {
      alert("Erro ao carregar as comunidades.");
    }
  }
}

function selectCommunity(comunidade) {
  localStorage.setItem("selectedCommunity", comunidade.nome);
  localStorage.setItem("selectedCommunityId", comunidade.id);

  const selectedCommunityName = document.getElementById("selected-community-name");
  if (selectedCommunityName) {
    selectedCommunityName.textContent = comunidade.nome;
  }

  window.dispatchEvent(new CustomEvent("communityChanged", {
    detail: { comunidade }
  }));

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: "success",
      title: "Comunidade alterada!",
      text: `Você selecionou: ${comunidade.nome}`,
      timer: 2000,
      showConfirmButton: false
    });
  }
}