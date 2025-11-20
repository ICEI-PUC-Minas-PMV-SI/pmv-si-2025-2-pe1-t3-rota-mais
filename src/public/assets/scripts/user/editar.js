async function fetchJSON(path, options = {}) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  return await res.json();
}

function checkAuth() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "../../autenticacao/login.html";
    return false;
  }
  return true;
}

$(document).ready(async function () {
  if (!checkAuth()) return;

  const currentUserId = Number(localStorage.getItem("userId"));
  const form = $("form.user-form");

  if (form.length === 0) {
    console.error("Formulário não encontrado!");
    return;
  }

  try {
    const user = await fetchJSON(`/users/${currentUserId}`);

    $(".profile-img").attr("src", user.avatar || "https://placehold.co/100x100").css("width", "100px").css("height", "100px");

    form.find("input[type='text']").eq(0).val(user.name || "");

    form.find("input[type='text']").eq(1).val(user.username || "");

    form.find("input[type='email']").val(user.email || "");

    form.find("input[type='tel']").val(user.telefone || "");

    if (user.endereco) {
      form.find(".input-group input[type='text']").eq(0).val(user.endereco.comunidade || "");
      form.find(".input-group input[type='text']").eq(1).val(user.endereco.cidade || "");
      form.find("input[type='text']").eq(4).val(user.endereco.rua || "");
      form.find("input[type='text']").eq(5).val(user.endereco.numero || "");
      form.find("input[type='text']").eq(6).val(user.endereco.complemento || "");
      form.find("input[type='text']").eq(7).val(user.endereco.bairro || "");
      form.find("input[type='text']").eq(8).val(user.endereco.pontoReferencia || "");
    }

  } catch {
    Swal.fire("Erro", "Falha ao carregar dados do usuário.", "error");
  }

  const nomeInput = form.find("input[type='text']").eq(0);
  const usernameInput = form.find("input[type='text']").eq(1);
  const emailInput = form.find("input[type='email']");
  const telefoneInput = form.find("input[type='tel']");

  nomeInput.attr("name", "nome");
  usernameInput.attr("name", "username");
  emailInput.attr("name", "email");
  telefoneInput.attr("name", "telefone");

  if (telefoneInput.length && typeof $.fn.mask !== 'undefined') {
    telefoneInput.mask('(00) 00000-0000');
  }

  nomeInput.attr("maxlength", "100");
  usernameInput.attr("maxlength", "50");
  emailInput.attr("maxlength", "255");

  usernameInput.on("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
  });

  form.find("input[type='text']").eq(5).on("input", function () {
    this.value = this.value.replace(/\D/g, '');
  });

  function validarCampo(input, valor, tipo) {
    const $input = $(input);
    const $parent = $input.closest("div").first();
    $input.removeClass("is-invalid is-valid");
    $parent.find(".invalid-feedback").remove();

    let valido = true;
    let mensagem = "";

    switch (tipo) {
      case "nome":
        if (!valor || valor.trim().length < 2) {
          valido = false;
          mensagem = "O nome deve ter pelo menos 2 caracteres";
        } else if (valor.length > 100) {
          valido = false;
          mensagem = "O nome deve ter no máximo 100 caracteres";
        }
        break;

      case "username":
        if (!valor || valor.trim().length < 3) {
          valido = false;
          mensagem = "O nome de usuário deve ter pelo menos 3 caracteres";
        } else if (valor.length > 50) {
          valido = false;
          mensagem = "O nome de usuário deve ter no máximo 50 caracteres";
        } else if (!/^[a-zA-Z0-9_]+$/.test(valor)) {
          valido = false;
          mensagem = "O nome de usuário deve conter apenas letras, números e underscore";
        }
        break;

      case "email":
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valor || !emailPattern.test(valor)) {
          valido = false;
          mensagem = "Por favor, insira um e-mail válido";
        } else if (valor.length > 255) {
          valido = false;
          mensagem = "O e-mail deve ter no máximo 255 caracteres";
        }
        break;

      case "telefone":
        const telefoneLimpo = valor.replace(/\D/g, '');
        if (telefoneLimpo.length > 0 && telefoneLimpo.length < 10) {
          valido = false;
          mensagem = "Por favor, insira um telefone válido (10 ou 11 dígitos)";
        }
        break;
    }

    if (!valido) {
      $input.addClass("is-invalid");
      $parent.append(`<div class="invalid-feedback">${mensagem}</div>`);
    } else if (valor && valor.trim().length > 0) {
      $input.addClass("is-valid");
    }

    return valido;
  }

  nomeInput.on("blur", function () {
    validarCampo(this, $(this).val(), "nome");
  });

  usernameInput.on("blur", function () {
    validarCampo(this, $(this).val(), "username");
  });

  emailInput.on("blur", function () {
    validarCampo(this, $(this).val(), "email");
  });

  telefoneInput.on("blur", function () {
    validarCampo(this, $(this).val(), "telefone");
  });

  function validarFormulario() {
    let valido = true;

    valido = validarCampo(nomeInput[0], nomeInput.val(), "nome") && valido;
    valido = validarCampo(usernameInput[0], usernameInput.val(), "username") && valido;
    valido = validarCampo(emailInput[0], emailInput.val(), "email") && valido;
    valido = validarCampo(telefoneInput[0], telefoneInput.val(), "telefone") && valido;

    return valido;
  }

  const fileInput = $('<input type="file" accept="image/*" style="display: none;">');
  $("body").append(fileInput);

  $(".profile-img").on("click", function () {
    fileInput.click();
  });

  fileInput.on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire("Erro", "Por favor, selecione uma imagem válida.", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Erro", "A imagem deve ter no máximo 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;
      $(".profile-img").attr("src", base64Image);
      Swal.fire("Sucesso!", "Foto de perfil atualizada. Não esqueça de salvar as alterações.", "success");
    };
    reader.onerror = function () {
      Swal.fire("Erro", "Erro ao ler a imagem.", "error");
    };
    reader.readAsDataURL(file);
  });

  form.on("submit", async function (e) {
    e.preventDefault();

    form.find(".is-invalid, .is-valid").removeClass("is-invalid is-valid");
    form.find(".invalid-feedback").remove();

    if (!validarFormulario()) {
      Swal.fire({
        icon: "error",
        title: "Erro de validação",
        text: "Por favor, corrija os erros destacados no formulário antes de salvar.",
        confirmButtonText: "OK"
      });

      const primeiroErro = form.find(".is-invalid").first();
      if (primeiroErro.length) {
        $('html, body').animate({
          scrollTop: primeiroErro.offset().top - 100
        }, 500);
      }

      return false;
    }

    try {
      const formData = {
        name: nomeInput.val().trim(),
        username: usernameInput.val().trim(),
        email: emailInput.val().trim(),
        telefone: telefoneInput.val().trim(),
        endereco: {
          comunidade: form.find(".input-group input[type='text']").eq(0).val().trim(),
          cidade: form.find(".input-group input[type='text']").eq(1).val().trim(),
          rua: form.find("input[type='text']").eq(4).val().trim(),
          numero: form.find("input[type='text']").eq(5).val().trim(),
          complemento: form.find("input[type='text']").eq(6).val().trim(),
          bairro: form.find("input[type='text']").eq(7).val().trim(),
          pontoReferencia: form.find("input[type='text']").eq(8).val().trim()
        },
        avatar: $(".profile-img").attr("src")
      };

      await fetchJSON(`/users/${currentUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Perfil atualizado com sucesso.",
        confirmButtonText: "OK"
      }).then(() => {
        window.location.href = "index.html";
      });

    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível salvar as alterações. Tente novamente.",
        confirmButtonText: "OK"
      });
    }
  });
});
