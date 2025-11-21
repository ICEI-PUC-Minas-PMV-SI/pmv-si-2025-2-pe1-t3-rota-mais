if (localStorage.getItem("userId")) {
    window.location.replace("/pages/caronas/index.html");
}

function hashPassword(password) {
    let hash = 0;
    if (password.length === 0) return hash.toString();
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

document.getElementById("btn-login").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;

    if (!usuario || !senha) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users?usuario=${encodeURIComponent(usuario)}`);
        let users = await response.json();
        
        if (users.length === 0) {
            const responseEmail = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(usuario)}`);
            users = await responseEmail.json();
        }

        if (users.length === 0) {
            alert("Usuário não encontrado");
            return;
        }

        const user = users[0];
        const senhaHash = hashPassword(senha);

        if (user.senha !== senhaHash && user.senha !== senha) {
            alert("Senha incorreta");
            return;
        }

        const userParaSalvar = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            usuario: user.usuario,
            telefone: user.telefone,
            comunidade: user.comunidade,
            cidade: user.cidade,
            avatar: user.avatar || "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png"
        };

        localStorage.setItem("user", JSON.stringify(userParaSalvar));
        localStorage.setItem("userId", user.id.toString());


        window.location.href = "/pages/caronas/index.html";

    } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro ao conectar com o servidor. Tente novamente.");
    }
});