document.addEventListener("DOMContentLoaded", async () => {
  
  const listaTipos = ["Restaurante", "Mercado", "Posto de Saúde", "Escola", "Shopping", "Farmácia", "Hospital", "Loja", "Outro"];

  const selectComunidade = document.getElementById("select-comunidade");
  const selectTipo = document.getElementById("select-tipo");

  try {
    const comunidades = await fetch(`${API_BASE}/comunidades`).then(res => res.json());
    
    // Preenche o select de comunidades
    comunidades.forEach(com => {
      const opt = document.createElement("option");
      opt.value = com.id;
      opt.textContent = com.nome;
      selectComunidade.appendChild(opt);
    });
  } catch (error) {
    console.error("Erro ao carregar comunidades:", error);
    Swal.fire("Erro", "Não foi possível carregar as comunidades.", "error");
  }

  // Preenche o select de tipos
  listaTipos.forEach(tipo => {
    const opt = document.createElement("option");
    opt.value = tipo;
    opt.textContent = tipo;
    selectTipo.appendChild(opt);
  });

  // Resto do comportamento de cadastro
  const btnCadastrar = document.getElementById("bnt-cadastrar-local");
  const arquivoInput = document.getElementById("bnt-adicionar-arquivo");
  
  let imagemBase64 = null;

  const previewContainer = document.createElement("div");
  previewContainer.style.marginTop = "10px";
  previewContainer.style.textAlign = "center";
  
  const previewImgElement = document.createElement("img");
  previewImgElement.id = "preview-imagem-local";
  previewImgElement.style.maxWidth = "300px";
  previewImgElement.style.maxHeight = "200px";
  previewImgElement.style.borderRadius = "8px";
  previewImgElement.style.display = "none";
  previewImgElement.style.margin = "10px auto";
  previewImgElement.style.objectFit = "cover";
  previewImgElement.style.border = "2px solid #dee2e6";
  
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-sm btn-danger mt-2";
  removeBtn.style.display = "none";
  removeBtn.innerHTML = '<i class="bi bi-trash"></i> Remover imagem';
  removeBtn.addEventListener("click", function() {
    arquivoInput.value = "";
    imagemBase64 = null;
    previewImgElement.style.display = "none";
    removeBtn.style.display = "none";
  });
  
  previewContainer.appendChild(previewImgElement);
  previewContainer.appendChild(removeBtn);
  if (arquivoInput && arquivoInput.parentElement) {
    arquivoInput.parentElement.appendChild(previewContainer);
  }

  if (arquivoInput) {
    arquivoInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (!file) {
        imagemBase64 = null;
        previewImgElement.style.display = "none";
        removeBtn.style.display = "none";
        return;
      }

      if (!file.type.startsWith('image/')) {
        Swal.fire("Erro", "Por favor, selecione uma imagem válida.", "error");
        arquivoInput.value = "";
        imagemBase64 = null;
        previewImgElement.style.display = "none";
        removeBtn.style.display = "none";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Erro", "A imagem deve ter no máximo 5MB.", "error");
        arquivoInput.value = "";
        imagemBase64 = null;
        previewImgElement.style.display = "none";
        removeBtn.style.display = "none";
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        imagemBase64 = e.target.result;
        previewImgElement.src = imagemBase64;
        previewImgElement.style.display = "block";
        removeBtn.style.display = "block";
      };
      reader.onerror = function() {
        Swal.fire("Erro", "Erro ao ler a imagem.", "error");
        arquivoInput.value = "";
        imagemBase64 = null;
        previewImgElement.style.display = "none";
        removeBtn.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  const getValue = (name) =>
    document.querySelector(`[name="${name}"]`)?.value.trim() || "";

  btnCadastrar.addEventListener("click", async (e) => {
    e.preventDefault();

    const confirmResult = await Swal.fire({
      title: "Cadastrar local?",
      text: "Deseja cadastrar este local?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    const nomeLocal = getValue("nome-local");
    const comunidadeId = Number(selectComunidade.value);
    const tipo = selectTipo.value;
    
    let comunidadeNome = "";
    try {
      const comunidades = await fetch(`${API_BASE}/comunidades`).then(res => res.json());
      const comunidadeSelecionada = comunidades.find(c => c.id === comunidadeId);
      comunidadeNome = comunidadeSelecionada ? comunidadeSelecionada.nome : "";
    } catch (error) {
      console.error("Erro ao buscar comunidade:", error);
    }
    const rua = getValue("rua-local");
    const numero = getValue("numero-local");
    const bairro = getValue("bairro-local");
    const referencia = getValue("referencia-local");

    // Validação
    if (!nomeLocal) {
      Swal.fire("Atenção", "Preencha o nome do local.", "warning");
      return;
    }
    if (!comunidadeId) {
      Swal.fire("Atenção", "Selecione uma comunidade.", "warning");
      return;
    }
    if (!tipo) {
      Swal.fire("Atenção", "Selecione o tipo de local.", "warning");
      return;
    }

    const imagem = imagemBase64 || "/assets/images/imagem-exemplo.jpg";

    const novoLocal = {
      nome: nomeLocal,
      comunidadeId: comunidadeId,
      comunidade: comunidadeNome,
      tipo: tipo,
      endereco: `${rua}${rua && numero ? ", " : ""}${numero}${bairro ? " - " + bairro : ""}${referencia ? " (" + referencia + ")" : ""}`,
      imagem: imagem,
      criador: "Usuário da plataforma",
      contato: "",
      quantidadeViagens: 0,
      aprovado: false,
      criadoEm: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/locais`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoLocal),
      });
      if (!res.ok) throw new Error("Falha ao salvar");

      await Swal.fire({
        icon: "success",
        title: "Local cadastrado!",
        text: "Seu local foi enviado para análise.",
        timer: 1800,
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.href = "/pages/comunidades/index.html";
      }, 1200);

    } catch (err) {
      console.error(err);
      Swal.fire("Erro", "Não foi possível salvar o local.", "error");
    }
  });
});
