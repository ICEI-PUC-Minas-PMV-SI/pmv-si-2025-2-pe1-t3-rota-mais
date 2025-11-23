// encomendas.js
$(function () {
    // usa API_BASE global
    const API = API_BASE || 'http://localhost:3000';

    async function fetchJSON(path, opts = {}) {
        const res = await fetch(`${API}${path}`, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }

    async function patchJSON(path, body) {
        const res = await fetch(`${API}${path}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`Patch failed ${res.status}`);
        return await res.json();
    }

    function el(tag, cls, text) {
        const $e = $(`<${tag}>`);
        if (cls) $e.addClass(cls);
        if (text !== undefined) $e.text(text);
        return $e;
    }

    function clear($c) { $c.empty(); }

    function emptyState($c, icon, msg) {
        const $wrap = $('<div>').addClass('text-center py-5');
        const $i = $('<i>').addClass(icon).css('font-size','2.6rem').css('color','#d1d5db');
        const $p = $('<p>').addClass('mt-3').text(msg);
        $wrap.append($i, $p);
        clear($c); $c.append($wrap);
    }

    function getCurrentUser() {
        try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
    }
    const currentUser = getCurrentUser();
    const currentUserId = Number(localStorage.getItem('userId')) || (currentUser && currentUser.id) || null;

    // load all
    async function loadEncomendas() {
        const $container = $('#encomendas-container');
        try {
            const list = await fetchJSON('/encomendas');
            clear($container);
            if (!list || !list.length) {
                emptyState($container, 'bi bi-inbox', 'Nenhuma encomenda disponível no momento');
                return;
            }
            list.sort((a,b)=> (b.id||0) - (a.id||0)).forEach(e => $container.append(buildEncomendaCard(e)));
        } catch (err) {
            console.error(err);
            emptyState($('#encomendas-container'), 'bi bi-exclamation-triangle', 'Erro ao carregar encomendas');
        }
    }

    // filter handler
    async function filterEncomendas(tipo) {
        const $container = $('#encomendas-container');
        try {
            const all = await fetchJSON('/encomendas');
            let list = all;
            if (tipo && tipo !== 'todos') list = all.filter(i => i.tipo === tipo);
            clear($container);
            if (!list.length) {
                emptyState($container, 'bi bi-search', 'Nenhuma encomenda encontrada');
                return;
            }
            list.sort((a,b)=> (b.id||0) - (a.id||0)).forEach(e => $container.append(buildEncomendaCard(e)));
        } catch (err) {
            console.error(err);
            emptyState($('#encomendas-container'), 'bi bi-exclamation-triangle', 'Erro ao filtrar encomendas');
        }
    }

    // adicionar candidato (user se candidata a oferta / oferece transporte a pedido)
    async function addCandidate(encomendaId, candidateObj) {
        // pega encomenda atual
        const enc = await fetchJSON(`/encomendas/${encomendaId}`);
        const candidatos = Array.isArray(enc.candidatos) ? enc.candidatos : [];
        // evitar duplicados por userId
        if (candidatos.some(c => c.userId === candidateObj.userId)) throw new Error('Já cadastrado');
        const novo = [...candidatos, candidateObj];
        return await patchJSON(`/encomendas/${encomendaId}`, { candidatos: novo });
    }

    // build card
    function buildEncomendaCard(encomenda) {
        const tipo = encomenda.tipo === 'oferecendo' ? 'oferecendo' : 'pedindo';
        const nome = encomenda.usuario?.nome || encomenda.usuario?.name || 'Usuário';
        const avatar = encomenda.usuario?.avatar || 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';
        const origem = encomenda.origem || '';
        const destino = encomenda.destino || '';
        const dataTexto = encomenda.dataTexto || '';
        const horario = encomenda.horario || '';
        const candidatos = Array.isArray(encomenda.candidatos) ? encomenda.candidatos : [];
        const qtdPendentes = candidatos.filter(c=>c.status==='pendente').length;
        const qtdAprovados = candidatos.filter(c=>c.status==='aprovado').length;

        const $card = el('div','encomenda-card');

        // badge showing type maybe or count
        const $badge = el('div','encomenda-badge').html(`<small class="text-muted">${tipo === 'oferecendo' ? 'Oferta' : 'Pedido'}</small>`);
        $card.append($badge);

        // header
        const $header = el('div','d-flex align-items-center gap-3 mb-2');
        const $img = $('<img>').addClass('encomenda-avatar').attr('src', avatar).attr('alt', nome);
        const $user = el('div', null);
        $user.append($('<div>').addClass('encomenda-user').text(`${nome} ${tipo === 'oferecendo' ? 'está oferecendo transporte de encomenda.' : 'precisa que alguém leve uma encomenda.'}`));
        $header.append($img,$user);
        $card.append($header);

        // rota
        const $rota = el('div', `encomenda-rota ${tipo}`).html(`De <strong>${origem}</strong> para <strong>${destino}</strong>`);
        $card.append($rota);

        // details
        const $details = el('div','encomenda-details mb-2');
        $details.append($('<div>').append($('<i>').addClass('bi bi-calendar3 me-1')).append($(`<span>`).text(` ${dataTexto}${horario ? ' às ' + horario : ''}`)));
        $card.append($details);

        // candidacy summary
        if (candidatos.length) {
            const $cand = el('div','mb-2');
            const states = candidatos.map(c => {
                const s = c.status || 'pendente';
                return `<span class="encomenda-state ${s==='pendente'?'pending':s==='aprovado'?'approved':'denied'}" style="margin-right:6px">${s.toUpperCase()}</span>`;
            }).join(' ');
            $cand.html(`<small class="text-muted">Candidaturas: ${candidatos.length} ${states}</small>`);
            $card.append($cand);
        }

        // action buttons container
        const $btns = el('div','d-flex gap-2 justify-content-end align-items-center');

        // details button
        const $detailsBtn = $('<a>').addClass('encomendas-mais-info').attr('href', `/pages/encomendas/detalhes.html?id=${encomenda.id}`).text('Mais informações');
        $btns.append($detailsBtn);

        // determine user relation and show correct action
        const isCreator = encomenda.criadorId && Number(encomenda.criadorId) === currentUserId;
        const alreadyCandidate = candidatos.some(c => Number(c.userId) === currentUserId);
        const myCandidate = candidatos.find(c => Number(c.userId) === currentUserId);
        // action for offering: others can "pedir transporte" (send their encomenda)
        if (tipo === 'oferecendo') {
            if (!currentUserId) {
                // not logged in show nothing (or link to login)
                const $login = $('<button>').addClass('encomenda-btn-request').text('Entrar para solicitar').on('click', ()=> window.location.href = '/pages/autenticacao/login.html');
                $btns.append($login);
            } else if (isCreator) {
                // creator sees candidates count and link to details
                const $info = $('<span>').addClass('text-muted small').text(`${candidatos.length} candidatura(s)`);
                $btns.prepend($info);
            } else {
                // normal user -> can request transport (cadastrar candidatura)
                const $req = $('<button>').addClass('encomenda-btn-request');
                if (alreadyCandidate) {
                    const st = myCandidate.status || 'pendente';
                    if (st === 'aprovado') {
                        $req.text('Pedido aprovado').prop('disabled', true);
                    } else if (st === 'negado') {
                        $req.text('Pedido negado').prop('disabled', true);
                    } else {
                        $req.text('Pedido enviado').prop('disabled', true);
                    }
                } else {
                    $req.text('Pedir transporte');
                    $req.on('click', async (ev) => {
                        ev.preventDefault(); ev.stopPropagation();
                        try {
                            if (!currentUserId) { alert('Você precisa estar logado'); window.location.href='/pages/autenticacao/login.html'; return; }
                            const candidate = {
                                userId: currentUserId,
                                status: 'pendente',
                                timestamp: Date.now()
                            };
                            await addCandidate(encomenda.id, candidate);
                            Swal.fire('Enviado','Sua solicitação foi enviada','success');
                            // reload card by refreshing container
                            await filterEncomendas($('.filter-tab.active').data('filter') || 'todos');
                        } catch (err) {
                            console.error(err); Swal.fire('Erro','Não foi possível enviar a solicitação','error');
                        }
                    });
                }
                $btns.append($req);
            }
        } else { // tipo === 'pedindo' -> others can offer to carry (se candidatar como transportador)
            if (!currentUserId) {
                const $login = $('<button>').addClass('encomenda-btn-offer').text('Entrar para oferecer').on('click', ()=> window.location.href = '/pages/autenticacao/login.html');
                $btns.append($login);
            } else if (isCreator) {
                const $info = $('<span>').addClass('text-muted small').text(`${candidatos.length} candidato(s)`);
                $btns.prepend($info);
            } else {
                const $offer = $('<button>').addClass('encomenda-btn-offer');
                if (alreadyCandidate) {
                    const st = myCandidate.status || 'pendente';
                    if (st === 'aprovado') $offer.text('Aprovado').prop('disabled', true);
                    else if (st === 'negado') $offer.text('Negado').prop('disabled', true);
                    else $offer.text('Candidato (aguardando)').prop('disabled', true);
                } else {
                    $offer.text('Quero levar');
                    $offer.on('click', async (ev) => {
                        ev.preventDefault(); ev.stopPropagation();
                        try {
                            if (!currentUserId) { alert('Você precisa estar logado'); window.location.href='/pages/autenticacao/login.html'; return; }
                            const candidate = {
                                userId: currentUserId,
                                status: 'pendente',
                                timestamp: Date.now()
                            };
                            await addCandidate(encomenda.id, candidate);
                            Swal.fire('Enviado','Sua candidatura foi enviada','success');
                            await filterEncomendas($('.filter-tab.active').data('filter') || 'todos');
                        } catch (err) {
                            console.error(err); Swal.fire('Erro','Não foi possível enviar a candidatura','error');
                        }
                    });
                }
                $btns.append($offer);
            }
        }

        $card.append($btns);
        return $card;
    }

    // setup filters
    function setupFilters() {
        const $tabs = $('.filter-tab');
        $tabs.on('click', function () {
            $tabs.removeClass('active');
            $(this).addClass('active');
            const filtro = $(this).data('filter') || 'todos';
            if (filtro === 'todos') loadEncomendas(); else filterEncomendas(filtro);
        });
    }

    // Inicial
    setupFilters();
    loadEncomendas();
});
