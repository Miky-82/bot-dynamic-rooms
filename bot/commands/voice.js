const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { voiceOwners } = require("../events/voiceStateUpdate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Controlla la tua stanza vocale")

    .addSubcommand(sub =>
      sub.setName("lock").setDescription("Blocca la stanza")
    )

    .addSubcommand(sub =>
      sub.setName("unlock").setDescription("Sblocca la stanza")
    )

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
      sub.setName("permit")
        .setDescription("Permetti accesso a un utente")
        .addUserOption(option =>
          option.setName("utente")
            .setDescription("Utente da autorizzare")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub.setName("kick")
        .setDescription("Espelli un utente dalla stanza")
        .addUserOption(option =>
          option.setName("utente")
            .setDescription("Utente da espellere")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub.setName("claim")
        .setDescription("Prendi possesso della stanza")
    )

    .addSubcommand(sub =>
      sub.setName("info")
        .setDescription("Info sulla stanza")
    ),

  async execute(interaction) {

    const sub = interaction.options.getSubcommand();
    const member = interaction.member;
    const channel = member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: "❌ Devi essere in una stanza vocale.",
        ephemeral: true
      });
    }

    const ownerId = voiceOwners.get(channel.id);

    // =========================
    // 👑 CLAIM (prima dei controlli)
    // =========================
    if (sub === "claim") {

      if (!ownerId) {
        return interaction.reply({
          content: "❌ Stanza non gestita dal bot.",
          ephemeral: true
        });
      }

      const ownerStillInside = channel.members.has(ownerId);

      if (ownerStillInside) {
        return interaction.reply({
          content: "❌ Il proprietario è ancora dentro.",
          ephemeral: true
        });
      }

      voiceOwners.set(channel.id, interaction.user.id);

      return interaction.reply(`👑 Ora sei il proprietario della stanza.`);
    }

    // =========================
    // 🔒 CONTROLLI OWNER
    // =========================
    if (
      interaction.user.id !== ownerId &&
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: "❌ Non sei il proprietario della stanza.",
        ephemeral: true
      });
    }

    // =========================
    // 🔒 LOCK
    // =========================
    if (sub === "lock") {
      await channel.permissionOverwrites.edit(interaction.guild.id, {
        Connect: false
      });
      return interaction.reply("🔒 Stanza bloccata.");
    }

    // =========================
    // 🔓 UNLOCK
    // =========================
    if (sub === "unlock") {
      await channel.permissionOverwrites.edit(interaction.guild.id, {
        Connect: true
      });
      return interaction.reply("🔓 Stanza sbloccata.");
    }

    // =========================
    // 👥 LIMIT
    // =========================
    if (sub === "limit") {
      const limit = interaction.options.getInteger("numero");

      if (limit < 0 || limit > 99) {
        return interaction.reply({
          content: "❌ Il limite deve essere tra 0 e 99.",
          ephemeral: true
        });
      }

      await channel.setUserLimit(limit);
      return interaction.reply(`👥 Limite utenti impostato a ${limit}`);
    }

    // =========================
    // ✏️ RENAME
    // =========================
    if (sub === "rename") {
      const name = interaction.options.getString("nome");

      if (name.length > 100) {
        return interaction.reply({
          content: "❌ Nome troppo lungo.",
          ephemeral: true
        });
      }

      await channel.setName(name);
      return interaction.reply(`✏️ Nome stanza cambiato in **${name}**`);
    }

    // =========================
    // ✅ PERMIT
    // =========================
    if (sub === "permit") {
      const target = interaction.options.getUser("utente");
      const targetMember = interaction.guild.members.cache.get(target.id);

      if (!targetMember) {
        return interaction.reply({
          content: "❌ Utente non trovato.",
          ephemeral: true
        });
      }

      await channel.permissionOverwrites.edit(target.id, {
        Connect: true
      });

      return interaction.reply(`✅ ${target.username} può entrare.`);
    }

    // =========================
    // 👢 KICK
    // =========================
    if (sub === "kick") {
      const target = interaction.options.getUser("utente");
      const targetMember = interaction.guild.members.cache.get(target.id);

      if (!targetMember || !targetMember.voice.channel || targetMember.voice.channel.id !== channel.id) {
        return interaction.reply({
          content: "❌ L'utente non è nella tua stanza.",
          ephemeral: true
        });
      }

      await targetMember.voice.disconnect();

      return interaction.reply(`👢 ${target.username} è stato espulso dalla stanza.`);
    }

    // =========================
    // ℹ️ INFO
    // =========================
    if (sub === "info") {

      const owner = ownerId ? `<@${ownerId}>` : "Nessuno";
      const users = channel.members.size;
      const limit = channel.userLimit || "∞";

      return interaction.reply(
        `📊 **Info stanza**
👑 Owner: ${owner}
👥 Utenti: ${users}/${limit}
🔊 Nome: ${channel.name}`
      );
    }

  }
};