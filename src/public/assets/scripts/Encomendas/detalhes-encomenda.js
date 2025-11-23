$(async function () {
    const API_URL = "http://localhost:3000";

    // Helpers
    async function fetchJSON(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro ao carregar");
        return await res.json();
    }

    function buildRow(label, value, icon) {
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

        // Tratamento de dados
        const user = encomenda.usuario || {};
        const tipo = encomenda.tipo === "pedindo" ? "Pedido de Encomenda" : "Oferta de Transporte";

        const html = `
            <div class="card shadow-sm">
                <div class="card-body">

                    <h4 class="fw-bold mb-4">${tipo}</h4>

                    ${buildRow("Criado por", user.nome || "Usuário", "bi-person-circle")}
                    ${buildRow("Origem", encomenda.origem, "bi-geo-alt-fill")}
                    ${buildRow("Destino", encomenda.destino, "bi-geo")}
                    ${buildRow("Data", encomenda.dataTexto || "", "bi-calendar3")}
                    ${buildRow("Horário", encomenda.horario || "Não informado", "bi-clock")}
                    
                </div>
            </div>

            <div class="mt-4 d-flex flex-wrap gap-3">
                <button id="btn-conversar" class="btn btn-primary">
                    <i class="bi bi-chat-dots"></i> Conversar
                </button>

                <button id="btn-excluir" class="btn btn-danger">
                    <i class="bi bi-trash"></i> Excluir
                </button>
            </div>
        `;

        container.html(html);

        // Botão conversar → placeholder
        $("#btn-conversar").on("click", () => {
            Swal.fire("Em breve", "Função de conversa ainda não implementada.", "info");
        });

        // Excluir
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
        container.html(`<p class='text-danger'>Erro ao carregar detalhes.</p>`);
    }
});
