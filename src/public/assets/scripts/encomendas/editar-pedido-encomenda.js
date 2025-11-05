document.addEventListener("DOMContentLoaded", () => {
  // Referências aos elementos do formulário
  const descricao = document.querySelector("#descricao");
  const localOrigem = document.querySelector("#localOrigem");
  const localDestino = document.querySelector("#localDestino");
  const radioDestinatario = document.querySelectorAll("input[name='destinatario']");
  const nomeDestinatario = document.querySelector("#nomeDestinatario");
  const dataReceber = document.querySelector("#dataReceber");
  const horaLimite = document.querySelector("#horaLimite");
  const btnSalvar = document.querySelector(".btn-salvar");

  // Exemplo de dados pré-carregados (poderia vir da API)
  const pedidoExistente = {
    descricao: "Saco de milho",
    localOrigem: "Farmácia do Antônio • Taquara",
    localDestino: "Papagaios",
    destinatarioEhUsuario: false,
    nomeDestinatario: "Pedro Alves",
    dataReceber: "2025-09-26",
    horaLimite: "14:00"
  };

  // Preenche automaticamente os campos
  function preencherFormulario(pedido) {
    descricao.value = pedido.descricao;
    localOrigem.value = pedido.localOrigem;
    localDestino.value = pedido.localDestino;
    nomeDestinatario.value = pedido.nomeDestinatario;
    dataReceber.value = pedido.dataReceber;
    horaLimite.value = pedido.horaLimite;

    if (pedido.destinatarioEhUsuario) {
      radioDestinatario[0].checked = true;
    } else {
      radioDestinatario[1].checked = true;
    }
  }

  preencherFormulario(pedidoExistente);

  // Ação ao clicar em "Salvar alterações"
  btnSalvar.addEventListener("click", (e) => {
    e.preventDefault();

    // Validação simples
    if (!descricao.value.trim() || !localOrigem.value.trim() || !localDestino.value.trim()) {
      alert("⚠️ Preencha todos os campos obrigatórios!");
      return;
    }

    // Cria objeto com os novos dados
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

    // Exemplo: guardar localmente (poderia enviar via fetch para API)
    localStorage.setItem("pedidoEditado", JSON.stringify(pedidoAtualizado));
  });
});
