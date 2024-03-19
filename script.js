const modal = document.getElementById("modal");
const modalCloseButton = document.getElementById("modal-close");
const addTodoButton = document.querySelector("#addTodo");
const modalCancelButton = document.getElementById("modal-cancel");
const addTodoForm = document.getElementById("add-todo-form");
const allTabButton = document.getElementById("allTab");
const activeTabButton = document.getElementById("activeTab");
const completedTabButton = document.getElementById("completedTab");
const todoList = document.getElementById("todoList");
const itemCount = document.getElementById("itemCount");
const tabIndicator = document.querySelector(".tab-indicator");
const clearButton = document.querySelector(".clear-btn");
let todoItems = JSON.parse(localStorage.getItem("todos")) || [];
let draggedItem = null;
let currentTab = "all";
let editingItem;
// Load items from local storage on page load
document.addEventListener("DOMContentLoaded", () => {
  showTab("all");
});

// All tabs event listener
allTabButton.addEventListener("click", () => {
  tabIndicator.style.left = 0;
  currentTab = "all";
  showTab(currentTab);
});
// completed tab event listener
completedTabButton.addEventListener("click", () => {
  tabIndicator.style.left = "66.66%";
  currentTab = "completed";
  showTab(currentTab);
});
// active tab event listener
activeTabButton.addEventListener("click", () => {
  tabIndicator.style.left = "33.33%";
  currentTab = "active";
  showTab(currentTab);
});

// Clear completed event listener
clearButton.addEventListener("click", () => {
  todoItems = todoItems.filter((todo) => !todo.completed);
  localStorage.setItem("todos", JSON.stringify(todoItems));
  showTab(currentTab);
});

// function to show tab
function showTab(tabName) {
  let filteredList;
  if (tabName === "active") {
    filteredList = todoItems.filter((item) => !item.completed);
  } else if (tabName === "completed") {
    filteredList = todoItems.filter((item) => item.completed);
  } else {
    filteredList = todoItems;
  }
  renderTodoList(filteredList);
}

// function to render todo list
function renderTodoList(todos) {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    // Creating a div element for each todo item
    const todoItem = document.createElement("div");
    todoItem.classList.add("todo-item");
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add("checkbox-div");
    const checkbox = document.createElement("input");
    checkbox.id = todo.name;
    checkbox.type = "checkbox";
    const label = document.createElement("label");
    label.htmlFor = todo.name;
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleComplete(todo.name));
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    const text = document.createElement("p");
    text.id = `${todo.name}-text`;
    text.textContent = todo.name;
    const textEdit = document.createElement("input");
    textEdit.id = `${todo.name}-input`;
    textEdit.setAttribute("type", "text");
    textEdit.setAttribute("class", "editInput");
    if (todo.completed) {
      text.classList.add("completed");
    }
    const textDiv = document.createElement("div");
    textDiv.appendChild(text);
    textDiv.appendChild(textEdit);

    const editButton = document.createElement("button");
    editButton.setAttribute("class", "editButton");
    editButton.textContent = "Edit";

    todoItem.appendChild(checkboxDiv);
    todoItem.appendChild(textDiv);
    todoItem.appendChild(editButton);
    todoItem.draggable = true;

    // Adding event listener to each edit button
    editButton.addEventListener("click", () => handleEdit(todoItem));

    todoList.appendChild(todoItem);
  });
  if (todos.length === 0) {
    const emptyList = document.createElement("div");
    emptyList.classList.add("todo-item");
    emptyList.textContent = "No items in list";
    todoList.appendChild(emptyList);
  }
  updateCount();
}
// Open edit input and handle edit when edit button is clicked
function handleEdit(todoItem) {
  if (editingItem) {
    const errorLabelExists = editingItem.querySelector("#errorEditLabel");
    if (errorLabelExists) {
      errorLabelExists.remove();
    }
    const editingItemInputElement = editingItem.querySelectorAll("input")[1];
    const editingItemTextDiv = editingItem.querySelectorAll("div")[1];
    const errorLabel = document.createElement("label");
    errorLabel.id = "errorEditLabel";
    errorLabel.textContent = "* Finish editing this item first";
    errorLabel.setAttribute("class", "errorLabel");
    editingItemTextDiv.appendChild(errorLabel);
    editingItemInputElement.focus();
    return;
  }
  editingItem = todoItem;
  const textDiv = todoItem.querySelectorAll("div")[1];
  const textValue = textDiv.querySelector("p");
  textValue.style.display = "none";
  const inputElement = textDiv.querySelector("input");
  inputElement.value = textValue.textContent;
  inputElement.style.display = "block";
  inputElement.focus();
  const editButton = todoItem.querySelector("button");
  editButton.remove();
  const saveButton = document.createElement("button");
  const cancelButton = document.createElement("button");
  saveButton.textContent = "Save";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    editingItem = undefined;
    showTab(currentTab);
    window.removeEventListener("keydown", handleKeys);
  });
  saveButton.addEventListener("click", () =>
    saveEdit(textDiv, inputElement.value, textValue.textContent, inputElement)
  );
  saveButton.setAttribute("class", "btn confirm-btn");
  cancelButton.setAttribute("class", "btn danger-btn");
  todoItem.appendChild(saveButton);
  todoItem.appendChild(cancelButton);
  window.addEventListener("keydown", handleKeys);
}
// Event listener for keydown when edit input is open
function handleKeys(event) {
  if (event.key === "Enter") {
    const textDiv = editingItem.querySelectorAll("div")[1];
    const inputElement = textDiv.querySelector("input");
    const textValue = textDiv.querySelector("p");
    saveEdit(textDiv, inputElement.value, textValue.textContent, inputElement);
  }
  if (event.key === "Escape") {
    editingItem = undefined;
    showTab(currentTab);
  }
}
// Save edit button event listener
function saveEdit(textDiv, newValue, oldValue, inputElement) {
  const errorLabelExists = textDiv.querySelector("#errorEditLabel");
  if (errorLabelExists) {
    errorLabelExists.remove();
  }
  // Validation for edited input
  if (newValue === "") {
    const errorLabel = document.createElement("label");
    errorLabel.id = "errorEditLabel";
    errorLabel.textContent = "* Please enter a Todo name";
    errorLabel.setAttribute("class", "errorLabel");
    textDiv.appendChild(errorLabel);
    inputElement.focus();
    return;
  }
  if (newValue.length < 3) {
    const errorLabel = document.createElement("label");
    errorLabel.id = "errorEditLabel";
    errorLabel.textContent = "* The name must be minimum 3 characters";
    errorLabel.setAttribute("class", "errorLabel");
    textDiv.appendChild(errorLabel);
    inputElement.focus();
    return;
  }
  if (newValue === oldValue) {
    editingItem = undefined;
    showTab(currentTab);
    return;
  }
  const valueExistsElsewhere = todoItems
    .filter((item) => item.name !== oldValue)
    .find((item) => item.name === newValue);
  if (valueExistsElsewhere) {
    const errorLabel = document.createElement("label");
    errorLabel.id = "errorEditLabel";
    errorLabel.textContent = "* Todo item already exists";
    errorLabel.setAttribute("class", "errorLabel");
    textDiv.appendChild(errorLabel);
    inputElement.focus();
    return;
  }

  todoItems.forEach((item) => {
    if (item.name === oldValue) {
      item.name = newValue;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todoItems));
  editingItem = undefined;
  window.removeEventListener("keydown", handleKeys);
  showTab(currentTab);
}
// Update item count for text
function updateCount() {
  const incompleteTodos = todoItems.filter((todo) => !todo.completed);
  const itemCount = document.getElementById("itemCount");
  if (incompleteTodos.length > 0) {
    itemCount.textContent = `${incompleteTodos.length} items left`;
  } else {
    itemCount.textContent = "All items completed";
  }
}
// Toggle the complete status on todo item
function toggleComplete(todoName) {
  todoItems.forEach((todo) => {
    if (todo.name === todoName) {
      todo.completed = !todo.completed;
      document.getElementById(todoName + "-text").classList.toggle("completed");
    }
  });
  updateCount();
  localStorage.setItem("todos", JSON.stringify(todoItems));
}

// Close modal on X click
modalCloseButton.addEventListener("click", () => {
  resetAddTodoForm();
  modal.close();
});

// Open modal on add todo button click
addTodoButton.addEventListener("click", () => {
  modal.showModal();
});

// Close modal on outside click
modal.addEventListener("click", (event) => {
  if (event.target.tagName == "DIALOG") {
    resetAddTodoForm();
    modal.close();
  }
});
// Close modal on cancel event listener
modalCancelButton.addEventListener("click", () => {
  resetAddTodoForm();
  modal.close();
});

// Add todo form submit event listener
addTodoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const todo = addTodoForm["todo"].value;
  // Validation for input
  if (todo === "") {
    addTodoForm["todo"].style["border-color"] = "red";
    addTodoForm.getElementsByTagName("label")[0].style["color"] = "#ed5858";
    addTodoForm.getElementsByTagName("span")[0].textContent =
      "* Please enter a Todo name";
    addTodoForm.getElementsByTagName("span")[0].style["display"] = "block";
    return;
  }
  if (todo.length < 3) {
    addTodoForm["todo"].style["border-color"] = "red";
    addTodoForm.getElementsByTagName("label")[0].style["color"] = "#ed5858";
    addTodoForm.getElementsByTagName("span")[0].textContent =
      "* The name must be minimum 3 characters";
    addTodoForm.getElementsByTagName("span")[0].style["display"] = "block";
    return;
  }
  const itemExists = todoItems.find((item) => item.name === todo);
  if (itemExists) {
    addTodoForm["todo"].style["border-color"] = "red";
    addTodoForm.getElementsByTagName("label")[0].style["color"] = "#ed5858";
    addTodoForm.getElementsByTagName("span")[0].textContent =
      "* Todo item already exists";
    addTodoForm.getElementsByTagName("span")[0].style["display"] = "block";
    return;
  }
  todoItems.push({
    name: todo,
    completed: false,
  });
  localStorage.setItem("todos", JSON.stringify(todoItems));
  resetAddTodoForm();
  modal.close();
  showTab(currentTab);
});
// Function to reset add todo form in dialog
function resetAddTodoForm() {
  addTodoForm.getElementsByTagName("input")[0].style["border-color"] = "black";
  addTodoForm.getElementsByTagName("label")[0].style["color"] = "#aaadab";
  addTodoForm.getElementsByTagName("span")[0].style["display"] = "none";
  addTodoForm.reset();
}

todoList.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  setTimeout(() => {
    e.target.style.display = "none";
  }, 0);
});

todoList.addEventListener("dragend", (e) => {
  setTimeout(() => {
    e.target.style.display = "";
    draggedItem = null;
  }, 0);
});
todoList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(todoList, e.clientY);
  const afterElementInList = todoItems.find(
    (item) => item.name === afterElement?.querySelector("p").textContent
  );
  const draggedElement = draggedItem.querySelector("p").textContent;
  const draggedElementInList = todoItems.find(
    (item) => item.name === draggedElement
  );
  const removedItem = todoItems.splice(
    todoItems.indexOf(draggedElementInList),
    1
  )[0];
  if (afterElement == null) {
    todoList.appendChild(draggedItem);
    todoItems.push(removedItem);
  } else {
    todoList.insertBefore(draggedItem, afterElement);
    if (afterElementInList) {
      todoItems.splice(todoItems.indexOf(afterElementInList), 0, removedItem);
    }
  }
  localStorage.setItem("todos", JSON.stringify(todoItems));
});
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".todo-item")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child,
        };
      } else {
        return closest;
      }
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
}
