// jshint esversion: 9

const Discord = require("discord.js");
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] });

const fs = require("fs");
const Color = require("js-color-class");

const { token } = require("./token.json");
const { lastColor } = require("./lastColor.json");

/* ----- Client Ready ----- */

client.on("ready", () => {
  // Set up event handlers:
  client.on("presenceUpdate", presenceUpdate);
  client.on("rateLimit", rateLimit);
  client.on("error", error);

  // Set bot activity:
  client.user.setActivity("raining bows", { type: "PLAYING" });

  changeColor();

  console.log(`Bot is ready.`);
  console.log(`Logged in as ${client.user.tag}!`);
});

/* ------- Function ------- */

function changeColor() {
  client.guilds
    .fetch("203778798406074368")
    .then((guild) => {
      guild.roles
        .fetch("1110878356624379904")
        .then((role) => {
          let color = new Color(lastColor);
          let count = 0;
          const c = () => {
            let hexRed = parseInt(color.getRed(), 10).toString(16);
            let hexGreen = parseInt(color.getGreen(), 10).toString(16);
            let hexBlue = parseInt(color.getBlue(), 10).toString(16);
            if (hexRed.length == 1) hexRed = `${hexRed}${hexRed}`;
            if (hexGreen.length == 1) hexGreen = `${hexGreen}${hexGreen}`;
            if (hexBlue.length == 1) hexBlue = `${hexBlue}${hexBlue}`;
            let hexColor = `#${hexRed}${hexGreen}${hexBlue}`;
            role
              .setColor(hexColor)
              .then(() => {
                fs.writeFileSync("./lastColor.json", `{ "lastColor": "${hexColor}" }`);
                console.log(`Changed color to: ${hexColor}.`);
              })
              .catch(console.warn);
            color = color.shiftHue(1 / 90);
            count++;
          };
          c();
          setInterval(() => {
            c();
          }, (24 * 60 * 60 * 1000) / 1000 + 1000); // (1 day in milliseconds) / hue degrees + one second safety buffer (4 minutes and 1 second)
        })
        .catch(console.warn);
    })
    .catch(console.warn);
}

/* ----- Event Handler ---- */

function presenceUpdate(oldPresence, newPresence) {
  if (newPresence.userID == "158262695781466112") {
    newPresence.guild.members
      .fetch("864985817763151872")
      .then((member) => {
        if (newPresence.status == "online")
          member.roles
            .remove("864507363816767519", "Removed myself from rainbowrole.")
            .then()
            .catch(console.warn);
        if (newPresence.status == "offline")
          member.roles
            .add("864507363816767519", "Added myself to rainbowrole.")
            .then()
            .catch(console.warn);
      })
      .catch(console.warn);
  }
}
function rateLimit(rateLimitInfo) {
  console.table(rateLimitInfo);
}
function error(errorInfo) {
  console.table(errorInfo);
}

/* ---------- Bot Shutdown ---------- */

const handleShutdown = async () => {
  console.info("Logging out and shutting down...");
  await client.destroy();
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED: " + err);
});

/* ----------- Bot Startup ---------- */

client.login(token);
