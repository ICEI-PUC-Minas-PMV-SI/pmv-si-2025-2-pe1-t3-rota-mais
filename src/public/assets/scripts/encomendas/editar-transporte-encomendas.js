// --------- Referências aos campos ---------

const partida = document.getElementById("partida");
const chegada = document.getElementById("chegada");
const dataViagem = document.getElementById("dataViagem");
const horaPartida = document.getElementById("horaPartida");
const veiculo = document.getElementById("veiculo");
const placa = document.getElementById("placa");

const dataRetorno = document.getElementById("dataRetorno");
const horaRetorno = document.getElementById("horaRetorno");
const retornoContainer = document.getElementById("retornoContainer");

const custoOptions = document.querySelectorAll("#custoOptions .option");
const retornoOptions = document.querySelectorAll("#retornoOptions .option");

const btnCriar = document.getElementById("criarOferta");


// ---------- Função genérica para seletores ----------
function configurarSeletores(options, callback) {
    options.forEach(op => {
        op.addEventListener("click", () => {
            options.forEach(o => o.classList.remove("active"));
            op.classList.add("active");
            if (callback) callback(op.innerText);
        });
    });
}


// ---------- Custo (radio style) ----------
configurarSeletores(custoOptions);


// ---------- Retorno (radio style) ----------
configurarSeletores(retornoOptions, (valor) => {
    if (valor.includes("Não incluir")) {
        retornoContainer.style.display = "none";
    } else {
        retornoContainer.style.display = "flex";
    }
});


// ---------- Estado inicial do container de retorno ----------
(function initRetorno() {
    const ativo = document.querySelector("#retornoOptions .active");
    if (ativo && ativo.innerText.includes("Não incluir")) {
        retornoContainer.style.display = "none";
    }
})();


function validarCampos() {

    const campos = [
        partida,
        chegada,
        dataViagem,
        horaPartida,
        veiculo,
        placa
    ];

    for (const campo of campos) {
        if (!campo.value || campo.value.trim() === "") {
            alert("Por favor, preencha todos os campos obrigatórios.");
            campo.focus();
            return false;
        }
    }

    // Se incluir retorno, validar também retorno
    const opcaoRetorno = document.querySelector("#retornoOptions .active").innerText;

    if (opcaoRetorno.includes("incluir")) {
        if (!dataRetorno.value || !horaRetorno.value) {
            alert("Preencha a data e horário do retorno.");
            dataRetorno.focus();
            return false;
        }
    }

    return true;
}



btnCriar.addEventListener("click", () => {

    if (!validarCampos()) return;

    const dados = {
        partida: partida.value.trim(),
        chegada: chegada.value.trim(),
        dataViagem: dataViagem.value,
        horaPartida: horaPartida.value,
        veiculo: veiculo.value,
        placa: placa.value.trim(),

        custo: document.querySelector("#custoOptions .active").innerText,
        incluirRetorno: document.querySelector("#retornoOptions .active").innerText,

        dataRetorno: dataRetorno.value,
        horaRetorno: horaRetorno.value
    };

    console.log("OFERTA CRIADA:", dados);
    alert("Oferta criada com sucesso!");

});
