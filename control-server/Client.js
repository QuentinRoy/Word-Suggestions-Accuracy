import shortid from "shortid";

export function generateClientId() {
  return shortid();
}

export default function Client({
  id = generateClientId(),
  socket,
  ...props
} = {}) {
  let nextMessage = 0;

  const generateMessageId = () => {
    let num = nextMessage;
    nextMessage += 1;
    return num;
  };

  const send = (message) => {
    const id = message.id == null ? generateMessageId() : message.id;
    socket.send(JSON.stringify({ ...message, id }));
    return id;
  };

  return { ...props, socket, id, generateMessageId, send };
}
