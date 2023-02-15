import { AGORA_APP_ID } from "../env.js";

let messages = document.getElementById("chatroom_chatwindow");
messages.scrollTop = messages.scrollHeight;
// console.log(AGORA_APP_ID)
let agoraAppId = AGORA_APP_ID;
let token = null;
let uid = String(Math.floor(Math.random() * 232));

let urlParams = new URLSearchParams(window.location.search);
let room = urlParams.get("room");

let displayName = sessionStorage.getItem("username");

if (room === null || displayName === null) {
  window.location = "join.htm";
}

let startRoom = async () => {
  let rtmClient = await AgoraRTM.createInstance(agoraAppId);
  await rtmClient.login({ uid, token });

  const channel = await rtmClient.createChannel(room);
  await channel.join();

  //Store username
  await rtmClient.addOrUpdateLocalUserAttributes({
    displayName: displayName,
  });

  channel.on("ChannelMessage", (messageData, memberId) => {
    let data = JSON.parse(messageData.text);
    addMessageToDom(data.message, memberId);
    console.log("Data", data);
  });

  channel.on("MemberJoined", (memberId) => {
    addParticipantToDom(memberId);
    updateParticipantsCount();
  });

  channel.on("MemberLeft", (memberId) => {
    removeParticipantFromDom(memberId);
    updateParticipantsCount();
  });

  let addParticipantToDom = async (memberId) => {
    let { displayName } = await rtmClient.getUserAttributesByKeys(memberId, [
      "displayName",
    ]);

    let membersWrapper = document.getElementById("chatroom_participants");
    let memberItem = `<div id="member_${memberId}_wrapper" class="member_wrapper">
                        <span class="active_identifier"></span>
                        <p>${displayName}</p>
                      </div>`;
    membersWrapper.innerHTML += memberItem;
  };

  let addMessageToDom = async (messageData, memberId) => {
    let { displayName } = await rtmClient.getUserAttributesByKeys(memberId, [
      "displayName",
    ]);

    let messages = document.getElementById("chatroom_chatwindow");
    let messageWrapper = `<div class="message_wrapper">
                        <p>${displayName}</p>
                        <p>${messageData}</p>
                    </div>`;
    messages.insertAdjacentHTML("beforeend", messageWrapper);
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

  let updateParticipantsCount = async () => {
    let members = await channel.getMembers();
    let count = members.length;
    let participantCounter = document.getElementById(
      "chatroom_participants_count"
    );
    participantCounter.innerHTML = count;
  };

  let getParticipants = async (e) => {
    let participants = await channel.getMembers();
    participants.forEach((participant, index, array) => {
      addParticipantToDom(participant);
    });
    return participants;
  };

  let removeParticipantFromDom = (memberId) => {
    document.getElementById(`member_${memberId}_wrapper`).remove();
  };

  let leaveRoom = async () => {
    await channel.leave();
    await rtmClient.logout();
  };
  window.addEventListener("beforeunload", leaveRoom);

  getParticipants();
  updateParticipantsCount();
};

startRoom();
