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

        const container = document.getElementById('detalhes-container');
        createDetailsComponent(carona, container);

        const currentUserId = Number(localStorage.getItem("userId"));
        const currentUserRole = localStorage.getItem("userRole");

        if (currentUserId === carona.motoristaId) {
            $('#detalhes-container-passageiro').hide();
            $('#detalhes-container-motorista').show();

            await carregarPassageiros(carona);
        } else {
            $('#detalhes-container-motorista').hide();
            $('#detalhes-container-passageiro').show();

            await carregarMotorista(carona);
        }

        $('.chat-btn').off().on('click', () => {
            window.location.href = `../../pages/viagens/negociar.html?id=${carona.id}`;
        });

        $("#edit-travel").off().on("click", () => {
            window.location.href = `../../pages/caronas/editar-carona.html?id=${carona.id}&tipo=${carona.tipo}`;
        });

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

async function carregarPassageiros(carona) {
    const passageirosContainer = $("#detalhes-container-motorista .card-body").first();
    const passageiros = carona.passageiros || [];

    passageirosContainer.find(".passenger").remove();

    for (let pas of passageiros) {
        const res = await fetch(`http://localhost:3000/users/${pas.userId}`);
        const user = await res.json();

        const div = $(`
            <div class="mb-3 passenger">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <span class="badge bg-secondary me-2">${pas.posicao}</span>
                        <img src="https://placehold.co/40x40" class="rounded-circle me-2">
                        <div>
                            <strong>${user.name}</strong> <span class="text-muted">★ ${user.rating || 5}</span>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-success btn-sm approve-btn">Aprovar</button>
                        <button class="btn btn-danger btn-sm deny-btn">Negar</button>
                        <a class="btn btn-outline-secondary btn-sm chat-btn"><i class="bi bi-chat-dots"></i></a>
                    </div>
                </div>
            </div>
        `);

        passageirosContainer.append(div);
    }
}

async function carregarMotorista(carona) {
    const motoristaContainer = $("#detalhes-container-passageiro div.d-flex").first();

    const res = await fetch(`http://localhost:3000/users/${carona.motoristaId}`);
    const user = await res.json();

    motoristaContainer.find("strong").text(user.name);
    motoristaContainer.find(".text-muted").first().text(`★ ${user.rating || 5}`);
}
