$(async function () {
    const API_URL = "http://localhost:3000";

    // Helpers
    async function fetchJSON(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro ao carregar");
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

    const container = $("#encomenda-detalhes");

    // Obter ID
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        container.html(`<p class='text-danger'>ID inválido.</p>`);
        return;
    }

    try {
        const encomenda = await fetchJSON(`${API_URL}/encomendas/${id}`);
        const user = encomenda.usuario || {};
        
        // Tipo
        const isPedido = encomenda.tipo === "pedindo";
        const titulo = isPedido
            ? "Pedido de Encomenda"
            : "Oferta de Transporte";

        // Criador
        const criadorNome = user.nome || "Usuário";
        const criadorAvatar = user.avatar ||
            "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png";

        // Botões
        const currentUserId = Number(localStorage.getItem("userId"));
        const isCriador = encomenda.criadorId === currentUserId;

        // Montagem
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

                    ${buildRow("Origem", encomenda.origem, "bi-geo-alt-fill")}
                    ${buildRow("Destino", encomenda.destino, "bi-geo")}
                    ${buildRow("Data", encomenda.dataTexto, "bi-calendar3")}
                    ${buildRow("Horário", encomenda.horario, "bi-clock")}
        `;

        // Caso seja oferta → exibir veículo se existir
        if (!isPedido && encomenda.veiculo) {
            html += buildRow("Veículo", encomenda.veiculo, "bi-car-front-fill");
        }

        // Fechar card
        html += `
                </div>
            </div>
        `;

        // Botões
        html += `
            <div class="mt-4 d-flex flex-wrap gap-3">
                <button id="btn-conversar" class="btn btn-primary">
                    <i class="bi bi-chat-dots"></i> Conversar
                </button>
        `;

        if (isCriador) {
            html += `
                <button id="btn-excluir" class="btn btn-danger">
                    <i class="bi bi-trash"></i> Excluir
                </button>
            `;
        }

        html += `</div>`;

        container.html(html);

        // Conversar
        $("#btn-conversar").on("click", () => {
            Swal.fire("Em breve", "A conversa será habilitada futuramente.", "info");
        });

        // Excluir (somente criador)
        $("#btn-excluir").on("click", async () => {
            const result = await Swal.fire({
                title: "Excluir?",
                text: "Deseja realmente excluir esta encomenda?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#dc3545"
            });

            if (result.isConfirmed) {
                await fetch(`${API_URL}/encomendas/${id}`, { method: "DELETE" });
                Swal.fire("Excluído!", "A encomenda foi excluída.", "success")
                    .then(() => window.location.href = "/pages/encomendas/encomendas.html");
            }
        });

    } catch (e) {
        console.error(e);
        container.html(`<p class='text-danger'>Erro ao carregar detalhes.</p>`);
    }
});
