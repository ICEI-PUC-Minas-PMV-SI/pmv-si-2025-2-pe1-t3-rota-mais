function createElDetailsComponent(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

function createDetailsComponent(carona, container) {
    const wrapper = createElDetailsComponent('div', 'container my-4 p-4');

    const headerDiv = createElDetailsComponent('div', 'mb-4');
    const origemLabel = createElDetailsComponent('h5', 'text-muted mb-1', 'Saindo de');
    const origemTitle = createElDetailsComponent('h1', 'fw-bold text-success', carona.rota.origem);
    const destinoLabel = createElDetailsComponent('h5', 'text-muted mt-3 mb-1', 'Chegando em');
    const destinoTitle = createElDetailsComponent('h1', 'fw-bold text-success', carona.rota.destino);

    headerDiv.append(origemLabel, origemTitle, destinoLabel, destinoTitle);
    wrapper.appendChild(headerDiv);

    const infoDiv = createElDetailsComponent('div', 'd-flex flex-wrap align-items-center gap-3 mb-3');
    const diaDiv = createElDetailsComponent('div');
    diaDiv.innerHTML = `<i class="bi bi-calendar-event"></i> Dia <strong>${carona.data}</strong> às <strong>${carona.horario}</strong>`;

    const hr = createElDetailsComponent('div', 'hr');
    const hrLarge = createElDetailsComponent('div', 'hr-large');
    const retornoDiv = createElDetailsComponent('div');
    retornoDiv.innerHTML = `Retorno previsto para as <strong>${carona.horarioRetorno || '—'}</strong>`;

    infoDiv.append(diaDiv, hr, retornoDiv, hrLarge);
    wrapper.appendChild(infoDiv);

    const ul = createElDetailsComponent('ul', 'list-unstyled mb-4');
    const listItems = [
        `<i class="bi bi-person-plus"></i> <strong>${carona.vagas || 1} vaga${carona.vagas > 1 ? 's' : ''}</strong> disponível`,
        `<i class="bi bi-car-front"></i> Veículo: <strong>${carona.veiculo || 'Não informado'}</strong>`,
        `<i class="bi bi-box-seam"></i> ${carona.podeTrazerEncomendas ? 'Pode trazer encomendas' : 'Não pode trazer encomendas'}`,
        `<i class="bi bi-arrow-repeat"></i> ${carona.incluiRetorno ? 'Inclui retorno' : 'Não inclui retorno'}`,
        `<i class="bi bi-currency-dollar"></i> ${carona.custo ? carona.custo : 'Viagem gratuita'}`
    ];


    let isDetails = window.location.pathname.includes('detalhes');

    if (isDetails) {
        listItems.forEach(itemHTML => {
            const li = createElDetailsComponent('li');
            li.innerHTML = itemHTML;
            ul.appendChild(li);
        });
    }

    wrapper.appendChild(ul);
    container.appendChild(wrapper);
}

window.createDetailsComponent = createDetailsComponent;