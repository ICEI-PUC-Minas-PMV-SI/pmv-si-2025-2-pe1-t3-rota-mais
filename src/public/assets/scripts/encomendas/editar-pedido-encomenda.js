document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = 'http://localhost:3000';
  const descricao = document.querySelector("#descricao");
  const localOrigem = document.querySelector("#localOrigem");
  const localDestino = document.querySelector("#localDestino");
  const radioDestinatario = document.querySelectorAll("input[name='destinatario']");
  const nomeDestinatario = document.querySelector("#nomeDestinatario");
  const dataReceber = document.querySelector("#dataReceber");
  const horaLimite = document.querySelector("#horaLimite");
  const btnSalvar = document.querySelector(".btn-salvar");
  const campoNomeDestinatario = document.querySelector("#campoNomeDestinatario");

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

  function atualizarCampoDestinatario() {
    if (campoNomeDestinatario) {
      campoNomeDestinatario.style.display = radioDestinatario[0].checked ? "none" : "flex";
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const encomendaId = urlParams.get('id');

  if (encomendaId) {
    try {
      const response = await fetch(`${API_URL}/encomendas/${encomendaId}`);
      if (response.ok) {
        const encomenda = await response.json();
        
        descricao.value = encomenda.descricao || "";
        localOrigem.value = encomenda.localOrigem || encomenda.origem || "";
        localDestino.value = encomenda.localDestino || encomenda.destino || "";
        nomeDestinatario.value = encomenda.nomeDestinatario || "";
        
        if (encomenda.dataReceber) {
          dataReceber.value = encomenda.dataReceber;
        } else if (encomenda.dataISO) {
          const data = new Date(encomenda.dataISO);
          dataReceber.value = data.toISOString().split('T')[0];
        }
        
        horaLimite.value = encomenda.horario || "";
        
        if (encomenda.destinatarioEhVoce) {
          radioDestinatario[0].checked = true;
        } else {
          radioDestinatario[1].checked = true;
        }
        
        atualizarCampoDestinatario();
      } else {
        console.error("Encomenda não encontrada");
      }
    } catch (error) {
      console.error("Erro ao carregar encomenda:", error);
    }
  } else {
    descricao.value = "";
    descricao.placeholder = "Ex: Saco de milho";
    localOrigem.value = "";
    localOrigem.placeholder = "Ex: Farmácia do Antônio • Taquara";
    localDestino.value = "";
    localDestino.placeholder = "Ex: Papagaios";
    nomeDestinatario.value = "";
    nomeDestinatario.placeholder = "Ex: Pedro Alves";
    dataReceber.value = "";
    horaLimite.value = "";
    radioDestinatario[1].checked = true;
    atualizarCampoDestinatario();
  }

  radioDestinatario.forEach(radio => {
    radio.addEventListener("change", atualizarCampoDestinatario);
  });

  btnSalvar.addEventListener("click", async (e) => {
    e.preventDefault();

    const destinatarioEhVoce = radioDestinatario[0].checked;
    const nome = destinatarioEhVoce ? "Próprio solicitante" : nomeDestinatario.value.trim();

    if (
      !descricao.value.trim() ||
      !localOrigem.value.trim() ||
      !localDestino.value.trim() ||
      (!radioDestinatario[0].checked && !radioDestinatario[1].checked) ||
      (!destinatarioEhVoce && !nomeDestinatario.value.trim()) ||
      !dataReceber.value ||
      !horaLimite.value
    ) {
      alert("⚠️ Preencha todos os campos obrigatórios antes de salvar!");
      return;
    }

    const currentUser = getCurrentUser();
    const userId = Number(localStorage.getItem('userId'));
    
    if (!currentUser || !userId) {
      alert("Você precisa estar logado para editar um pedido!");
      window.location.href = "/pages/autenticacao/login.html";
      return;
    }

    const dataISO = dataReceber.value ? new Date(dataReceber.value + 'T00:00:00').toISOString() : new Date().toISOString();
    const dataTexto = formatarData(dataISO);

    const encomendaAtualizada = {
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
      let response;
      
      if (encomendaId) {
        response = await fetch(`${API_URL}/encomendas/${encomendaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(encomendaAtualizada)
        });
      } else {
        response = await fetch(`${API_URL}/encomendas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(encomendaAtualizada)
        });
      }

      if (!response.ok) {
        throw new Error('Erro ao salvar encomenda');
      }

      alert("✅ Alterações salvas com sucesso!");
      window.location.href = "/pages/encomendas/index.html";
    } catch (error) {
      console.error("Erro ao salvar encomenda:", error);
      alert("Erro ao salvar alterações. Tente novamente.");
    }
  });
});
