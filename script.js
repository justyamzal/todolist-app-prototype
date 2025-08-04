document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mengambil Elemen dari HTML ---
    const timeDisplay = document.getElementById('time-display');
    const profileHeader = document.getElementById('profile-header');
    const profileNameEl = document.getElementById('profile-name');
    const profileJobEl = document.getElementById('profile-job');
    const dashboardGrid = document.getElementById('dashboard-grid');
    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const dueDateInput = document.getElementById('due-date-input');
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const filterDateInput = document.getElementById('filter-date');
    const showAllBtn = document.getElementById('show-all-btn');
    const taskEditIdInput = document.getElementById('task-edit-id');
    const submitTaskBtn = document.getElementById('submit-task-btn');

    let tasks = [];

    function saveTasks() {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    }

    // --- PERUBAHAN: Logika renderDashboard diperbarui ---
    function renderDashboard() {
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(task => task.status === 'done').length;
        
        // Menghitung persentase, hindari pembagian dengan nol
        const percentageDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

        // Menghitung jumlah tugas yang belum selesai per prioritas
        const highNotDone = tasks.filter(task => task.priority === 'high' && task.status !== 'done').length;
        const mediumNotDone = tasks.filter(task => task.priority === 'medium' && task.status !== 'done').length;
        const lowNotDone = tasks.filter(task => task.priority === 'low' && task.status !== 'done').length;

        dashboardGrid.innerHTML = `
            <div class="dashboard-card percentage">
                <div class="title">Tugas Selesai</div>
                <div class="value">${percentageDone}%</div>
            </div>
            <div class="dashboard-card high">
                <div class="title"><span class="dot"></span>Prioritas Tinggi</div>
                <div class="value">${highNotDone}</div>
            </div>
            <div class="dashboard-card medium">
                <div class="title"><span class="dot"></span>Prioritas Sedang</div>
                <div class="value">${mediumNotDone}</div>
            </div>
            <div class="dashboard-card low">
                <div class="title"><span class="dot"></span>Prioritas Rendah</div>
                <div class="value">${lowNotDone}</div>
            </div>
        `;
    }

    function renderUI() {
        renderTasks();
        renderDashboard();
    }

    function renderTasks() {
        todoList.innerHTML = '';
        doneList.innerHTML = '';

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item', `priority-${task.priority}`);
            if (task.status === 'done') {
                taskItem.classList.add('done');
            }

            taskItem.dataset.id = task.id;
            taskItem.dataset.dueDate = task.dueDate;
            
            const taskContentHTML = `
                <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''}>
                <div class="task-content">
                    <p>${task.text}</p>
                    <small class="due-date">Tenggat: ${new Date(task.dueDate).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</small>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" title="Edit Tugas">✏️</button>
                    <button class="action-btn delete-btn" title="Hapus Tugas">🗑️</button>
                </div>
            `;

            taskItem.innerHTML = taskContentHTML;

            if (task.status === 'todo') {
                todoList.appendChild(taskItem);
            } else {
                doneList.appendChild(taskItem);
            }
        });
        checkOverdueTasks();
    }
    
    todoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value;
        const editingId = taskEditIdInput.value;

        if (taskText === '' || dueDate === '') {
            alert('Harap isi deskripsi tugas dan tanggalnya!');
            return;
        }

        if (editingId) {
            const taskIndex = tasks.findIndex(t => t.id == editingId);
            if (taskIndex > -1) {
                tasks[taskIndex].text = taskText;
                tasks[taskIndex].priority = priority;
                tasks[taskIndex].dueDate = dueDate;
            }
        } else {
            const newTask = {
                id: Date.now(),
                text: taskText,
                priority: priority,
                dueDate: dueDate,
                status: 'todo',
                creationTimestamp: new Date().getTime()
            };
            tasks.push(newTask);
        }

        saveTasks();
        renderUI();
        resetForm();
    });

    function resetForm() {
        todoForm.reset();
        dueDateInput.valueAsDate = new Date();
        taskEditIdInput.value = '';
        submitTaskBtn.textContent = 'Tambah Tugas';
        taskInput.focus();
    }

    document.querySelector('.app-container').addEventListener('click', (event) => {
        const target = event.target;
        const taskItem = target.closest('.task-item');

        if (!taskItem) return;

        const taskId = Number(taskItem.dataset.id);

        if (target.matches('.task-checkbox')) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = target.checked ? 'done' : 'todo';
                saveTasks();
                renderUI();
            }
        }

        if (target.matches('.edit-btn')) {
            const taskToEdit = tasks.find(t => t.id === taskId);
            if (taskToEdit) {
                taskEditIdInput.value = taskToEdit.id;
                taskInput.value = taskToEdit.text;
                priorityInput.value = taskToEdit.priority;
                dueDateInput.value = taskToEdit.dueDate;
                submitTaskBtn.textContent = 'Update Tugas';
                taskInput.focus();
            }
        }

        if (target.matches('.delete-btn')) {
            taskItem.classList.add('removing');
            
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderUI();
            }, 400);
        }
    });

    deleteAllBtn.addEventListener('click', () => {
        if (tasks.length > 0) {
            tasks = [];
            saveTasks();
            renderUI();
        }
    });
    
    function initializeApp() {
        setupProfile();
        const savedTasks = localStorage.getItem('todo_tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        renderUI();
        dueDateInput.valueAsDate = new Date();
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    initializeApp();

    // Fungsi-fungsi lainnya tidak berubah
    function setupProfile() { /* ... */ }
    function askForProfileInfo() { /* ... */ }
    function updateProfileDisplay(name, job) { /* ... */ }
    profileHeader.addEventListener('click', askForProfileInfo);
    function updateTime() { /* ... */ }
    filterDateInput.addEventListener('input', () => { /* ... */ });
    showAllBtn.addEventListener('click', () => { /* ... */ });
    function checkOverdueTasks() { /* ... */ }

    // Salin fungsi yang tidak berubah dari kode sebelumnya ke sini
    function setupProfile() {
        // let userName = localStorage.getItem('todo_username') || `Username`;
        // let userJob = localStorage.getItem('todo_userjob') || 'jobdesk';
        // updateProfileDisplay(userName, userJob);
                let userName = localStorage.getItem('todo_username');
        let userJob = localStorage.getItem('todo_userjob');
        if (!userName) {
            // Jika belum diset, tampilkan ikon pen dan teks username
            profileNameEl.innerHTML = 'username <i style="font-size: 16px;" class="fa-solid fa-pen"></i> ';
        } else {
            profileNameEl.textContent = userName;
        }
        profileJobEl.textContent = userJob || 'jobdesk';

    }
    function askForProfileInfo() {
        let newName = prompt("Masukkan nama lengkap Anda:", localStorage.getItem('todo_username') || "");
        if (newName) localStorage.setItem('todo_username', newName);
        let newJob = prompt("Masukkan pekerjaan Anda:", localStorage.getItem('todo_userjob') || "");
        if (newJob) localStorage.setItem('todo_userjob', newJob);
        setupProfile();
    }
    function updateProfileDisplay(name, job) {
        profileNameEl.textContent = name;
        profileJobEl.textContent = job;
    }
    function updateTime() {
        const now = new Date();
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        timeDisplay.innerHTML = `${now.toLocaleDateString('en-GB', dateOptions)}<br>${now.toLocaleTimeString('en-GB', timeOptions)}`;
    }
    filterDateInput.addEventListener('input', () => {
        const filterValue = filterDateInput.value;
        document.querySelectorAll('.task-item').forEach(task => {
            if (filterValue && task.dataset.dueDate !== filterValue) {
                task.style.display = 'none';
            } else {
                task.style.display = 'flex';
            }
        });
    });
    showAllBtn.addEventListener('click', () => {
        filterDateInput.value = '';
        document.querySelectorAll('.task-item').forEach(task => {
            task.style.display = 'flex';
        });
    });
    function checkOverdueTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        document.querySelectorAll('.task-item').forEach(taskItem => {
            const dueDate = new Date(taskItem.dataset.dueDate);
            if (dueDate < today && !taskItem.classList.contains('done')) {
                taskItem.classList.add('overdue');
            } else {
                taskItem.classList.remove('overdue');
            }
        });
    }
});
