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

        $('.chat-btn').on('click', () => {
            window.location.href = `../../pages/viagens/negociar.html?id=${carona.id}`;
        });

        $("#edit-travel").on('click',()=>{
            window.location.href = `../../pages/caronas/editar-carona.html?id=${carona.id}&tipo=${carona.tipo}`;
        })
            
        const container = document.getElementById('detalhes-container');
        createDetailsComponent(carona, container);

        if(carona.tipo === 'pedindo'){
            $('#detalhes-container-passageiro').hide();
        } else {
            $('#detalhes-container-motorista').hide()
        }

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
