document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mengambil Elemen dari HTML ---
    const timeDisplay = document.getElementById('time-display');
    const profileHeader = document.getElementById('profile-header');
    const profileNameEl = document.getElementById('profile-name');
    const profileJobEl = document.getElementById('profile-job');
    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const dueDateInput = document.getElementById('due-date-input');
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const filterDateInput = document.getElementById('filter-date');
    const showAllBtn = document.getElementById('show-all-btn');
    // Elemen baru untuk proses edit
    const taskEditIdInput = document.getElementById('task-edit-id');
    const submitTaskBtn = document.getElementById('submit-task-btn');

    // 'tasks' tetap menjadi sumber data utama.
    let tasks = [];

    // Fungsi untuk menyimpan tugas ke localStorage
    function saveTasks() {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    }

    // --- DIPERBARUI: Fungsi renderTasks sekarang menyertakan tombol Edit & Delete ---
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
            
            // Konten HTML sekarang menyertakan div .task-actions
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
    
    // --- DIPERBARUI: Fungsi submit form sekarang bisa menangani 'add' dan 'edit' ---
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
            // --- LOGIKA EDIT ---
            const taskIndex = tasks.findIndex(t => t.id == editingId);
            if (taskIndex > -1) {
                tasks[taskIndex].text = taskText;
                tasks[taskIndex].priority = priority;
                tasks[taskIndex].dueDate = dueDate;
            }
        } else {
            // --- LOGIKA ADD ---
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
        renderTasks();
        resetForm();
    });

    // Fungsi untuk mereset form ke mode 'add'
    function resetForm() {
        todoForm.reset();
        dueDateInput.valueAsDate = new Date();
        taskEditIdInput.value = ''; // Kosongkan ID edit
        submitTaskBtn.textContent = 'Tambah Tugas'; // Kembalikan teks tombol
        taskInput.focus();
    }

    // --- DIPERBARUI: Event listener utama untuk menangani semua aksi di list ---
    // Menggunakan Event Delegation
    document.querySelector('.app-container').addEventListener('click', (event) => {
        const target = event.target;
        const taskItem = target.closest('.task-item');

        if (!taskItem) return; // Jika klik bukan di dalam task-item, abaikan

        const taskId = Number(taskItem.dataset.id);

        // Aksi untuk Checkbox
        if (target.matches('.task-checkbox')) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = target.checked ? 'done' : 'todo';
                saveTasks();
                renderTasks();
            }
        }

        // Aksi untuk Tombol Edit
        if (target.matches('.edit-btn')) {
            const taskToEdit = tasks.find(t => t.id === taskId);
            if (taskToEdit) {
                // Isi form dengan data tugas yang akan diedit
                taskEditIdInput.value = taskToEdit.id;
                taskInput.value = taskToEdit.text;
                priorityInput.value = taskToEdit.priority;
                dueDateInput.value = taskToEdit.dueDate;
                submitTaskBtn.textContent = 'Update Tugas'; // Ubah teks tombol
                taskInput.focus(); // Fokus ke input teks
            }
        }

        // Aksi untuk Tombol Delete
        if (target.matches('.delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        }
    });

    // Fungsi untuk menghapus semua tugas tidak berubah.
    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Apakah kamu yakin ingin menghapus SEMUA tugas?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });
    
    // --- FUNGSI INISIALISASI & FUNGSI BANTU LAINNYA (TIDAK BERUBAH) ---
    function initializeApp() {
        setupProfile();
        const savedTasks = localStorage.getItem('todo_tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        renderTasks();
        dueDateInput.valueAsDate = new Date();
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    initializeApp();

    // Fungsi-fungsi ini tidak diubah, jadi saya singkat untuk kejelasan.
    function setupProfile() {
        let userName = localStorage.getItem('todo_username') || 'Pengguna Baru';
        let userJob = localStorage.getItem('todo_userjob') || 'Pekerjaan';
        updateProfileDisplay(userName, userJob);
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
    profileHeader.addEventListener('click', askForProfileInfo);
    
    function updateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        timeDisplay.textContent = now.toLocaleDateString('id-ID', options);
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