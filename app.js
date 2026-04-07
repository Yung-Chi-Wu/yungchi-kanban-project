async function initApp() {
    try {
        await API.init();
        renderBoard();
    } catch (e) {
        console.error(e);
        alert("Connection failed.");
    }
}
let allTasks = [];

async function renderBoard() {
    allTasks = await API.getTasks();
    filterAndRender();
}
function filterAndRender() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(c => c.innerHTML = '');

    const filtered = allTasks.filter(t =>
        t.title.toLowerCase().includes(searchTerm) ||
        (t.description && t.description.toLowerCase().includes(searchTerm))
    );

    filtered.forEach(t => {
        const col = document.getElementById(t.status);
        if (!col) return;

        const card = document.createElement('div');
        card.className = 'task-card group';
        card.setAttribute('data-id', t.id);

        const labelClass = t.label === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${labelClass}">${t.label || 'Feature'}</span>
                <button onclick="handleDelete('${t.id}')" class="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs">✕</button>
            </div>
            <h4 class="font-bold text-slate-100">${t.title}</h4>
            <p class="text-sm text-slate-400 mt-1">${t.description || ''}</p>
        `;
        col.appendChild(card);
    });
}
document.getElementById('searchInput').oninput = filterAndRender;

const taskModal = document.getElementById('taskModal');

function openModal() {
    taskModal.classList.remove('hidden');
    taskModal.classList.add('flex');
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    taskModal.classList.remove('flex');
    taskModal.classList.add('hidden');
}

document.getElementById('saveBtn').onclick = async (e) => {
    const btn = e.target;
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDesc');
    const labelSelect = document.getElementById('taskLabel');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const labelValue = labelSelect ? labelSelect.value : 'Feature';

    if (!title) {
        titleInput.classList.add('border-red-500');
        alert("⚠️ Task title cannot be empty!");
        titleInput.focus();
        return;
    }
    const isDuplicate = allTasks.some(t => t.title.toLowerCase() === title.toLowerCase());
    if (isDuplicate) {
        titleInput.classList.add('border-red-500');
        alert("⚠️ A task with this title already exists!");
        titleInput.focus();
        return;
    }

    btn.innerText = "...";
    btn.disabled = true;

    try {
        await API.create(title, desc, labelValue);
        titleInput.value = '';
        descInput.value = '';
        if (labelSelect) labelSelect.value = 'Feature';
        titleInput.classList.remove('border-red-500');
        closeModal();
        renderBoard();
    } catch (e) {
        console.error(e);
        alert("Failed to save.");
    } finally {
        btn.innerText = "Create";
        btn.disabled = false;
    }
};

async function handleDelete(id) {
    if (!confirm('Delete?')) return;
    await API.delete(id);
    renderBoard();
}

document.querySelectorAll('.kanban-column').forEach(col => {
    new Sortable(col, {
        group: 'tasks',
        animation: 150,
        ghostClass: 'ghost-card',
        onEnd: async (evt) => {
            if (evt.to === evt.from) return;
            const taskId = evt.item.getAttribute('data-id');
            const newStatus = evt.to.id;
            try {
                await API.updateStatus(taskId, newStatus);
            } catch (e) {
                renderBoard();
            }
        }
    });
});

initApp();