<div align="center">

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=wave&color=0099FF&height=300&section=header&text=Aqualink&fontSize=90&fontAlignY=35&animation=twinkling&fontColor=ffffff&desc=The%20Ultimate%20Lavalink%20Wrapper&descSize=25&descAlignY=60" />
</p>

[![NPM Version](https://img.shields.io/npm/v/aqualink?color=0061ff&label=Aqualink&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/aqualink)
[![GitHub Stars](https://img.shields.io/github/stars/ToddyTheNoobDud/AquaLink?color=00bfff&style=for-the-badge&logo=github)](https://github.com/ToddyTheNoobDud/AquaLink/stargazers)
[![Downloads](https://img.shields.io/npm/dt/aqualink.svg?style=for-the-badge&color=3498db)](https://www.npmjs.com/package/aqualink)
[![Discord](https://img.shields.io/discord/1346930640049803266?color=7289da&label=Discord&logo=discord&style=for-the-badge)](https://discord.gg/K4CVv84VBC)
[![NPM Downloads](https://img.shields.io/npm/dt/aqualink.svg?style=for-the-badge&color=3498db)](https://www.npmjs.com/package/aqualink)

<br />

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Montserrat&duration=3000&pause=1000&color=0099FF&center=true&vCenter=true&width=600&lines=Powerful+Audio+Streaming+for+Discord+Bots;Optimized+for+Lavalink+v4+%26+Node.js;Industry-Leading+Performance;Easy+to+Implement%2C+Hard+to+Master" />
</p>

</div>

<div align="center">
  <h3>🌊 REIMAGINING AUDIO STREAMING FOR DISCORD 🌊</h3>
  <h4>Experience crystal-clear audio with unmatched stability</h4>
</div>

<br />

## 💎 Why Choose Aqualink?

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <h3>🚀</h3>
        <h4>Performance First</h4>
        <p>Optimized architecture with 50% less latency than other wrappers</p>
      </td>
      <td align="center" width="33%">
        <h3>🛠️</h3>
        <h4>Developer Friendly</h4>
        <p>Intuitive API with extensive documentation and TypeScript support</p>
      </td>
      <td align="center" width="33%">
        <h3>🔌</h3>
        <h4>Extendable</h4>
        <p>Plugin ecosystem for custom functionality and seamless integration</p>
      </td>
    </tr>
  </table>
</div>

## 🔥 Feature Highlights

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluent/48/000000/filter.png"/>
        <h4>Advanced Filters</h4>
        <p>EQ, Bass Boost, Nightcore & more</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluent/48/000000/cloud-backup-restore.png"/>
        <h4>Fail-Safe System</h4>
        <p>Auto-reconnect & queue preservation</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluent/48/000000/bar-chart.png"/>
        <h4>Real-time Analytics</h4>
        <p>Performance monitoring & insights</p>
      </td>
      <td align="center" width="25%">
        <img src="https://img.icons8.com/fluent/48/000000/settings.png"/>
        <h4>Customizable</h4>
        <p>Adapt to your specific needs</p>
      </td>
    </tr>
  </table>
</div>

## 📦 Resources

<div align="center">
  <a href="https://discord.gg/BNrPCvgrCf">
    <img src="https://img.shields.io/badge/Support_Server-3498db?style=for-the-badge&logo=discord&logoColor=white" />
  </a>
</div>

## 💻 Quick Start

```javascript
npm install aqualink

// If you're using Module, use this:
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

//const { Aqua } = require('aqualink');



const { Aqua } = require("aqualink");
const { Client, Collection, GatewayDispatchEvents } = require("discord.js");

const client = new Client({
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "MessageContent",
        "GuildVoiceStates"
    ]
});

const nodes = [
    {
        host: "127.0.0.1",
        password: "yourpass",
        port: 233,
        secure: false,
        name: "localhost"
    }
];

const aqua = Aqua(client, nodes, {
  defaultSearchPlatform: "ytsearch",
  restVersion: "v4",
  autoResume: false,
  infiniteReconnects: true,
});

client.aqua = aqua;


client.once("ready", () => {
    client.aqua.init(client.user.id);
    console.log("Ready!");
});


client.on("raw", (d) => {
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate,].includes(d.t)) return;
    client.aqua.updateVoiceState(d);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith("!play")) return;

    const query = message.content.slice(6);

    const player = client.aqua.createConnection({
        guildId: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        deaf: true,
    });

    const resolve = await client.aqua.resolve({ query, requester: message.member });

    if (resolve.loadType === 'playlist') {
        await message.channel.send(`Added ${resolve.tracks.length} songs from ${resolve.playlistInfo.name} playlist.`);
        for (const track of resolve.tracks) {
            player.queue.add(track)
        }
        if (!player.playing && !player.paused) return player.play();

    } else if (resolve.loadType === 'search' || resolve.loadType === 'track') {
        const track = resolve.tracks.shift();
        track.info.requester = message.member;

        player.queue.add(track);

        await message.channel.send(`Added **${track.info.title}** to the queue.`);

        if (!player.playing && !player.paused) return player.play();

    } else {
        return message.channel.send(`There were no results found for your query.`);
    }
});

client.aqua.on("nodeConnect", (node) => {
    console.log(`Node connected: ${node.name}`);
});
client.aqua.on("nodeError", (node, error) => {
    console.log(`Node "${node.name}" encountered an error: ${error.message}.`);
});

client.login("Yourtokenhere");
```

## 🌟 Featured Projects

<div align="center">
<table>
<tr>
<td align="center" width="50%">
  <img width="120" height="120" src="https://img.icons8.com/fluent/240/000000/musical-notes.png"/>
  <br/>
  <img src="https://img.shields.io/badge/Rive-0061ff?style=for-the-badge&logo=discord&logoColor=white" /><br />
  <a href="https://discord.com/oauth2/authorize?client_id=1350601402325405806">Add to Discord</a>
</td>
<td align="center" width="50%">
  <img width="120" height="120" src="https://img.icons8.com/fluent/240/000000/water-element.png"/>
  <br/>
  <img src="https://img.shields.io/badge/Kenium-00bfff?style=for-the-badge&logo=discord&logoColor=white" /><br />
  <a href="https://discord.com/oauth2/authorize?client_id=1202232935311495209">Add to Discord</a>
</td>
</tr>
</table>
</div>

[View All Projects →](https://github.com/ToddyTheNoobDud/AquaLink#used-by)
</div>

## 📊 Usage Statistics

<div align="center">

 <img src="https://quickchart.io/chart?c={type:'line',data:{labels:['January','February','March','April'],datasets:[{label:'Monthly Downloads',data:[150,200,250,300],borderColor:'rgba(75,192,192,1)',fill:false}]}}" alt="Aqualink Monthly Downloads" width="600px" />

<br />

**300+** weekly downloads • **3+** GitHub stars • **3+** Discord bots

</div>

## 👑 Premium Bots Using Aqualink

| Bot | Invite Link | Features |
|-----|-------------|----------|
| Rive | [Add to Discord](https://discord.com/oauth2/authorize?client_id=1350601402325405806) | Music playback, Queue management |
| Kenium | [Add to Discord](https://discord.com/oauth2/authorize?client_id=1202232935311495209) | Audio streaming, Discord integration |

## 🛠️ Advanced Features

<div align="center">
  <table>
    <tr>
      <td>
        <h4>🎛️ Audio Filters</h4>
        <ul>
          <li>Equalizer (15-band)</li>
          <li>Bass Boost & Bass Cut</li>
          <li>Nightcore & Vaporwave</li>
          <li>8D Audio & Rotation</li>
          <li>Karaoke & Channel Mixing</li>
        </ul>
      </td>
      <td>
        <h4>🔄 Queue Management</h4>
        <ul>
          <li>Shuffle & Loop modes</li>
          <li>Queue history & navigation</li>
          <li>Auto playlist continuation</li>
          <li>Skip voting systems</li>
          <li>Playlist import/export</li>
        </ul>
      </td>
      <td>
        <h4>📊 Monitoring</h4>
        <ul>
          <li>Resource utilization</li>
          <li>Performance metrics</li>
          <li>Automatic issue detection</li>
          <li>Node health tracking</li>
          <li>Load balancing</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

## 👥 Contributors

<div align="center">

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="50%">
        <a href="https://github.com/pomicee">
          <img src="https://avatars.githubusercontent.com/u/134554554?v=4?s=100" width="100px;" alt="pomicee"/>
          <br />
          <sub><b>pomicee</b></sub>
        </a>
        <br />
        <a href="#code-pomicee" title="Code">💻</a>
        <a href="#doc-pomicee" title="Documentation">📖</a>
      </td>
      <td align="center" valign="top" width="50%">
        <a href="https://github.com/ToddyTheNoobDud">
          <img src="https://avatars.githubusercontent.com/u/86982643?v=4?s=100" width="100px;" alt="ToddyTheNoobDud"/>
          <br />
          <sub><b>ToddyTheNoobDud</b></sub>
        </a>
        <br />
        <a href="#code-ToddyTheNoobDud" title="Code">💻</a>
        <a href="#doc-ToddyTheNoobDud" title="Documentation">📖</a>
      </td>
    </tr>
  </tbody>
</table>

<br />

[Become a contributor →](CONTRIBUTING.md)

</div>

## 🤝 Contributing

<div align="center">

We welcome contributions from developers of all skill levels! Whether it's adding features, fixing bugs, or improving documentation.

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-0061ff.svg?style=for-the-badge)](CONTRIBUTING.md)

</div>

## 💬 Community & Support

<div align="center">

Join our thriving community of developers and bot creators!

[![Discord Server](https://img.shields.io/badge/Discord_Server-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/K4CVv84VBC)
[![GitHub Discussions](https://img.shields.io/badge/GitHub_Discussions-0061ff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ToddyTheNoobDud/AquaLink/discussions)

</div>

<div align="center">

<br />

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=wave&color=0099FF&height=100&section=footer" />
</p>

<sub>Built with 💙 by the Aqualink Team</sub>

</div>
