let lobbyForm = document.getElementById("lobby_form");

lobbyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sessionStorage.setItem("username", e.target.name.value);
  window.location = `chatroom.htm?room=${e.target.room.value}`;
});

lobbyForm.room.addEventListener("keyup", (e) => {
  let cleanedValue = e.target.value.replace(" ", "");
  e.target.value = cleanedValue.toUpperCase();
});
