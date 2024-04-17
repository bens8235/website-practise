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
const orgSelect = document.getElementById("organisation-select"); //select for organisations to append options to
const peopleContainer = document.getElementById("p-details-container"); //div to append data to
const peopleData = document.getElementById("p-detail-container"); // to make appear once logged in
const centerDiv = document.querySelector(".centerDiv"); //div in center of screen on signup/login
const centerDivContainer = document.querySelector(".centerDivContainer");
const padlockImg = document.querySelector(".padlock");
const h1 = document.querySelector("h1");
secondCenterDiv = document.querySelector(".centerDiv2");

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
    if (p.innerHTML !== "Username already exists") {
      alertDiv.style.left = "38.2%";
      alertDiv.style.bottom = "10%";
    }

    if (json.message === "") {
      form.reset();
      form.style.display = "none";
      centerDivContainer.style.display = "block";
      passwordRequirements.style.display = "none";
      form2.style.display = "flex";
      // peopleData.style.display = "block";
      padlockImg.style.display = "none";
      centerDiv.style.display = "none";
      h1.style.display = "none";
      secondCenterDiv.style.display = "flex";

      document.getElementById("DataForm").style.display = "block";
    }
  }
});

//form for submitting user data/organisations.

form2.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(form2);
  const formValues = Object.fromEntries(formData);

  const response = await fetch("http://localhost:8080/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formValues),
  });
  const json = await response.json();
  const alerted = document.querySelector(".alert");
  if (alerted) {
    alerted.remove();
  }
  const alert = document.createElement("p");
  alert.classList.add("alert");
  alert.innerHTML = json.message;
  alertDiv.appendChild(alert);
  setTimeout(function () {
    alert.remove();
  }, 4000);
  if (json.message == "") {
    form2.reset();
    const p = document.createElement("p");
    p.innerHTML = "Form Submitted";
    alertDiv.appendChild(p);
    setTimeout(function () {
      p.remove();
    }, 4000);
  }
  while (orgSelect.firstChild) {
    orgSelect.removeChild(orgSelect.firstChild);
  }

  getOrganisations();
});

//This gets all the organisations and people data from the database. Runs it once when program
//first starts and then again when form is submitted to refresh data

async function getOrganisations() {
  let peopleInfo = [];
  const response = await fetch("http://localhost:8080/");
  const orgs = await response.json();
  const initialOption = document.createElement("option");
  initialOption.innerHTML = "Please select an organisation";
  orgSelect.appendChild(initialOption);
  for (let org of orgs) {
    const option = document.createElement("option");
    option.innerHTML = org.organisation_name;
    orgSelect.appendChild(option);
  }
  orgSelect.addEventListener("change", function (event) {
    peopleInfo = [];
    while (peopleContainer.firstChild) {
      peopleContainer.removeChild(peopleContainer.firstChild);
    }

    const organisationSelected = event.target.value;
    for (let org of orgs) {
      if (org.organisation_name === organisationSelected) {
        peopleInfo.push(org.people_details);
      }
    }

    for (const people of peopleInfo) {
      for (const p of people) {
        const peopleDiv = document.createElement("div");
        peopleDiv.classList.add("p-details");
        peopleContainer.appendChild(peopleDiv);
        for (const name in p) {
          const peopleDetails = document.createElement("p");
          peopleDetails.innerHTML = `${name} : ${p[name]}`;
          peopleDiv.appendChild(peopleDetails);
        }
      }
    }
  });
}

getOrganisations();
