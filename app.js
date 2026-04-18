/**
 * Next Play Task Management - Final Assessment
 * Developed by Yung-Chi (Boston)
 */

let allTasks = [];
let currentEditingId = null;

// DOM Elements
const slidePanel = document.getElementById('taskModal');
const titleInput = document.getElementById('taskTitle');
const descInput = document.getElementById('taskDesc');
const statusSelect = document.getElementById('taskStatus');
const labelSelect = document.getElementById('taskLabel');
const prioritySelect = document.getElementById('taskPriority');
const dateInput = document.getElementById('taskDueDate');
const saveBtn = document.getElementById('saveBtn');

// Init App
async function initApp() {
    try {
        await API.init();
        await renderBoard();
        renderUserManagement();
        setupEventListeners();
    } catch (e) {
        console.error("Initialization error:", e);
        alert("Connection failed. Please check your API.");
    }
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listener
function setupEventListeners() {
    titleInput.oninput = (e) => {
        updateGhostCard(e.target.value);
        toggleCreateButton();
    };

    [statusSelect, labelSelect, prioritySelect, dateInput].forEach(el => {
        el.onchange = () => updateGhostCard(titleInput.value);
    });

    document.getElementById('searchInput').oninput = filterAndRender;

    // Adding Assignee by double click 
    const assigneeSelect = document.getElementById('taskAssignee');
    assigneeSelect.onchange = () => {
        updateGhostCard(titleInput.value);
    };
    assigneeSelect.onmousedown = (e) => {
        if (e.target.tagName === 'OPTION') {
            e.preventDefault(); // Prevent one click
            e.target.selected = !e.target.selected;
            assigneeSelect.focus();
            assigneeSelect.dispatchEvent(new Event('change'))
            console.log("Current Selection:", Array.from(assigneeSelect.selectedOptions).map(o => o.value)); // Checking bug
        }
    };
}

// Panel Control
function openPanel(status = 'TODO', taskId = null) {
    console.log("openPanel triggered:", { status, taskId }); // Debug 1
    const deleteBtn = document.getElementById('deleteBtn');
    currentEditingId = taskId;

    // Show Panel
    slidePanel.classList.remove('translate-x-full');

    // Show Block
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    const assigneeSelect = document.getElementById('taskAssignee');
    if (assigneeSelect) {
        Array.from(assigneeSelect.options).forEach(opt => opt.selected = false);
    }

    if (taskId) {
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        console.log("Looking for Task in allTasks...", allTasks); // Debug 2
        const task = allTasks.find(t => String(t.id) === String(taskId));

        if (task) {
            console.log("Task found:", task.title);
            titleInput.value = task.title;
            descInput.value = task.description || '';
            statusSelect.value = task.status;
            if (labelSelect) labelSelect.value = task.label || 'Feature';
            if (prioritySelect) prioritySelect.value = task.priority || 'Medium';
            if (dateInput) dateInput.value = task.dueDate || '';
            if (task.assignee && assigneeSelect) {
                const names = task.assignee.split(',').map(n => n.trim());
                Array.from(assigneeSelect.options).forEach(opt => {
                    opt.selected = names.includes(opt.value);
                });
            }
            saveBtn.innerText = "Save Changes";
        } else {
            console.error("Task not found in allTasks! This is why it's not popping up.");// Debug 3
            // If not found, close
            closePanel();
            return;
        }
    } else {
        resetForm();
        statusSelect.value = status;
        saveBtn.innerText = "Create Task";
        if (deleteBtn) deleteBtn.classList.add('hidden');
    }
    setTimeout(() => updateGhostCard(titleInput.value), 50);
    toggleCreateButton();
}
// Check whether the panel is edited
function isFormDirty() {
    if (!currentEditingId) {
        return taskTitle.value.trim() !== "";
    }

    const task = allTasks.find(t => String(t.id) === String(currentEditingId));
    if (!task) return false;

    const assigneeSelect = document.getElementById('taskAssignee');
    const selectedAssignees = Array.from(assigneeSelect.selectedOptions).map(opt => opt.value).join(', ');
    
    return titleInput.value !== task.title ||
        descInput.value !== (task.description || '') ||
        statusSelect.value !== task.status ||
        (prioritySelect && prioritySelect.value !== (task.priority || 'Medium')) ||
        (labelSelect && labelSelect.value !== (task.label || 'Feature')) ||
        (dateInput && dateInput.value !== (task.dueDate || '')) ||
        (assigneeSelect && selectedAssignees !== (task.assignee || 'Anonymous'));
}

function closePanel(force = false) {
    if (!force && isFormDirty()) {
        if (!confirm("You have unsaved changes — discard?")) {
            return;
        }
    }
    // Slide Panel
    slidePanel.classList.add('translate-x-full');

    // Remove hidden wall
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.remove('active');

        setTimeout(() => {
            if (!overlay.classList.contains('active')) {
                overlay.classList.add('hidden');
                overlay.style.display = 'none';
            }
        }, 400);
    }

    setTimeout(() => {
        currentEditingId = null;
    }, 100);

    removeGhostCard();
}

function resetForm() {
    titleInput.value = '';
    descInput.value = '';
    if (dateInput) dateInput.value = '';
    titleInput.classList.remove('border-red-500');
}

// Real Time Card Review
function updateGhostCard(title) {
    removeGhostCard();
    if (!title.trim()) return;

    const col = document.getElementById(statusSelect.value);
    if (!col) return;

    const priority = prioritySelect.value;
    const label = labelSelect.value;
    const priorityMap = { 'Critical': 'bg-red-500', 'High': 'bg-orange-500', 'Medium': 'bg-yellow-500', 'Low': 'bg-green-500' };
    const dotColor = priorityMap[priority] || 'bg-slate-500';

    // Get assignee
    const assigneeSelect = document.getElementById('taskAssignee');
    const selectedPeople = Array.from(assigneeSelect.selectedOptions).map(opt => opt.value);
    const assignees = selectedPeople.length > 0 ? selectedPeople : ['Anonymous'];

    const avatarsHTML = assignees.map(name => {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        return `
            <div class="w-6 h-6 rounded-full bg-indigo-500 border-2 border-slate-800 text-[10px] flex items-center justify-center font-bold -ml-2 first:ml-0 shadow-sm text-white">
                ${initials}
            </div>
        `;
    }).join('');

    const ghost = document.createElement('div');
    ghost.id = 'ghost-card';
    ghost.className = 'task-card opacity-95 border-2 border-indigo-400 border-dashed bg-slate-800 ring-2 ring-indigo-500/30 pointer-events-none mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]';

    ghost.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${dotColor} shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span>
                <span class="text-[10px] text-white uppercase font-black tracking-widest">${label}</span>
            </div>
            <span class="text-[9px] text-white font-black italic bg-indigo-600 px-1.5 py-0.5 rounded shadow-sm">PREVIEWING</span>
        </div>
        <h4 class="font-bold text-white text-lg leading-tight">${title}</h4>
        <div class="flex justify-between items-center mt-4 pt-3 border-t border-white/20">
            <div class="flex items-center">${avatarsHTML}</div>
            <span class="text-[11px] text-indigo-200 font-bold">${dateInput.value || 'No Date'}</span>
        </div>
    `;
    col.prepend(ghost);
}

function removeGhostCard() {
    const existing = document.getElementById('ghost-card');
    if (existing) existing.remove();
}

// Validation
function toggleCreateButton() {
    const isValid = titleInput.value.trim().length > 0;
    saveBtn.disabled = !isValid;
    saveBtn.classList.toggle('opacity-50', !isValid);
    saveBtn.classList.toggle('cursor-not-allowed', !isValid);
}
// Chaging amount of task int each status
function updateColumnCounts() {
    const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    statuses.forEach(status => {
        const count = allTasks.filter(t => t.status === status).length;
        const countBadge = document.getElementById(`${status}-count`);
        if (countBadge) {
            countBadge.innerText = count;
            countBadge.className = count > 0
                ? "bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold transition-all"
                : "bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold";
        }
    });
}
function handleDeleteFromModal() {
    if (currentEditingId && confirm('Are you sure you want to delete this task?')) {
        handleDelete(currentEditingId);
        closePanel(true);
    }
}
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

        const priorityMap = { 'Critical': 'bg-red-500', 'High': 'bg-orange-500', 'Medium': 'bg-yellow-500', 'Low': 'bg-green-500' };
        const dotColor = priorityMap[t.priority] || 'bg-slate-500';

        const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
        const dateDisplayClass = isOverdue ? 'text-red-400 font-bold' : 'text-indigo-200 font-semibold';

        const assignees = t.assignee ? t.assignee.split(',') : ['Anonymous'];
        const avatarsHTML = assignees.map(name => {
            const trimmedName = name.trim();
            const initials = trimmedName.split(' ').map(n => n[0]).join('').toUpperCase();
            return `
            <div class="w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-800 text-[10px] flex items-center justify-center font-bold -ml-2 first:ml-0 shadow-sm" title="${trimmedName}">
                ${initials}
            </div>
        `;
        }).join('');

        const card = document.createElement('div');
        card.className = 'task-card group cursor-pointer animate-in fade-in slide-in-from-bottom-2';
        card.setAttribute('data-id', t.id);
        card.onclick = () => openPanel(t.status, t.id);

        card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${dotColor}"></span>
                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">${t.label || 'Feature'}</span>
            </div>
            <button onclick="event.stopPropagation(); handleDelete('${t.id}')" 
                    class="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs">✕</button>
        </div>
        <h4 class="font-bold text-slate-100 leading-tight">${escapeHtml(t.title)}</h4>
        <div class="flex justify-between items-center mt-4">
            <div class="flex items-center">
                <div class="flex items-center mr-2">
                    ${avatarsHTML} </div>
            </div>
            <span class="text-[10px] ${dateDisplayClass}">${t.dueDate || ''}</span>
        </div>
    `;
        col.appendChild(card);
    });
    updateColumnCounts();
}

// Save logic
saveBtn.onclick = async () => {
    const title = titleInput.value.trim();
    if (!title) {
        titleInput.classList.add('border-red-500');
        return;
    }

    const originalTask = currentEditingId ? allTasks.find(t => t.id === currentEditingId) : {};

    const assigneeSelect = document.getElementById('taskAssignee');
    const selectedAssignees = Array.from(assigneeSelect.selectedOptions).map(opt => opt.value);
    const assigneeValue = selectedAssignees.length > 0 ? selectedAssignees.join(', ') : 'Anonymous';

    const payload = {
        title: title,
        description: descInput.value.trim(),
        status: statusSelect.value,
        label: labelSelect?.value || originalTask.label || 'Feature',
        priority: prioritySelect?.value || originalTask.priority || 'Medium',
        dueDate: dateInput?.value || originalTask.dueDate || '',
        assignee: assigneeValue
    };

    saveBtn.innerText = "...";
    saveBtn.disabled = true;

    try {
        if (currentEditingId) {
            await API.update(currentEditingId, payload);
        } else {
            // Check Duplicate
            if (allTasks.some(t => t.title.toLowerCase() === title.toLowerCase())) {
                alert("⚠️ A task with this title already exists!");
                saveBtn.innerText = "Create Task";
                saveBtn.disabled = false;
                return;
            }
            await API.create(payload.title, payload.description, payload.label, payload.status, payload.priority, payload.dueDate, payload.assignee);
        }

        await renderBoard();

        // Return to clean data, avoid dirty check by closePanel()
        titleInput.value = "";
        descInput.value = "";
        closePanel(true);

        saveBtn.innerText = "Success ✓";
    } catch (e) {
        console.error("Save error:", e);
        alert("Failed to save changes.");
        saveBtn.innerText = currentEditingId ? "Save Changes" : "Create Task";
    } finally {
        setTimeout(() => {
            saveBtn.innerText = currentEditingId ? "Save Changes" : "Create Task";
            toggleCreateButton();
        }, 1000);
    }
};

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        await API.delete(id);
        await renderBoard();
    } catch (e) {
        alert("Delete failed.");
    }
}

// Sortable
document.querySelectorAll('.kanban-column').forEach(col => {
    new Sortable(col, {
        group: 'tasks',
        animation: 150,
        ghostClass: 'ghost-card-dragging',
        onEnd: async (evt) => {
            if (evt.to === evt.from) return;

            const taskId = evt.item.getAttribute('data-id');
            const newStatus = evt.to.id; // get status' id

            try {
                await API.updateStatus(taskId, newStatus);
                const task = allTasks.find(t => String(t.id) === String(taskId));
                if (task) task.status = newStatus;
                updateColumnCounts(); // Update column count
                console.log(`Task ${taskId} moved to ${newStatus}`);
            } catch (e) {
                console.error("Move failed:", e);
                renderBoard();
            }
        }
    });
});

// User Management
let teamMembers = JSON.parse(localStorage.getItem('nextPlay_users')) || [
    { name: 'Yung-Chi', role: 'Lead Developer' },
    { name: 'Nicholas', role: 'CTO' },
    { name: 'Sid', role: 'CEO' }
];
function renderUserManagement() {
    const userList = document.getElementById('userList');
    const assigneeSelect = document.getElementById('taskAssignee');

    if (!userList || !assigneeSelect) return;

    // Storeage User Name
    localStorage.setItem('nextPlay_users', JSON.stringify(teamMembers));

    // Empty
    userList.innerHTML = '';
    assigneeSelect.innerHTML = '';

    teamMembers.forEach(user => {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

        userList.innerHTML += `
            <div class="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">${initials}</div>
                <div>
                    <div class="text-[10px] font-bold text-white">${user.name}</div>
                    <div class="text-[8px] text-slate-500">${user.role}</div>
                </div>
            </div>
        `;

        // update task
        const opt = document.createElement('option');
        opt.value = user.name;
        opt.innerText = `${user.name} (${user.role})`;
        assigneeSelect.appendChild(opt);
    });
}
function addUser() {
    const input = document.getElementById('newUserName');
    const name = input.value.trim();
    if (!name) return;

    teamMembers.push({ name: name, role: 'Contributor' });
    input.value = '';
    renderUserManagement();
}

initApp();