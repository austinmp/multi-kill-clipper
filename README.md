# Multi-Kill Clipper
A desktop application built for League of Legends players that allows you to easily create clips of multi-kills earned by you or any other player within your region.

* Multi-Kill Clipper works by making calls to Riot's API through a running instance of the League of Legends client.
* Enter the summoner name of any player within your client's region.
* Select the types of multi-kills you would like Multi-Kill Clipper to detect (first blood, double, triple, quadra, or penta kills).
* Multi-Kill Clipper will automatically download, launch, and record the entire kill sequence using the Replay API, saving the video to your League of Legends Highlights folder.

## Prerequisites
* You must have the League of Legends client installed on your computer and running while using the app.
* You must enable the Replay API in the game client config, it is disabled by default. This can be done by following the following steps, which are also listed on the [Riot Developer Portal](https://developer.riotgames.com/docs/lol#game-client-api_replay-api)

    >       1. Locate where your game is installed. 
    >
    >           Example file location:
    >
    >           C:\Riot Games\League of Legends\Config\game.cfg
    >
    >       2. Add the following lines to the game.cfg file:
    >
    >           [General]
    >
    >           EnableReplayApi=1
    >
    >       If the option is already listed, make sure that the valuse is set to 1.
    >       If the option is not listed at all just add it to the bottom of the list.
    >       You will need to restart the replay after changing this value for it to take effect.
    
## Download
## Demo
## Planned Features
* A queue system for clipping more than one multi-kill at a time.
* Configurable replay settings (fps, resolution, format, etc.).

If you have any requests of your own, please feel free to submit them. 

## Misc
If you found this app helpful or cool and you're feeling generous, feel free to buy me a beer 🍻.
