const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory data storage (pre-populated for testing)
let tasks = [
    {
        id: 1,
        title: "Set up environment",
        description: "Install Node.js, npm, and git",
        completed: true,
        priority: "medium",
        createdAt: new Date().toISOString(),
    },
];
let taskId = 2;

// Allowed priority levels
const validPriorities = ["low", "medium", "high"];

// Helper function to validate task input
const validateTaskInput = (req, res, next) => {
    const { title, description, completed, priority } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ message: "Title is required and cannot be empty" });
    }

    if (!description || description.trim() === "") {
        return res.status(400).json({ message: "Description is required and cannot be empty" });
    }

    if (typeof completed !== "boolean") {
        return res.status(400).json({ message: "Completed status must be a boolean (true or false)" });
    }

    if (priority && !validPriorities.includes(priority.toLowerCase())) {
        return res.status(400).json({ message: "Priority must be one of: low, medium, high" });
    }

    next(); // Proceed if validation passes
};

// GET /tasks - Retrieve all tasks with filtering & sorting
app.get("/tasks", (req, res) => {
    let { completed, sort } = req.query;
    let filteredTasks = [...tasks];

    // Filter by completion status
    if (completed !== undefined) {
        const isCompleted = completed.toLowerCase() === "true";
        filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
    }

    // Sort by creation date
    if (sort === "date") {
        filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    res.json(filteredTasks);
});

// GET /tasks/:id - Retrieve a specific task
app.get("/tasks/:id", (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
});

// GET /tasks/priority/:level - Retrieve tasks by priority level
app.get("/tasks/priority/:level", (req, res) => {
    const { level } = req.params;
    if (!validPriorities.includes(level.toLowerCase())) {
        return res.status(400).json({ message: "Invalid priority level. Must be: low, medium, high" });
    }

    const priorityTasks = tasks.filter(task => task.priority === level.toLowerCase());
    res.json(priorityTasks);
});

// POST /tasks - Create a new task
app.post("/tasks", validateTaskInput, (req, res) => {
    const { title, description, completed, priority = "medium" } = req.body;

    const newTask = {
        id: taskId++,
        title,
        description,
        completed,
        priority: priority.toLowerCase(),
        createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /tasks/:id - Update a task
app.put("/tasks/:id", (req, res) => {
    const { title, description, completed, priority } = req.body;
    const task = tasks.find(t => t.id === parseInt(req.params.id));

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    if (title && title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (description && description.trim() === "") {
        return res.status(400).json({ message: "Description cannot be empty" });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
        return res.status(400).json({ message: "Completed status must be a boolean" });
    }

    if (priority && !validPriorities.includes(priority.toLowerCase())) {
        return res.status(400).json({ message: "Priority must be one of: low, medium, high" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (priority) task.priority = priority.toLowerCase();

    res.json(task);
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.status(200).json(deletedTask); // Return deleted task instead of empty response
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app; // Ensure app is exported for testing

// Start the server if run directly (not during testing)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
