document.getElementById("btn-criar-conta").addEventListener("click", async function () {

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const usuario = document.getElementById("usuario").value;
    const telefone = document.getElementById("telefone").value;

    const comunidade = document.getElementById("comunidade").value;
    const cidade = document.getElementById("cidade").value;

    const rua = document.getElementById("rua").value;
    const numero = document.getElementById("numero").value;
    const complemento = document.getElementById("complemento").value;
    const bairro = document.getElementById("bairro").value;
    const referencia = document.getElementById("referencia").value;

    const user = {
        nome,
        email,
        senha,
        usuario,
        telefone,
        comunidade,
        cidade,
        endereco: {
            rua,
            numero,
            complemento,
            bairro,
            referencia
        },
        vehicles: window.userVehicles || []
    };

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        if (!response.ok) throw new Error("Erro ao criar conta");

        Swal.fire({
            icon: "success",
            title: "Conta criada com sucesso!",
        });

        window.location.href = "/pages/caronas/index.html";

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Erro ao criar conta",
            text: err.message
        });
    }
});
