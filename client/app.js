async function getData() {
  const response = await fetch("http://localhost:8080/employees");
  const data = await response.json();
  console.log(data);

  for (let i = 0; i < data.length; i++) {
    const info = data[i];
    // const p = document.createElement("p");
    // p.innerHTML =
    Object.entries(info).forEach(([key, value]) => {
      console.log(key, value);
    });
  }
}

//   getMessages();
getData();
