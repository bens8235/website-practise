// async function getData() {
//   const response = await fetch("http://localhost:8080/employees");
//   const data = await response.json();
//   console.log(data);

//   for (let i = 0; i < data.length; i++) {
//     const info = data[i];
//     // const p = document.createElement("p");
//     // p.innerHTML =
//     Object.entries(info).forEach(([key, value]) => {
//       console.log(key, value);
//     });
//   }
// }

// //   getMessages();
// getData();

const form = document.getElementById("submit");
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  const formData = new FormData(form);
  const formValues = Object.fromEntries(formData);

  const buttonId = document.activeElement.id;
  const endpoint =
    buttonId === "signup-btn"
      ? "http://localhost:8080/sign-up"
      : "http://localhost:8080/login";

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formValues),
  });
  form.reset();
});

// form.addEventListener("submit", async function (event) {
//     event.preventDefault();
//     const formData = new FormData(form);
//     const formValues = Object.fromEntries(formData);

//     await fetch("https://message-board-server.onrender.com/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formValues),
//     });
//     form.reset();
//     addElements(formValues);
//   });
