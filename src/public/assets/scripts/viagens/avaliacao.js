async function fetchJSON(path, options = {}) {
    const res = await fetch(API_BASE + path, options);
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    return await res.json();
}

function checkAuth() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "../../autenticacao/login.html";
        return false;
    }
    return true;
}

async function resolveMotorista(carona) {
    if (!carona.motoristaId) return null;
    return await fetchJSON(`/users/${carona.motoristaId}`);
}

$(document).ready(async function () {
    if (!checkAuth()) return;

    const currentUserId = Number(localStorage.getItem("userId"));
    const params = new URLSearchParams(window.location.search);
    const caronaId = params.get("id");

    if (!caronaId) {
        Swal.fire("Erro", "ID da viagem não encontrado.", "error").then(() => {
            window.location.href = "index.html";
        });
        return;
    }

    try {
        const carona = await fetchJSON(`/caronas/${caronaId}`);
        const motorista = await resolveMotorista(carona);

        const encomendasAprovadas = (carona.encomendas || []).filter(e => e.status === 'aprovado');
        const userEncomenda = encomendasAprovadas.find(e => e.userId === currentUserId);
        const isEncomenda = !!userEncomenda && carona.tipo === 'oferecendo';

        const $container = $(".avaliacao-container");
        $container.empty();

        if (isEncomenda) {
            if (motorista && motorista.id !== currentUserId) {
                criarItemAvaliacao(motorista, "Motorista", $container);
            }
        } else {
            const passageiros = carona.passageiros || [];
            const passageirosAprovados = passageiros.filter(p => p.status === 'aprovado' && p.userId !== currentUserId);

            for (const passageiro of passageirosAprovados) {
                const user = await fetchJSON(`/users/${passageiro.userId}`);
                criarItemAvaliacao(user, "Passageiro", $container);
            }

            if (motorista && motorista.id !== currentUserId) {
                criarItemAvaliacao(motorista, "Motorista", $container);
            }
        }

        if ($container.children().length === 0) {
            $container.html('<p class="text-muted text-center py-5">Nenhum participante para avaliar nesta viagem.</p>');
        }

        $(".btn-success").on("click", async function () {
            await salvarAvaliacoes(caronaId, currentUserId);
        });

    } catch (e) {
        console.error("Erro ao carregar dados da viagem:", e);
        Swal.fire("Erro", "Falha ao carregar dados da viagem.", "error");
    }
});

function criarItemAvaliacao(user, papel, $container) {
    const $item = $(`
    <div class="avaliacao-item mb-3" data-user-id="${user.id}">
      <div class="d-flex align-items-start gap-3 p-3 pb-0">
        <img src="${user.avatar || 'https://placehold.co/40x40'}" class="rounded-circle" alt="Foto" width="50" height="50" style="object-fit: cover;">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="d-flex flex-column justify-content-around">
              <div class="d-flex align-items-center gap-2">
                <strong>${user.name || 'Usuário'}</strong>
                <span class="text-muted">★ ${user.rating || '5.0'}</span>
              </div>
              <div>
                <span class="text-muted">${papel}</span>
              </div>
            </div>
            <div class="d-flex justify-content-end w-75">
              <textarea class="form-control resize-none comentario-avaliacao" rows="2" 
                placeholder="Adicione um comentário" data-user-id="${user.id}"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex mb-2 px-3 avaliacao-estrelas" data-user-id="${user.id}">
        <i class="bi bi-star-fill me-2 fs-1 text-secondary estrela" data-value="1" data-user-id="${user.id}"></i>
        <i class="bi bi-star-fill me-2 fs-1 text-secondary estrela" data-value="2" data-user-id="${user.id}"></i>
        <i class="bi bi-star-fill me-2 fs-1 text-secondary estrela" data-value="3" data-user-id="${user.id}"></i>
        <i class="bi bi-star-fill me-2 fs-1 text-secondary estrela" data-value="4" data-user-id="${user.id}"></i>
        <i class="bi bi-star-fill me-2 fs-1 text-secondary estrela" data-value="5" data-user-id="${user.id}"></i>
      </div>
    </div>
  `);

    $item.find(".estrela").on("click", function () {
        const userId = $(this).data("user-id");
        const value = $(this).data("value");
        atualizarEstrelas(userId, value);
    });

    $container.append($item);
}

function atualizarEstrelas(userId, value) {
    $(`.estrela[data-user-id="${userId}"]`).each(function () {
        const estrelaValue = $(this).data("value");
        if (estrelaValue <= value) {
            $(this).removeClass("text-secondary").addClass("text-warning");
        } else {
            $(this).removeClass("text-warning").addClass("text-secondary");
        }
    });
}

async function salvarAvaliacoes(caronaId, avaliadorId) {
    const avaliacoes = [];
    let todasAvaliadas = true;

    $(".avaliacao-item").each(function () {
        const userId = $(this).data("user-id");
        const estrelas = $(this).find(".estrela.text-warning").length;
        const comentario = $(this).find(`.comentario-avaliacao[data-user-id="${userId}"]`).val().trim();

        if (estrelas === 0) {
            todasAvaliadas = false;
            return false;
        }

        avaliacoes.push({
            avaliadorId: avaliadorId,
            avaliadoId: userId,
            rating: estrelas,
            comentario: comentario || null,
            caronaId: caronaId,
            timestamp: Date.now()
        });
    });

    if (!todasAvaliadas) {
        Swal.fire("Atenção", "Por favor, avalie todos os participantes antes de salvar.", "warning");
        return;
    }

    try {
        for (const avaliacao of avaliacoes) {
            await fetchJSON(`/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: Date.now() + Math.random(),
                    ...avaliacao
                })
            });
        }

        for (const avaliacao of avaliacoes) {
            await atualizarMediaAvaliacao(avaliacao.avaliadoId);
        }

        Swal.fire("Sucesso!", "Avaliações salvas com sucesso.", "success").then(() => {
            window.location.href = "index.html";
        });
    } catch (e) {
        console.error("Erro ao salvar avaliações:", e);
        Swal.fire("Erro", "Não foi possível salvar as avaliações.", "error");
    }
}

async function atualizarMediaAvaliacao(userId) {
    try {
        const todasAvaliacoes = await fetchJSON(`/avaliacoes?avaliadoId=${userId}`);

        if (todasAvaliacoes.length === 0) {
            return;
        }

        const somaRatings = todasAvaliacoes.reduce((acc, av) => acc + av.rating, 0);
        const media = somaRatings / todasAvaliacoes.length;
        const mediaArredondada = Math.round(media * 10) / 10;

        const user = await fetchJSON(`/users/${userId}`);
        await fetchJSON(`/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rating: mediaArredondada
            })
        });
    } catch (e) {
        console.error(`Erro ao atualizar média de avaliação do usuário ${userId}:`, e);
    }
}

