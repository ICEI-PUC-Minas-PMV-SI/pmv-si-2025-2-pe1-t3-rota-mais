document.addEventListener("DOMContentLoaded", () => {
  // Simula as listas fixas para comunidade e tipo
  const listaComunidades = ["Centro", "Bairro Alto", "Taquara", "Vila Nova"];
  const listaTipos = ["Restaurante", "Mercado", "Posto de Saúde", "Escola"];

  const selectComunidade = document.getElementById("select-comunidade");
  const selectTipo = document.getElementById("select-tipo");

  // Preenche o select de comunidades
  listaComunidades.forEach(com => {
    const opt = document.createElement("option");
    opt.value = com;
    opt.textContent = com;
    selectComunidade.appendChild(opt);
  });

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
    const comunidade = selectComunidade.value;
    const tipo = selectTipo.value;
    const rua = getValue("rua-local");
    const numero = getValue("numero-local");
    const bairro = getValue("bairro-local");
    const referencia = getValue("referencia-local");

    // Validação
    if (!nomeLocal) {
      Swal.fire("Atenção", "Preencha o nome do local.", "warning");
      return;
    }
    if (!comunidade) {
      Swal.fire("Atenção", "Selecione uma comunidade.", "warning");
      return;
    }
    if (!tipo) {
      Swal.fire("Atenção", "Selecione o tipo de local.", "warning");
      return;
    }

    let imagemPath = "/assets/images/imagem-exemplo.jpg";
    if (arquivoInput && arquivoInput.files.length > 0) {
      const file = arquivoInput.files[0];
      imagemPath = `/uploads/${file.name}`;
    }

    const novoLocal = {
      nome: nomeLocal,
      comunidade: comunidade,
      tipo: tipo,
      endereco: `${rua}${rua && numero ? ", " : ""}${numero}${bairro ? " - " + bairro : ""}${referencia ? " (" + referencia + ")" : ""}`,
      imagem: imagemPath,
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
        window.location.href = "/pages/comunidades/comunidades.html";
      }, 1200);

    } catch (err) {
      console.error(err);
      Swal.fire("Erro", "Não foi possível salvar o local.", "error");
    }
  });
});
