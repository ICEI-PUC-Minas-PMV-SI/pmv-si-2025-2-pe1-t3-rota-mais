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

async function fetchJSON(path, options = {}) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  if (options.method === 'DELETE') {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }
  return await res.json();
}

function checkAuth() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.replace("/pages/autenticacao/login.html");
    return false;
  }
  return true;
}

$(document).ready(async function () {
  if (!checkAuth()) return;

  const currentUserId = Number(localStorage.getItem("userId"));

  try {
    const user = await fetchJSON(`/users/${currentUserId}`);

    if (!user || !user.id) {
      throw new Error('Usuário não encontrado');
    }

    $(".user-avatar img").attr("src", user.avatar || "https://placehold.co/100x100").css("width", "100px").css("height", "100px");

    $(".user-name h1").text(user.name || "Usuário");

    const username = user.username || `${(user.name || "usuario").toLowerCase().replace(/\s+/g, "")}`;
    $(".user-id p").text('@' + username);

    const caronas = await fetchJSON("/caronas");
    const userCaronas = caronas.filter(c =>
      (c.motoristaId === currentUserId && c.tipo === "oferecendo") ||
      (c.passageiros && c.passageiros.some(p => p.userId === currentUserId && p.status === "aprovado"))
    );
    const viagensRealizadas = userCaronas.length;

    const rating = user.rating || 5.0;

    $(".user-stats-item-value").html(`
      <div>
        <i class="bi bi-car-front"></i>
            <span><strong>
              ${viagensRealizadas} ${viagensRealizadas === 1 ? 'viagem realizada' : 'viagens realizadas'}
            </strong></span>
      </div>
      <div>
        <i class="bi bi-star-fill"></i>
        <span><strong>${rating} de avaliação média</strong></span>
      </div>
    `);

    let localizacaoTexto = "Não informado";
    if (user.endereco) {
      const partes = [];
      if (user.endereco.comunidade) partes.push(user.endereco.comunidade);
      if (user.endereco.cidade) partes.push(user.endereco.cidade);
      if (partes.length > 0) {
        localizacaoTexto = partes.join(" • ");
      }
    } else if (user.localizacao) {
      localizacaoTexto = user.localizacao;
    }
    $(".user-info").find("h4").first().text(localizacaoTexto);

    if (user.biografia) {
      $(".user-info").find("h4").last().text(user.biografia);
    } else {
      $(".user-info").find("h4").last().text("Nenhuma biografia cadastrada.");
    }

    await carregarVeiculos(currentUserId);

    configurarBotoes(currentUserId, user);

  } catch (e) {
    if (e.message && (e.message.includes('404') || e.message.includes('não encontrado'))) {
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      Swal.fire({
        icon: "warning",
        title: "Sessão expirada",
        text: "Seu usuário não foi encontrado. Você será redirecionado para o login.",
        confirmButtonText: "OK"
      }).then(() => {
        window.location.replace("/pages/autenticacao/login.html");
      });
      return;
    }
    
    Swal.fire("Erro", "Falha ao carregar dados do usuário.", "error");
  }
});

async function carregarVeiculos(userId) {
  const $container = $(".veiculos-container");

  try {
    const veiculos = await fetchJSON(`/vehicles?motoristaId=${userId}`);

    $container.empty();

    if (veiculos.length === 0) {
      $container.html('<p class="text-muted">Nenhum veículo cadastrado.</p>');
      return;
    }

    veiculos.forEach(veiculo => {
      const tipoVeiculo = veiculo.type === 'CAR' ? 'Carro' : 'Motocicleta';
      const $item = $(`
        <div class="veiculo-item mb-3 p-3 border rounded">
          <div class="veiculo-item-info">
            <h3 class="mb-2">${veiculo.brand} ${veiculo.model}</h3>
            <div class="d-flex flex-wrap gap-3 text-muted">
              <span><i class="bi bi-tag"></i> ${tipoVeiculo}</span>
              <span><i class="bi bi-palette"></i> ${veiculo.color || 'Não informado'}</span>
              <span><i class="bi bi-123"></i> ${veiculo.licensePlate || 'Não informado'}</span>
              <span><i class="bi bi-people"></i> ${veiculo.availableSeats || 0} vaga${veiculo.availableSeats !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      `);

      $container.append($item);
    });

  } catch {
    $container.html('<p class="text-danger">Erro ao carregar veículos.</p>');
  }
}

function configurarBotoes(userId, user) {
  $("#btn-alterar-senha").off("click").on("click", async function(e) {
    e.preventDefault();
    
    const { value: formValues } = await Swal.fire({
      title: 'Alterar Senha',
      html: `
        <input id="swal-senha-atual" type="password" class="swal2-input" placeholder="Senha atual" required>
        <input id="swal-senha-nova" type="password" class="swal2-input" placeholder="Nova senha" required>
        <input id="swal-senha-confirmar" type="password" class="swal2-input" placeholder="Confirmar nova senha" required>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Alterar senha',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const senhaAtual = document.getElementById('swal-senha-atual').value;
        const senhaNova = document.getElementById('swal-senha-nova').value;
        const senhaConfirmar = document.getElementById('swal-senha-confirmar').value;

        if (!senhaAtual || !senhaNova || !senhaConfirmar) {
          Swal.showValidationMessage('Preencha todos os campos');
          return false;
        }

        const senhaAtualHash = hashPassword(senhaAtual);
        if (user.senha && senhaAtualHash !== user.senha && senhaAtual !== user.senha) {
          Swal.showValidationMessage('Senha atual incorreta');
          return false;
        }

        if (senhaNova.length < 4) {
          Swal.showValidationMessage('A nova senha deve ter pelo menos 4 caracteres');
          return false;
        }

        if (senhaNova !== senhaConfirmar) {
          Swal.showValidationMessage('As senhas não coincidem');
          return false;
        }

        return { senhaAtual, senhaNova };
      }
    });

    if (formValues) {
      try {
        const senhaHash = hashPassword(formValues.senhaNova);
        await fetchJSON(`/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senha: senhaHash })
        });

        Swal.fire({
          icon: 'success',
          title: 'Senha alterada!',
          text: 'Sua senha foi alterada com sucesso.',
          confirmButtonText: 'OK'
        });
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível alterar a senha. Tente novamente.',
          confirmButtonText: 'OK'
        });
      }
    }
  });

  $("#btn-logout").off("click").on("click", function(e) {
    e.preventDefault();
    
    Swal.fire({
      title: 'Deseja sair?',
      text: 'Você será desconectado da sua conta.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userId");
        localStorage.removeItem("user");
        window.location.replace("/pages/autenticacao/login.html");
      }
    });
  });

  $("#btn-excluir-usuario").off("click").on("click", async function(e) {
    e.preventDefault();
    
    const { value: senha } = await Swal.fire({
      title: 'Excluir Conta',
      text: 'Esta ação não pode ser desfeita. Digite sua senha para confirmar:',
      input: 'password',
      inputPlaceholder: 'Digite sua senha',
      showCancelButton: true,
      confirmButtonText: 'Excluir conta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa digitar sua senha!';
        }
        const senhaHash = hashPassword(value);
        if (user.senha && senhaHash !== user.senha && value !== user.senha) {
          return 'Senha incorreta!';
        }
      }
    });

    if (senha) {
      const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação é irreversível. Todos os seus dados serão perdidos.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir conta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
      });

      if (confirmacao.isConfirmed) {
        try {
          await fetchJSON(`/users/${userId}`, {
            method: 'DELETE'
          });

          localStorage.removeItem("userId");
          localStorage.removeItem("user");
          
          Swal.fire({
            icon: 'success',
            title: 'Conta excluída!',
            text: 'Sua conta foi excluída com sucesso.',
            confirmButtonText: 'OK'
          }).then(() => {
            window.location.replace("/pages/autenticacao/login.html");
          });
        } catch {
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível excluir a conta. Tente novamente.',
            confirmButtonText: 'OK'
          });
        }
      }
    }
  });
}

