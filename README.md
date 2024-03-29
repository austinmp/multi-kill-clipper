<p align="center">
  <a href="https://austinmp.github.io/multi-kill-clipper/">
    <img align="center" src="https://user-images.githubusercontent.com/48191538/120049047-ce551d80-bfe6-11eb-9795-6e2722aa0e7a.png"       height="120">
  </a>
  <h3 align="center">Multi Kill Clipper</h3>
  <p align="center" width="50%">A League of Legends companion app built on Electron. </p>
</p>

## About
* Multi-Kill Clipper allows you to easily create clips of multi-kills earned by you or any other player within your region.
* The app makes calls to Riot's in game API through a running instance of the League of Legends client.
* With your League client running, enter the summoner name of any player within your client's region.
* Select the types of multi-kills you would like Multi-Kill Clipper to detect (first blood, double, triple, quadra, or penta kills).
* Multi-Kill Clipper will automatically download, launch, and record the entire kill sequence using the Replay API, saving the video to your League of Legends Highlights folder.

![previewImage](https://github.com/austinmp/multi-kill-clipper/assets/48191538/10a0ff6a-8b46-483f-8d2f-b11a781ff14b)

## Prerequisites
* You must have the League of Legends client installed on your computer and running while using the app.
* You must enable the Replay API in the game client config, it is disabled by default. This can be done by following the following steps, which are also listed on the [Riot Developer Portal](https://developer.riotgames.com/docs/lol#game-client-api_replay-api)

    >       1. Locate where your game is installed. 
    >
    >           Example file location:
    >
    >           C:\Riot Games\League of Legends\Config\game.cfg
    >
    >       2. Make sure the following lines are included in your game.cfg file:
    >
    >           [General]
    >
    >           EnableReplayApi=1
    >
    >       If the option is already listed, make sure that the valuse is set to 1.
    >       If the option is not listed at all just add it to the bottom of the list.
    >       You will need to restart the replay after changing this value for it to take effect.
    
## Download
* [Windows x64](https://github.com/austinmp/multi-kill-clipper/releases/download/v2.0/Multi.Kill.Clipper.exe)

## Demo
https://user-images.githubusercontent.com/48191538/119200669-61c4a680-ba5b-11eb-9e10-6a5106f9ec76.mp4
## Planned Features
* A queue system for clipping more than one multi-kill at a time.
* Configurable replay settings (fps, resolution, format, etc.).
* Tracking of previously clipped multi-kills to prevent duplicate searches.

## Feedback & Support
* [Submit a Bug Report](https://github.com/austinmp/multi-kill-clipper/issues/new/choose)
* [Submit a Question](https://github.com/austinmp/multi-kill-clipper/discussions/categories/general)
* [Submit a Feature Request](https://github.com/austinmp/multi-kill-clipper/discussions/categories/ideas)
