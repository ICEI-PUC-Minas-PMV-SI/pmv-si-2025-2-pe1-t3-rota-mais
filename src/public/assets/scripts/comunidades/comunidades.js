document.addEventListener("DOMContentLoaded", () => {
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
          const link = "https://wa.me/${numeroWhatsApp}?text=${mensagem}";
          window.open(link, "_blank");
        }
      });
    });
  }


  const btnParticipar = document.getElementById("bnt-conhecer-local");
  if (btnParticipar) {
    btnParticipar.addEventListener("click", () => {
      Swal.fire({
        title: "Participar da viagem?",
        text: "Confirma sua participação na carona de Papagaios para o Bar do José?",
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

          const inputArquivo = document.getElementById('bnt-adicionar-arquivo');
          if (inputArquivo) {
            inputArquivo.addEventListener('change', (event) => {
              const arquivoSelecionado = event.target.files[0];
              console.log(arquivoSelecionado);
              console.log(arquivoSelecionado.name);
              console.log(arquivoSelecionado.type);
            });
          }
        };
      });
    })
  }

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
            text: "O local foi adicionado a comunidade.",
            timer: 3000,
            showConfirmButton: false
          })
        };
      });
    })
  }

  function buildLocalCard(local) {
  // Container principal (wrapper do card)
  const box = document.createElement("div");
  box.classList.add("comunidades-box-locais");

  // --- IMAGEM ---
  const imagemWrapper = document.createElement("div");
  imagemWrapper.classList.add("comunidades-imagem");

  const img = document.createElement("img");
  img.src = local.imagem || "../../assets/images/imagem-exemplo.jpg";
  img.alt = `Foto de ${local.nome || "local"}`;

  imagemWrapper.appendChild(img);

  // --- INFO ---
  const info = document.createElement("div");
  info.classList.add("comunidades-info");

  // Nome
  const nomeEl = document.createElement("h3");
  nomeEl.classList.add("comunidades-nome-local");
  nomeEl.textContent = local.nome || "Nome do local";

  // Tipo
  const tipoEl = document.createElement("p");
  tipoEl.classList.add("comunidades-txt-tipo-local", "bi", "bi-shop-window");
  tipoEl.textContent = " " + (local.tipo || "Tipo não informado");

  // Endereço
  const enderecoEl = document.createElement("p");
  enderecoEl.classList.add("comunidades-txt-endereco-local", "bi", "bi-geo-alt-fill");
  enderecoEl.textContent = " " + (local.endereco || "Endereço não informado");

  // Quantidade de viagens
  const qtdEl = document.createElement("p");
  qtdEl.classList.add("comunidades-txt-quantidade-viagens", "bi-car-front-fill");
  qtdEl.textContent =
    " " +
    (local.quantidadeViagens !== undefined
      ? `${local.quantidadeViagens} viagens`
      : "0 viagens");

  // Botão "Conhecer Local"
  const btn = document.createElement("a");
  btn.classList.add("btn", "comunidades-conhecer-local");
  btn.id = "btn-conhecer-local";
  btn.textContent = "Conhecer local";
  btn.href = `/pages/comunidades/comunidade-local.html?id=${local.id}`;

  // Montando o bloco info
  info.appendChild(nomeEl);
  info.appendChild(tipoEl);
  info.appendChild(enderecoEl);
  info.appendChild(qtdEl);
  info.appendChild(btn);

  // Final: juntar imagem + info no container principal
  box.appendChild(imagemWrapper);
  box.appendChild(info);

  return box;
}


  async function carregarLocais() {
    const lista = document.getElementById("container-locais"); // o ID do seu container

    const locais = await fetch("http://localhost:3000/locais")
      .then(res => res.json());

    locais.forEach(local => {
      const card = buildLocalCard(local);
      lista.appendChild(card);
    });
  }

  carregarLocais();

})