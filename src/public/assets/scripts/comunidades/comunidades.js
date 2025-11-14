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
})