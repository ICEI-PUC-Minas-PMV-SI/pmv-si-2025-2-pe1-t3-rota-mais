$(function () {
    const API_URL = 'http://localhost:3000';

    async function fetchJSON(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return await res.json();
    }

    function clear($container) {
        $container.children().remove();
    }

    function el(tag, className) {
        return $(`<${tag}>`).addClass(className);
    }

    function emptyState($container, iconCls, msg, color) {
        const $wrap = el('div', 'text-center py-5');
        const $i = $(`<i>`).addClass(iconCls).css('font-size', '3rem').css('color', color || '#d1d5db');
        const $p = el('p', 'mt-3').text(msg);
        $wrap.append($i, $p);
        clear($container);
        $container.append($wrap);
    }

    function getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    }

    async function loadencomendas() {
        const $container = $('#encomendas-container');
        if (!$container.length) return;
        try {
            const encomendas = await fetchJSON(`${API_URL}/encomendas`);
            clear($container);
            if (!encomendas.length) {
                emptyState($container, 'bi bi-car-front', 'Nenhuma encomenda disponível no momento', '#d1d5db');
                return;
            }
            const encomendasOrdenadas = encomendas.sort((a, b) => (b.id || 0) - (a.id || 0));
            encomendasOrdenadas.forEach(c => $container.append(buildEncomendaCard(c)));
        } catch (e) {
            emptyState($container, 'bi bi-exclamation-triangle', 'Erro ao carregar encomendas');
        }
    }

    async function filterEncomendas(filter) {
        const $container = $('#encomendas-container');
        if (!$container.length) return;
        try {
            const encomendas = await fetchJSON(`${API_URL}/encomendas`);
            
            let list = encomendas;
            
            if (filter === 'comunidade') {
                // Filtrar por comunidade do usuário logado
                const currentUserId = Number(localStorage.getItem('userId'));
                if (currentUserId) {
                    try {
                        const user = await fetchJSON(`${API_URL}/users/${currentUserId}`);
                        const userComunidade = user.comunidade;
                        if (userComunidade) {
                            list = encomendas.filter(c => {
                                const encomendaComunidade = c.usuario?.comunidade || '';
                                return encomendaComunidade === userComunidade;
                            });
                        }
                    } catch (e) {
                        console.error('Erro ao buscar usuário:', e);
                    }
                }
            } else if (filter && filter !== 'todos') {
                list = encomendas.filter(c => c.tipo === filter);
            }
            
            clear($container);
            if (!list.length) {
                const msg = filter === 'oferecendo' ? 'Nenhuma oferta de encomenda disponível' : 
                           filter === 'pedindo' ? 'Nenhum pedido de encomenda disponível' : 
                           filter === 'comunidade' ? 'Nenhuma encomenda disponível na sua comunidade' :
                           'Nenhuma encomenda disponível no momento';
                emptyState($container, 'bi bi-car-front', msg, '#d1d5db');
                return;
            }
            const listOrdenada = list.sort((a, b) => (b.id || 0) - (a.id || 0));
            listOrdenada.forEach(c => $container.append(buildEncomendaCard(c)));
        } catch (e) { }
    }

    async function searchencomendas(origem, destino, data) {
        const $container = $('#encomendas-container');
        if (!$container.length) return;
        try {
            const encomendas = await fetchJSON(`${API_URL}/encomendas`);
            let filtered = encomendas;
            if (origem) filtered = filtered.filter(c => c.rota && c.rota.origem && c.rota.origem.toLowerCase().includes(origem.toLowerCase()));
            if (destino) filtered = filtered.filter(c => c.rota && c.rota.destino && c.rota.destino.toLowerCase().includes(destino.toLowerCase()));
            if (data) {
                const searchDate = new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                filtered = filtered.filter(c => c.data === searchDate);
            }
            clear($container);
            if (!filtered.length) {
                emptyState($container, 'bi bi-search', 'Nenhuma encomenda encontrada com os critérios de busca', '#d1d5db');
                return;
            }
            const filteredOrdenado = filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
            filteredOrdenado.forEach(c => $container.append(buildEncomendaCard(c)));
        } catch (e) { }
    }

    function setupFilters() {
        const $tabs = $('.filter-tab');
        if (!$tabs.length) return;
        $tabs.each(function () {
            $(this).on('click', function () {
                $tabs.removeClass('active');
                $(this).addClass('active');
                const filter = $(this).data('filter') || 'todos';
                filterEncomendas(filter);
            });
        });
    }

    function buildEncomendaCard(encomenda) {
        const user = encomenda.usuario || getCurrentUser();
        const $card = el('div', 'viagens-box-locais p-3 rounded mb-3 position-relative');

        const agora = Date.now();
        const idade = agora - (encomenda.id || 0);
        const ehRecente = idade < 300000;

        /*if (ehRecente || encomenda.urgente) {
            $card.css({
                'border-left': '5px solid #dc3545',
                'background-color': '#ffeaea',
                'border': '2px solid #dc3545',
                'box-shadow': '0 2px 8px rgba(220, 53, 69, 0.2)'
            });

            const badgeText = encomenda.urgente ? 'Urgente' : 'Nova';
            const $badge = $('<span>')
                .addClass('badge bg-danger')
                .css({
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '0.75rem',
                    zIndex: 10
                })
                .text(badgeText);

            $card.prepend($badge);
        }*/

        const $info = el('div', 'viagens-info');

        // 🔹 Linha 1 — Nome + ação
        const $p1 = $('<p>')
            .addClass('bi bi-person-circle')
            .html(
                `${user.nome || 'Usuário'} precisa que <strong>alguém leve uma encomenda</strong>.`
            );

        // 🔹 Linha 2 — Origem e destino
        const origem = encomenda.origem || '';
        const destino = encomenda.destino || '';

        const $p2 = $('<p>')
            .addClass('encomendas-origem-destino')
            .html(`De <strong>${origem}</strong> para <strong>${destino}</strong>.`);

        // 🔹 Linha 3 — Data e hora formatadas
        const dataISO = encomenda.dataISO || new Date().toISOString();
        const dataLegivel = encomenda.dataTexto || '';
        const hora = encomenda.horario || '';

        const $p3 = $('<p>')
            .addClass('viagens-data bi bi-calendar3')
            .html(
                `<strong>Dia <time datetime="${dataISO}">${dataLegivel} ${hora ? 'às ' + hora : ''
                }.</time></strong>`
            );

        // 🔹 Botão "Mais informações"
        const $btn = $('<a>')
            .addClass('btn encomendas-mais-info')
            .text('Mais informações')
            .attr('href', `/pages/encomendas/detalhes.html?id=${encomenda.id}`);

        // Monta tudo
        $info.append($p1, $p2, $p3, $btn);

        $card.append($info);

        return $card;
    }


    setupFilters();
    loadencomendas();
});