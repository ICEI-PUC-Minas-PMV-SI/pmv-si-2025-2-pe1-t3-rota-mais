document.addEventListener("DOMContentLoaded", () => {
  const descricao = document.querySelector("#descricao");
  const localOrigem = document.querySelector("#localOrigem");
  const localDestino = document.querySelector("#localDestino");
  const radioDestinatario = document.querySelectorAll("input[name='destinatario']");
  const nomeDestinatario = document.querySelector("#nomeDestinatario");
  const dataReceber = document.querySelector("#dataReceber");
  const horaLimite = document.querySelector("#horaLimite");
  const btnSalvar = document.querySelector(".btn-salvar");

  // 🔹 Garante que os campos começam vazios + adiciona placeholders
  descricao.value = "";
  descricao.placeholder = "Ex: Saco de milho";

  localOrigem.value = "";
  localOrigem.placeholder = "Ex: Farmácia do Antônio • Taquara";

  localDestino.value = "";
  localDestino.placeholder = "Ex: Papagaios";

  nomeDestinatario.value = "";
  nomeDestinatario.placeholder = "Ex: Pedro Alves";

  dataReceber.value = "";
  dataReceber.placeholder = "Selecione uma data";

  horaLimite.value = "";
  horaLimite.placeholder = "Selecione um horário";

  radioDestinatario.forEach(r => (r.checked = false));

  btnSalvar.addEventListener("click", (e) => {
    e.preventDefault();

    // 🔹 Validação
    if (
      !descricao.value.trim() ||
      !localOrigem.value.trim() ||
      !localDestino.value.trim() ||
      (!radioDestinatario[0].checked && !radioDestinatario[1].checked) ||
      !nomeDestinatario.value.trim() ||
      !dataReceber.value ||
      !horaLimite.value
    ) {
      alert("⚠️ Preencha todos os campos obrigatórios antes de salvar!");
      return;
    }

    const pedidoAtualizado = {
      descricao: descricao.value.trim(),
      localOrigem: localOrigem.value.trim(),
      localDestino: localDestino.value.trim(),
      destinatarioEhUsuario: radioDestinatario[0].checked,
      nomeDestinatario: nomeDestinatario.value.trim(),
      dataReceber: dataReceber.value,
      horaLimite: horaLimite.value
    };

    console.log("📦 Pedido atualizado:", pedidoAtualizado);
    alert("✅ Alterações salvas com sucesso!");

    localStorage.setItem("pedidoEditado", JSON.stringify(pedidoAtualizado));
  });
});
