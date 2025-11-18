  // ======================================================
//   PÁGINA DO LOCAL - CARREGAMENTO DINÂMICO
// ======================================================

// ---------------------------
// 1. Pegar o ID da URL
// ---------------------------
function getLocalIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ---------------------------
// 2. Buscar locais no localStorage
// ---------------------------
function getLocais() {
  return JSON.parse(localStorage.getItem("locais") || "[]");
}

// ---------------------------
// 3. Buscar caronas no localStorage
// ---------------------------
function getCaronas() {
  return JSON.parse(localStorage.getItem("caronas") || "[]");
}

// ---------------------------
// 4. Preencher página com dados do local
// ---------------------------
function preencherLocal(local) {
  // Foto principal
  document.querySelector(".comunidades-box-local img").src = local.imagem;

  // Nome
  document.querySelector(".comunidades-nome-local2").textContent = local.nome;

  // Criador
  document.querySelector(".local-info span:nth-child(1)").innerHTML =
    `<span class="bi bi-person-circle"> Criado por <strong>${local.criador}</strong></span>`;

  // Tipo
  document.querySelector(".local-info span:nth-child(2)").innerHTML =
    `<span class="bi bi-shop-window"> ${local.tipo}</span>`;

  // Viagens
  document.querySelector(".local-info span:nth-child(3)").innerHTML =
    `<span class="bi bi-car-front-fill"> ${local.viagens} viagens estão passando por aqui atualmente</span>`;

  // Endereço
  document.querySelector(".local-info span:nth-child(4)").innerHTML =
    `<span class="bi bi-geo-alt-fill"> ${local.endereco}</span>`;
}

// ---------------------------
// 5. Build do card de carona
// (simples e igual ao seu modelo)
// ---------------------------
function buildCaronaSimples(carona) {
  const card = document.createElement("div");
  card.className = "comunidades-box-locais";

  card.innerHTML = `
    <div class="comunidades-info">
      <p class="bi bi-person-circle"> ${carona.usuario} está 
        <strong>${carona.tipo === "oferecendo" ? "oferecendo" : "pedindo"} uma carona</strong>
      </p>

      <h2 class="comunidades-nome-local2">
        De <strong>${carona.origem}</strong> para <strong>${carona.destino}</strong>
      </h2>

      <div class="local-info2">
        <span class="bi bi-calendar3"><strong> Dia ${carona.data}</strong> às ${carona.horario}</span>
        <span class="bi bi-car-front-fill"> <strong>Veículo: </strong>${carona.veiculo}</span>
        <span class="bi bi-people-fill"><strong>${carona.vagas}</strong> vaga(s)</span>
      </div>

      <button class="btn comunidades-conhecer-local">
        Participar da viagem
      </button>
    </div>
  `;

  return card;
}

// ---------------------------
// 6. Listar caronas relacionadas ao local
// ---------------------------
function listarCaronas(local) {
  const caronas = getCaronas().filter(c => c.destino === local.nome);
  const container = document.getElementById("caronas-container");
  container.innerHTML = ""; // limpa

  if (caronas.length === 0) {
    container.innerHTML = `<p style="margin-top:15px; color:#777;">Nenhuma carona disponível para este local.</p>`;
    return;
  }

  caronas.forEach(c => {
    const card = buildCaronaSimples(c);
    container.appendChild(card);
  });
}

// ---------------------------
// 7. Iniciar página
// ---------------------------
function initLocalPage() {
  const id = getLocalIdFromUrl();
  if (!id) {
    alert("ID do local não encontrado na URL.");
    return;
  }

  const locais = getLocais();
  const localEncontrado = locais.find(l => l.id == id);

  if (!localEncontrado) {
    alert("Local não encontrado no sistema.");
    return;
  }

  preencherLocal(localEncontrado);
  listarCaronas(localEncontrado);
}


document.getElementById("form-cadastro-local").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Se tiver upload de imagem, coloca o nome do arquivo apenas
    if (formData.get("foto")) {
        data.foto = formData.get("foto").name;
    }

    try {
        const response = await fetch("http://localhost:3000/locais", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Local cadastrado com sucesso!");
            this.reset();
        } else {
            alert("Erro ao cadastrar.");
        }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Falha de conexão com o servidor JSON.");
    }
});

document.addEventListener("DOMContentLoaded", initLocalPage);