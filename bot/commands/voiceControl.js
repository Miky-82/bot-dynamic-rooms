const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Controlla la tua stanza vocale")

    .addSubcommand(sub => sub.setName("lock").setDescription("Blocca la stanza"))
    .addSubcommand(sub => sub.setName("unlock").setDescription("Sblocca la stanza"))
    .addSubcommand(sub => sub.setName("hide").setDescription("Nasconde la stanza"))
    .addSubcommand(sub => sub.setName("show").setDescription("Rende visibile la stanza"))
    .addSubcommand(sub => sub.setName("claim").setDescription("Diventa proprietario"))

    .addSubcommand(sub =>
      sub.setName("limit")
        .setDescription("Imposta limite utenti")
        .addIntegerOption(option =>
          option.setName("numero")
            .setDescription("Numero massimo utenti")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub.setName("rename")
        .setDescription("Rinomina la stanza")
        .addStringOption(option =>
          option.setName("nome")
            .setDescription("Nuovo nome")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub.setName("kick")
        .setDescription("Espelli utente")
        .addUserOption(option =>
          option.setName("utente")
            .setDescription("Utente da espellere")
            .setRequired(true)
        )
    ),

  async execute(interaction, voiceOwners) {

    const sub = interaction.options.getSubcommand();
    const member = interaction.member;
    const channel = member.voice.channel;

    if (!channel) {
      return interaction.reply({ content: "❌ Devi essere in una stanza vocale.", ephemeral: true });
    }

    const ownerId = voiceOwners.get(channel.id);

    // CLAIM
    if (sub === "claim") {
      if (!ownerId) {
        return interaction.reply({ content: "❌ Stanza non gestita.", ephemeral: true });
      }

      if (channel.members.has(ownerId)) {
        return interaction.reply({ content: "❌ Il proprietario è ancora dentro.", ephemeral: true });
      }

      voiceOwners.set(channel.id, interaction.user.id);
      return interaction.reply(`👑 ${interaction.user.username} ora è il proprietario.`);
    }

    // CONTROLLO OWNER
    if (
      interaction.user.id !== ownerId &&
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({ content: "❌ Non sei il proprietario.", ephemeral: true });
    }

    // LOCK
    if (sub === "lock") {
      await channel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
      return interaction.reply("🔒 Stanza bloccata.");
    }

    // UNLOCK
    if (sub === "unlock") {
      await channel.permissionOverwrites.edit(interaction.guild.id, { Connect: true });
      return interaction.reply("🔓 Stanza sbloccata.");
    }

    // HIDE
    if (sub === "hide") {
      await channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
      return interaction.reply("🙈 Stanza nascosta.");
    }

    // SHOW
    if (sub === "show") {
      await channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: true });
      return interaction.reply("👀 Stanza visibile.");
    }

    // LIMIT
    if (sub === "limit") {
      const limit = interaction.options.getInteger("numero");

      if (limit < 0 || limit > 99) {
        return interaction.reply({ content: "❌ Limite 0-99.", ephemeral: true });
      }

      await channel.setUserLimit(limit);
      return interaction.reply(`👥 Limite impostato a ${limit}`);
    }

    // RENAME
    if (sub === "rename") {
      const name = interaction.options.getString("nome");

      if (name.length > 100) {
        return interaction.reply({ content: "❌ Nome troppo lungo.", ephemeral: true });
      }

      await channel.setName(name);
      return interaction.reply(`✏️ Rinominata in ${name}`);
    }

    // KICK
    if (sub === "kick") {
      const user = interaction.options.getMember("utente");

      if (!user.voice.channel || user.voice.channel.id !== channel.id) {
        return interaction.reply({ content: "❌ Utente non nella stanza.", ephemeral: true });
      }

      await user.voice.disconnect();
      return interaction.reply(`👢 ${user.user.username} espulso.`);
    }

  }

};