import Replay from "./main/app/apis/replay";


async function test() {
  console.log("starting...")
  const r = new Replay();
  const pp = await r.getPlaybackProperties();
  // const t = await r.getProcessId()
  console.log(pp)
  // console.log(t)
  // console.log("done")

}

test()
