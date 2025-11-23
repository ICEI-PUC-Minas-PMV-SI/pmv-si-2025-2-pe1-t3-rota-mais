$(async function () {
    const API = API_BASE || 'http://localhost:3000';

    async function fetchJSON(path, opts = {}) {
        const res = await fetch(`${API}${path}`, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }
    async function patchJSON(path, body) {
        const res = await fetch(`${API}${path}`, {
            method: 'PATCH',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Patch error');
        return await res.json();
    }

    function buildRow(label, value, icon) {
        if (!value) value = "Não informado";
        return `
            <div class="mb-3 p-3 border rounded bg-light">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi ${icon} fs-4 text-primary"></i>
                    <div>
                        <div class="fw-bold">${label}</div>
                        <div class="text-muted">${value}</div>
                    </div>
                </div>
            </div>
        `;
    }

    const $container = $('#encomenda-detalhes');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { $container.html('<p class="text-danger">ID inválido.</p>'); return; }

    try {
        let encomenda = await fetchJSON(`/encomendas/${id}`);
        const user = encomenda.usuario || {};
        const isPedido = encomenda.tipo === 'pedindo';
        const titulo = isPedido ? 'Pedido de Encomenda' : 'Oferta de Transporte';
        const criadorNome = user.nome || user.name || 'Usuário';
        const criadorAvatar = user.avatar || 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';
        const currentUserId = Number(localStorage.getItem('userId')) || (JSON.parse(localStorage.getItem('user')||'null')?.id);

        // render básico
        let html = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <img src="${criadorAvatar}" class="rounded-circle" style="width:55px; height:55px; object-fit:cover;">
                        <div>
                            <h4 class="fw-bold mb-0">${titulo}</h4>
                            <small class="text-muted">Criado por ${criadorNome}</small>
                        </div>
                    </div>

                    ${buildRow('Origem', encomenda.origem, 'bi-geo-alt-fill')}
                    ${buildRow('Destino', encomenda.destino, 'bi-geo')}
                    ${buildRow('Data', encomenda.dataTexto, 'bi-calendar3')}
                    ${buildRow('Horário', encomenda.horario, 'bi-clock')}
                    ${(encomenda.veiculo && !isPedido) ? buildRow('Veículo', encomenda.veiculo, 'bi-car-front-fill') : ''}
                </div>
            </div>
            <div id="encomenda-candidatos" class="mt-4"></div>
            <div class="mt-4 d-flex gap-2">
                <button id="btn-conversar" class="btn btn-primary"><i class="bi bi-chat-dots"></i> Conversar</button>
        `;

        // excluir se for criador
        if (encomenda.criadorId && Number(encomenda.criadorId) === currentUserId) {
            html += `<button id="btn-excluir" class="btn btn-danger"><i class="bi bi-trash"></i> Excluir</button>`;
        }
        html += '</div>';
        $container.html(html);

        // render candidatos area
        const $candWrap = $('#encomenda-candidatos');
        function renderCandidatos() {
            const candidatos = Array.isArray(encomenda.candidatos) ? encomenda.candidatos : [];
            if (!candidatos.length) {
                $candWrap.html('<p class="text-muted">Nenhuma candidatura ainda.</p>');
                return;
            }
            let inner = '<h5>Candidatos</h5>';
            for (const c of candidatos) {
                const uid = c.userId;
                const status = c.status || 'pendente';
                inner += `<div class="mb-3 p-3 border rounded d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="me-2">Usuário #${uid}</strong>
                        <small class="text-muted">- ${new Date(c.timestamp||0).toLocaleString()}</small>
                        <div class="mt-1"><span class="encomenda-state ${status==='aprovado'?'approved':status==='negado'?'denied':'pending'}">${status.toUpperCase()}</span></div>
                    </div>
                    <div class="d-flex gap-2 align-items-center" data-userid="${uid}">
                        ${ (Number(encomenda.criadorId) === currentUserId && status === 'pendente') ? `<button class="btn btn-success btn-sm btn-aprovar" data-userid="${uid}">Aprovar</button>
                        <button class="btn btn-danger btn-sm btn-negar" data-userid="${uid}">Negar</button>` : '' }
                    </div>
                </div>`;
            }
            $candWrap.html(inner);

            // attach handlers
            $candWrap.find('.btn-aprovar').on('click', async function () {
                const uid = Number($(this).data('userid'));
                await aprovarCandidato(uid);
            });
            $candWrap.find('.btn-negar').on('click', async function () {
                const uid = Number($(this).data('userid'));
                await negarCandidato(uid);
            });
        }

        async function aprovarCandidato(userId) {
            // set candidato.status = 'aprovado' and set transportadorId
            const candidatos = Array.isArray(encomenda.candidatos) ? encomenda.candidatos : [];
            const novo = candidatos.map(c => c.userId === userId ? {...c, status:'aprovado'} : c);
            // set transportadorId for the encomenda
            await patchJSON(`/encomendas/${encomenda.id}`, { candidatos: novo, transportadorId: userId, status: 'em andamento' });
            encomenda = await fetchJSON(`/encomendas/${encomenda.id}`);
            renderCandidatos();
            Swal.fire('Aprovado','Candidato aprovado com sucesso','success');
        }

        async function negarCandidato(userId) {
            const candidatos = Array.isArray(encomenda.candidatos) ? encomenda.candidatos : [];
            const novo = candidatos.map(c => c.userId === userId ? {...c, status:'negado'} : c);
            await patchJSON(`/encomendas/${encomenda.id}`, { candidatos: novo });
            encomenda = await fetchJSON(`/encomendas/${encomenda.id}`);
            renderCandidatos();
            Swal.fire('Negado','Candidato negado','info');
        }

        renderCandidatos();

        // conversar placeholder
        $('#btn-conversar').on('click', () => {
            Swal.fire('Em breve', 'Funcionalidade de chat será implementada', 'info');
        });

        // excluir
        $('#btn-excluir').on('click', async () => {
            const res = await Swal.fire({
                title: 'Excluir?',
                text: 'Deseja realmente excluir esta encomenda?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir'
            });
            if (!res.isConfirmed) return;
            await fetch(`${API}/encomendas/${encomenda.id}`, { method: 'DELETE' });
            Swal.fire('Excluído','Encomenda removida','success').then(()=> window.location.href = '/pages/encomendas/index.html');
        });

    } catch (err) {
        console.error(err);
        $container.html('<p class="text-danger">Erro ao carregar detalhes.</p>');
    }
});
