const { ChannelType, PermissionsBitField } = require("discord.js");

const voiceOwners = new Map();
const voiceTypes = new Map();
const deleteTimers = new Map();
const cooldown = new Map();

async function voiceStateHandler(oldState, newState, client, config) {

  const guild = newState.guild || oldState.guild;
  const member = newState.member;

  try {

    // =========================
    // 🗑️ AUTO DELETE
    // =========================
    if (oldState.channel && oldState.channel.members.size === 0) {

      const oldChannel = oldState.channel;

      if (voiceOwners.has(oldChannel.id)) {

        const type = voiceTypes.get(oldChannel.id);
        const deleteTime = config.settings.deleteTimers[type] || 60;

        console.log(`🗑️ Cancello tra ${deleteTime}s: ${oldChannel.name}`);

        const timer = setTimeout(async () => {
          try {
            await oldChannel.delete();
            voiceOwners.delete(oldChannel.id);
            voiceTypes.delete(oldChannel.id);
            deleteTimers.delete(oldChannel.id);
            console.log(`❌ Stanza eliminata: ${oldChannel.name}`);
          } catch (err) {
            console.error(err);
          }
        }, deleteTime * 1000);

        deleteTimers.set(oldChannel.id, timer);
      }
    }

    // ❌ annulla delete se rientra qualcuno
    if (newState.channel && deleteTimers.has(newState.channel.id)) {
      clearTimeout(deleteTimers.get(newState.channel.id));
      deleteTimers.delete(newState.channel.id);
    }

    // =========================
    // 🚫 COOLDOWN ANTI SPAM
    // =========================
    if (cooldown.has(member.id)) return;
    cooldown.set(member.id, true);
    setTimeout(() => cooldown.delete(member.id), 3000);

    // =========================
    // 🎯 TRIGGER
    // =========================
    const trigger = Object.entries(config.triggers).find(
      ([key, value]) => value.channelId === newState.channelId
    );

    if (!trigger) return;

    const [type, data] = trigger;

    // evita doppia creazione
    if (member.voice.channel && voiceOwners.has(member.voice.channel.id)) return;

    console.log(`✅ Trigger ${type} attivato`);

    // =========================
    // 🔐 RUOLO
    // =========================
    const role = guild.roles.cache.find(r => r.name === data.role);
    if (!role || !member.roles.cache.has(role.id)) return;

    // =========================
    // 🧠 NOME STANZA
    // =========================
    let channelName = member.user.username;

    if (type === "live") channelName = `🔴 LIVE • ${member.user.username}`;
    if (type === "private") channelName = `🔒 ${member.user.username}`;

    // =========================
    // 📁 CATEGORIA
    // =========================
    let category = guild.channels.cache.find(
      c => c.name === config.categories[type] && c.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await guild.channels.create({
        name: config.categories[type],
        type: ChannelType.GuildCategory
      });
    }

    // =========================
    // 🔎 RUOLI SPECIALI
    // =========================
    const streamerRole = guild.roles.cache.find(r => r.name === config.roles.streamer);
    const streamerModRole = guild.roles.cache.find(r => r.name === config.roles.streamer_mod);
    const discordModRole = guild.roles.cache.find(r => r.name === config.roles.discord_mod);

    // =========================
    // 🎙️ CREAZIONE
    // =========================
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: type === "live" ? [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.Connect]
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MoveMembers
          ]
        },
        ...(streamerRole ? [{ id: streamerRole.id, allow: [PermissionsBitField.Flags.Connect] }] : []),
        ...(streamerModRole ? [{ id: streamerModRole.id, allow: [PermissionsBitField.Flags.Connect] }] : []),
        ...(discordModRole ? [{ id: discordModRole.id, allow: [PermissionsBitField.Flags.Connect] }] : [])
      ] : [
        {
          id: guild.roles.everyone.id,
          allow: [PermissionsBitField.Flags.Connect]
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MoveMembers
          ]
        }
      ]
    });

    // =========================
    // 💾 SALVATAGGIO
    // =========================
    voiceOwners.set(channel.id, member.id);
    voiceTypes.set(channel.id, type);

    // =========================
    // 👥 LIMITI
    // =========================
    if (type === "live") await channel.setUserLimit(config.settings.liveUserLimit);
    if (type === "private") await channel.setUserLimit(config.settings.privateUserLimit);
    if (type === "public") await channel.setUserLimit(config.settings.publicUserLimit);

    // =========================
    // 🚀 SPOSTA UTENTE
    // =========================
    await member.voice.setChannel(channel);

  } catch (error) {
    console.error("Errore voiceStateUpdate:", error);
  }
}

module.exports = {
  voiceStateHandler,
  voiceOwners
};