document.addEventListener("DOMContentLoaded", () => {
  const formButton = document.querySelector(".btn-criar-oferta");
  const custoRadios = document.querySelectorAll("input[name='custo']");
  const retornoRadios = document.querySelectorAll("input[name='retorno']");
  const retornoFields = document.querySelector(".retorno-fields");

  // Mostrar ou esconder campos de retorno
  retornoRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "sim" && radio.checked) {
        retornoFields.style.display = "flex";
      } else {
        retornoFields.style.display = "none";
      }
    });
  });

  // Ação ao clicar em "Criar oferta"
  formButton.addEventListener("click", (e) => {
    e.preventDefault();

    const localPartida = document.querySelector("#localPartida").value.trim();
    const localChegada = document.querySelector("#localChegada").value.trim();
    const dataViagem = document.querySelector("#dataViagem").value;
    const horaPartida = document.querySelector("#horaPartida").value;
    const veiculo = document.querySelector("#veiculo").value;

    const custo = document.querySelector("input[name='custo']:checked")?.value;
    const incluirRetorno = document.querySelector("input[name='retorno']:checked")?.value;

    const dataRetorno = document.querySelector("#dataRetorno")?.value;
    const horaRetorno = document.querySelector("#horaRetorno")?.value;

    // Validação básica
    if (!localPartida || !localChegada || !dataViagem || !horaPartida || !veiculo) {
      alert("⚠️ Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // Criar objeto com os dados
    const transporte = {
      localPartida,
      localChegada,
      dataViagem,
      horaPartida,
      veiculo,
      custo: custo === "sim" ? "Com custo" : "Gratuito",
      retorno: incluirRetorno === "sim" ? { dataRetorno, horaRetorno } : null,
    };

    console.log("Transporte atualizado:", transporte);
    alert("✅ Oferta de transporte atualizada com sucesso!");

    // Limpar formulário (opcional)
    // document.querySelector("form").reset();
  });
});
