const form = document.getElementById("submit");
const alertDiv = document.getElementById("alert");
const form2 = document.getElementById("data");
const passwordCheck = document.getElementById("password-check");
const greenBoxes = document.querySelectorAll(".green-box");
const button1 = document.getElementById("signup-btn-1");
const button2 = document.getElementById("login-btn-1");
const signUp = document.getElementById("signup-btn");
const login = document.getElementById("login-btn");
const passwordRequirements = document.getElementById("password-requirements");

const symbolArray = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "-",
  "+",
  "=",
  "{",
  "}",
  "[",
  "]",
  "|",
  "\\",
  ":",
  ";",
  '"',
  "'",
  "<",
  ">",
  ",",
  ".",
  "?",
  "/",
];

const uppercaseLetters = [];
for (let i = 65; i <= 90; i++) {
  uppercaseLetters.push(String.fromCharCode(i));
}

const numbers = [];
for (let i = 0; i <= 9; i++) {
  numbers.push(i.toString());
}

let allGreen = true;

function passwordValidation(arr, index, event) {
  for (letter of event.target.value) {
    if (arr.includes(letter)) {
      greenBoxes[index].style.backgroundColor = "green";
      break;
    } else {
      greenBoxes[index].style.backgroundColor = "";
    }
  }
}

button1.addEventListener("click", function () {
  form.style.display = "block";
  button1.style.display = "none";
  button2.style.display = "none";
  login.style.display = "none";
  passwordRequirements.style.display = "block";
  passwordCheck.addEventListener("input", function (event) {
    if (event.target.value.length >= 8) {
      greenBoxes[0].style.backgroundColor = "green";
    } else if (event.target.value.length === 0) {
      for (box of greenBoxes) {
        box.style.backgroundColor = "";
      }
    } else {
      greenBoxes[0].style.backgroundColor = "";
    }

    passwordValidation(uppercaseLetters, 1, event);
    passwordValidation(symbolArray, 2, event);
    passwordValidation(numbers, 3, event);

    allGreen = true;

    for (box of greenBoxes) {
      if (box.style.backgroundColor !== "green") {
        allGreen = false;
        break;
      }
    }
  });
});

button2.addEventListener("click", function () {
  form.style.display = "block";
  button1.style.display = "none";
  button2.style.display = "none";
  signUp.style.display = "none";
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const formValues = Object.fromEntries(formData);

  const buttonId = document.activeElement.id;
  const endpoint =
    buttonId === "signup-btn"
      ? "http://localhost:8080/sign-up"
      : "http://localhost:8080/login";

  if (!allGreen) {
    const p = document.createElement("p");
    p.classList.add("alert");
    p.innerHTML = "invalid password";
    alertDiv.append(p);
    setTimeout(function () {
      p.remove();
    }, 2000);
  } else {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });
    const json = await response.json();
    const alert = document.querySelector(".alert");
    if (alert) {
      alert.remove();
    }

    const p = document.createElement("p");
    p.classList.add("alert");
    p.innerHTML = json.message;
    alertDiv.appendChild(p);

    setTimeout(function () {
      p.remove();
    }, 2000);

    if (json.message === "") {
      form.reset();
      form.style.display = "none";
      passwordRequirements.style.display = "none";
      form2.style.display = "block";
    }
  }
});
