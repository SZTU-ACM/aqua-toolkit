/* Trace module */

const data = {
  handle: null,
  startTimestamp: null,
  previousTimestamp: null,
  speed: 100,
  mode: 0,
  direction: 1
}

const start = (speed, silent)=>{
  // Check handle
  if (data.handle !== null) {
    return
  }

  // Initialize
  const body = document.body
  const topAnchor = document.querySelector('#rank-top')
  const header = document.querySelector('header')
  data.speed = Math.max(20, speed)

  // Start cruising
  const step = async (timestamp)=>{
    const delay = (tick)=>new Promise((res)=>setInterval(()=>res(), tick))

    // Startup
    if (data.startTimestamp === null) {
      data.startTimestamp = timestamp
      data.previousTimestamp = timestamp
    }

    // Scrolling
    const elapsed = timestamp - data.previousTimestamp
    if (data.previousTimestamp !== timestamp) {
      scrollTo(0, scrollY + elapsed / 1000.0 * data.speed * data.direction)
    }

    // If at edge
    if (data.mode === 0) {
      if (innerHeight + scrollY >= body.offsetHeight + header.getBoundingClientRect().height) {
        await delay(2000)
        scrollTo(0, scrollY + topAnchor.getBoundingClientRect().top)
        await delay(2000)
        timestamp += 4000
      }
    } else {
      if (data.direction === 1 && innerHeight + scrollY >= body.clientHeight + header.getBoundingClientRect().height) {
        await delay(2000)
        data.direction = -1
        timestamp += 2000
      } else if (data.direction === -1 && topAnchor.getBoundingClientRect().top > 0) {
        await delay(2000)
        data.direction = 1
        timestamp += 2000
      }
    }

    // Next loop
    data.previousTimestamp = timestamp
    data.handle = requestAnimationFrame(step)
  }
  data.handle = requestAnimationFrame(step)
}

const stop = (silent)=>{
  // Check handle
  if (data.handle !== null) {
    cancelAnimationFrame(data.handle)
    data.handle = null
    data.startTimestamp = null
    data.previousTimestamp = null
  }
}

const toggle = (silent)=>{
  // Check handle
  if (data.handle === null) {
    start(data.speed, silent)
    console.log('start cruise')
  } else {
    stop(silent)
    console.log('stop cruise')
  }
}

const speedUp = ()=>{
  // Check handle
  if (data.handle !== null) {
    data.speed += 20
  }
}

const speedDown = ()=>{
  // Check handle 
  if (data.handle !== null) {
    data.speed -= 20
    if (data.speed < 20) {
      data.speed = 20
    }
  }
}

const toggleMode = ()=>{
  if (data.mode === 0)
    data.mode = 1
  else
    data.mode = 0
  data.direction = 1
}

const getStatus = ()=>{
  return data.handle !== null
}

const getSpeed = ()=>{
  return data.speed
}

const cruise = {
  start,
  stop,
  toggle,
  speedUp,
  speedDown,
  toggleMode,
  getStatus,
  getSpeed
}

export default cruise
