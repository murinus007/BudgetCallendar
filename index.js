const api = {
  baseurl: "https://pacific-reef-32046.herokuapp.com/",
};

const ul = document.querySelector("ul");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const enterButton = document.getElementById("enterButton");
let currentDate;
let editId;

let myCalendar = new VanillaCalendar({
  selector: "#myCalendar",
  onSelect: (data, element) => {
    currentDate = data.date;
    getSpendings();
  },
});

function getSpendings() {
  enterButton.textContent = "Create Entry";
  fetch(`${api.baseurl}spendings`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      cleanTable();
      data.forEach((element) => {
        createListElement(element);
      });
    })

    .catch((error) => {
      console.log(error);
    });
}

function createSpending() {
  let amount = amountInput.value;
  let category = categoryInput.value;

  let spending = {
    category: category,
    amount: amount,
    date: currentDate,
  };
  if (enterButton.textContent == "Edit Entry") {
    let body = [{ "propName": "amount", "value": `${amountInput.value}` },
    { "propName": "category", "value": `${categoryInput.value}` }]
    fetch(`${api.baseurl}spendings/${editId}`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    }).then((data) => {
      getSpendings();
      amountInput.value = "";
      categoryInput.value = "";
    });
  } else {
    fetch(`${api.baseurl}spendings`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(spending),
    }).then((data) => {
      getSpendings();
      amountInput.value = "";
      categoryInput.value = "";
    });
  }
}

function createListElement(spending) {
  let spendingDate = new Date(spending.date);
  let newCurrentDate = new Date(currentDate);

  if (newCurrentDate.sameDay(spendingDate)) {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(`${spending.category} `));
    li.appendChild(document.createTextNode(`${spending.amount} $`));

    const dBtn = document.createElement("button");
    dBtn.appendChild(document.createTextNode("X"));
    li.appendChild(dBtn);
    dBtn.addEventListener("click", deleteListItem);

    function deleteListItem() {
      li.classList.add("delete");
      fetch(`${api.baseurl}spendings/${spending._id}`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }).then((data) => {
        console.log(data);
      });
    }

    const editBtn = document.createElement("button");
    editBtn.appendChild(document.createTextNode("edit"));
    li.appendChild(editBtn);
    editBtn.addEventListener("click", updateSpending);

    function updateSpending() {
      unDoneTable();
      li.classList.toggle("done");
      amountInput.value = spending.amount;
      categoryInput.value = spending.category;
      enterButton.textContent = "Edit Entry";
      editId = spending._id;
    }
    ul.appendChild(li);
  }
}

enterButton.addEventListener("click", createSpending);

Date.prototype.sameDay = function (newDate) {
  return (
    this.getFullYear() === newDate.getFullYear() &&
    this.getDate() === newDate.getDate() &&
    this.getMonth() === newDate.getMonth()
  );
};

function cleanTable() {
  let elementChildrens = ul.children;
  for (let i = 0, child; (child = elementChildrens[i]); i++) {
    child.classList.add("delete");
  }
}

function unDoneTable() {
  let elementChildrens = ul.children;
  for (let i = 0, child; (child = elementChildrens[i]); i++) {
    child.classList.remove("done");
  }
}
