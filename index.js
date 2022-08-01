const Discord = require('discord.js');
const { Song, Queue } = require('distube');
const Distube = require('distube')
const client = new Discord.Client({intents:[Discord.Intents.FLAGS.GUILD_MESSAGES,Discord.Intents.FLAGS.GUILDS,Discord.Intents.FLAGS.GUILD_VOICE_STATES]})
let DisTube = new Distube.DisTube(client,{
    searchSongs:3,
    searchCooldown:20,
    savePreviousSongs:true,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: false,
})
const db = require('quick.db');


client.on('ready',()=>{
    console.log(client.user.tag+'is Online Now')
})
let config = require('./config.json')

client.on('messageCreate',async(message)=>{
     
    let pref = db.get(`server_${message.guild.id}`)
    let prefix = pref||config.prefix
    
    const args = message.content.slice(config.prefix).trim().split(/ +/g);
    const command = args.shift();
   

    let queue = DisTube.getQueue(message)
    if(!message.member.voice.channel)return;
    if(message.content.toLowerCase() === prefix+"help"){
        message.author.send(`**
        Commands List: 

      >  \`Play \`: Play the song and add it to queue or resume it [p] 
      >  \`Pause \`: Pause the song  
      >  \`Resume \`: Resume the song 
      >  \`Queue \`: Displays the queue 
      >  \`Skip \`: Skip to the next song or any song in queue 
      >  \`Back \`: Back to the previous song 
      >  \`Volume \`: Change the volume [vol] 
      >  \`Nowplaying \`: Displays info about the song [np] 
      >  \`Clear \`: Remove the queue and stop the song 
      >  \`Clean \`: Clean bot message and any message related to the bot commands 
      >  \`Ping \`: Get the bot latency 
      >  \`Loop \`: Repeat the queue or the song 
      >  \`Shuffle \`: Shuffles the queue 
      >  \`Move \`: Move a song to the top of the queue or to specific position 
      >  \`Removeduplicate \`: Remove duplicate songs from queue 
      >  \`Leave \`: Leave the channel 
      >  \`Search \`: Search in Youtube 
      >  \`Seek \`: Change the position of the track or to specific time 
      >  \`Prefix \`: Displays the bot server prefix or change it 
      >  \`topmusic\` : Show Must hear music in your bot or server or Wsam Cloud 
        Wsam support server: https://discord.gg/T9q5YFePqK
        **`)
        message.react(`✅`)
    }
    if(message.content.toLowerCase().startsWith(prefix+"play")||message.content.toLowerCase().startsWith(prefix+"p")){
    
        DisTube.play(message.member.voice.channel,args.join(" "),{
            member:message.member,
            textChannel:message.channel,
            message:message
        })        
    }
    // play command
    if(message.content.toLowerCase() == prefix+"skip"){
        if(!queue)return;
        queue.skip(message)
    }
    if(message.content.toLowerCase() == prefix+"stop"){
        if(!queue)return ;
        queue.stop(message)
        message.react(`🤚`)
    }
    if(message.content.toLowerCase() == prefix+"pause"){
        if(!queue) return ; 
        queue.pause(message)
        message.react('⏸️')
    }
    if(message.content.toLowerCase() == prefix+"resume"){
        if(!queue)return ;
        queue.resume(message)
        message.react('▶️')
    }
    if(message.content.toLowerCase() == prefix+"back"){
        let s = db.get(`song_${message.guild.id}`)
        if(!s)return ; 
        DisTube.play(message.member.voice.channel,s,{
            member:message.member,
            textChannel:message.channel,
            message:message
        })
    }
    if(message.content.toLowerCase().startsWith(prefix+"volume") ||message.content.toLowerCase().startsWith(prefix+"vol") ){
        if(!queue)return ;
        
        let vol = queue.volume
        if(isNaN(args[0]))return message.reply(`Write Number Only`)
        message.channel.send(`🔉 Volume changed from \`${vol}\` to \`${args[0]}\`.`).then(
            DisTube.setVolume(message,Number(args[0]))
        )
    }
    if(message.content.toLowerCase() == prefix+"np"||message.content.toLowerCase()== prefix+"nowplaing"){
        let d = queue.songs.map((song, id) =>`**${id ? id : 'Playing'}**. ${ song.name} - \`${song.formattedDuration}\`, \`${queue.currentTime}\``,).slice(0, 1).join('\n')
        message.reply(`${d}`)
    }
    if(message.content.toLowerCase() == prefix+"clear"){
        queue.stop()
    }
    if(message.content.toLowerCase().startsWith(prefix+"clean")){
        message.channel.messages.cache.forEach(m=> {if(m.author.id === "948534326256103434"){ m.delete()} })
    }
        if(message.content.toLowerCase() == prefix+"ping"){
            message.reply(`${client.ws.ping}ws `)
        }
        if(message.content.toLowerCase().startsWith(prefix+"loop")){
            let array = ["on","off","queue","song"]
            if(!array.includes(args[0])||!args[0]){  
            let mode = null
            switch (args[0]) {
            case 'off':
                mode = 0
                break
            case 'song':
                mode = 1
                break
            case 'queue':
                mode = 2
                break
            }
            mode = queue.setRepeatMode(mode)
            mode = mode ? (mode === 2 ? 'Repeat queue' : 'Repeat song') : 'Off'
            message.channel.send(`> The ${queue.repeatMode} loop mode is on`)
            }else{
                let mod = null 
                if (args[0]){
                    if(args[0] == "off") mod = 0
                    if(args[0] =="on") mod = 1
                    if(args[0] == "song")mod = 1
                    if(args[0] =="queue")mod = 2
                    queue.setRepeatMode(args[0])
            message.reply(`> The ${queue.repeatMode} loop mode is on`)
                }
        }
        }
        if(message.content.toLowerCase() == prefix+"shuffle"){
            if(queue.songs == 0)return message.reply(`> **🎶 Nothing in queue!**`)
            if(queue.songs == 1)return message.reply(`**You only have one song in the queue!**`)
            queue.shuffle()
            message.react(`✅`)
        }
        if(message.content.toLowerCase().startsWith(prefix+"move")){
            DisTube.jump(message, parseInt(args[0]))
            .catch(err =>  message.react(`✅`));
            message.react(`✅`)
        }
        if(message.content.toLowerCase().startsWith(prefix+"search")){
            DisTube.play(message.member.voice.channel,args.join(" "),{
                member:message.member,
                textChannel:message.channel,
                message:message
            })
        }
        if(message.content.toLowerCase()==prefix+"leave"){
            message.guild.me.voice.disconnect()
        }
            if(message.content.toLowerCase().startsWith(prefix+"seek")){
                if (!args[0]) {
                    return message.react("❌")
                  }
                  const time = Number(args[0])
                  if (isNaN(time)) return message.react("❌")
                  queue.seek(time)
                  message.react("✅")
            }
            if(message.content.toLowerCase() == prefix+"topmusic"){
                let voicer = db.all().filter(data => data.ID.startsWith(`top_`)).sort((me1, me2) => me2.data - me1.data);
                var inner = "";
                var code = "";
                var i = 0;
                var e = 1;
                for (i in voicer) {
                  voicer.length = 5
                  inner += `#${e++} I[${voicer[i].ID.split(`_`)[1]}](https://youtube.${voicer[i].ID.split(`_url_,`)[1]}) \`x${voicer[i].data}\`\n`;
                }
                const embed = new Discord.MessageEmbed()
                .setTitle(`**Top 5 played music in Wsam cloud bots**`)
                .setDescription(`${inner}`)
                message.reply({embeds:[embed]})
            }
            if(message.content.toLowerCase().startsWith(prefix+"prefix")){
                let d = db.get(`server_${message.guild.id}`)
                if(!d) d = "!"
                if(!args[0])return message.reply(`The prefix for this bot is : ${d}`)
                db.set(`server_${message.guild.id}`,args[0])
                message.react('✅')
            }
})
const status = queue =>
    `Volume: \`${queue.volume}%\` | Filter: \`${
        queue.filters.join(', ') || 'Off'
    }\` | Loop: \`${
        queue.repeatMode
            ? queue.repeatMode === 2
                ? 'All Queue'
                : 'This Song'
            : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``
DisTube
    .on("addSong",(queue,song)=>{
    queue.textChannel.send(`:notes:**${song.name}** added to queue (${song.formattedDuration})!`)
    db.set(`song_${queue.textChannel.guild.id}`,song.name)
    db.add(`top_${song.name}_url_${song.url.split("https://www.youtube.")}`,1)
    })
    .on('searchResult', (message, result) => {
        let i = 0
        message.channel.send(
            `**Choose an option from below**\n${result
                .map(
                    song =>
                        `**${++i}**. ${song.name} - \`${
                            song.formattedDuration
                        }\``,
                )
                .join(
                    '\n',
                )}\n*Enter anything else or wait 20 seconds to cancel*`,
        )
    })
    .on('searchCancel', message =>
        message.channel.send('Searching canceled'),
    )
    .on('searchInvalidAnswer', message =>
        message.channel.send('Invalid number of result.'),
    )
    .on('searchNoResult', message =>
        message.channel.send('No result found!'),
    )
    .on('searchDone', () => {})
client.login(config.token)
