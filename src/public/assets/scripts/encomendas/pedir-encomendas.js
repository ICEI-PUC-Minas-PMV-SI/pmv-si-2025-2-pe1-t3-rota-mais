document.addEventListener("DOMContentLoaded", function() {
  const descricao = document.getElementById("descricao");
  const localOrigem = document.getElementById("localOrigem");
  const localDestino = document.getElementById("localDestino");
  const nomeDestinatario = document.getElementById("nomeDestinatario");
  const dataReceber = document.getElementById("dataReceber");
  const horaLimite = document.getElementById("horaLimite");
  const campoNomeDestinatario = document.getElementById("campoNomeDestinatario");
  const btnCriarPedido = document.getElementById("btnCriarPedido");

  const radioSim = document.getElementById("dest-sim");
  const radioNao = document.getElementById("dest-nao");

  // Alternar exibição do campo de nome
  function atualizarCampoDestinatario() {
    campoNomeDestinatario.style.display = radioSim.checked ? "none" : "flex";
  }

  radioSim.addEventListener("change", atualizarCampoDestinatario);
  radioNao.addEventListener("change", atualizarCampoDestinatario);
  atualizarCampoDestinatario(); // atualizar ao carregar

  // Clique no botão
  btnCriarPedido.addEventListener("click", function() {
    const destinatarioEhVoce = radioSim.checked;
    const nome = destinatarioEhVoce ? "Próprio solicitante" : nomeDestinatario.value.trim();

    if (!descricao.value.trim() || !localOrigem.value.trim() || !localDestino.value.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    if (!destinatarioEhVoce && nome === "") {
      alert("Por favor, informe o nome do destinatário.");
      return;
    }

    const pedido = {
      descricao: descricao.value.trim(),
      localOrigem: localOrigem.value.trim(),
      localDestino: localDestino.value.trim(),
      destinatarioEhVoce,
      nomeDestinatario: nome,
      dataReceber: dataReceber.value,
      horaLimite: horaLimite.value
    };

    // Simulação de envio (poderia ser um fetch para API)
    alert("✅ Pedido criado com sucesso!\n\n" + JSON.stringify(pedido, null, 2));

    // Limpar campos
    descricao.value = "";
    localOrigem.value = "";
    localDestino.value = "";
    nomeDestinatario.value = "";
    dataReceber.value = "";
    horaLimite.value = "";
    radioNao.checked = true;
    atualizarCampoDestinatario();
  });
});
