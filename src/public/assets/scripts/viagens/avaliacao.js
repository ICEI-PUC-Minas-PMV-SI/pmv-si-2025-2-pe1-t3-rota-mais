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
        const motorista = carona.motoristaId ? await fetchJSON(`/users/${carona.motoristaId}`) : null;

        const encomendasAprovadas = (carona.encomendas || []).filter(e => e.status === 'aprovado');
        const userEncomenda = encomendasAprovadas.find(e => e.userId === currentUserId);
        const isEncomenda = !!userEncomenda && carona.tipo === 'oferecendo';

        const $container = $(".avaliacao-container");
        $container.empty();

        if (isEncomenda) {
            if (motorista && motorista.id !== currentUserId) {
                criarItemAvaliacao(motorista, "Motorista", $container);
            }
        } else if (carona.tipo === 'pedindo') {
            const isMotorista = carona.motoristaId === currentUserId;
            const isPassageiro = carona.passageiroId === currentUserId;

            if (isMotorista) {
                if (carona.passageiroId && carona.passageiroId !== currentUserId) {
                    const passageiro = await fetchJSON(`/users/${carona.passageiroId}`);
                    criarItemAvaliacao(passageiro, "Passageiro", $container);
                }
            } else if (isPassageiro) {
                if (motorista && motorista.id !== currentUserId) {
                    criarItemAvaliacao(motorista, "Motorista", $container);
                }
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

    } catch {
        Swal.fire("Erro", "Falha ao carregar dados da viagem.", "error");
    }
});

function criarItemAvaliacao(user, papel, $container) {
    const papelEmoji = papel === 'Motorista' ? '🚗' : '👤';
    const $item = $(`
    <div class="avaliacao-item mb-4 p-4 border rounded shadow-sm" data-user-id="${user.id}" style="background-color: #f8f9fa;">
      <div class="d-flex align-items-start gap-3 mb-3">
        <img src="${user.avatar || 'https://placehold.co/60x60'}" class="rounded-circle" alt="Foto" width="60" height="60" style="object-fit: cover; border: 2px solid #dee2e6;">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-1">
            <strong style="font-size: 1.1rem;">${user.name || 'Usuário'}</strong>
            <span class="badge bg-info">${papelEmoji} ${papel}</span>
            <span class="text-muted ms-auto">★ ${user.rating || '5.0'}</span>
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <label class="form-label fw-bold">Avaliação com estrelas:</label>
        <div class="d-flex gap-1 avaliacao-estrelas" data-user-id="${user.id}" style="font-size: 2rem;">
          <i class="bi bi-star-fill text-secondary estrela" data-value="1" data-user-id="${user.id}" style="cursor: pointer; transition: all 0.2s;"></i>
          <i class="bi bi-star-fill text-secondary estrela" data-value="2" data-user-id="${user.id}" style="cursor: pointer; transition: all 0.2s;"></i>
          <i class="bi bi-star-fill text-secondary estrela" data-value="3" data-user-id="${user.id}" style="cursor: pointer; transition: all 0.2s;"></i>
          <i class="bi bi-star-fill text-secondary estrela" data-value="4" data-user-id="${user.id}" style="cursor: pointer; transition: all 0.2s;"></i>
          <i class="bi bi-star-fill text-secondary estrela" data-value="5" data-user-id="${user.id}" style="cursor: pointer; transition: all 0.2s;"></i>
        </div>
      </div>
      
      <div>
        <label class="form-label fw-bold">Comentário (opcional):</label>
        <textarea class="form-control comentario-avaliacao" rows="3" 
          placeholder="Deixe um comentário sobre sua experiência com este participante..." 
          data-user-id="${user.id}"
          style="resize: none;"></textarea>
      </div>
    </div>
  `);

    $item.find(".estrela").on("click", function () {
        const userId = $(this).data("user-id");
        const value = $(this).data("value");
        atualizarEstrelas(userId, value);
    });

    $item.find(".estrela").on("mouseenter", function () {
        const userId = $(this).data("user-id");
        const value = $(this).data("value");
        $(`.estrela[data-user-id="${userId}"]`).each(function () {
            const estrelaValue = $(this).data("value");
            if (estrelaValue <= value) {
                $(this).css("transform", "scale(1.1)");
            }
        });
    }).on("mouseleave", function () {
        const userId = $(this).data("user-id");
        $(`.estrela[data-user-id="${userId}"]`).css("transform", "scale(1)");
    });

    $container.append($item);
}

function atualizarEstrelas(userId, value) {
    $(`.estrela[data-user-id="${userId}"]`).each(function () {
        const estrelaValue = $(this).data("value");
        if (estrelaValue <= value) {
            $(this).removeClass("text-secondary").addClass("text-warning");
            $(this).css("transform", "scale(1)");
        } else {
            $(this).removeClass("text-warning").addClass("text-secondary");
            $(this).css("transform", "scale(1)");
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
    } catch {
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
    } catch {}
}

