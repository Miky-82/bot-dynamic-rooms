require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const config = require('./config.json');
const voiceStateHandler = require('./events/voiceStateUpdate');
const voiceCommand = require('./commands/voiceControl');

// import owner map
const { voiceOwners } = require('./events/voiceStateUpdate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// =============================
// BOT READY
// =============================
client.once('clientReady', () => {
  console.log(`🤖 Bot online come ${client.user.tag}`);
});

// =============================
// EVENTO VOICE
// =============================
client.on('voiceStateUpdate', (oldState, newState) => {
  voiceStateHandler(oldState, newState, client, config);
});

// =============================
// SLASH COMMANDS
// =============================
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "voice") {
    voiceCommand.execute(interaction, voiceOwners);
  }

});

// =============================
// LOGIN
// =============================
client.login(process.env.TOKEN);