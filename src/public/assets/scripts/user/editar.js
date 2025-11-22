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

  // Carregar comunidades
  try {
    const comunidades = await fetchJSON(`/comunidades`);
    const $comunidadeSelect = $("#comunidade-select");
    
    if ($comunidadeSelect.length && comunidades && comunidades.length > 0) {
      // Adicionar opção vazia primeiro
      $comunidadeSelect.append($("<option>").attr("value", "").text("Selecione uma comunidade"));
      
      comunidades.forEach(comunidade => {
        const $option = $("<option>").attr("value", comunidade.nome).text(comunidade.nome);
        $comunidadeSelect.append($option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar comunidades:", error);
  }

  try {
    const user = await fetchJSON(`/users/${currentUserId}`);

    $(".profile-img").attr("src", user.avatar || "https://placehold.co/100x100").css("width", "100px").css("height", "100px");

    form.find("input[type='text']").eq(0).val(user.name || "");

    form.find("input[type='text']").eq(1).val(user.username || "");

    form.find("input[type='email']").val(user.email || "");

    form.find("input[type='tel']").val(user.telefone || "");

    const comunidadeValue = (user.endereco && user.endereco.comunidade) || user.comunidade || "";
    $("#comunidade-select").val(comunidadeValue);
    
    const cidadeValue = (user.endereco && user.endereco.cidade) || user.cidade || "";
    $("#cidade-input").val(cidadeValue);
    
    if (user.endereco) {
      $("#rua-input").val(user.endereco.rua || "");
      $("#numero-input").val(user.endereco.numero || "");
      $("#complemento-input").val(user.endereco.complemento || "");
      $("#bairro-input").val(user.endereco.bairro || "");
      $("#ponto-referencia-input").val(user.endereco.pontoReferencia || "");
    }
    
    $("#biografia-input").val(user.biografia || "");

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
  
  const biografiaInput = $("#biografia-input");
  if (biografiaInput.length) {
    biografiaInput.attr("maxlength", "500");
  }

  usernameInput.on("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
  });

  form.find("input[type='text']").eq(5).on("input", function () {
    this.value = this.value.replace(/\D/g, '');
  });
  
  if (biografiaInput.length) {
    const $counter = $("<small>").addClass("form-text text-muted").text("0/500 caracteres");
    biografiaInput.after($counter);
    
    biografiaInput.on("input", function() {
      const length = $(this).val().length;
      $counter.text(`${length}/500 caracteres`);
      if (length > 500) {
        $counter.addClass("text-danger").removeClass("text-muted");
      } else {
        $counter.removeClass("text-danger").addClass("text-muted");
      }
    });
    
    const initialLength = biografiaInput.val().length;
    $counter.text(`${initialLength}/500 caracteres`);
  }

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
      const comunidadeValue = $("#comunidade-select").val().trim();
      const cidadeValue = $("#cidade-input").val().trim();
      
      const biografiaValue = $("#biografia-input").val().trim();
      
      const formData = {
        name: nomeInput.val().trim(),
        username: usernameInput.val().trim(),
        email: emailInput.val().trim(),
        telefone: telefoneInput.val().trim(),
        comunidade: comunidadeValue,
        cidade: cidadeValue,
        biografia: biografiaValue,
        endereco: {
          comunidade: comunidadeValue,
          cidade: cidadeValue,
          rua: $("#rua-input").val().trim(),
          numero: $("#numero-input").val().trim(),
          complemento: $("#complemento-input").val().trim(),
          bairro: $("#bairro-input").val().trim(),
          pontoReferencia: $("#ponto-referencia-input").val().trim()
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
