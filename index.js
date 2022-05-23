const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const dotenv = require("dotenv");
const fs = require("fs");

const saveCredentials = (apiId, apiHash, session) => {
  fs.writeFileSync(".env", [
    `API_ID=${apiId}`,
    `API_HASH=${apiHash}`,
    `SESSION=${session}`
  ].join("\n"))
}

(async () => {
  let apiHash, apiId, stringSession;

  const config = dotenv.config();
  if (config.parsed && config.parsed["API_ID"] && config.parsed["API_HASH"]) {
    const { API_ID, API_HASH, SESSION } = config.parsed
    console.log("Using saved credentials...");
    console.log(" > API_ID", API_ID);
    console.log(" > API_HASH", API_HASH);
    apiId = Number(API_ID);
    apiHash = String(API_HASH);
    stringSession = new StringSession(SESSION || "");
  }
  else {
    apiId = await input.text("Enter API Id: ");
    apiHash = await input.text("Enter API hash: ");
    stringSession = new StringSession("");
  }

  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected. Check your saved messages.");

  saveCredentials(apiId, apiHash, client.session.save());
  console.log("Credentials saved to .env");

  await client.sendMessage("me", { message: `Test message sent on ${new Date().toLocaleDateString()}` });


})();
