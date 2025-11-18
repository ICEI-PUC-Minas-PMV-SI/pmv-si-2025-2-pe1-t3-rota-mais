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


  function buildComunidadeCard(local) {
    // Cria o card principal
    const $card = $('<div>').addClass('comunidades-box-locais');

    // IMAGEM
    const $imagemBox = $('<div>').addClass('comunidades-imagem');
    const $img = $('<img>')
      .attr('src', local.imagem || '../../assets/images/imagem-exemplo.jpg')
      .attr('alt', local.nome || 'Imagem do local');
    $imagemBox.append($img);

    // INFO DO CARD
    const $info = $('<div>').addClass('comunidades-info');

    const $titulo = $('<h3>')
      .addClass('comunidades-nome-local')
      .text(local.nome || 'Nome do Local');

    const $tipo = $('<p>')
      .addClass('comunidades-txt-tipo-local bi bi-shop-window')
      .text(` ${local.tipo || 'Tipo do local'}`);

    const $endereco = $('<p>')
      .addClass('comunidades-txt-endereco-local bi bi-geo-alt-fill')
      .text(` ${local.endereco || 'Endereço do local'}`);

    const $qtdViagens = $('<p>')
      .addClass('comunidades-txt-quantidade-viagens bi bi-car-front-fill')
      .text(` ${local.quantidadeViagens || 0} viagens cadastradas`);

    // BOTÃO "CONHECER"
    const $btnConhecer = $('<a>')
      .addClass('btn comunidades-conhecer-local')
      .attr('href', local.link || `/pages/comunidades/comunidade-local.html?id=${local.id}`)
      .text('Conhecer local');

    // Efeito de clique no botão
    $btnConhecer.on('mousedown', function () {
      $(this).css('background', '#8cdba9');
    });
    $btnConhecer.on('mouseup mouseleave', function () {
      $(this).css('background', '#A2E9C1');
    });

    // Montagem final
    $info.append($titulo, $tipo, $endereco, $qtdViagens, $btnConhecer);
    $card.append($imagemBox, $info);

    return $card;
  }



})