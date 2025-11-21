async function fetchJSON(path, options = {}) {
    const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : "http://localhost:3000";
    const res = await fetch(apiBase + path, options);
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    return await res.json();
}

function checkAuth() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.replace("/pages/autenticacao/login.html");
        return false;
    }
    return true;
}


function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class') {
            el.className = value;
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.assign(el.dataset, value);
        } else if (key.startsWith('data-')) {
            el.setAttribute(key, value);
        } else {
            el.setAttribute(key, value);
        }
    });
    [].concat(children).forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    });
    return el;
}

async function createCard(carona, papel, tipoViagem, statusText, statusClass, statusIcon, motorista, userId) {
    const card = createElement('div', { 
        class: 'card shadow-sm mb-4 border-0', 
        style: 'border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;'
    });
    card.style.transform = 'translateY(0)';
    card.onmouseenter = () => { card.style.transform = 'translateY(-4px)'; card.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'; };
    card.onmouseleave = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; };
    
    const cardBody = createElement('div', { class: 'card-body p-4' });
    
    const header = createElement('div', { class: 'd-flex justify-content-between align-items-start mb-3' });
    
    const papelEmoji = papel === 'motorista' ? '🚗' : papel === 'solicitante de encomenda' ? '📦' : '👤';
    const tipoEmoji = tipoViagem === 'encomenda' ? '📦' : '🚙';
    
    const papelInfo = createElement('div', { class: 'd-flex align-items-center gap-2' });
    const papelText = createElement('span', { style: 'font-size: 1rem; color: #6b7280;' });
    papelText.appendChild(document.createTextNode(`${papelEmoji} Você foi `));
    const papelStrong = createElement('strong', { style: 'color: #1f2937;' }, [papel]);
    papelText.appendChild(papelStrong);
    papelText.appendChild(document.createTextNode(` de uma ${tipoEmoji} `));
    const tipoStrong = createElement('strong', { style: 'color: #1f2937;' }, [tipoViagem]);
    papelText.appendChild(tipoStrong);
    papelInfo.appendChild(papelText);
    
    const badge = createElement('span', { 
        class: `badge bg-${statusClass} px-3 py-2`,
        style: 'font-size: 0.9rem; font-weight: 600;'
    });
    const icon = createElement('i', { class: `bi bi-${statusIcon} me-1` });
    badge.appendChild(icon);
    badge.appendChild(document.createTextNode(statusText));
    
    header.appendChild(papelInfo);
    header.appendChild(badge);
    
    const rotaDiv = createElement('div', { class: 'mb-3 p-3', style: 'background-color: #f8f9fa; border-radius: 8px;' });
    const rotaText = createElement('div', { style: 'font-size: 1.1rem; font-weight: 600; color: #1f2937;' });
    rotaText.appendChild(document.createTextNode('📍 '));
    const origemStrong = createElement('strong', { style: 'color: #059669;' }, [carona.rota?.origem || 'Não informado']);
    rotaText.appendChild(origemStrong);
    rotaText.appendChild(document.createTextNode(' → '));
    const destinoStrong = createElement('strong', { style: 'color: #2563eb;' }, [carona.rota?.destino || 'Não informado']);
    rotaText.appendChild(destinoStrong);
    rotaDiv.appendChild(rotaText);
    
    const dataDiv = createElement('div', { class: 'd-flex align-items-center gap-2 mb-3', style: 'color: #6b7280;' });
    const calendarIcon = createElement('i', { class: 'bi bi-calendar3', style: 'font-size: 1.2rem;' });
    dataDiv.appendChild(calendarIcon);
    const dataText = createElement('span', { style: 'font-size: 0.95rem;' });
    dataText.appendChild(document.createTextNode('Dia '));
    const time = createElement('strong', { style: 'color: #1f2937;' });
    const dataTexto = carona.data || 'Data não informada';
    const horarioTexto = carona.horario ? ` às ${carona.horario}` : '';
    time.textContent = dataTexto + horarioTexto;
    dataText.appendChild(time);
    dataDiv.appendChild(dataText);
    
    const actionsDiv = createElement('div', { class: 'd-flex gap-2 mt-3' });
    
    if (carona.statusViagem === 'concluida') {
        const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : "http://localhost:3000";
        let jaAvaliada = false;
        try {
            const avaliacoes = await fetch(`${apiBase}/avaliacoes?caronaId=${carona.id}&avaliadorId=${userId}`);
            if (avaliacoes.ok) {
                const avaliacoesData = await avaliacoes.json();
                jaAvaliada = avaliacoesData && avaliacoesData.length > 0;
            }
        } catch {}

        const btn = createElement('button', {
            type: 'button',
            class: jaAvaliada ? 'btn btn-secondary flex-grow-1' : 'btn btn-success btn-avaliar-viagem flex-grow-1',
            dataset: { caronaId: carona.id },
            style: 'font-weight: 600; padding: 0.75rem;'
        });
        if (!jaAvaliada) {
            btn.onclick = function() {
                window.location.href = `avaliacao.html?id=${carona.id}`;
            };
        } else {
            btn.disabled = true;
        }
        const iconBtn = createElement('i', { class: jaAvaliada ? 'bi bi-check-circle me-2' : 'bi bi-star-fill me-2' });
        btn.appendChild(iconBtn);
        btn.appendChild(document.createTextNode(jaAvaliada ? 'Viagem já avaliada' : 'Avaliar viagem'));
        actionsDiv.appendChild(btn);
    } else {
        const link = createElement('a', {
            href: `/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo}`,
            class: 'btn btn-outline-primary flex-grow-1',
            style: 'font-weight: 600; padding: 0.75rem; text-decoration: none;'
        });
        const iconLink = createElement('i', { class: 'bi bi-info-circle me-2' });
        link.appendChild(iconLink);
        link.appendChild(document.createTextNode('Ver detalhes'));
        actionsDiv.appendChild(link);
    }
    
    cardBody.appendChild(header);
    cardBody.appendChild(rotaDiv);
    cardBody.appendChild(dataDiv);
    cardBody.appendChild(actionsDiv);
    
    card.appendChild(cardBody);
    return card;
}

(function() {
  function init() {
    if (typeof jQuery === 'undefined') {
      setTimeout(init, 50);
      return;
    }
    
    const $ = jQuery;
    
    $(document).ready(async function () {
        if (!checkAuth()) return;

        const currentUserId = Number(localStorage.getItem("userId"));
        const container = document.getElementById("caronas-container");

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
        const container = document.getElementById("caronas-container");
        if (!container) return;
        
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        try {
            const caronas = await fetchJSON("/caronas");

            let viagens = caronas.filter(c => {
                const isMotoristaOferecendo = c.motoristaId === userId && c.tipo === 'oferecendo';
                const isPassageiroOferecendo = c.tipo === 'oferecendo' && c.passageiros && c.passageiros.some(p => p.userId === userId && p.status === 'aprovado');
                const isPassageiroPedindo = c.tipo === 'pedindo' && c.passageiroId === userId;
                const isMotoristaPedindo = c.tipo === 'pedindo' && c.motoristaId === userId;
                const isEncomenda = c.encomendas && c.encomendas.some(e => e.userId === userId && e.status === 'aprovado');

                return isMotoristaOferecendo || isPassageiroOferecendo || isPassageiroPedindo || isMotoristaPedindo || isEncomenda;
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
                const emptyMsg = createElement('p', { class: 'text-muted text-center py-5' });
                emptyMsg.textContent = 'Nenhuma viagem encontrada.';
                container.appendChild(emptyMsg);
                return;
            }

            viagens.sort((a, b) => (b.id || 0) - (a.id || 0));

            for (const carona of viagens) {
                const apiBase = typeof API_BASE !== 'undefined' ? API_BASE : "http://localhost:3000";
                const motorista = carona.motoristaId ? await fetchJSON(`/users/${carona.motoristaId}`) : null;
                const status = carona.statusViagem || 'agendada';

                let papel = 'passageiro';
                const isEncomenda = carona.encomendas && carona.encomendas.some(e => e.userId === userId && e.status === 'aprovado');
                
                if (carona.tipo === 'oferecendo') {
                    if (carona.motoristaId === userId) {
                        papel = 'motorista';
                    } else if (carona.passageiros && carona.passageiros.some(p => p.userId === userId && p.status === 'aprovado')) {
                        papel = 'passageiro';
                    }
                } else if (carona.tipo === 'pedindo') {
                    if (carona.passageiroId === userId) {
                        papel = 'passageiro';
                    } else if (carona.motoristaId === userId) {
                        papel = 'motorista';
                    }
                }
                
                if (isEncomenda && papel !== 'motorista') papel = 'solicitante de encomenda';

                let tipoViagem = 'carona';
                if (isEncomenda && carona.tipo === 'oferecendo') tipoViagem = 'encomenda';

                let statusText, statusClass, statusIcon;
                if (status === 'concluida') {
                    statusText = 'Concluída';
                    statusClass = 'success';
                    statusIcon = 'check-circle';
                } else if (status === 'cancelada') {
                    statusText = 'Cancelada';
                    statusClass = 'danger';
                    statusIcon = 'x-circle';
                } else if (status === 'em_andamento') {
                    statusText = 'Em andamento';
                    statusClass = 'primary';
                    statusIcon = 'car-front';
                } else {
                    statusText = 'Agendada';
                    statusClass = 'warning';
                    statusIcon = 'clock';
                }

                const card = await createCard(carona, papel, tipoViagem, statusText, statusClass, statusIcon, motorista, userId);
                container.appendChild(card);
            }

            container.querySelectorAll('.btn-avaliar-viagem').forEach(btn => {
                btn.addEventListener('click', function() {
                    const caronaId = this.dataset.caronaId;
                    window.location.href = `avaliacao.html?id=${caronaId}`;
                });
            });

        } catch {
            const errorMsg = createElement('p', { class: 'text-danger text-center py-5' });
            errorMsg.textContent = 'Erro ao carregar viagens.';
            container.appendChild(errorMsg);
        }
    }
  }
  
  if (typeof jQuery !== 'undefined') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();