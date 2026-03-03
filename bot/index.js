require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Salviamo i timer attivi
const deleteTimers = new Map();

client.once('clientReady', () => {
  console.log(`Bot online come ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const guild = newState.guild;
    const member = newState.member;

    // =============================
    // CANCELLAZIONE CON TIMER
    // =============================
    if (
      oldState.channel &&
      oldState.channel.parent &&
      oldState.channel.parent.name === config.categoryName
    ) {
      if (oldState.channel.members.size === 0) {

        // Avvia timer di 60 secondi
        const timer = setTimeout(async () => {
          if (oldState.channel.members.size === 0) {
            await oldState.channel.delete().catch(() => {});
          }
          deleteTimers.delete(oldState.channel.id);
        }, 60000); // 60 secondi

        deleteTimers.set(oldState.channel.id, timer);
      }
    }

    // Se qualcuno rientra → annulla timer
    if (
      newState.channel &&
      deleteTimers.has(newState.channel.id)
    ) {
      clearTimeout(deleteTimers.get(newState.channel.id));
      deleteTimers.delete(newState.channel.id);
    }

    // =============================
    // CREAZIONE STANZA
    // =============================
    if (!newState.channel) return;

    const triggerNames = Object.values(config.triggerChannels);
    if (!triggerNames.includes(newState.channel.name)) return;

    const memberRoles = member.roles.cache;

    // Controllo ruoli
    if (newState.channel.name === config.triggerChannels.private) {
      const role = guild.roles.cache.find(r => r.name === config.privateRoleName);
      if (!role || !memberRoles.has(role.id)) return;
    }

    if (newState.channel.name === config.triggerChannels.live) {
      const role = guild.roles.cache.find(r => r.name === config.liveRoleName);
      if (!role || !memberRoles.has(role.id)) return;
    }

    if (newState.channel.name === config.triggerChannels.public) {
      const role = guild.roles.cache.find(r => r.name === config.utenteRoleName);
      if (!role || !memberRoles.has(role.id)) return;
    }

    let category = guild.channels.cache.find(
      c => c.name === config.categoryName && c.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await guild.channels.create({
        name: config.categoryName,
        type: ChannelType.GuildCategory
      });
    }

    const newChannel = await guild.channels.create({
      name: member.user.username,
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    await member.voice.setChannel(newChannel);

  } catch (err) {
    console.error("Errore gestione voice:", err);
  }
});

client.login(process.env.TOKEN);