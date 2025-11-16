document.getElementById("btn-login").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (!usuario || !senha) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users?usuario=${usuario}&senha=${senha}`);
        const data = await response.json();

        if (data.length === 0) {
            alert("Usuário ou senha incorretos");
            return;
        }
        localStorage.setItem("user", JSON.stringify(data[0]));
        localStorage.setItem("userId", data[0].id);

        window.location.href = "/pages/caronas/index.html";

    } catch (error) {
        console.error(error);
        alert("Erro ao fazer login");
    }
});
