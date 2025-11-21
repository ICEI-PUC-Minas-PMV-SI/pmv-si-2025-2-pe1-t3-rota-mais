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

  function getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  function formatarData(dataISO) {
    const data = new Date(dataISO);
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
  }

  // Alternar exibição do campo de nome
  function atualizarCampoDestinatario() {
    campoNomeDestinatario.style.display = radioSim.checked ? "none" : "flex";
  }

  radioSim.addEventListener("change", atualizarCampoDestinatario);
  radioNao.addEventListener("change", atualizarCampoDestinatario);
  atualizarCampoDestinatario(); // atualizar ao carregar

  // Clique no botão
  btnCriarPedido.addEventListener("click", async function() {
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

    const currentUser = getCurrentUser();
    const userId = Number(localStorage.getItem('userId'));
    
    if (!currentUser || !userId) {
      alert("Você precisa estar logado para criar um pedido!");
      window.location.href = "/pages/autenticacao/login.html";
      return;
    }

    const dataISO = dataReceber.value ? new Date(dataReceber.value + 'T00:00:00').toISOString() : new Date().toISOString();
    const dataTexto = formatarData(dataISO);

    const encomenda = {
      tipo: "pedindo",
      descricao: descricao.value.trim(),
      origem: localOrigem.value.trim(),
      destino: localDestino.value.trim(),
      localOrigem: localOrigem.value.trim(),
      localDestino: localDestino.value.trim(),
      destinatarioEhVoce,
      nomeDestinatario: nome,
      dataReceber: dataReceber.value,
      horario: horaLimite.value,
      dataISO: dataISO,
      dataTexto: dataTexto,
      usuario: {
        id: currentUser.id,
        nome: currentUser.nome || currentUser.name,
        email: currentUser.email,
        usuario: currentUser.usuario,
        telefone: currentUser.telefone,
        comunidade: currentUser.comunidade,
        cidade: currentUser.cidade,
        avatar: currentUser.avatar
      },
      criadorId: userId
    };

    try {
      const response = await fetch(`${API_BASE}/encomendas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(encomenda)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar encomenda');
      }

      alert("Pedido de encomenda criado com sucesso!");

      descricao.value = "";
      localOrigem.value = "";
      localDestino.value = "";
      nomeDestinatario.value = "";
      dataReceber.value = "";
      horaLimite.value = "";
      radioNao.checked = true;
      atualizarCampoDestinatario();

      window.location.href = "/pages/encomendas/index.html";
    } catch (error) {
      alert("Erro ao criar pedido. Tente novamente.");
    }
  });
});
