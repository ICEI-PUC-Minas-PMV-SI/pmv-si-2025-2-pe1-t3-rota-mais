$(function () {
    // usa a mesma base que as outras telas
    const API_URL = `${API_BASE}`;

    async function fetchJSON(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return await res.json();
    }

    function clear($container) { $container.empty(); }
    function el(tag, className) { return $(`<${tag}>`).addClass(className); }

    function emptyState($container, iconCls, msg) {
        const $wrap = el('div', 'text-center py-5');
        const $i = $('<i>').addClass(iconCls).css('font-size', '3rem').css('color', '#d1d5db');
        const $p = el('p', 'mt-3').text(msg);
        $wrap.append($i, $p);
        clear($container);
        $container.append($wrap);
    }

    function getCurrentUser() {
        try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
    }

    function formatarDataTexto(dataISO) {
        try {
            const d = new Date(dataISO);
            const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
            return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
        } catch { return ''; }
    }

    // Carrega todas as encomendas
    async function loadencomendas() {
        const $container = $('#encomendas-container');
        try {
            const encomendas = await fetchJSON(`${API_URL}/encomendas`);
            clear($container);
            if (!encomendas || !encomendas.length) {
                emptyState($container, 'bi bi-envelope', 'Nenhuma encomenda disponível no momento');
                return;
            }
            encomendas
                .sort((a, b) => (b.id || 0) - (a.id || 0))
                .forEach(e => $container.append(buildCard(e)));
        } catch (e) {
            console.error(e);
            emptyState($('#encomendas-container'), 'bi bi-exclamation-triangle', 'Erro ao carregar encomendas');
        }
    }

    // Filtra por tipo: 'pedindo' | 'oferecendo' | 'todos'
    async function filterEncomendas(tipo) {
        const $container = $('#encomendas-container');
        try {
            const encomendas = await fetchJSON(`${API_URL}/encomendas`);
            let lista = encomendas || [];
            if (tipo && tipo !== 'todos') {
                lista = lista.filter(i => i.tipo === tipo);
            }
            clear($container);
            if (!lista.length) {
                const msg = tipo === 'oferecendo' ? 'Nenhuma oferta de encomenda disponível' :
                            tipo === 'pedindo' ? 'Nenhum pedido de encomenda disponível' :
                            'Nenhuma encomenda disponível no momento';
                emptyState($container, 'bi bi-car-front', msg);
                return;
            }
            lista.sort((a,b) => (b.id || 0) - (a.id || 0)).forEach(e => $container.append(buildCard(e)));
        } catch (e) {
            console.error(e);
            emptyState($container, 'bi bi-exclamation-triangle', 'Erro ao filtrar encomendas');
        }
    }

    // Setup filtros (corrigido: data-filter corresponde ao tipo real)
    function setupFilters() {
        const $tabs = $('.filter-tab');
        $tabs.on('click', function () {
            $tabs.removeClass('active');
            $(this).addClass('active');
            const filtro = $(this).data('filter') || 'todos';
            if (filtro === 'todos') loadencomendas();
            else filterEncomendas(filtro);
        });
    }

    // Build do card (padronizado)
    function buildCard(encomenda) {
        const user = encomenda.usuario || {};
        const nome = user.nome || 'Usuário';

        const origem = encomenda.origem || encomenda.partida || '—';
        const destino = encomenda.destino || encomenda.chegada || '—';
        const dataISO = encomenda.dataISO || (encomenda.dataViagem ? new Date(encomenda.dataViagem + 'T00:00:00').toISOString() : new Date().toISOString());
        const dataTexto = encomenda.dataTexto || formatarDataTexto(dataISO) || '';
        const horario = encomenda.horario || encomenda.horaPartida || '';

        const tipo = encomenda.tipo || 'pedindo';
        const isPedido = tipo === 'pedindo';
        const isOferta = tipo === 'oferecendo';

        const classeBtn = isPedido ? 'encomendas-pedido' : 'encomendas-oferta';
        const textoBtn = isPedido ? 'Ver pedido' : 'Ver oferta';

        const $card = el('div', 'viagens-box-locais p-3 rounded mb-3 position-relative');

        // Texto principal conforme tipo
        const textoPrincipal = isOferta
            ? `${nome} está oferecendo transporte de encomenda.`
            : `${nome} precisa que alguém leve uma encomenda.`;

        const $p1 = $('<p>').addClass('mb-1').html(`<strong>${textoPrincipal}</strong>`);
        const $p2 = $('<p>').addClass('encomendas-origem-destino').html(`De <strong>${origem}</strong> para <strong>${destino}</strong>.`);
        const $p3 = $('<p>').addClass('viagens-data bi bi-calendar3').html(`<strong>Dia <time datetime="${dataISO}">${dataTexto}${horario ? ' às ' + horario : ''}.</time></strong>`);

        const $btn = $(`<a class="btn ${classeBtn}">${textoBtn}</a>`);
        $btn.attr('href', `/pages/encomendas/detalhes.html?id=${encomenda.id}`);

        $card.append($p1, $p2, $p3, $btn);
        return $card;
    }

    // Inicializa
    setupFilters();
    loadencomendas();
});
