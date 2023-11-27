// import { Controller} from '@main/controllers/multi-kill-clipper'; 
// const Controller = require('./src/main/controllers/multi-kill-clipper.js')

// const { Replay }        = require('./src/main/apis/replay.js');
// // const { makeRequest }       = require('./src/models/requests.js');
// const {makeRequest} = require("./src/main/models/replay-request.js")


// const c = Controller.getMultiKillMatches("stoopkidman", [1,2,3,4,5])
// console.log(c)

const { keyboard, Key, sleep } = require("@nut-tree/nut-js");
const { Replay } = require( "./src/main/apis/replay")
// const { makeRequest }       = require('./src/main/models/replay-request.js');
const {makeRequest} = require("./src/main/models/requests.js")
const LeagueClient = require("./src/main/apis/league-client.js")

const cameraLock = async (key) => {
	await keyboard.type(Key.S) // enable manual camera controls
	await keyboard.type(key)
	sleep(2000)
	await keyboard.type(key)
}




const main = async () => {

	const replay = new Replay()
	replay.init()
	// const p = await replay.getPlaybackProperties()


	const options = {
		interfaceTimeline : false,
		cameraAttached: true,
		selectionName: 'stoopkidman',
		cameraMode: 'fps',
		selectionOffset: {
			x: 0.0,
			y: 1911.85,
			z: -1200.0
		}
	}
	const resp = await replay.postRenderProperties(options);
	console.log(resp)
	// const render = await replay.getRenderProperties()
	// console.log(render)

	
	// console.log(curr)
	// for (const key of Object.keys(BlueSideCameraControlsByRole)){
	// 	const keyboardKey = BlueSideCameraControlsByRole[key]
	// 	console.log(`Locking onto role ${key}, using keyboard key ${keyboardKey}`)
	// 	await cameraLock(keyboardKey)
	// 	await sleep(5000)
	// }
	// for (const key of Object.keys(RedSideCameraControlsByRole)){
	// 	const keyboardKey = RedSideCameraControlsByRole[key]
	// 	console.log(`Locking onto role ${key}, using keyboard key ${keyboardKey}`)
	// 	await cameraLock(keyboardKey)
	// 	await sleep(5000)
	// }
}

main()




// check if we are in manual camera mode ?




// old code
async pressCameraLockKeyWithDelay(keyboardKey, delay=2000){
	/* Attempt to lock the camera onto a player by immitating the pressing of the provided keyboard key. */
	bringWindowToFocus(this.replay.pid)
	await keyboard.type(Key.S) // enable manual camera controls
	await keyboard.type(keyboardKey)
	await sleep(delay)
	await keyboard.type(keyboardKey)
}

async lockCamera(){
	const summonerName = this.MultiKillMatch.summonerName;
	const teamId = this.MultiKillMatch.teamId;
	const role = this.MultiKillMatch.role;
	let cameraControlsByRole;
	if(teamId == BLUE_SIDE_TEAM_ID) {
		cameraControlsByRole = BLUE_SIDE_CAMERA_CONTROLS_BY_ROLE
	} else {
		cameraControlsByRole = RED_SIDE_CAMERA_CONTROLS_BY_ROLE
	}
	// try locking onto the summoner using the role stated by the lcu api (sometimes this is incorrect)
	await this.pressCameraLockKeyWithDelay(cameraControlsByRole[role])
	let renderProperties = await this.replay.getRenderProperties();
	let selectedSummoner = renderProperties?.selectionName;
	let cameraAttached = renderProperties?.cameraAttached;
	let isAttachedToSummoner = ((selectedSummoner === summonerName) && cameraAttached)
	if (isAttachedToSummoner){
		return
	}
	// try all roles with varying delay times
	for (const role of Object.keys(cameraControlsByRole)) {
		const key = cameraControlsByRole[role]
		for (const delay of [1500, 2000, 2500, 3000, 5000, 9000]) {
			console.log(`Locking onto role ${role}, using keyboard key ${key}, with ${delay} ms delay`)
			await this.pressCameraLockKeyWithDelay(key, delay)
			renderProperties = await this.replay.getRenderProperties();
			console.log(renderProperties)
			selectedSummoner = renderProperties?.selectionName;
			cameraAttached = renderProperties?.cameraAttached;
			console.log(`${selectedSummoner} ==== ${cameraAttached}`)
			isAttachedToSummoner = ((selectedSummoner === summonerName) && cameraAttached)
			if (isAttachedToSummoner) break;
		}
		if (isAttachedToSummoner) break;  
	}
	if (!isAttachedToSummoner) {
		throw new CustomError(`Failed to attatch replay camera to summoner ${summonerName}`);
	}
}