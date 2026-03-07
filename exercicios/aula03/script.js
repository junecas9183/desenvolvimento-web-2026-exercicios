// --- Seleção de Elementos ---
const emailForm = document.getElementById('emailForm');
const historyList = document.getElementById('historyList');
const loader = document.getElementById('loader');
const clearHistoryBtn = document.getElementById('clearHistory');

// Campos do Formulário para Preview
const inputFrom = document.getElementById('from');
const inputTo = document.getElementById('to');
const inputSubject = document.getElementById('subject');
const inputPriority = document.getElementById('priority');
const inputBody = document.getElementById('body');

// Elementos do Preview
const pFrom = document.getElementById('pFrom');
const pTo = document.getElementById('pTo');
const pSubject = document.getElementById('pSubject');
const pPriority = document.getElementById('pPriority');
const pBody = document.getElementById('pBody');

// --- 1. Validação de Email (Regex) ---
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
};

// --- 2. Preview em Tempo Real ---
emailForm.addEventListener('input', () => {
    pFrom.textContent = inputFrom.value;
    pTo.textContent = inputTo.value;
    pSubject.textContent = inputSubject.value;
    pBody.textContent = inputBody.value;
    
    // Correção: Uso de crases para Template Literals
    pPriority.textContent = `Prioridade: ${inputPriority.value.toUpperCase()}`;
    pPriority.className = `priority-tag p-${inputPriority.value}`;
});

// --- 3. Simulação de Envio (Assíncrona) ---
emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validação robusta de múltiplos emails
    const recipients = inputTo.value.split(',').map(mail => mail.trim()).filter(mail => mail !== "");
    const allValid = recipients.every(email => validateEmail(email)) && validateEmail(inputFrom.value);

    if (!allValid || recipients.length === 0) {
        alert("Por favor, insira e-mails válidos.");
        return;
    }

    // Início da simulação visual
    loader.classList.remove('hidden');
    const btnSend = document.querySelector('button[type="submit"]');
    btnSend.disabled = true;

    // Simular delay de 2 segundos (Aula 3)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Criar objeto do email
    const newEmail = {
        id: Date.now(),
        from: inputFrom.value,
        to: inputTo.value,
        subject: inputSubject.value,
        priority: inputPriority.value,
        date: new Date().toLocaleString()
    };

    // Salvar e Limpar
    saveToLocalStorage(newEmail);
    loader.classList.add('hidden');
    btnSend.disabled = false;
    
    alert("E-mail enviado com sucesso!");
    emailForm.reset();
    resetPreview();
    renderHistory();
});

// --- 4. Histórico e LocalStorage ---
function saveToLocalStorage(email) {
    let history = JSON.parse(localStorage.getItem('emails')) || [];
    history.unshift(email); 
    if (history.length > 10) history.pop();
    localStorage.setItem('emails', JSON.stringify(history));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('emails')) || [];
    historyList.innerHTML = ''; 

    history.forEach(email => {
        const li = document.createElement('li');
        li.className = 'history-item';
        // Correção: Uso de crases para gerar o HTML dinâmico
        li.innerHTML = `
            <div>
                <strong>${email.subject}</strong> <br>
                <small>Para: ${email.to} | ${email.date}</small>
            </div>
            <div class="history-actions">
                <button onclick="resendEmail(${email.id})">Reenviar</button>
                <button onclick="deleteEmail(${email.id})" class="btn-danger">Deletar</button>
            </div>
        `;
        historyList.appendChild(li);
    });
}

// Funções Auxiliares Globais
window.deleteEmail = (id) => {
    let history = JSON.parse(localStorage.getItem('emails')) || [];
    history = history.filter(item => item.id !== id);
    localStorage.setItem('emails', JSON.stringify(history));
    renderHistory();
};

window.resendEmail = (id) => {
    const history = JSON.parse(localStorage.getItem('emails')) || [];
    const email = history.find(item => item.id == id);
    if(email) {
        inputFrom.value = email.from;
        inputTo.value = email.to;
        inputSubject.value = `Fwd: ${email.subject}`;
        inputPriority.value = email.priority;
        emailForm.dispatchEvent(new Event('input')); // Atualiza o preview
        window.scrollTo(0, 0);
    }
};

// Botão de Limpar Tudo
clearHistoryBtn.addEventListener('click', () => {
    if(confirm("Deseja apagar todo o histórico?")) {
        localStorage.removeItem('emails');
        renderHistory();
    }
});

function resetPreview() {
    pFrom.textContent = '';
    pTo.textContent = '';
    pSubject.textContent = '';
    pBody.textContent = '';
    pPriority.textContent = '';
}

renderHistory();