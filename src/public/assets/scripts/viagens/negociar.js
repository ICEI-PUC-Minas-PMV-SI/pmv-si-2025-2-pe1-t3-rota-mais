$(document).ready(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const caronaId = urlParams.get('id');
    const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
    const carona = await response.json();
    if (!carona) {
        Swal.fire('Erro', 'Carona não encontrada.', 'error');
        return;
    }
    const container = document.getElementById('detalhes-container');
    createDetailsComponent(carona, container);
});