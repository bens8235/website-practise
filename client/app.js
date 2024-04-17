// Load in sounds

const sound = new Audio("padlock.mp3");
sound.preload = "auto";
sound.load();

// Defining variables to be used

const form = document.getElementById("submit"); // signup & login form
const alertDiv = document.getElementById("alert"); // div containing alert message
const form2 = document.getElementById("data"); // people & organisation form
const passwordCheck = document.getElementById("password-check"); // password input
const userCheck = document.getElementById("username-check"); // username input
const greenBoxes = document.querySelectorAll(".green-box"); // validation boxes
const button1 = document.getElementById("signup-btn-1"); // first signup button
const button2 = document.getElementById("login-btn-1"); // first login button
const signUp = document.getElementById("signup-btn"); // second signup button
const login = document.getElementById("login-btn"); // second login button
const passwordRequirements = document.getElementById("password-requirements"); // password requirements
const orgSelect = document.getElementById("organisation-select"); // select for organisations to append options to
const peopleContainer = document.getElementById("p-details-container"); // div to append data to
const peopleData = document.getElementById("p-detail-container"); // to make appear once logged in
const centerDiv = document.querySelector(".centerDiv"); // div in center of screen on signup/login
const centerDivContainer = document.querySelector(".centerDivContainer"); // div on second screen
const padlockImg = document.querySelector(".padlock"); // first padlock image
const h1 = document.querySelector("h1"); // h1 title
secondCenterDiv = document.querySelector(".centerDiv2"); // second center div
dataFormBtn = document.getElementById("data-form"); // button to show data form
orgDataBtn = document.getElementById("organisation-data"); // button to show organisation data
dataFormContainer = document.querySelector(".data-container"); // div containing data
dataFormTitle = document.getElementById("data-form-title"); // titles on the organisation data
imgDiv = document.querySelector(".img-div"); // div that new image gets appended to

// to check password meets symbol requirement

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

// to check password meets uppercase requirement

const uppercaseLetters = [];
for (let i = 65; i <= 90; i++) {
  uppercaseLetters.push(String.fromCharCode(i));
}

// to check password meets number requirement

const numbers = [];
for (let i = 0; i <= 9; i++) {
  numbers.push(i.toString());
}

// boolean value to use in a function later to check if all password requirements met

let allGreen = true;

// function to check if password meets different requirements

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

function playSoundAndChangeImage(sound, callback) {
  sound.onplay = () => {
    callback();
    sound.onplay = null; //
  };

  sound.play();
}

async function getOrganisations() {
  let peopleInfo = [];
  const response = await fetch("http://localhost:8080/");
  let orgs = await response.json();
  const initialOption = document.createElement("option");
  initialOption.innerHTML = "Please select an organisation";
  initialOption.value = "";
  orgSelect.appendChild(initialOption);
  for (let org of orgs) {
    const option = document.createElement("option");
    option.innerHTML = org.organisation_name;
    option.value = org.organisation_name;
    orgSelect.appendChild(option);
  }
  orgSelect.addEventListener("change", async function (event) {
    const r = await fetch("http://localhost:8080/");
    orgs = await r.json();
    peopleInfo = [];
    while (peopleContainer.firstChild) {
      peopleContainer.removeChild(peopleContainer.firstChild);
    }

    if (event.target.value === "") {
      return;
    }

    const organisationSelected = event.target.value;
    for (let org of orgs) {
      if (org.organisation_name === organisationSelected) {
        peopleInfo.push(org.people_details);
      }
    }

    const titles = [
      "Name",
      "Country Code",
      "Phone",
      "Email",
      "Account Number",
      "Ethnicity",
    ];
    const peopleDiv = document.createElement("div");
    peopleDiv.classList.add("p-details");
    peopleDiv.classList.add("p-details-title");
    peopleContainer.appendChild(peopleDiv);
    for (let title of titles) {
      const peopleDetails = document.createElement("p");
      peopleDetails.innerHTML = title;
      peopleDiv.appendChild(peopleDetails);
    }

    for (const people of peopleInfo) {
      for (const p of people) {
        const peopleDiv = document.createElement("div");
        peopleDiv.classList.add("p-details");
        peopleContainer.appendChild(peopleDiv);
        for (const name in p) {
          if (name !== "id") {
            const peopleDetails = document.createElement("p");
            peopleDetails.innerHTML = `${p[name]}`;
            peopleDiv.appendChild(peopleDetails);
          }
        }
        const imgBin = document.createElement("img");
        imgBin.src = "bin.png";
        imgBin.alt = "bin";
        imgBin.style.height = "40px";
        imgBin.style.width = "35px";
        imgBin.style.cursor = "pointer";
        peopleDiv.appendChild(imgBin);
        let temp = "";

        if (peopleInfo[0].length === 1) {
          temp = "delete";
        }
        imgBin.addEventListener("click", async function () {
          function getOrgIdByOrgName(targetValue) {
            const org = orgs.find((o) => o.organisation_name === targetValue);
            return org ? org.organisationid : null; // Returns the organisationid or null if no match is found
          }
          const orgId = getOrgIdByOrgName(event.target.value);

          const confirmed = confirm(
            "Are you sure you want to delete this entry?"
          );
          if (confirmed) {
            const response = await fetch("http://localhost:8080/delete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: p,
                delete: temp,
                org: event.target.value,
                orgid: orgId,
              }),
            });
            const json = await response.json();
            if (json.message === "") {
              this.parentNode.remove();
              // const divToRemove = this.parentNode;
              // divToRemove.parentNode.removeChild(divToRemove);

              if (json.orgDeleted === "yes") {
                const orgOption = document.querySelector(
                  `#organisation-select option[value="${json.orgName}"]`
                );

                if (orgOption) {
                  orgOption.remove();
                }
                alert("Last member and organization deleted.");
              } else {
                alert("Member deleted.");
              }
            } else {
              alert("Failed to delete the entry: " + json.message);
            }
          }
        });
      }
    }
  });
}

// makes signup form appear, will then check password input meets requirements

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

// makes login form appear

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

/* submits login or sign up form. Login checks credentials meet the ones in database. 
signup creates new user in database. */

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const formValues = Object.fromEntries(formData);

  // depending on which button is clicked will set server endpoint

  const buttonId = document.activeElement.id;
  const endpoint =
    buttonId === "signup-btn"
      ? "http://localhost:8080/sign-up"
      : "http://localhost:8080/login";

  // if password requirements not all met on signup

  if (!allGreen) {
    if (!document.querySelector("p.alert")) {
      const p = document.createElement("p");
      p.classList.add("alert");
      p.innerHTML = "Password doesn't meet requirements";
      alertDiv.append(p);
    }
  }
  // this happens either on login or on signup when password requirements met
  // Depending on if login or signup will have different endpoint and on signup will add user to database
  // On login will check database for valid user
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
      alertDiv.style.left = "45%";
      alertDiv.style.bottom = "10%";
    }

    if (json.message === "") {
      playSoundAndChangeImage(sound, function () {
        const img = document.createElement("img");
        img.src = "unlocked_padlock.png";
        img.alt = "unlocked padlock";
        img.classList.add("padlock");
        padlockImg.style.display = "none";
        imgDiv.appendChild(img);

        setTimeout(function () {
          form.reset();
          form.style.display = "none";
          centerDivContainer.style.display = "flex";
          passwordRequirements.style.display = "none";
          form2.style.display = "flex";
          padlockImg.style.display = "none";
          centerDiv.style.display = "none";
          h1.style.display = "none";
          secondCenterDiv.style.display = "block";
        }, 1000);
      });
    }
  }
});

// form for submitting user data/organisations.

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
  alertDiv.style.left = "28%";
  setTimeout(function () {
    alert.remove();
  }, 4000);
  if (json.message == "") {
    form2.reset();
    const p = document.createElement("p");
    p.innerHTML = "Form Submitted";
    alertDiv.appendChild(p);
    alertDiv.style.left = "28%";
    setTimeout(function () {
      p.remove();
    }, 4000);
  }
  while (orgSelect.firstChild) {
    orgSelect.removeChild(orgSelect.firstChild);
  }

  getOrganisations();
});

// This gets all the organisations and people data from the database. Runs it once when program
// first starts and then again when form is submitted to refresh data

// This makes data form appear and org data disappear

dataFormBtn.addEventListener("click", function () {
  dataFormBtn.style.border = "1px solid white";
  orgDataBtn.style.border = "none";
  form2.style.display = "flex";
  secondCenterDiv.style.width = "50%";
  peopleData.style.display = "none";
  dataFormTitle.style.display = "block";
  dataFormContainer.style.display = "block";
  secondCenterDiv.style.overflowY = "visible";
  peopleDiv.style.display = "none";
});

// This makes org data appear and form data disappear

orgDataBtn.addEventListener("click", function () {
  dataFormBtn.style.border = "none";
  orgDataBtn.style.border = "1px solid white";
  form2.style.display = "none";
  dataFormTitle.style.display = "none";
  peopleData.style.display = "block";
  secondCenterDiv.style.width = "80%";
  dataFormContainer.style.display = "flex";
  dataFormContainer.style.flexDirection = "column";
  dataFormContainer.style.justifyContent = "start";
  dataFormContainer.style.alignItems = "center";
  secondCenterDiv.style.overflowY = "auto";
});

// Runs getOrganisations on page load

getOrganisations();
