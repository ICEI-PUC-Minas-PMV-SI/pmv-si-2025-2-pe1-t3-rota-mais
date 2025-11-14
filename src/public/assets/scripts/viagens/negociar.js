$(document).ready(async function () {
    await initCarona();
    initChat();
});

async function initCarona() {
    const urlParams = new URLSearchParams(window.location.search);
    const caronaId = urlParams.get('id');

    if (!caronaId) {
        return Swal.fire('Erro', 'ID da carona não informado.', 'error');
    }

    const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
    const carona = await response.json();

    if (!carona) {
        return Swal.fire('Erro', 'Carona não encontrada.', 'error');
    }

    const container = document.getElementById('detalhes-container');
    createDetailsComponent(carona, container);

    window.CARONA_ID = caronaId;

    const currentUserId = Number(localStorage.getItem("userId"));

    let otherUserId =
        currentUserId === carona.motoristaId
            ? carona.passageiroId
            : carona.motoristaId;

    const otherRes = await fetch(`http://localhost:3000/users/${otherUserId}`);
    const otherUser = await otherRes.json();


    document.querySelector(".passenger strong").textContent = otherUser.name;
    document.querySelectorAll(".passenger .text-muted")[0].textContent = `★ ${otherUser.rating || 5}`;
    document.querySelectorAll(".passenger .text-muted")[1].textContent =
        otherUser.role === "motorista" ? "Motorista" : "Passageiro";
}

const chatContainer = document.getElementById("chat-container");
const input = document.querySelector(".chat-input-container input");
const sendBtn = document.querySelector(".chat-input-container button");

const API_URL = "http://localhost:3000/messages";

function initChat() {
    loadMessages();

    sendBtn.addEventListener("click", sendMessage);

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    setInterval(loadMessages, 1000);
}

function createMessageElement(msg, isMe) {
    const wrapper = document.createElement("div");
    wrapper.className = isMe ? "chat-message-me-message" : "chat-message-other-message";

    const content = document.createElement("div");
    content.className = "chat-message-content";

    const bubble = document.createElement("div");
    bubble.className =
        `chat-message-content-text ${isMe ? "bg-primary" : "bg-secondary"} text-white p-3 rounded-pill`;

    // texto
    const textSpan = document.createElement("span");
    textSpan.textContent = msg.text;
    textSpan.classList.add("msg-text");
    textSpan.dataset.id = msg.id;
    bubble.appendChild(textSpan);

    // botões do autor
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
    author.className = "text-muted";
    author.textContent = msg.authorName;

    content.appendChild(bubble);
    content.appendChild(author);
    wrapper.appendChild(content);

    return wrapper;
}

async function loadMessages() {
    if (!window.CARONA_ID) return;

    const res = await fetch(`${API_URL}?caronaId=${window.CARONA_ID}`);
    const messages = await res.json();

    const currentUserId = Number(localStorage.getItem("userId"));

    chatContainer.textContent = ""; // limpa

    messages.forEach(msg => {
        const isMe = msg.authorId === currentUserId;
        const el = createMessageElement(msg, isMe);
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
    const authorName = localStorage.getItem("userName");

    if (!authorId || !authorName) {
        return Swal.fire("Erro", "Usuário não está logado.", "error");
    }

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            caronaId: window.CARONA_ID,
            authorId,
            authorName,
            text,
            timestamp: Date.now()
        })
    });

    input.value = "";
    loadMessages();
}
