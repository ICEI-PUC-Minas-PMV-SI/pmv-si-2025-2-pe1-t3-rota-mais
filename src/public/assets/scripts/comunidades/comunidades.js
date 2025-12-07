document.addEventListener("DOMContentLoaded", () => {

  /* ======================================================================================
     BOTÃO: Entrar em contato (CORRIGIDO - interpolação template literal funcionando)
  ======================================================================================= */
  const btnContato = document.getElementById("bnt-contato");
  if (btnContato) {
    btnContato.addEventListener("click", () => {
      Swal.fire({
        title: "Entrar em contato",
        text: "Deseja abrir o WhatsApp para falar com o responsável?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, abrir WhatsApp",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {

          const numeroWhatsApp = "5535984722078";
          const mensagem = encodeURIComponent("Olá! Gostaria de mais informações.");
          const link = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

          window.open(link, "_blank");
        }
      });
    });
  }


  /* ======================================================================================
      BOTÃO: Participar da viagem
  ======================================================================================= */
  const btnParticipar = document.getElementById("bnt-conhecer-local");
  if (btnParticipar) {
    btnParticipar.addEventListener("click", () => {
      Swal.fire({
        title: "Participar da viagem?",
        text: "Confirma sua participação na carona?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: "Participação confirmada!",
            text: "Você foi adicionado à viagem.",
            timer: 3000,
            showConfirmButton: false
          });

          const container = document.getElementById("caronas-container");
          if (container) {
            const msg = document.createElement("div");
            msg.classList.add("alert", "alert-success", "mt-3");
            msg.textContent = "Você agora participa desta viagem!";
            container.appendChild(msg);
          }
        }
      });
    });
  }


  /* ======================================================================================
      BOTÃO: Cadastrar local
  ======================================================================================= */
  const btnCadastrar = document.getElementById("bnt-cadastrar-local");
  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", () => {
      Swal.fire({
        title: "Cadastrar local?",
        text: "Deseja cadastrar este local?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: "Local cadastrado!",
            text: "O local foi adicionado à comunidade.",
            timer: 3000,
            showConfirmButton: false
          });
        }
      });
    });
  }


  /* ======================================================================================
      CARD DO LOCAL (CORRIGIDO - ID removido, agora usa class)
  ======================================================================================= */
  function buildLocalCard(local) {
    const box = document.createElement("div");
    box.classList.add("comunidades-box-locais");

    const imagemWrapper = document.createElement("div");
    imagemWrapper.classList.add("comunidades-imagem");

    const img = document.createElement("img");
    img.src = local.imagem || "../../assets/images/imagem-exemplo.jpg";
    img.alt = `Foto de ${local.nome || "local"}`;
    imagemWrapper.appendChild(img);

    const info = document.createElement("div");
    info.classList.add("comunidades-info");

    const nomeEl = document.createElement("h3");
    nomeEl.classList.add("comunidades-nome-local");
    nomeEl.textContent = local.nome || "Nome do local";

    const tipoEl = document.createElement("p");
    tipoEl.classList.add("comunidades-txt-tipo-local", "bi", "bi-shop-window");
    tipoEl.textContent = " " + (local.tipo || "Tipo não informado");

    const enderecoEl = document.createElement("p");
    enderecoEl.classList.add("comunidades-txt-endereco-local", "bi", "bi-geo-alt-fill");
    enderecoEl.textContent = " " + (local.endereco || "Endereço não informado");

    const qtdEl = document.createElement("p");
    qtdEl.classList.add("comunidades-txt-quantidade-viagens", "bi-car-front-fill");
    qtdEl.textContent =
      " " +
      (local.quantidadeViagens !== undefined
        ? `${local.quantidadeViagens} viagens`
        : "0 viagens");

    const btn = document.createElement("a");
    btn.classList.add("btn", "comunidades-conhecer-local");
    btn.textContent = "Conhecer local";
    btn.href = `/pages/comunidades/comunidade-local.html?id=${local.id}`;

    info.appendChild(nomeEl);
    info.appendChild(tipoEl);
    info.appendChild(enderecoEl);
    info.appendChild(qtdEl);
    info.appendChild(btn);

    box.appendChild(imagemWrapper);
    box.appendChild(info);

    return box;
  }


  /* ======================================================================================
      FUNÇÃO PRINCIPAL (CORRIGIDA) - CARREGAR LOCAIS COM FILTROS
  ======================================================================================= */
  async function carregarLocais(filter = "regiao") {

    const lista = document.getElementById("container-locais");
    lista.innerHTML = ""; // limpar antes de renderizar

    const locais = await fetch("http://localhost:3000/locais")
      .then(res => res.json())
      .catch(() => []);

    let filtrados = locais;

    const selectedCommunityId = Number(localStorage.getItem("selectedCommunityId"));

    if (filter === "comunidade" && selectedCommunityId) {
      filtrados = locais.filter(l => l.comunidadeId === selectedCommunityId);
    }

    if (filtrados.length === 0) {
      lista.innerHTML = `
        <div class="alert alert-secondary mt-3">
          Nenhum local encontrado para este filtro.
        </div>`;
      return;
    }

    filtrados.forEach(local => {
      const card = buildLocalCard(local);
      lista.appendChild(card);
    });
  }


  /* ======================================================================================
      EVENTOS DOS BOTÕES DE FILTRO
  ======================================================================================= */
  const btnRegiao = document.getElementById("bnt-locais-regiao");
  const btnComunidade = document.getElementById("bnt-locais-comunidade");

  const tabs = [btnRegiao, btnComunidade];

  tabs.forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tipo = btn.id === "bnt-locais-comunidade" ? "comunidade" : "regiao";

      carregarLocais(tipo);
    });
  });


  /* ======================================================================================
      BUSCA POR NOME
  ======================================================================================= */
  const campoBusca = document.querySelector(".comunidades-procurar-local");
  const btnBuscar = document.getElementById("bnt-procurar-local");

  if (btnBuscar) {
    btnBuscar.addEventListener("click", async (e) => {
      e.preventDefault();

      const termo = campoBusca.value.trim().toLowerCase();

      const lista = document.getElementById("container-locais");
      lista.innerHTML = "";

      const locais = await fetch("http://localhost:3000/locais")
        .then(res => res.json())
        .catch(() => []);

      const filtrados = locais.filter(l =>
        (l.nome || "").toLowerCase().includes(termo)
      );

      if (filtrados.length === 0) {
        lista.innerHTML = `
          <div class="alert alert-warning mt-3">
            Nenhum local encontrado com esse nome.
          </div>`;
        return;
      }

      filtrados.forEach(local => {
        const card = buildLocalCard(local);
        lista.appendChild(card);
      });
    });
  }


  /* ======================================================================================
      CARREGA LOCAIS INICIAIS (REGIÃO)
  ======================================================================================= */
  carregarLocais("regiao");

});
