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

if (!window.userVehicles) {
    window.userVehicles = [];
}

window.displayVehiclesRegister = function() {
    const container = document.getElementById("vehicles-list-register");
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!window.userVehicles || window.userVehicles.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'text-muted';
        emptyMsg.textContent = 'Nenhum veículo adicionado.';
        container.appendChild(emptyMsg);
        return;
    }
    
    window.userVehicles.forEach((vehicle, index) => {
        const typeText = vehicle.type === 'CAR' ? 'Carro' : 'Motocicleta';
        const item = document.createElement('div');
        item.className = 'd-flex gap-3 align-items-center mb-2 p-2 border rounded';
        item.innerHTML = `
            <div class="col-md-3">
                <select class="form-select form-select-sm" disabled>
                    <option ${vehicle.type === 'CAR' ? 'selected' : ''}>Carro</option>
                    <option ${vehicle.type === 'MOTORCYCLE' ? 'selected' : ''}>Moto</option>
                </select>
            </div>
            <div class="col-md-3">
                <input type="text" class="form-control form-control-sm" value="${vehicle.brand || ''} ${vehicle.model || ''}" disabled>
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control form-control-sm" value="${vehicle.licensePlate || ''}" disabled>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm remove-vehicle-register" data-index="${index}">
                <i class="bi bi-trash"></i>
            </button>
        `;
        container.appendChild(item);
    });
    
    container.querySelectorAll('.remove-vehicle-register').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            window.userVehicles.splice(index, 1);
            window.displayVehiclesRegister();
        });
    });
};

if (localStorage.getItem("userId")) {
    window.location.replace("/pages/caronas/index.html");
}

document.addEventListener("DOMContentLoaded", async function() {
    if (typeof jQuery !== 'undefined' && jQuery.fn.mask) {
        jQuery("#telefone").mask("(00) 00000-0000");
    }
    
    try {
        const response = await fetch("http://localhost:3000/comunidades");
        const comunidades = await response.json();
        
        const selectComunidade = document.getElementById("comunidade");
        if (selectComunidade) {
            comunidades.forEach(comunidade => {
                const option = document.createElement("option");
                option.value = comunidade.nome;
                option.textContent = comunidade.nome;
                selectComunidade.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar comunidades:", error);
        const selectComunidade = document.getElementById("comunidade");
        if (selectComunidade) {
            ["Centro", "Bairro Alto", "Taquara", "Vila Nova"].forEach(comunidade => {
                const option = document.createElement("option");
                option.value = comunidade;
                option.textContent = comunidade;
                selectComunidade.appendChild(option);
            });
        }
    }
    
    window.displayVehiclesRegister();
    
    if (typeof jQuery !== 'undefined' && jQuery.fn.validate) {
        const inputs = ['nome', 'email', 'senha', 'usuario', 'telefone', 'comunidade', 'cidade', 'rua', 'numero', 'bairro', 'referencia'];
        inputs.forEach(name => {
            const $input = jQuery(`#${name}`);
            if ($input.length && !$input.attr('name')) {
                $input.attr('name', name);
            }
        });
        
        const $form = jQuery('#form-register');
        
        inputs.forEach(name => {
            const $input = jQuery(`#${name}`);
            if ($input.length) {
                const $clone = $input.clone();
                $clone.attr('id', name + '-validate');
                $clone.removeAttr('required');
                $form.append($clone);
            }
        });
        
        jQuery('#form-register').validate({
            rules: {
                nome: { required: true },
                email: { required: true, email: true },
                senha: { required: true, minlength: 8 },
                usuario: { required: true, minlength: 4 },
                telefone: { required: true, minlength: 10 },
                comunidade: { required: true },
                cidade: { required: true },
                rua: { required: true },
                numero: { required: true },
                bairro: { required: true },
                referencia: { required: false }
            },
            messages: {
                nome: 'Por favor, preencha o nome',
                email: 'Por favor, insira um e-mail válido',
                senha: 'A senha deve ter pelo menos 8 caracteres',
                usuario: 'O nome de usuário deve ter pelo menos 4 caracteres',
                telefone: 'Por favor, preencha um telefone válido',
                comunidade: 'Por favor, selecione uma comunidade',
                cidade: 'Por favor, preencha a cidade',
                rua: 'Por favor, preencha a rua',
                numero: 'Por favor, preencha o número',
                bairro: 'Por favor, preencha o bairro'
            },
            errorElement: 'div',
            errorClass: 'invalid-feedback',
            highlight: function(element) {
                const name = jQuery(element).attr('name');
                jQuery(`#${name}`).addClass('is-invalid');
            },
            unhighlight: function(element) {
                const name = jQuery(element).attr('name');
                jQuery(`#${name}`).removeClass('is-invalid');
                jQuery(`#${name}`).next('.invalid-feedback').remove();
            },
            errorPlacement: function(error, element) {
                const name = jQuery(element).attr('name');
                jQuery(`#${name}`).after(error.clone());
            }
        });
    }
});

document.getElementById("btn-criar-conta").addEventListener("click", async function (e) {
    e.preventDefault();
    
    if (typeof jQuery !== 'undefined' && jQuery.fn.validate) {
        const $form = jQuery('#form-register');
        const inputs = ['nome', 'email', 'senha', 'usuario', 'telefone', 'comunidade', 'cidade', 'rua', 'numero', 'bairro', 'referencia'];
        inputs.forEach(name => {
            const $original = jQuery(`#${name}`);
            const $clone = jQuery(`#${name}-validate`);
            if ($original.length && $clone.length) {
                $clone.val($original.val());
            }
        });
        
        if ($form.length && $form.valid && !$form.valid()) {
            return;
        }
    }

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const usuario = document.getElementById("usuario").value.trim();
    const telefoneInput = document.getElementById("telefone");
    const telefone = telefoneInput ? telefoneInput.value.replace(/\D/g, '') : '';

    const comunidade = document.getElementById("comunidade").value;
    const cidade = document.getElementById("cidade").value.trim();

    const rua = document.getElementById("rua").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const complemento = document.getElementById("complemento").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const referencia = document.getElementById("referencia").value.trim();

    if (!nome) {
        Swal.fire({
            icon: "error",
            title: "Campo obrigatório",
            text: "Por favor, preencha o nome."
        });
        document.getElementById("nome").focus();
        return;
    }

    if (!email) {
        Swal.fire({
            icon: "error",
            title: "Campo obrigatório",
            text: "Por favor, preencha o e-mail."
        });
        document.getElementById("email").focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            icon: "error",
            title: "E-mail inválido",
            text: "Por favor, insira um e-mail válido."
        });
        document.getElementById("email").focus();
        return;
    }

    if (!senha || senha.length < 8) {
        Swal.fire({
            icon: "error",
            title: "Senha inválida",
            text: "A senha deve ter pelo menos 8 caracteres."
        });
        document.getElementById("senha").focus();
        return;
    }

    if (!usuario || usuario.length < 4) {
        Swal.fire({
            icon: "error",
            title: "Nome de usuário inválido",
            text: "O nome de usuário deve ter pelo menos 4 caracteres."
        });
        document.getElementById("usuario").focus();
        return;
    }

    if (!telefone || telefone.length < 10) {
        Swal.fire({
            icon: "error",
            title: "Telefone inválido",
            text: "Por favor, preencha um telefone válido."
        });
        document.getElementById("telefone").focus();
        return;
    }

    if (!comunidade) {
        Swal.fire({
            icon: "error",
            title: "Campo obrigatório",
            text: "Por favor, selecione uma comunidade."
        });
        document.getElementById("comunidade").focus();
        return;
    }

    if (!cidade) {
        Swal.fire({
            icon: "error",
            title: "Campo obrigatório",
            text: "Por favor, preencha a cidade."
        });
        document.getElementById("cidade").focus();
        return;
    }

    const checkResponse = await fetch(`http://localhost:3000/users?email=${email}`);
    const existing = await checkResponse.json();

    if (existing.length > 0) {
        Swal.fire({
            icon: "warning",
            title: "Usuário já existe!",
            text: "Já existe uma conta com esse e-mail."
        });
        return;
    }

    const senhaHash = hashPassword(senha);

    const user = {
        name: nome,
        email,
        senha: senhaHash,
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
        }
    };

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        if (!response.ok) throw new Error("Erro ao criar conta");

        const newUser = await response.json();

        if (window.userVehicles && window.userVehicles.length > 0) {
            for (const vehicle of window.userVehicles) {
                const vehicleData = {
                    ...vehicle,
                    motoristaId: newUser.id
                };
                
                try {
                    await fetch("http://localhost:3000/vehicles", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(vehicleData)
                    });
                } catch (err) {
                    console.error("Erro ao salvar veículo:", err);
                }
            }
            window.userVehicles = [];
        }

        const userParaSalvar = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            usuario: newUser.usuario,
            telefone: newUser.telefone,
            comunidade: newUser.comunidade,
            cidade: newUser.cidade,
            avatar: newUser.avatar,
            endereco: newUser.endereco
        };

        localStorage.setItem("user", JSON.stringify(userParaSalvar));
        localStorage.setItem("userId", newUser.id);

        Swal.fire({
            icon: "success",
            title: "Conta criada com sucesso!"
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
