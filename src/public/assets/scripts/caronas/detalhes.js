$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const caronaId = urlParams.get('id');

    try {
        const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
        if (!response.ok) throw new Error('Carona não encontrada');

        const carona = await response.json();

        if (!carona || !carona.rota) {
            Swal.fire('Erro', 'Não foi possível carregar os dados da carona.', 'error');
            return;
        }

        const container = document.querySelector('#detalhes-container');

        function createEl(tag, className, text) {
            const el = document.createElement(tag);
            if (className) el.className = className;
            if (text) el.textContent = text;
            return el;
        }

        const wrapper = createEl('div', 'container my-4 p-4');

        const headerDiv = createEl('div', 'mb-4');
        const origemLabel = createEl('h5', 'text-muted mb-1', 'Saindo de');
        const origemTitle = createEl('h1', 'fw-bold text-success', carona.rota.origem);
        const destinoLabel = createEl('h5', 'text-muted mt-3 mb-1', 'Chegando em');
        const destinoTitle = createEl('h1', 'fw-bold text-success', carona.rota.destino);

        headerDiv.append(origemLabel, origemTitle, destinoLabel, destinoTitle);
        wrapper.appendChild(headerDiv);

        const infoDiv = createEl('div', 'd-flex flex-wrap align-items-center gap-3 mb-3');
        const diaDiv = createEl('div');
        diaDiv.innerHTML = `<i class="bi bi-calendar-event"></i> Dia <strong>${carona.data}</strong> às <strong>${carona.horario}</strong>`;

        const hr = createEl('div', 'hr');
        const hrLarge = createEl('div', 'hr-large');
        const retornoDiv = createEl('div');
        retornoDiv.innerHTML = `Retorno previsto para as <strong>${carona.horarioRetorno || '—'}</strong>`;

        infoDiv.append(diaDiv, hr, retornoDiv, hrLarge);
        wrapper.appendChild(infoDiv);

        const ul = createEl('ul', 'list-unstyled mb-4');
        const listItems = [
            `<i class="bi bi-person-plus"></i> <strong>${carona.vagas || 1} vaga${carona.vagas > 1 ? 's' : ''}</strong> disponível`,
            `<i class="bi bi-car-front"></i> Veículo: <strong>${carona.veiculo || 'Não informado'}</strong>`,
            `<i class="bi bi-box-seam"></i> ${carona.podeTrazerEncomendas ? 'Pode trazer encomendas' : 'Não pode trazer encomendas'}`,
            `<i class="bi bi-arrow-repeat"></i> ${carona.incluiRetorno ? 'Inclui retorno' : 'Não inclui retorno'}`,
            `<i class="bi bi-currency-dollar"></i> ${carona.custo ? carona.custo : 'Viagem gratuita'}`
        ];


        let isDetails = window.location.pathname.includes('detalhes');
        
        if(isDetails){
            listItems.forEach(itemHTML => {
                const li = createEl('li');
                li.innerHTML = itemHTML;
                ul.appendChild(li);
            });
        }

        wrapper.appendChild(ul);
        container.appendChild(wrapper);

        $('.conclude-trip').on('click', function () {
            Swal.fire({
                title: 'Concluir viagem?',
                text: 'Tem certeza que deseja marcar esta viagem como concluída?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, concluir'
            }).then(result => {
                if (result.isConfirmed) {
                    Swal.fire('Concluída!', 'A viagem foi concluída com sucesso.', 'success');
                }
            });
        });

        $('.cancel-trip').on('click', function () {
            Swal.fire({
                title: 'Cancelar viagem?',
                text: 'Tem certeza que deseja cancelar esta viagem?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    Swal.fire('Cancelada!', 'A viagem foi cancelada.', 'success');
                }
            });
        });
    } catch (err) {
        console.error(err);
        Swal.fire('Erro', 'Não foi possível carregar os dados da carona.', 'error');
    }
});
