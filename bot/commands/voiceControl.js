const { PermissionFlagsBits } = require('discord.js');

module.exports = {

  name: "voice",

  async execute(interaction, voiceOwners) {

    const sub = interaction.options.getSubcommand();
    const member = interaction.member;
    const channel = member.voice.channel;

    if (!channel) {
      return interaction.reply({ content: "❌ Devi essere in una stanza vocale.", ephemeral: true });
    }

    const owner = voiceOwners.get(channel.id);

    if (owner !== member.id) {
      return interaction.reply({ content: "❌ Non sei il proprietario della stanza.", ephemeral: true });
    }

    // LOCK
    if (sub === "lock") {

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        Connect: false
      });

      return interaction.reply("🔒 Stanza bloccata.");

    }

    // UNLOCK
    if (sub === "unlock") {

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        Connect: true
      });

      return interaction.reply("🔓 Stanza sbloccata.");

    }

    // RENAME
    if (sub === "rename") {

      const name = interaction.options.getString("nome");

      await channel.setName(name);

      return interaction.reply("✏️ Nome stanza aggiornato.");

    }

  }

};