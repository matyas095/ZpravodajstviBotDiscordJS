// Imports
const { 
    joinVoiceChannel,
    getVoiceConnection,
    generateDependencyReport,
    entersState,
    createAudioPlayer,
    createAudioResource,

    VoiceConnectionStatus,
    AudioPlayerStatus
} = require('@discordjs/voice');
const ytdl = require("ytdl-core"); //require("ytdl-core-discord");
const fs = require("fs");
const path = require("path");
//const play = require('../commands/sound/play');

const pathToCache = path.join(__dirname, "modules/song/cache");

module.exports = class SongPlayer {
    constructor(client) {
        this.client = client;

        this.queue = [];

        const files = fs.readdirSync(pathToCache)
                    .filter(file => file.endsWith('.mp3'));

        for(const file of files) {
            this.deleteFile(path.join(pathToCache, file));
        };
    };

    joinChannel(channelObj) {
        const connection = this.connection = joinVoiceChannel({
            channelId: channelObj.channel.id,
            guildId: channelObj.guild.id,
            adapterCreator: channelObj.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, async() => {
            this.playSongInQueue();
        });
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                player.stop();
                connection.destroy();
            }
        });

        return connection;
    };

    pushQueue(link) {
        this.queue.push(link);
    };

    async playSongInQueue() {
        const [song, fileFS] = await this.createSongFile(this.queue[0]);

        fileFS.on("finish", () => {
            this.player.play(createAudioResource(path.join(pathToCache, `${song.videoDetails.videoId}.mp3`)));
            this.currentTrack = song;
        });

        this.queue.shift();
    };

    deleteFile(pathing) {
        fs.unlinkSync(pathing);
    };

    createSongPlayer() {
        const player = this.player = createAudioPlayer();

        player.on(AudioPlayerStatus.Idle, async() => {
            this.deleteFile(createAudioResource(path.join(pathToCache, `${this.currentTrack.videoDetails.videoId}.mp3`)));

            this.playSongInQueue();
        });

        return player;
    };

    async createSongFile(url) {
        const info = await ytdl.getBasicInfo(url);

        return [info, await ytdl(url, { filter: "audioonly" })
            .pipe(fs.createWriteStream(path.join(pathToCache, `${info.videoDetails.videoId}.mp3`)))];
    }

    subscribe(ev) {
        this.connection.subscribe(ev);
    };
};