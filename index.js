const api = {
  baseurl: "https://pacific-reef-32046.herokuapp.com/",
  //baseurl: "http://localhost:3000/",
  baseAuth: "Bearer ",
};

const ul = document.querySelector("ul");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const enterButton = document.getElementById("enterButton");
let currentDate;
let editId;
let token;
let userId;

let myCalendar = new VanillaCalendar({
  selector: "#myCalendar",
  onSelect: (data, element) => {
    currentDate = data.date;
    getSpendings();
  },
});

function getSpendings() {
  enterButton.textContent = "Create Entry";
  fetch(`${api.baseurl}spendings/${userId}`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `${api.baseAuth}${token}`,
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      cleanTable();
      let sum = 0;

      data.forEach((spending) => {
        let spendingDate = new Date(spending.date);
        let calendarDate = new Date(currentDate);
        let today = new Date();

        console.log(isNaN(calendarDate.getTime()));
        console.log(today.sameDay(spendingDate));
        if (
          calendarDate.sameDay(spendingDate) ||
          (isNaN(calendarDate.getTime()) && today.sameDay(spendingDate))
        ) {
          createListElement(spending);
          sum += spending.amount;
        }
      });
      document.getElementById("total").innerHTML = `Total: ${sum} $`;
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
    let body = [
      { propName: "amount", value: `${amountInput.value}` },
      { propName: "category", value: `${categoryInput.value}` },
    ];
    fetch(`${api.baseurl}spendings/${editId}`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `${api.baseAuth}${token}`,
      },
      body: JSON.stringify(body),
    }).then((data) => {
      getSpendings();
      amountInput.value = "";
      categoryInput.value = "";
    });
  } else {
    fetch(`${api.baseurl}spendings/${userId}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `${api.baseAuth}${token}`,
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
        Authorization: `${api.baseAuth}${token}`,
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

/*assdkj9999999999999999999999999999999999999 */
function setFormMessage(formElement, type, message) {
  const messageElement = formElement.querySelector(".form__message");

  messageElement.textContent = message;
  messageElement.classList.remove(
    "form__message--success",
    "form__message--error"
  );
  messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
  inputElement.classList.add("form__input--error");
  inputElement.parentElement.querySelector(
    ".form__input-error-message"
  ).textContent = message;
}

function clearInputError(inputElement) {
  inputElement.classList.remove("form__input--error");
  inputElement.parentElement.querySelector(
    ".form__input-error-message"
  ).textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login");
  const createAccountForm = document.querySelector("#createAccount");

  document
    .querySelector("#linkCreateAccount")
    .addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("form--hidden");
      createAccountForm.classList.remove("form--hidden");
    });

  document.querySelector("#linkLogin").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("form--hidden");
    createAccountForm.classList.add("form--hidden");
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let user = {
      email: document.getElementById("signInEmail").value,
      password: document.getElementById("signInPassword").value,
    };

    fetch(`${api.baseurl}user/login/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(user),
    })
      .then(function (response) {
        return response.json();
      })
      .then((data) => {
        token = data.token;
        userId = data.userId;
        document.getElementById('name').innerHTML = data.name;

        document.getElementsByClassName("loginPage")[0].style.display = "none";
        document.getElementsByClassName("firstPage")[0].style.display = "block";
        getSpendings();
      })
      .catch((error) => {
        console.log(error);
      });
  });

  createAccountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let user = {
      name: document.getElementById("signupUsername").value,
      email: document.getElementById("signupUserEmail").value,
      password: document.getElementById("signupUserPass").value,
    };

    fetch(`${api.baseurl}user/signup/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(user),
    })
      .then((data) => {
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
      })
      .catch((error) => {
        console.log(error);
      });
  });

  document.querySelectorAll(".form__input").forEach((inputElement) => {
    inputElement.addEventListener("blur", (e) => {
      if (
        e.target.id === "signupUsername" &&
        e.target.value.length > 0 &&
        e.target.value.length < 3
      ) {
        setInputError(
          inputElement,
          "Username must be at least 3 characters in length"
        );
      }
    });

    inputElement.addEventListener("input", (e) => {
      clearInputError(inputElement);
    });
  });
});

