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
    const $container = $("#caronas-container");

    const buttons = document.querySelectorAll('.filter-tab');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            loadViagens(currentUserId, button.id);
        });
    });

    await loadViagens(currentUserId, 'bnt-locais-regiao');
});

async function loadViagens(userId, filterId) {
    const $container = $("#caronas-container");
    $container.empty();

    try {
        const caronas = await fetchJSON("/caronas");

        let viagens = caronas.filter(c => {
            const status = c.statusViagem || 'agendada';
            if (status !== 'concluida' && status !== 'cancelada') return false;

            const isMotorista = c.motoristaId === userId && c.tipo === 'oferecendo';
            const isPassageiro = c.passageiros && c.passageiros.some(p => p.userId === userId && p.status === 'aprovado');
            const isEncomenda = c.encomendas && c.encomendas.some(e => e.userId === userId && e.status === 'aprovado');

            return isMotorista || isPassageiro || isEncomenda;
        });

        if (filterId === 'bnt-locais-comunidade') {
            viagens = viagens.filter(c => c.tipo === 'oferecendo' || c.tipo === 'pedindo');
        } else if (filterId === 'bnt-encomendas') {
            viagens = viagens.filter(c => {
                const encomendas = c.encomendas || [];
                return encomendas.some(e => e.userId === userId && e.status === 'aprovado');
            });
        } else if (filterId === 'bnt-concluidas') {
            viagens = viagens.filter(c => (c.statusViagem || 'agendada') === 'concluida');
        } else if (filterId === 'bnt-canceladas') {
            viagens = viagens.filter(c => (c.statusViagem || 'agendada') === 'cancelada');
        }

        if (viagens.length === 0) {
            $container.html('<p class="text-muted text-center py-5">Nenhuma viagem encontrada.</p>');
            return;
        }

        viagens.sort((a, b) => (b.id || 0) - (a.id || 0));

        for (const carona of viagens) {
            const motorista = await resolveMotorista(carona);
            const origem = carona.rota?.origem || 'Não informado';
            const destino = carona.rota?.destino || 'Não informado';
            const data = carona.data || 'Data não informada';
            const horario = carona.horario || '';
            const status = carona.statusViagem || 'agendada';

            const isMotorista = carona.motoristaId === userId;
            const isEncomenda = carona.encomendas && carona.encomendas.some(e => e.userId === userId && e.status === 'aprovado');
            let papel = isMotorista ? 'motorista' : 'passageiro';
            if (isEncomenda && !isMotorista) papel = 'solicitante de encomenda';

            let tipoViagem = 'carona';
            if (isEncomenda && carona.tipo === 'oferecendo') tipoViagem = 'encomenda';

            const statusText = status === 'concluida' ? 'Concluída' : 'Cancelada';
            const statusClass = status === 'concluida' ? 'success' : 'danger';
            const statusIcon = status === 'concluida' ? 'check-circle' : 'x-circle';

            let botaoHtml = '';
            if (status === 'concluida') {
                botaoHtml = `<button type="button" class="viagens-conferir-info btn-avaliar-viagem btn btn-success" data-carona-id="${carona.id}">
          <i class="bi bi-star-fill me-1"></i> Avaliar viagem
        </button>`;
            } else {
                botaoHtml = `<a href="/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo}" class="viagens-conferir-info btn btn-outline-secondary">
          <i class="bi bi-info-circle me-1"></i> Ver detalhes
        </a>`;
            }

            const $card = $(`
        <div class="viagens-box-locais mb-4">
          <div class="viagens-info">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <p class="mb-0">Você é <strong>${papel}</strong> de uma <strong>${tipoViagem}</strong>.</p>
              <span class="badge bg-${statusClass}"><i class="bi bi-${statusIcon}"></i> ${statusText}</span>
            </div>
            <p class="viagens-origem-destino">De <strong>${origem}</strong> para <strong>${destino}</strong>.</p>
            <p class="viagens-data bi bi-calendar3">
              <strong>Dia <time datetime="${data}">${data} ${horario ? 'às ' + horario : ''}</time></strong>
            </p>
            ${botaoHtml}
          </div>
        </div>
      `);

            $container.append($card);
        }

        $container.off("click", ".btn-avaliar-viagem").on("click", ".btn-avaliar-viagem", function () {
            const caronaId = $(this).data("carona-id");
            window.location.href = `avaliacao.html?id=${caronaId}`;
        });

    } catch (e) {
        console.error("Erro ao carregar viagens:", e);
        $container.html('<p class="text-danger text-center py-5">Erro ao carregar viagens.</p>');
    }
}
