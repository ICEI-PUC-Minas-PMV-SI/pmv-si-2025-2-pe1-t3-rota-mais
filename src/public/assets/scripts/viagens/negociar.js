$(document).ready(async function () {
    await initCarona();
    initChat();
});

async function initCarona() {
    const urlParams = new URLSearchParams(window.location.search);
    const caronaId = urlParams.get('id');
    const userIdParam = urlParams.get('userId');

    if (!caronaId) {
        return Swal.fire('Erro', 'ID da carona não informado.', 'error');
    }

    const response = await fetch(`${API_BASE}/caronas/${caronaId}`);
    const carona = await response.json();

    if (!carona) {
        return Swal.fire('Erro', 'Carona não encontrada.', 'error');
    }

    const container = document.getElementById('detalhes-container');
    createDetailsComponent(carona, container);

    window.CARONA_ID = caronaId;

    const currentUserId = Number(localStorage.getItem("userId"));

    let otherUserId = null;

    if (userIdParam) {
        otherUserId = Number(userIdParam);
    } else {
        if (carona.tipo === 'pedindo') {
            if (carona.passageiroId === currentUserId) {
                otherUserId = carona.motoristaId;
            } else if (carona.motoristaId === currentUserId) {
                otherUserId = carona.passageiroId;
            }
        } else {
            otherUserId = currentUserId === carona.motoristaId
                ? carona.passageiroId
                : carona.motoristaId;
        }
    }

    if (!otherUserId) {
        return Swal.fire('Erro', 'Não foi possível determinar o outro participante.', 'error');
    }

    const otherRes = await fetch(`${API_BASE}/users/${otherUserId}`);
    if (!otherRes.ok) {
        return Swal.fire('Erro', 'Usuário não encontrado.', 'error');
    }
    const otherUser = await otherRes.json();

    let isMotorista = false;
    if (carona.tipo === 'pedindo') {
        isMotorista = carona.motoristaId === otherUserId;
    } else {
        isMotorista = carona.motoristaId === otherUserId;
    }
    const roleText = isMotorista ? "Motorista" : "Passageiro";

    const passengerImgElement = document.querySelector(".passenger img");
    const passengerStrong = document.querySelector(".passenger strong");
    const passengerRating = document.querySelectorAll(".passenger .text-muted")[0];
    const passengerRole = document.querySelectorAll(".passenger .text-muted")[1];

    if (passengerImgElement) {
        passengerImgElement.style.width = "40px";
        passengerImgElement.style.height = "40px";
        passengerImgElement.src = otherUser.avatar || "https://placehold.co/40x40";
        passengerImgElement.alt = otherUser.name || otherUser.nome || "Usuário";
    }
    if (passengerStrong) {
        passengerStrong.textContent = otherUser.name || otherUser.nome || "Usuário";
    }
    if (passengerRating) {
        passengerRating.textContent = `★ ${otherUser.rating || 5}`;
    }
    if (passengerRole) {
        passengerRole.textContent = roleText;
    }

    window.OTHER_USER = otherUser;
    window.OTHER_USER_ID = otherUserId;
}

const chatContainer = document.getElementById("chat-container");
const input = document.querySelector(".chat-input-container input");
const sendBtn = document.querySelector(".chat-input-container button");

const API_URL = `${API_BASE}/messages`;

function initChat() {
    loadMessages();

    sendBtn.addEventListener("click", sendMessage);

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    setInterval(loadMessages, 1000);
}

function createMessageElement(msg, isMe, authorAvatar = null, authorName = null) {
    const wrapper = document.createElement("div");
    wrapper.className = isMe ? "chat-message-me-message" : "chat-message-other-message";
    wrapper.style.alignItems = "flex-end";
    wrapper.style.gap = "10px";
    wrapper.style.marginBottom = "15px";

    if (!isMe) {
        const avatarImg = document.createElement("img");
        avatarImg.src = authorAvatar || "https://placehold.co/40x40";
        avatarImg.alt = authorName || "Usuário";
        avatarImg.className = "rounded-circle";
        avatarImg.style.width = "40px";
        avatarImg.style.height = "40px";
        avatarImg.style.objectFit = "cover";
        avatarImg.style.flexShrink = "0";
        wrapper.appendChild(avatarImg);
    }

    const content = document.createElement("div");
    content.className = "chat-message-content";
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.maxWidth = "70%";
    content.style.alignItems = isMe ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");
    bubble.className =
        `chat-message-content-text ${isMe ? "bg-primary" : "bg-secondary"} text-white p-3 rounded-pill`;
    bubble.style.display = "inline-block";
    bubble.style.wordWrap = "break-word";

    const textSpan = document.createElement("span");
    textSpan.textContent = msg.text;
    textSpan.classList.add("msg-text");
    textSpan.dataset.id = msg.id;
    bubble.appendChild(textSpan);

    if (isMe) {
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-light ms-2 edit-btn";
        editBtn.dataset.id = msg.id;
        editBtn.innerHTML = `<i class="bi bi-pencil"></i>`;
        bubble.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-danger ms-1 delete-btn";
        deleteBtn.dataset.id = msg.id;
        deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`;
        bubble.appendChild(deleteBtn);
    }

    const author = document.createElement("small");
    author.className = "text-muted d-block mt-1";
    author.textContent = authorName || msg.authorName || "Usuário";
    author.style.textAlign = isMe ? "right" : "left";

    content.appendChild(bubble);
    content.appendChild(author);
    wrapper.appendChild(content);

    if (isMe) {
        const currentUserStr = localStorage.getItem("user");
        if (currentUserStr) {
            try {
                const currentUser = JSON.parse(currentUserStr);
                const avatarImg = document.createElement("img");
                avatarImg.src = currentUser.avatar || "https://placehold.co/40x40";
                avatarImg.alt = currentUser.nome || currentUser.name || "Você";
                avatarImg.className = "rounded-circle";
                avatarImg.style.width = "40px";
                avatarImg.style.height = "40px";
                avatarImg.style.objectFit = "cover";
                avatarImg.style.flexShrink = "0";
                wrapper.appendChild(avatarImg);
            } catch (e) {
                console.error("Erro ao obter avatar do usuário atual:", e);
            }
        }
    }

    return wrapper;
}

async function loadMessages() {
    if (!window.CARONA_ID) return;

    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('userId');
    const isPrivate = !!userIdParam;
    const recipientId = userIdParam ? Number(userIdParam) : null;

    const res = await fetch(`${API_URL}?caronaId=${window.CARONA_ID}`);
    const allMessages = await res.json();

    const currentUserId = Number(localStorage.getItem("userId"));

    let messages;
    if (isPrivate && recipientId) {
        messages = allMessages.filter(msg => {
            return msg.isPrivate === true && (
                (msg.authorId === currentUserId && msg.recipientId === recipientId) ||
                (msg.authorId === recipientId && msg.recipientId === currentUserId)
            );
        });
    } else {
        messages = allMessages.filter(msg => !msg.isPrivate);
    }

    chatContainer.textContent = "";

    const authorIds = [...new Set(messages.map(msg => msg.authorId))];
    const authorsMap = new Map();

    for (const authorId of authorIds) {
        try {
            const authorRes = await fetch(`${API_BASE}/users/${authorId}`);
            if (authorRes.ok) {
                const author = await authorRes.json();
                authorsMap.set(authorId, {
                    name: author.name || author.nome || "Usuário",
                    avatar: author.avatar || "https://placehold.co/40x40"
                });
            }
        } catch (e) {
            console.error(`Erro ao buscar autor ${authorId}:`, e);
        }
    }

    messages.forEach(msg => {
        const isMe = msg.authorId === currentUserId;
        const authorInfo = authorsMap.get(msg.authorId);
        const authorName = authorInfo?.name || msg.authorName || "Usuário";
        const authorAvatar = authorInfo?.avatar || null;
        
        const el = createMessageElement(msg, isMe, authorAvatar, authorName);
        chatContainer.appendChild(el);
    });

    attachActionListeners();

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function attachActionListeners() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.closest("button").dataset.id;
            await deleteMessage(id);
            loadMessages();
        });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.closest("button").dataset.id;
            enterEditMode(id);
        });
    });
}

async function deleteMessage(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}

function enterEditMode(id) {
    const span = document.querySelector(`.msg-text[data-id="${id}"]`);
    const original = span.textContent;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control form-control-sm";
    input.value = original;

    span.replaceWith(input);
    input.focus();

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveEdit(id, input.value);
    });

    input.addEventListener("blur", () => saveEdit(id, input.value));
}

async function saveEdit(id, newText) {
    await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText })
    });

    loadMessages();
}

async function sendMessage() {
    if (!window.CARONA_ID) return;

    const text = input.value.trim();
    if (!text) return;

    const authorId = Number(localStorage.getItem("userId"));
    if (!authorId) {
        return Swal.fire("Erro", "Usuário não está logado.", "error");
    }

    let authorName = "Usuário";
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            authorName = user.nome || user.name || user.username || "Usuário";
        } else {
            const userRes = await fetch(`${API_BASE}/users/${authorId}`);
            if (userRes.ok) {
                const user = await userRes.json();
                authorName = user.nome || user.name || user.username || "Usuário";
            }
        }
    } catch (e) {
        console.error("Erro ao obter nome do usuário:", e);
        authorName = "Usuário";
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('userId');
    const isPrivate = !!userIdParam;
    const recipientId = userIdParam ? Number(userIdParam) : null;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            caronaId: window.CARONA_ID,
            authorId,
            authorName,
            text,
            timestamp: Date.now(),
            isPrivate: isPrivate,
            recipientId: recipientId || null
        })
    });

    input.value = "";
    loadMessages();
}
