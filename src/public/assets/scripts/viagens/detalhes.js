async function fetchJSON(path, options = {}) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  return await res.json();
}


async function resolveVehicleForCarona(carona) {
  if (carona.vehicleId) {
    try {
      return await fetchJSON(`/vehicles/${carona.vehicleId}`);
    } catch {}
  }

  if (carona.motoristaId) {
    try {
      const lista = await fetchJSON(`/vehicles?motoristaId=${carona.motoristaId}`);
      if (lista && lista.length > 0) {
        const veiculoTipo = carona.veiculo === 'carro' ? 'CAR' : carona.veiculo === 'moto' ? 'MOTORCYCLE' : null;
        if (veiculoTipo) {
          const veiculoCorreto = lista.find(v => v.type === veiculoTipo);
          if (veiculoCorreto) return veiculoCorreto;
        }
        return lista[0];
      }
    } catch {}
  }

  return null;
}

$(document).ready(async function () {
  const params = new URLSearchParams(window.location.search);
  const caronaId = params.get("id");

  if (!caronaId) return Swal.fire("Erro", "ID inválido.", "error");

  const currentUserId = Number(localStorage.getItem("userId"));
  const currentUser = await fetchJSON(`/users/${currentUserId}`);

  try {
    const carona = await fetchJSON(`/caronas/${caronaId}`);
    const vehicle = await resolveVehicleForCarona(carona);

    if (typeof createDetailsComponent === "function")
      createDetailsComponent(carona, document.getElementById("detalhes-container"), vehicle);

    if (carona.tipo === 'pedindo') {
      const isCriador = carona.passageiroId === currentUserId;
      const isMotoristaAprovado = carona.motoristaId === currentUserId;

      if (isCriador) {
        if (carona.motoristaId) {
          $("#detalhes-container-motorista").hide();
          $("#detalhes-container-passageiro").hide();
          $("#detalhes-container-criador").hide();
          $("#detalhes-container-motorista-candidato").hide();
          $("#detalhes-container-pedindo-aprovado").show();
          await renderPedindoAprovadoPanel(carona, currentUser, 'passageiro');
        } else {
          $("#detalhes-container-motorista").hide();
          $("#detalhes-container-passageiro").hide();
          $("#detalhes-container-motorista-candidato").hide();
          $("#detalhes-container-pedindo-aprovado").hide();
          $("#detalhes-container-criador").show();
          await renderCriadorPanel(carona, currentUser);
        }
      } else if (isMotoristaAprovado) {
        $("#detalhes-container-passageiro").hide();
        $("#detalhes-container-criador").hide();
        $("#detalhes-container-motorista").hide();
        $("#detalhes-container-motorista-candidato").hide();
        $("#detalhes-container-pedindo-aprovado").show();
        await renderPedindoAprovadoPanel(carona, currentUser, 'motorista');
      } else {
        const currentUserRole = currentUser.role || 'passageiro';
        if (currentUserRole === 'motorista') {
          $("#detalhes-container-passageiro").hide();
          $("#detalhes-container-motorista").hide();
          $("#detalhes-container-criador").hide();
          $("#detalhes-container-motorista-candidato").show();
          await renderMotoristaCandidatoPanel(carona, currentUser);
        } else {
          $("#detalhes-container-motorista").hide();
          $("#detalhes-container-criador").hide();
          $("#detalhes-container-motorista-candidato").hide();
          $("#detalhes-container-passageiro").show();
          await renderPassageiroPanel(carona, currentUser);
        }
      }
    } else {
      const isMotorista = carona.motoristaId === currentUserId;

      if (isMotorista) {
        $("#detalhes-container-passageiro").hide();
        $("#detalhes-container-criador").hide();
        $("#detalhes-container-motorista-candidato").hide();
        $("#detalhes-container-motorista").show();
        await renderMotoristaPanel(carona);
      } else {
        $("#detalhes-container-motorista").hide();
        $("#detalhes-container-criador").hide();
        $("#detalhes-container-motorista-candidato").hide();
        $("#detalhes-container-passageiro").show();
        await renderPassageiroPanel(carona, currentUser);
      }
    }
  } catch {
    Swal.fire("Erro", "Falha ao carregar carona.", "error");
  }
});


async function renderPassageiroPanel(carona, currentUser) {
  const motorista = carona.motoristaId ? await fetchJSON(`/users/${carona.motoristaId}`) : null;
  const vehicle = await resolveVehicleForCarona(carona);

  if (motorista?.avatar) {
    $("#motorista-avatar").attr("src", motorista.avatar).css({ width: "40px", height: "40px", objectFit: "cover" });
  }

  $("#motorista-nome").text(motorista?.name || "Motorista não encontrado");
  $("#motorista-rating").text(`★ ${motorista?.rating || 5}`);

  const vagasTotais = vehicle ? vehicle.availableSeats : (carona.vagas || 0);
  const passageiros = carona.passageiros || [];
  const aprovados = passageiros.filter(p => p.status === "aprovado").length;
  const vagasRestantes = vagasTotais - aprovados;

  const pedidoUsuario = passageiros.find(p => p.userId === currentUser.id);
  const jaPediu = !!pedidoUsuario;
  const statusPedido = pedidoUsuario?.status || null;
  const statusViagem = carona.statusViagem || "agendada";

  const btnVaga = $("#btn-pedir-vaga");
  const btnEncomenda = $("#btn-pedir-encomenda");
  const textoStatus = $("#texto-status-passageiro");

  let statusTexto = "";
  let statusClass = "";

  if (statusViagem === "cancelada") {
    statusTexto = "❌ Esta viagem foi <strong>CANCELADA</strong> pelo motorista.";
    statusClass = "text-danger";
    btnVaga.prop("disabled", true).text("Viagem Cancelada");
    btnEncomenda.prop("disabled", true);
  } else if (statusViagem === "concluida") {
    statusTexto = "✅ Esta viagem foi <strong>CONCLUÍDA</strong>.";
    statusClass = "text-success";
    btnVaga.prop("disabled", true).text("Viagem Concluída");
    btnEncomenda.prop("disabled", true);
  } else if (statusViagem === "iniciada") {
    if (jaPediu && statusPedido === "aprovado") {
      statusTexto = "🚗 Viagem <strong>INICIADA</strong>! O motorista está a caminho.";
      statusClass = "text-primary";
      btnVaga.prop("disabled", true).text("Viagem em Andamento");
    } else if (jaPediu) {
      statusTexto = "⏳ Viagem iniciada, mas seu pedido ainda está aguardando aprovação.";
      statusClass = "text-warning";
      btnVaga.prop("disabled", true).text("Aguardando Aprovação");
    } else {
      statusTexto = "🚗 Viagem iniciada. Solicite uma vaga rapidamente!";
      statusClass = "text-info";
      btnVaga.prop("disabled", false).text("Pedir carona");
    }
  } else {
    if (jaPediu) {
      switch (statusPedido) {
        case "aprovado":
          statusTexto = "✅ Seu pedido foi <strong>APROVADO</strong>! Você está confirmado nesta carona!";
          statusClass = "text-success";
          btnVaga.prop("disabled", true).text("Pedido Aprovado");
          $("#btn-conversar-motorista-container").show();
          break;
        case "negado":
          statusTexto = "❌ Seu pedido foi <strong>NEGADO</strong> pelo motorista.";
          statusClass = "text-danger";
          btnVaga.prop("disabled", true).text("Pedido Negado");
          $("#btn-conversar-motorista-container").hide();
          break;
        case "pendente":
        default:
          statusTexto = "⏳ Seu pedido está <strong>AGUARDANDO</strong> aprovação do motorista.";
          statusClass = "text-warning";
          btnVaga.prop("disabled", true).text("Aguardando resposta do motorista");
          $("#btn-conversar-motorista-container").hide();
          break;
      }
    } else if (vagasRestantes <= 0) {
      statusTexto = "Sem vagas disponíveis no momento.";
      statusClass = "text-muted";
      btnVaga.prop("disabled", true).text("Sem vagas");
      $("#btn-conversar-motorista-container").hide();
    } else {
      statusTexto = "Solicite uma vaga nesta carona.";
      statusClass = "text-muted";
      btnVaga.prop("disabled", false).text("Pedir carona");
      $("#btn-conversar-motorista-container").hide();
    }
  }

  if (statusViagem === "iniciada" && jaPediu && statusPedido === "aprovado") {
    $("#btn-concluir-viagem-container").show();
    $("#btn-concluir-viagem-passageiro").off("click").on("click", async () => {
      const result = await Swal.fire({
        title: "Concluir Viagem",
        text: "Deseja marcar esta viagem como concluída?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, concluir",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        try {
          await patchCarona(carona.id, {
            statusViagem: "concluida",
            dataConclusao: new Date().toISOString()
          });
          Swal.fire("Sucesso!", "Viagem concluída!", "success");
          const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
          await renderPassageiroPanel(caronaAtualizada, currentUser);
        } catch {
          Swal.fire("Erro", "Não foi possível concluir a viagem.", "error");
        }
      }
    });
  } else {
    $("#btn-concluir-viagem-container").hide();
  }

  $("#btn-conversar-motorista").off("click").on("click", () => {
    window.location.href = `/pages/viagens/negociar.html?id=${carona.id}`;
  });

  textoStatus.html(statusTexto).removeClass("text-success text-danger text-warning text-primary text-info text-muted").addClass(statusClass);

  btnVaga.off().on("click", async () => {
    if (jaPediu || vagasRestantes <= 0 || statusViagem === "cancelada" || statusViagem === "concluida") return;

    const newPass = {
      userId: currentUser.id,
      status: "pendente",
      posicao: (passageiros.length + 1)
    };

    await patchCarona(carona.id, {
      passageiros: [...passageiros, newPass]
    });

    Swal.fire("Enviado!", "Solicitação enviada.", "success");

    const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
    await renderPassageiroPanel(caronaAtualizada, currentUser);
  });

  btnEncomenda.off().on("click", async () => {
    if (!carona.podeTrazerEncomendas) {
      Swal.fire("Aviso", "Esta carona não aceita encomendas.", "info");
      return;
    }

    const minhasEncomendas = (carona.encomendas || []).filter(e => e.userId === currentUser.id);
    const jaPediuEncomenda = minhasEncomendas.length > 0;

    let encomendasHtml = '';
    if (jaPediuEncomenda) {
      encomendasHtml = '<div class="text-start mb-3 p-3 bg-light rounded"><h6 class="mb-2"><strong>Suas encomendas solicitadas:</strong></h6>';
      minhasEncomendas.forEach((e, index) => {
        const statusBadge = e.status === "aprovado" 
          ? '<span class="badge bg-success">Aprovado</span>'
          : e.status === "negado"
          ? '<span class="badge bg-danger">Negado</span>'
          : '<span class="badge bg-warning">Pendente</span>';
        
        encomendasHtml += `
          <div class="mb-2 pb-2 ${index < minhasEncomendas.length - 1 ? 'border-bottom' : ''}">
            ${statusBadge}
            ${e.descricao ? `<p class="mb-1 mt-1"><strong>O que é:</strong> ${e.descricao}</p>` : ''}
            <p class="mb-1 small"><strong><i class="bi bi-geo-alt-fill text-primary"></i> Onde pegar:</strong> ${e.enderecoBusca || 'Não informado'}</p>
            <p class="mb-0 small"><strong><i class="bi bi-geo-alt text-success"></i> Para onde levar:</strong> ${e.enderecoEntrega || 'Não informado'}</p>
          </div>
        `;
      });
      encomendasHtml += '</div>';
    }

    const { value: formValues } = await Swal.fire({
      title: 'Solicitar Transporte de Encomenda',
      html: `
        <div class="text-start mb-3">
          <p class="mb-2"><strong>O que é transporte de encomenda?</strong></p>
          <p class="text-muted small mb-3">Você pode solicitar que o motorista busque ou entregue um item em um endereço específico durante a viagem. O motorista avaliará sua solicitação e poderá aprovar ou negar.</p>
        </div>
        ${encomendasHtml}
        <div class="text-start mb-3">
          <h6 class="mb-2"><strong>Nova solicitação:</strong></h6>
        </div>
        <textarea id="descricao-encomenda" class="swal2-textarea" placeholder="O que é a encomenda? (ex: pacote, documento, etc.)" required></textarea>
        <input id="endereco-busca" class="swal2-input" placeholder="Onde pegar a encomenda?" required>
        <input id="endereco-entrega" class="swal2-input" placeholder="Para onde levar a encomenda?" required>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar solicitação',
      cancelButtonText: 'Cancelar',
      width: '600px',
      preConfirm: () => {
        const descricao = document.getElementById('descricao-encomenda').value;
        const enderecoBusca = document.getElementById('endereco-busca').value;
        const enderecoEntrega = document.getElementById('endereco-entrega').value;
        
        if (!descricao || !enderecoBusca || !enderecoEntrega) {
          Swal.showValidationMessage('Por favor, preencha todos os campos');
          return false;
        }
        
        return {
          descricao: descricao,
          enderecoBusca: enderecoBusca,
          enderecoEntrega: enderecoEntrega
        };
      }
    });

    if (!formValues) return;

    const newEnc = { 
      userId: currentUser.id, 
      status: "pendente",
      enderecoBusca: formValues.enderecoBusca,
      enderecoEntrega: formValues.enderecoEntrega,
      descricao: formValues.descricao
    };

    await patchCarona(carona.id, {
      encomendas: [...(carona.encomendas || []), newEnc]
    });

    Swal.fire("OK!", "Solicitação de encomenda enviada!", "success");

    const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
    await renderPassageiroPanel(caronaAtualizada, currentUser);
  });

  $("#btn-atualizar-status").remove();
  const btnAtualizar = $('<button id="btn-atualizar-status" class="btn btn-outline-primary btn-sm mt-2"><i class="bi bi-arrow-clockwise"></i> Atualizar status</button>');
  btnAtualizar.on("click", async () => {
    const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
    await renderPassageiroPanel(caronaAtualizada, currentUser);
    Swal.fire("Atualizado!", "Status atualizado.", "success");
  });
  $("#detalhes-container-passageiro .container").append(btnAtualizar);
}


async function renderMotoristaPanel(carona) {
  const passList = $("#motorista-lista-passageiros").empty();
  const encList = $("#motorista-lista-encomendas").empty();

  const vehicle = await resolveVehicleForCarona(carona);
  const vagasTotais = vehicle ? vehicle.availableSeats : (carona.vagas || 0);
  const passageiros = carona.passageiros || [];
  const aprovados = passageiros.filter(p => p.status === "aprovado").length;
  const vagasRestantes = vagasTotais - aprovados;

  if (vagasRestantes <= 0) {
    $("#motorista-vagas-info").text('Sem vagas disponíveis').show();
  } else {
    const textoVagasInfo = `${aprovados} de ${vagasTotais} vaga${vagasTotais > 1 ? 's' : ''} ocupada${aprovados !== 1 ? 's' : ''} - ${vagasRestantes} disponível${vagasRestantes > 1 ? 'eis' : ''}`;
    $("#motorista-vagas-info").text(textoVagasInfo).show();
  }

  if (passageiros.length === 0) {
    passList.append('<p class="text-muted">Nenhum passageiro solicitou vaga ainda.</p>');
  } else {
    const passageirosAprovados = passageiros.filter(p => p.status === "aprovado");
    const passageirosPendentes = passageiros.filter(p => p.status === "pendente");
    const passageirosNegados = passageiros.filter(p => p.status === "negado");

    if (passageirosAprovados.length > 0) {
      const aprovadosHeader = $('<h6 class="mt-3 mb-2 text-success"><i class="bi bi-check-circle"></i> Passageiros Confirmados</h6>');
      passList.append(aprovadosHeader);

      for (let p of passageirosAprovados) {
        const user = await fetchJSON(`/users/${p.userId}`);

        let localizacao = "Localização não informada";
        if (user.endereco) {
          const partes = [];
          if (user.endereco.rua) partes.push(user.endereco.rua);
          if (user.endereco.numero) partes.push(`nº ${user.endereco.numero}`);
          if (user.endereco.comunidade) partes.push(user.endereco.comunidade);
          if (user.endereco.cidade) partes.push(user.endereco.cidade);
          if (partes.length > 0) {
            localizacao = partes.join(", ");
          }
        } else if (user.localizacao) {
          localizacao = user.localizacao;
        }

        const row = $(`
          <div class="mb-3 p-3 border border-success rounded bg-light">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge bg-success me-2">Confirmado</span>
                  <strong>${user.name}</strong>
                </div>
                <div class="text-muted small">
                  <i class="bi bi-geo-alt-fill"></i> ${localizacao}
                </div>
                ${user.telefone ? `<div class="text-muted small mt-1"><i class="bi bi-telephone"></i> ${user.telefone}</div>` : ''}
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary btn-chat-individual" data-user-id="${p.userId}" data-user-name="${user.name}" title="Conversar individualmente">
                  <i class="bi bi-chat-dots"></i>
                </button>
              </div>
            </div>
          </div>
        `);

        row.find(".btn-chat-individual").on("click", () => {
          window.location.href = `/pages/viagens/negociar.html?id=${carona.id}&userId=${p.userId}`;
        });

        passList.append(row);
      }
    }

    if (passageirosPendentes.length > 0) {
      const pendentesHeader = $('<h6 class="mt-3 mb-2 text-warning"><i class="bi bi-clock"></i> Solicitações Pendentes</h6>');
      passList.append(pendentesHeader);

      for (let p of passageirosPendentes) {
        const user = await fetchJSON(`/users/${p.userId}`);

        const row = $(`
          <div class="mb-3 p-3 border rounded d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center mb-2">
                <span class="badge bg-warning me-2">Pendente</span>
                <strong>${user.name}</strong>
              </div>
              ${user.endereco ? `<div class="text-muted small"><i class="bi bi-geo-alt-fill"></i> ${user.endereco.comunidade || ''}${user.endereco.cidade ? `, ${user.endereco.cidade}` : ''}</div>` : ''}
            </div>
            <div class="d-flex gap-2"></div>
          </div>
        `);

        const actions = row.find("div").eq(1);

        if (carona.statusViagem !== "concluida" && carona.statusViagem !== "cancelada") {
          const btnAprovar = $('<button class="btn btn-success btn-sm">Aprovar</button>');
          const btnNegar = $('<button class="btn btn-danger btn-sm">Negar</button>');

          btnAprovar.on("click", async () => {
            if (aprovados >= vagasTotais)
              return Swal.fire("Sem vagas", "Limite atingido.", "warning");

            await atualizarStatusPassageiro(carona.id, p.userId, "aprovado");
            const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
            await renderMotoristaPanel(caronaAtualizada);
          });

          btnNegar.on("click", async () => {
            await removerPassageiro(carona.id, p.userId);
            const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
            await renderMotoristaPanel(caronaAtualizada);
          });

          actions.append(btnAprovar, btnNegar);
        }

        passList.append(row);
      }
    }

    if (passageirosNegados.length > 0) {
      const negadosHeader = $('<h6 class="mt-3 mb-2 text-danger"><i class="bi bi-x-circle"></i> Solicitações Negadas</h6>');
      passList.append(negadosHeader);

      for (let p of passageirosNegados) {
        const user = await fetchJSON(`/users/${p.userId}`);

        const row = $(`
          <div class="mb-3 p-2 border border-danger rounded bg-light">
            <div class="d-flex align-items-center">
              <span class="badge bg-danger me-2">Negado</span>
              <strong>${user.name}</strong>
            </div>
          </div>
        `);

        passList.append(row);
      }
    }
  }

  const encomendas = carona.encomendas || [];
  if (encomendas.length === 0) {
    encList.append('<p class="text-muted">Nenhuma encomenda solicitada ainda.</p>');
  } else {
    for (let e of encomendas) {
      const user = await fetchJSON(`/users/${e.userId}`);
      
      const statusBadge = e.status === "aprovado" 
        ? '<span class="badge bg-success">Aprovado</span>'
        : e.status === "negado"
        ? '<span class="badge bg-danger">Negado</span>'
        : '<span class="badge bg-warning">Pendente</span>';

      const row = $(`
        <div class="mb-3 p-3 border rounded">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <strong>${user.name || user.nome || "Usuário"}</strong>
              ${statusBadge}
            </div>
            <div class="d-flex gap-2"></div>
          </div>
          <div class="mt-2">
            ${e.descricao ? `<p class="mb-2"><strong>O que é:</strong> ${e.descricao}</p>` : ''}
            <p class="mb-1"><strong><i class="bi bi-geo-alt-fill text-primary"></i> Onde pegar:</strong> ${e.enderecoBusca || 'Não informado'}</p>
            <p class="mb-0"><strong><i class="bi bi-geo-alt text-success"></i> Para onde levar:</strong> ${e.enderecoEntrega || 'Não informado'}</p>
          </div>
        </div>
      `);

      const actions = row.find("div").eq(1);

      if (e.status === "pendente" && carona.statusViagem !== "concluida" && carona.statusViagem !== "cancelada") {
        const btnAprovar = $('<button class="btn btn-success btn-sm">Aprovar</button>');
        const btnNegar = $('<button class="btn btn-danger btn-sm">Negar</button>');

        btnAprovar.on("click", async () => {
          await atualizarStatusEncomenda(carona.id, e.userId, "aprovado");
          const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
          await renderMotoristaPanel(caronaAtualizada);
        });

        btnNegar.on("click", async () => {
          await removerEncomenda(carona.id, e.userId);
          const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
          await renderMotoristaPanel(caronaAtualizada);
        });

        actions.append(btnAprovar, btnNegar);
      }

      encList.append(row);
    }
  }

  setupMotoristaButtons(carona);

  const currentUserId = Number(localStorage.getItem("userId"));
  const temPassageirosAprovados = passageiros.some(p => p.status === 'aprovado');
  const isCriador = carona.criadorId === currentUserId || carona.motoristaId === currentUserId;
  
  $("#btn-excluir-carona-oferecendo").remove();
  
  if (isCriador && !temPassageirosAprovados && carona.statusViagem !== 'iniciada' && carona.statusViagem !== 'concluida' && carona.statusViagem !== 'cancelada') {
    const $btnExcluir = $('<button id="btn-excluir-carona-oferecendo" class="btn btn-danger mt-3"><i class="bi bi-trash me-2"></i> Excluir oferta de carona</button>');
    $btnExcluir.on("click", async () => {
      const result = await Swal.fire({
        title: 'Excluir oferta de carona?',
        text: 'Tem certeza que deseja excluir esta oferta? Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
      });

      if (result.isConfirmed) {
        try {
          await fetchJSON(`/caronas/${carona.id}`, {
            method: 'DELETE'
          });
          Swal.fire('Excluída!', 'Oferta de carona excluída com sucesso.', 'success').then(() => {
            window.location.href = '/pages/caronas/index.html';
          });
        } catch {
          Swal.fire("Erro", "Não foi possível excluir a oferta.", "error");
        }
      }
    });
    $("#detalhes-container-motorista .card").last().after($btnExcluir);
  }
}


function setupMotoristaButtons(carona) {
  const statusViagem = carona.statusViagem || "agendada";
  const btnConcluir = $(".conclude-trip");
  const btnEditar = $("#edit-travel");
  const btnCancelar = $(".cancel-trip");

  btnConcluir.off("click");
  btnEditar.off("click");
  btnCancelar.off("click");

  if (statusViagem === "agendada") {
    btnConcluir.html('<i class="bi bi-play-circle me-1"></i> Iniciar viagem');
    btnConcluir.removeClass("btn-success").addClass("btn-primary");
    btnConcluir.on("click", async () => {
      const result = await Swal.fire({
        title: "Iniciar Viagem",
        text: "Deseja iniciar esta viagem?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, iniciar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        try {
          await patchCarona(carona.id, {
            statusViagem: "iniciada",
            dataInicio: new Date().toISOString()
          });
          Swal.fire("Sucesso!", "Viagem iniciada!", "success");
          const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
          await renderMotoristaPanel(caronaAtualizada);
        } catch {
          Swal.fire("Erro", "Não foi possível iniciar a viagem.", "error");
        }
      }
    });
  } else if (statusViagem === "iniciada") {
    btnConcluir.html('<i class="bi bi-check-circle me-1"></i> Concluir viagem');
    btnConcluir.removeClass("btn-primary").addClass("btn-success");
    btnConcluir.on("click", async () => {
      const result = await Swal.fire({
        title: "Concluir Viagem",
        text: "Deseja concluir esta viagem?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, concluir",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        try {
          await patchCarona(carona.id, {
            statusViagem: "concluida",
            dataConclusao: new Date().toISOString()
          });
          Swal.fire("Sucesso!", "Viagem concluída!", "success");
          const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
          await renderMotoristaPanel(caronaAtualizada);
        } catch {
          Swal.fire("Erro", "Não foi possível concluir a viagem.", "error");
        }
      }
    });
  } else {
    btnConcluir.prop("disabled", true);
    if (statusViagem === "concluida") {
      btnConcluir.html('<i class="bi bi-check-circle me-1"></i> Viagem concluída');
    } else if (statusViagem === "cancelada") {
      btnConcluir.html('<i class="bi bi-x-circle me-1"></i> Viagem cancelada');
    }
  }

  if (statusViagem === "agendada") {
    btnEditar.prop("disabled", false);
    btnEditar.on("click", () => {
      window.location.href = `/public/pages/viagens/editar.html?id=${carona.id}`;
    });
  } else {
    btnEditar.prop("disabled", true);
  }

  if (statusViagem === "agendada" || statusViagem === "iniciada") {
    btnCancelar.prop("disabled", false);
    btnCancelar.on("click", async () => {
      const result = await Swal.fire({
        title: "Cancelar Viagem",
        text: "Tem certeza que deseja cancelar esta viagem? Esta ação não pode ser desfeita.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, cancelar",
        cancelButtonText: "Não",
        confirmButtonColor: "#dc3545"
      });

      if (result.isConfirmed) {
        try {
          await patchCarona(carona.id, {
            statusViagem: "cancelada",
            dataCancelamento: new Date().toISOString()
          });
          Swal.fire("Cancelada!", "Viagem cancelada com sucesso.", "success");
          const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
          await renderMotoristaPanel(caronaAtualizada);
        } catch {
          Swal.fire("Erro", "Não foi possível cancelar a viagem.", "error");
        }
      }
    });
  } else {
    btnCancelar.prop("disabled", true);
  }
}

async function patchCarona(id, data) {
  await fetchJSON(`/caronas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

async function atualizarStatusPassageiro(caronaId, userId, novoStatus) {
  const carona = await fetchJSON(`/caronas/${caronaId}`);
  await patchCarona(caronaId, {
    passageiros: carona.passageiros.map(p =>
      p.userId === userId ? { ...p, status: novoStatus } : p
    )
  });
}

async function atualizarStatusEncomenda(caronaId, userId, novoStatus) {
  const carona = await fetchJSON(`/caronas/${caronaId}`);
  await patchCarona(caronaId, {
    encomendas: carona.encomendas.map(e =>
      e.userId === userId ? { ...e, status: novoStatus } : e
    )
  });
}

async function removerPassageiro(caronaId, userId) {
  const carona = await fetchJSON(`/caronas/${caronaId}`);
  await patchCarona(caronaId, {
    passageiros: carona.passageiros.filter(p => p.userId !== userId)
  });
}

async function removerEncomenda(caronaId, userId) {
  const carona = await fetchJSON(`/caronas/${caronaId}`);
  await patchCarona(caronaId, {
    encomendas: carona.encomendas.filter(e => e.userId !== userId)
  });
}

async function renderCriadorPanel(carona, currentUser) {
  const $lista = $("#criador-lista-motoristas").empty();
  const $aprovadoContainer = $("#criador-motorista-aprovado");
  const $aprovadoInfo = $("#criador-motorista-info");

  const currentUserId = Number(localStorage.getItem("userId"));
  const isCriador = carona.criadorId === currentUserId;
  let $btnExcluir = null;
  
  if (isCriador) {
    $("#btn-excluir-carona-pedindo").remove();
    $btnExcluir = $('<button id="btn-excluir-carona-pedindo" class="btn btn-danger mt-3 w-100"><i class="bi bi-trash me-2"></i> Excluir pedido de carona</button>');
    $btnExcluir.on("click", async () => {
      const result = await Swal.fire({
        title: 'Excluir pedido de carona?',
        text: 'Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
      });

      if (result.isConfirmed) {
        try {
          await fetchJSON(`/caronas/${carona.id}`, {
            method: 'DELETE'
          });
          Swal.fire('Excluído!', 'Pedido de carona excluído com sucesso.', 'success').then(() => {
            window.location.href = '/pages/caronas/index.html';
          });
        } catch {
          Swal.fire("Erro", "Não foi possível excluir o pedido.", "error");
        }
      }
    });
    $("#detalhes-container-criador .card").last().after($btnExcluir);
  }

  if (carona.motoristaId) {
    const motorista = await fetchJSON(`/users/${carona.motoristaId}`);
    const vehicle = await resolveVehicleForCarona(carona);

    $aprovadoInfo.html(`
      <div class="d-flex align-items-center mt-2">
        <img src="${motorista.avatar || 'https://placehold.co/40x40'}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
        <div>
          <strong>${motorista.name}</strong>
          <div class="text-muted small">★ ${motorista.rating || 5.0}</div>
          ${vehicle ? `<div class="text-muted small">${vehicle.brand} ${vehicle.model} - ${vehicle.availableSeats} vagas</div>` : ''}
        </div>
      </div>
    `);
    $aprovadoContainer.show();
    $lista.html('<p class="text-muted">Você já aprovou um motorista para esta carona.</p>');
    if ($btnExcluir) {
      $("#criador-lista-motoristas").parent().append($btnExcluir);
    }
    return;
  }

  $aprovadoContainer.hide();

  const motoristasCandidatos = carona.motoristasCandidatos || [];

  if (motoristasCandidatos.length === 0) {
    $lista.html('<p class="text-muted">Nenhum motorista se candidatou ainda.</p>');
    if ($btnExcluir) {
      $("#criador-lista-motoristas").parent().append($btnExcluir);
    }
    return;
  }

  for (let candidato of motoristasCandidatos) {
    const motorista = await fetchJSON(`/users/${candidato.motoristaId}`);
    const veiculos = await fetchJSON(`/vehicles?motoristaId=${candidato.motoristaId}`);
    const veiculo = veiculos.length > 0 ? veiculos[0] : null;

    const row = $(`
      <div class="mb-3 p-3 border rounded">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-2">
              <img src="${motorista.avatar || 'https://placehold.co/40x40'}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
              <div>
                <strong>${motorista.name}</strong>
                <div class="text-muted small">★ ${motorista.rating || 5.0}</div>
              </div>
            </div>
            ${veiculo ? `<div class="text-muted small"><i class="bi bi-car-front"></i> ${veiculo.brand} ${veiculo.model} - ${veiculo.availableSeats} vagas</div>` : ''}
            ${candidato.mensagem ? `<div class="text-muted small mt-2"><i class="bi bi-chat"></i> "${candidato.mensagem}"</div>` : ''}
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm btn-aprovar-motorista" data-motorista-id="${candidato.motoristaId}">
              Aprovar
            </button>
            <button class="btn btn-danger btn-sm btn-negar-motorista" data-motorista-id="${candidato.motoristaId}">
              Negar
            </button>
          </div>
        </div>
      </div>
    `);

    row.find(".btn-aprovar-motorista").on("click", async () => {
      await patchCarona(carona.id, {
        motoristaId: candidato.motoristaId,
        motoristasCandidatos: motoristasCandidatos.filter(m => m.motoristaId !== candidato.motoristaId)
      });

      Swal.fire("Aprovado!", "Motorista aprovado com sucesso.", "success");
      const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
      await renderCriadorPanel(caronaAtualizada, currentUser);
    });

    row.find(".btn-negar-motorista").on("click", async () => {
      await patchCarona(carona.id, {
        motoristasCandidatos: motoristasCandidatos.filter(m => m.motoristaId !== candidato.motoristaId)
      });

      Swal.fire("Negado", "Candidatura negada.", "info");
      const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
      await renderCriadorPanel(caronaAtualizada, currentUser);
    });

    $lista.append(row);
  }

  if ($btnExcluir) {
    $("#criador-lista-motoristas").parent().append($btnExcluir);
  }
}

async function renderMotoristaCandidatoPanel(carona, currentUser) {
  const $status = $("#candidato-status");
  const $btn = $("#btn-candidatar-motorista");

  const currentUserId = Number(localStorage.getItem("userId"));
  const motoristasCandidatos = carona.motoristasCandidatos || [];
  const jaCandidatou = motoristasCandidatos.some(m => m.motoristaId === currentUserId);

  if (carona.motoristaId) {
    if (carona.motoristaId === currentUserId) {
      window.location.reload();
      return;
    } else {
      $status.html('<div class="alert alert-warning">Esta carona já tem um motorista aprovado.</div>');
      $btn.prop("disabled", true).text("Carona já tem motorista");
    }
    return;
  }

  if (jaCandidatou) {
    $status.html('<div class="alert alert-info">Você já se candidatou. Aguardando aprovação do passageiro.</div>');
    $btn.prop("disabled", true).text("Aguardando aprovação");
    return;
  }

  $status.html('<div class="alert alert-secondary">Você pode se candidatar para ser o motorista desta carona.</div>');
  $btn.prop("disabled", false).off("click").on("click", async () => {
    const veiculos = await fetchJSON(`/vehicles?motoristaId=${currentUserId}`);
    if (veiculos.length === 0) {
      Swal.fire("Atenção", "Você precisa ter pelo menos um veículo cadastrado para se candidatar.", "warning");
      return;
    }

    const novoCandidato = {
      motoristaId: currentUserId,
      status: "pendente",
      timestamp: Date.now()
    };

    await patchCarona(carona.id, {
      motoristasCandidatos: [...motoristasCandidatos, novoCandidato]
    });

    Swal.fire("Candidatura enviada!", "Sua candidatura foi enviada. Aguarde a aprovação do passageiro.", "success");
    const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
    await renderMotoristaCandidatoPanel(caronaAtualizada, currentUser);
  });
}

async function renderPedindoAprovadoPanel(carona, currentUser, role) {
  const $btn = $("#btn-conversar-pedindo");
  const $info = $("#outro-participante-info");
  const statusViagem = carona.statusViagem || "agendada";

  let outroParticipante = null;
  let outroRole = '';
  let veiculo = null;

  if (role === 'motorista') {
    outroParticipante = await fetchJSON(`/users/${carona.passageiroId}`);
    outroRole = 'Passageiro';
    $btn.html(`<i class="bi bi-chat-dots me-2"></i> Conversar com ${outroParticipante.name}`);
  } else {
    outroParticipante = await fetchJSON(`/users/${carona.motoristaId}`);
    outroRole = 'Motorista';
    $btn.html('<i class="bi bi-chat-dots me-2"></i> Conversar com o motorista');

    const veiculos = await fetchJSON(`/vehicles?motoristaId=${carona.motoristaId}`);
    veiculo = veiculos.length > 0 ? veiculos[0] : null;
  }

  if (!outroParticipante) {
    $info.html('<p class="text-muted">Carregando informações...</p>');
  } else {
    let infoExtra = '';
    let statusMensagem = '';

    if (statusViagem === "iniciada") {
      if (role === 'passageiro') {
        statusMensagem = '<div class="alert alert-info mb-3"><i class="bi bi-car-front me-2"></i><strong>O motorista está a caminho!</strong></div>';
      } else {
        statusMensagem = '<div class="alert alert-primary mb-3"><i class="bi bi-play-circle me-2"></i><strong>Viagem em andamento</strong></div>';
      }
    }

    if (role === 'motorista') {
      if (outroParticipante.endereco) {
        const partes = [];
        if (outroParticipante.endereco.comunidade) partes.push(outroParticipante.endereco.comunidade);
        if (outroParticipante.endereco.cidade) partes.push(outroParticipante.endereco.cidade);
        if (partes.length > 0) {
          infoExtra = `<div class="text-muted small mt-1"><i class="bi bi-geo-alt-fill"></i> ${partes.join(', ')}</div>`;
        }
      }
    } else {
      if (veiculo) {
        infoExtra = `<div class="text-muted small mt-1"><i class="bi bi-car-front"></i> ${veiculo.brand} ${veiculo.model} - ${veiculo.availableSeats} vagas</div>`;
      }
    }

    $info.html(`
      ${statusMensagem}
      <div class="d-flex align-items-center mb-3 p-3 border rounded bg-light">
        <img src="${outroParticipante.avatar || 'https://placehold.co/60x60'}" 
             class="rounded-circle me-3" 
             style="width: 60px; height: 60px; object-fit: cover;">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center mb-1">
            <strong class="me-2">${outroParticipante.name}</strong>
            <span class="text-muted">★ ${outroParticipante.rating || 5.0}</span>
          </div>
          <div class="text-muted small">${outroRole}</div>
          ${infoExtra}
        </div>
      </div>
    `);
  }

  $btn.off("click").on("click", () => {
    window.location.href = `/pages/viagens/negociar.html?id=${carona.id}`;
  });
  $btn.show();

  if (role === 'motorista') {
    let $btnIniciar = $("#btn-iniciar-viagem-pedindo");
    
    if (!$btnIniciar.length) {
      $btnIniciar = $('<button id="btn-iniciar-viagem-pedindo" class="btn btn-primary btn-lg w-100 mt-3"></button>');
      $btn.after($btnIniciar);
    }

    if (statusViagem === "agendada") {
      $btnIniciar.html('<i class="bi bi-play-circle me-2"></i> Iniciar viagem');
      $btnIniciar.removeClass("btn-success").addClass("btn-primary");
      $btnIniciar.show();
      $btnIniciar.off("click").on("click", async () => {
        const result = await Swal.fire({
          title: "Iniciar Viagem",
          text: "Deseja iniciar esta viagem?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sim, iniciar",
          cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
          try {
            await patchCarona(carona.id, {
              statusViagem: "iniciada",
              dataInicio: new Date().toISOString()
            });
            Swal.fire("Sucesso!", "Viagem iniciada!", "success");
            const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
            await renderPedindoAprovadoPanel(caronaAtualizada, currentUser, role);
          } catch {
            Swal.fire("Erro", "Não foi possível iniciar a viagem.", "error");
          }
        }
      });
    } else if (statusViagem === "iniciada") {
      $btnIniciar.html('<i class="bi bi-check-circle me-2"></i> Concluir viagem');
      $btnIniciar.removeClass("btn-primary").addClass("btn-success");
      $btnIniciar.show();
      $btnIniciar.off("click").on("click", async () => {
        const result = await Swal.fire({
          title: "Concluir Viagem",
          text: "Deseja concluir esta viagem?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sim, concluir",
          cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
          try {
            await patchCarona(carona.id, {
              statusViagem: "concluida",
              dataFim: new Date().toISOString()
            });
            Swal.fire("Sucesso!", "Viagem concluída!", "success");
            const caronaAtualizada = await fetchJSON(`/caronas/${carona.id}`);
            await renderPedindoAprovadoPanel(caronaAtualizada, currentUser, role);
          } catch {
            Swal.fire("Erro", "Não foi possível concluir a viagem.", "error");
          }
        }
      });
    } else {
      $btnIniciar.hide();
    }
  } else {
    $("#btn-iniciar-viagem-pedindo").hide();
  }
}
