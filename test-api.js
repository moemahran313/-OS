fetch("http://localhost:3000/api/notifications")
  .then((res) => console.log(res.status))
  .catch((err) => console.error("Error:", err));
