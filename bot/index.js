require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const config = require('./config.json');
const { voiceStateHandler, voiceOwners } = require('./events/voiceStateUpdate');
const voiceCommand = require('./commands/voiceControl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('clientReady', () => {
  console.log(`🤖 Bot online come ${client.user.tag}`);
});

// EVENTO VOICE (con gestione errori)
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    await voiceStateHandler(oldState, newState, client, config);
  } catch (err) {
    console.error("Errore evento voice:", err);
  }
});

// SLASH COMMANDS
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "voice") {
    try {
      await voiceCommand.execute(interaction, voiceOwners);
    } catch (err) {
      console.error("Errore comando voice:", err);
    }
  }

});

// gestione errori globali (IMPORTANTISSIMO)
process.on('unhandledRejection', err => {
  console.error("Unhandled promise rejection:", err);
});

client.login(process.env.TOKEN);