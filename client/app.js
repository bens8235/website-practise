const form = document.getElementById("submit"); //signup & login form
const alertDiv = document.getElementById("alert"); //div containing alert message
const form2 = document.getElementById("data"); //people & organisation form
const passwordCheck = document.getElementById("password-check"); //password input
const userCheck = document.getElementById("username-check"); //username input
const greenBoxes = document.querySelectorAll(".green-box"); //validation boxes
const button1 = document.getElementById("signup-btn-1"); //first signup button
const button2 = document.getElementById("login-btn-1"); //first login button
const signUp = document.getElementById("signup-btn"); //second signup button
const login = document.getElementById("login-btn"); //second login button
const passwordRequirements = document.getElementById("password-requirements"); //password requirements

//to check password meets symbol requirement
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
  "£",
];

//to check password meets uppercase requirement
const uppercaseLetters = [];
for (let i = 65; i <= 90; i++) {
  uppercaseLetters.push(String.fromCharCode(i));
}

//to check password meets number requirement
const numbers = [];
for (let i = 0; i <= 9; i++) {
  numbers.push(i.toString());
}
//boolean value to use in a function later to check if all password requirements met
let allGreen = true;

//function to check if password meets different requirements
function passwordValidation(arr, index, event) {
  for (letter of event.target.value) {
    if (arr.includes(letter)) {
      greenBoxes[index].style.backgroundColor = "green";
      greenBoxes[index].style.borderRadius = "50%";
      break;
    } else {
      greenBoxes[index].style.backgroundColor = "";
      greenBoxes[index].style.borderRadius = "0%";
    }
  }
}

//makes signup form appear, will then check password input meets requirements
button1.addEventListener("click", function () {
  form.style.display = "block";
  button1.style.display = "none";
  button2.style.display = "none";
  login.style.display = "none";
  passwordRequirements.style.display = "block";
  userCheck.addEventListener("input", function () {
    const pAlert = document.querySelector("p.alert");
    if (pAlert) {
      pAlert.remove();
    }
  });
  passwordCheck.addEventListener("input", function (event) {
    const pAlert = document.querySelector("p.alert");
    if (pAlert) {
      pAlert.remove();
    }
    if (event.target.value.length >= 8) {
      greenBoxes[0].style.backgroundColor = "green";
      greenBoxes[0].style.borderRadius = "50%";
    } else if (event.target.value.length === 0) {
      for (box of greenBoxes) {
        box.style.backgroundColor = "";
        box.style.borderRadius = "0%";
      }
    } else {
      greenBoxes[0].style.backgroundColor = "";
      greenBoxes[0].style.borderRadius = "0%";
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

//makes login form appear

button2.addEventListener("click", function () {
  userCheck.addEventListener("input", function () {
    const pAlert = document.querySelector("p.alert");
    if (pAlert) {
      pAlert.remove();
    }
  });
  passwordCheck.addEventListener("input", function () {
    const pAlert = document.querySelector("p.alert");
    if (pAlert) {
      pAlert.remove();
    }
  });
  form.style.display = "block";
  button1.style.display = "none";
  button2.style.display = "none";
  signUp.style.display = "none";
});

/*submits login or sign up form. Login checks credentials meet the ones in database. 
signup creates new user in database. */

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const formValues = Object.fromEntries(formData);

  //depending on which button is clicked will set server endpoint
  const buttonId = document.activeElement.id;
  const endpoint =
    buttonId === "signup-btn"
      ? "http://localhost:8080/sign-up"
      : "http://localhost:8080/login";

  //if password requirements not all met on signup
  if (!allGreen) {
    if (!document.querySelector("p.alert")) {
      const p = document.createElement("p");
      p.classList.add("alert");
      p.innerHTML = "Password doesn't meet requirements";
      alertDiv.append(p);
    }
  }
  //this happens either on login or on signup when password requirements met
  //Depending on if login or signup will have different endpoint and on signup will add user to database
  //On login will check database for valid user
  else {
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

    if (json.message === "") {
      form.reset();
      form.style.display = "none";
      passwordRequirements.style.display = "none";
      form2.style.display = "block";
      document.getElementById("DataForm").style.display = "block";
    }
  }
});
