document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const newTodoInput = document.getElementById('new-todo');
    const assigneeInput = document.getElementById('assignee');
    const clearCompletedButton = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filters button');
    const nameFilter = document.getElementById('name-filter');
    const statusDisplay = document.getElementById('status-display');

    loadTodos();

    addButton.addEventListener('click', addTodo);
    newTodoInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTodo();
    });
    clearCompletedButton.addEventListener('click', clearCompleted);
    nameFilter.addEventListener('change', filterByName);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => applyFilter(button.id));
    });

    function addTodo() {
        const todoText = newTodoInput.value.trim();
        const assignee = assigneeInput.value.trim();
        if (!todoText || !assignee) return;

        createTodoElement(todoText, false, assignee);
        updateAssigneeOptions(assignee);
        newTodoInput.value = '';
        assigneeInput.value = '';
        updateStatus("Task Added");
        saveTodos();
    }

    function createTodoElement(text, completed, assignee) {
        const li = document.createElement('li');
        if (completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = completed;
        checkbox.addEventListener('change', toggleTodoComplete);

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        textSpan.addEventListener('dblclick', editTodo);

        const assigneeSpan = document.createElement('span');
        assigneeSpan.textContent = `Assigned to: ${assignee}`;
        assigneeSpan.style.marginLeft = '10px';

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(assigneeSpan);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            li.remove();
            updateStatus("Task Deleted");
            saveTodos();
        });

        li.appendChild(deleteButton);
        todoList.appendChild(li);
    }

    function toggleTodoComplete(event) {
        const li = event.target.parentElement;
        li.classList.toggle('completed');
        updateStatus("Task Updated");
        saveTodos();
    }

    function editTodo(event) {
        const span = event.target;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                span.textContent = input.value;
                updateStatus("Task Edited");
                saveTodos();
                span.parentNode.replaceChild(span, input);
            }
        });
        input.addEventListener('blur', function () {
            span.parentNode.replaceChild(span, input);
        });
        span.parentNode.replaceChild(input, span);
        input.focus();
    }

    function clearCompleted() {
        document.querySelectorAll('#todo-list li.completed').forEach(li => li.remove());
        updateStatus("Completed Tasks Cleared");
        saveTodos();
    }

    function updateAssigneeOptions(newAssignee) {
        if (![...nameFilter.options].some(option => option.value === newAssignee)) {
            const option = new Option(newAssignee, newAssignee);
            nameFilter.appendChild(option);
        }
    }

    function filterByName() {
        const selectedName = nameFilter.value;
        document.querySelectorAll('#todo-list li').forEach(li => {
            const assignee = li.querySelectorAll('span')[1].textContent.split(': ')[1];
            if (selectedName === 'all' || assignee === selectedName) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
            }
        });
    }

    function updateStatus(message) {
        statusDisplay.textContent = message;
        setTimeout(() => { statusDisplay.textContent = ''; }, 3000);
    }

    function saveTodos() {
        const todos = [];
        document.querySelectorAll('#todo-list li').forEach(li => {
            todos.push({
                text: li.childNodes[1].textContent.trim(),
                completed: li.classList.contains('completed'),
                assignee: li.childNodes[2].textContent.split(': ')[1]
            });
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        savedTodos.forEach(todo => {
            createTodoElement(todo.text, todo.completed, todo.assignee);
            updateAssigneeOptions(todo.assignee);
        });
    }

    function applyFilter(filter) {
        let todos = todoList.children;

        for (let todo of todos) {
            switch (filter) {
                case 'filter-all':
                    todo.style.display = '';
                    break;
                case 'filter-active':
                    todo.style.display = todo.classList.contains('completed') ? 'none' : '';
                    break;
                case 'filter-completed':
                    todo.style.display = todo.classList.contains('completed') ? '' : 'none';
                    break;
            }
        }
    }
});
