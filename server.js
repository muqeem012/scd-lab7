const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.json());

var tasks = [];
var users = [];

function isAuthenticated(req, res, next) {
    const { username, password } = req.headers;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.user = user;
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Task Creation
app.post('/tasks', isAuthenticated, (req, res) => {
    const { title, description, dueDate, category, priority } = req.body;
    const newTask = { id: tasks.length + 1, title, description, dueDate, category, priority, completed: false };
    tasks.push(newTask);
    res.status(201).send(newTask);
});

// Task Categorization & Update (also used for marking as completed)
app.patch('/tasks/:title', isAuthenticated, (req, res) => {
    const { title } = req.params;
    const { category, completed, priority } = req.body;
    const task = tasks.find(task => task.title === title);
    if (task) {
        if (category) task.category = category;
        if (completed !== undefined) task.completed = completed;
        if (priority) task.priority = priority;
        res.send(task);
    } else {
        res.status(404).send('Task not found');
    }
});

// View Tasks
app.get('/tasks/:sortBy', isAuthenticated, (req, res) => {
    const sortBy = req.params.sortBy;
    let sortedTasks = [...tasks];
    if (sortBy) {
        sortedTasks = sortedTasks.sort((a, b) => {
            if (sortBy === 'dueDate') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortBy === 'category') {
                return a.category.localeCompare(b.category);
            } else if (sortBy === 'completed') {
                return (a.completed === b.completed)? 0 : a.completed? 1 : -1;
            } else if (sortBy === 'priority') {
                const priorities = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return priorities[a.priority] - priorities[b.priority];
            }
        });
    }
    res.send(sortedTasks);
});

// User Authentication

// Route for sign up 
app.post("/signup", (req, res) => {
    users.push(req.body);
    res.status(201).json({ message : "User created successfully"});
});

// Route for logging in
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.send({ message: 'Login successful' });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
});
