import { AGORA_APP_ID } from "../env.js";

// console.log(AGORA_APP_ID)
let agoraAppId = AGORA_APP_ID;
let token = null;
let uid = String(Math.floor(Math.random() * 232));
let room = "default";

let startRoom = async () => {
  let rtmClient = await AgoraRTM.createInstance(agoraAppId);
  await rtmClient.login({ uid, token });

  const channel = await rtmClient.createChannel(room);
  await channel.join();

  channel.on("ChannelMessage", (messageData, memberId) => {
    let data = JSON.parse(messageData.text);
    addMessageToDom(data.message, memberId);
    console.log("Data", data);
  });

  let addMessageToDom = (messageData, memberId) => {
    let messagesWrapper = document.getElementById('chatroom_chatwindow');
    let message = `<div class="message_wrapper">
                        <p>${memberId}</p>
                        <p>${messageData}</p>
                    </div>`;
    messagesWrapper.insertAdjacentHTML("beforeend", message);
  };

  let sendMessage = async (e) => {
    e.preventDefault();
    let message = e.target.message.value;
    channel.sendMessage({ text: JSON.stringify({ message: message }) });
    addMessageToDom(message, uid);
    e.target.reset();
  };

  let chatroomForm = document.getElementById("chatroom_message_form");
  chatroomForm.addEventListener("submit", sendMessage);
};

startRoom();
