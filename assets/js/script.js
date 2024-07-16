// Call renderTaskList in the document ready function
// Call handleAddTask when submit button on form is pressed
// Call handleDrop when tasks are being dragged and dropped
// Display datepicker calendar if date is being changed
// Retrieve tasks from localStorage if exists
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
// Retrieve nextId from localStorage or initialize to 1
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

renderTaskList();

$("#taskForm").submit(handleAddTask);

$("#to-do, #in-progress, #done").droppable({
  accept: '.task-card',
  drop: handleDrop,
});

$("#taskDueDate").datepicker({
  dateFormat: "yy-mm-dd",
});

// Function to render task list on the page or empty page
function renderTaskList() {
  // Clear existing task cards
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  // Iterate through the taskList and create task cards, if any
  taskList.forEach((task) => {
    const taskStatus = getTaskStatus(task.dueDate, task.status);
    const taskCard = `
    <div class="task-card ${taskStatus}" data-taskId=${task.id}>
        <h3>${task.title}</h3>
        <p><strong>Due Date:</strong> ${task.dueDate}</p>
        <p><strong>Description:</strong> ${task.desc}</p>
        <button class="btn btn-danger delete-btn">Delete</button>
    </div>
    `;

    // Append the task card to the appropriate column based on task status, if any
    $(`#${task.status}-cards`).append(taskCard);
  });

  // Call handleDeleteTask when delete on a task is clicked
  $(".delete-btn").on("click", handleDeleteTask);

  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
  });
}

// Call the checkFields function on input entries
$("#taskTitle, #taskDueDate, #taskDesc").on("input", checkFields);

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = $("#taskTitle").val();
  const taskDueDate = $("#taskDueDate").val();
  const taskDesc = $("#taskDesc").val();

  const newTask = {
    id: generateTaskId(),
    title: taskTitle,
    dueDate: taskDueDate,
    desc: taskDesc,
    status: "todo",
  };

  // Push and store new task to taskList
  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();

// Hide and clear modal
  $("#formModal").modal("hide");
  $("#taskForm").trigger("reset");
}

// Function to generate and store a unique task id
function generateTaskId() {
  const id = nextId;
  nextId++;
  localStorage.setItem("nextId", nextId);
  return id;
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  event.stopPropagation();
  const $taskCard = $(this).closest(".task-card");
  
  if ($taskCard.length === 0) {
    console.log("No task card found.");
    return;
  }

  const taskId = $taskCard.data("taskid");
  taskList = taskList.filter((task) => {
    return task.id !== taskId;
  });

  // Remove the task from local storage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("taskid");
  const newStatus = event.target.id;
  taskList = taskList.map((task) => {
    if (task.id === taskId) {
      return { ...task, status: newStatus };
    }
    return task;
  });

  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}

function getTaskStatus(dueDate, status) {
  if (status === 'done') {
    return 'normal';
  }
  const today = new Date();
  const taskDate = new Date(dueDate);
  const timeDiff = taskDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) {
     return 'overdue';
  } else if (daysDiff <= 3) {
    return 'near-deadline';
  } else {
    return 'normal';
  }
}

// Function to check if all required fields are filled
function checkFields() {
  const taskTitle = $("#taskTitle").val();
  const taskDueDate = $("#taskDueDate").val();
  const taskDesc = $("#taskDesc").val();

  if (taskTitle && taskDueDate && taskDesc) {
    // Enable the submit button
    $("#addTaskBtn").prop("disabled", false);
  } else {
    // Disable the submit button
    $("#addTaskBtn").prop("disabled", true);
  }
}