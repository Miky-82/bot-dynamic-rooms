const {
    ChannelType,
    PermissionsBitField
} = require("discord.js");

const voiceOwners = new Map();
const deleteTimers = new Map();

async function voiceStateHandler(oldState, newState, client) {

    const guild = newState.guild || oldState.guild;

    const triggerChannelId = "1478101543143211180"; // metti qui l'id della stanza trigger
    const categoryName = "🎙️ LIVE ROOMS";

    try {

        // quando un utente entra nel trigger
        if (newState.channelId === triggerChannelId) {

            const member = newState.member;

            // trova o crea la categoria
            let category = guild.channels.cache.find(
                c => c.name === categoryName && c.type === ChannelType.GuildCategory
            );

            if (!category) {
                category = await guild.channels.create({
                    name: categoryName,
                    type: ChannelType.GuildCategory
                });
            }

            // crea la stanza
            const channel = await guild.channels.create({
                name: `🔴 ${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
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

            // salva owner stanza
            voiceOwners.set(channel.id, member.id);

            // sposta utente
            await member.voice.setChannel(channel);
        }

        // gestione uscita utente da stanza
        if (oldState.channel && oldState.channel.members.size === 0) {

            const channel = oldState.channel;

            if (voiceOwners.has(channel.id)) {

                const timer = setTimeout(async () => {

                    try {
                        await channel.delete();
                        voiceOwners.delete(channel.id);
                        deleteTimers.delete(channel.id);
                    } catch (err) {
                        console.error("Errore cancellazione stanza:", err);
                    }

                }, 10000); // 10 secondi

                deleteTimers.set(channel.id, timer);
            }
        }

        // se qualcuno rientra nella stanza annulla il timer
        if (newState.channel && deleteTimers.has(newState.channel.id)) {

            clearTimeout(deleteTimers.get(newState.channel.id));
            deleteTimers.delete(newState.channel.id);

        }

    } catch (error) {
        console.error("Errore voiceStateUpdate:", error);
    }
}

module.exports = voiceStateHandler;
module.exports.voiceOwners = voiceOwners;