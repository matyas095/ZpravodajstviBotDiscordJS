// Imports
const { Events, ActivityType } = require('discord.js');

// Services
const user_service = global.pathFinderOfService("user_service");
const { UsersRepository } = require(global.returnPathToService("postgres_service")).repositories;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(msg) {
        if (msg.author.bot) return;

        if(!global.registeredUsers.includes(msg.author.id)) await user_service.registerUser(msg.author.id);

        const userTable = await UsersRepository.find()
                                               .userId(msg.author.id)
                                               .execute();

        if(userTable.length == 0) return;
        const out = UsersRepository.setColumn({
            COLUMN: "chat_xp",
            VALUE: userTable.chatXp.get() + 1
        }, {
            COLUMN: "user_id",
            VALUE: msg.author.id
        });

        if(!msg.member.botOwner) if(msg.author.id != "409422082611347457") return;
        let cmd = args.shift().toLowerCase();
        if(cmd = "eval") {
            const prefix = "!";
            let args = msg.content
                .slice(prefix.length)
                .trim()
                .split(/ +/g);
            if(!args[0]) return msg.reply("Mat provide arguments.")
            try {
                const code = args.join(" ");
                let evaled = eval(code);

                if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
            } catch (err) {
                msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
            }
        }
    },
};