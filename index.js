const YUMMY = 1, AWFUL = 0
const FRUIT_ADDING_INTERVAL = 1000
const FRUIT_MOVING_INTERVAL = 50
const FRUIT_MOVING_SPEED = 10
const MY_MOVING_SPEED = 10

// game area
var main

// store fruit objects ids
const fruitBucket = new Map();

// height and width of game area
var GAME_HEIGHT, GAME_WIDTH, OFFSET_TOP, OFFSET_LEFT

var myPoint = 0

const PLAYER_ID = 'me'
var playerInfo = {}
var playerPosX

var gameIntervalId

window.onload = function(){
    initGame()

    window.onresize = windowSize;
}

function windowSize() {
    initGame()
}
  
const initGame = () => {
    // start listen even
    document.onkeydown = onKeyDown

    // init game size
    GAME_HEIGHT = 500
    let bodyRect = document.body.getBoundingClientRect()
    GAME_WIDTH = bodyRect.width

    main = document.getElementById('main')
    let rect = main.getBoundingClientRect()

    OFFSET_TOP = rect.top
    OFFSET_LEFT = rect.left

    // set game box size
    main.style.height = "".concat(GAME_HEIGHT, "px")
    main.style.width = "".concat(GAME_WIDTH, "px")

    // control panel
    let controlPanel = document.getElementById('control-panel')
    controlPanel.style.width = "".concat(GAME_WIDTH, "px")

    // init player
    setPlayer()
}

const setPlayer = () => {
    // remove if existed
    let playerElement = document.getElementById(PLAYER_ID)
    if (playerElement) playerElement.remove()

    let player = document.createElement('div')
    player.id = PLAYER_ID
    player.className = 'player'
    player.style.top = "".concat(GAME_HEIGHT + OFFSET_TOP - 70, "px")
    player.style.left = "".concat(GAME_WIDTH / 2, "px")

    main.append(player)

    playerPosX = GAME_WIDTH / 2 + 10
}

const startGame = () => {
    // reset my point
    myPoint = 0
    let pointElmt = document.getElementById('my-point')
    pointElmt.innerHTML = myPoint

    gameIntervalId = setInterval(gameInterval, FRUIT_ADDING_INTERVAL)

    // change button start -> stop
    let startBtn = document.getElementById('startBtn')
    startBtn.setAttribute("value", "Stop")
    startBtn.setAttribute("onclick", "stopGame()")

    // init and show pause button
    let pauseBtn = document.getElementById('pauseBtn')
    pauseBtn.setAttribute("value", "Pause");
    pauseBtn.setAttribute("onclick", "pauseGame()");
    pauseBtn.style.display = "inline"

    // effect sound
    effectSound('press-button-audio')
}

const stopGame = () => {
    fruitBucket.forEach((fruitInfo, fruitId) => {
        clearInterval(fruitInfo.intervalId)

        let fruitElement = document.getElementById(fruitId)
        fruitElement.remove()
    })
    fruitBucket.clear()

    clearInterval(gameIntervalId)

    // change button stop -> start
    let startBtn = document.getElementById('startBtn')
    startBtn.setAttribute("value", "Start");
    startBtn.setAttribute("onclick", "startGame()");

    // hide pause button
    let pauseBtn = document.getElementById('pauseBtn')
    pauseBtn.style.display = "none"

    // effect sound
    effectSound('press-button-audio')
}

const pauseGame = () => {
    fruitBucket.forEach((fruitInfo, fruitId) => {
        clearInterval(fruitInfo.intervalId)
    })

    clearInterval(gameIntervalId)

    // change button Pause -> Resume
    let pauseBtn = document.getElementById('pauseBtn')
    pauseBtn.setAttribute("value", "Resume");
    pauseBtn.setAttribute("onclick", "resumeGame()");

    // effect sound
    effectSound('press-button-audio')
}

const resumeGame = () => {
    fruitBucket.forEach((fruitInfo, fruitId) => {
        // TODO
        fruitInfo.intervalId = setInterval(moveFruit, FRUIT_MOVING_INTERVAL, fruitId)

        fruitBucket.set(fruitId, fruitInfo)
        // console.log("fruitIntervalMap size : ", fruitIntervalMap.size)
    })

    gameIntervalId = setInterval(gameInterval, FRUIT_ADDING_INTERVAL)

    // change button Resume -> Pause
    let pauseBtn = document.getElementById('pauseBtn')
    pauseBtn.setAttribute("value", "Pause");
    pauseBtn.setAttribute("onclick", "pauseGame()");

    // effect sound
    effectSound('press-button-audio')
}

const gameInterval = () => {
    let fruitId = "f-" + crypto.randomUUID()
    // console.log("fruitId : ", fruitId)

    initAFruit(fruitId)

    let intervalId = setInterval(moveFruit, FRUIT_MOVING_INTERVAL, fruitId)

    
    let fruitInfo = {
                        "intervalId": intervalId,
                    }
    fruitBucket.set(fruitId, fruitInfo)
    // console.log("fruitIntervalMap size : ", fruitIntervalMap.size)
}

const initAFruit = (fruitId) => {
    let aFruit = document.createElement('div')
    aFruit.id = fruitId
    aFruit.className = 'fruit'

    initRandomPosition(aFruit)

    main.append(aFruit)
}

const initRandomPosition = (element) => {
    let top = getRandomInt(GAME_HEIGHT)
    element.style.top = "".concat(top + OFFSET_TOP, "px")
    element.style.left = "".concat(0 + OFFSET_LEFT, "px")
}

const gameOver = () => {
    effectSound('game-over-audio')

    stopGame()
}

const moveFruit = (fruitId) => {
    let fruitElement = document.getElementById(fruitId)
    let fruitRect = fruitElement.getBoundingClientRect()
    let left = fruitRect.left
    let fruitInfo = fruitBucket.get(fruitId)

    // if fruit kiss me
    if (hitPlayer(fruitId)) {
        clearInterval(fruitInfo.intervalId)

        // GAME OVER
        gameOver()
        return
    } 

    // distroy elemet if it get max left
    if (left > (GAME_WIDTH + OFFSET_LEFT)) {
        clearInterval(fruitInfo.intervalId)
        
        fruitElement.remove()
        fruitBucket.delete(fruitId)

        return
    }

    fruitElement.style.left = "".concat(left + FRUIT_MOVING_SPEED, "px")

    // check position to get point
    validatePoint(left)
}

const hitPlayer = (fruitId) => {
    let fruitElement = document.getElementById(fruitId)

    let player = document.getElementById(PLAYER_ID)
    let playerRect = player.getBoundingClientRect()
    let fruitRect = fruitElement.getBoundingClientRect()

    if (
        fruitRect.left > (playerRect.left - fruitRect.width) &&
        fruitRect.left < (playerRect.left + fruitRect.width/2) &&
        fruitRect.top > (playerRect.top - fruitRect.height/2) &&
        fruitRect.top < (playerRect.top - fruitRect.height/2 + playerRect.height)
    ) {
        return true
    }

    return false
}

const validatePoint = (postX) => {
    if (
        postX < playerPosX &&
        (postX + FRUIT_MOVING_SPEED)  > playerPosX
    ) {
        // got point
        myPoint += 1
        console.log("myPoint: ", myPoint)

        let pointElmt = document.getElementById('my-point')
        pointElmt.innerHTML = myPoint
    }
}

function onKeyDown(e) {
    e = e || window.event;

    if (e.keyCode == '32') {
        onClick()
    }
}

const PLAYER_JUMP_INTERVAL = 100
function onClick(e) {
    // console.log("clicked")
    effectSound('jump-audio')

    if (playerInfo.intervalId) {
        clearInterval(playerInfo.intervalId)
    }

    playerInfo.intervalId = setInterval(playerJumpUp, PLAYER_JUMP_INTERVAL)
    playerInfo.upSpeed = 30
}

function playerJumpUp() {
    console.log("up interval")

    if (playerInfo.upSpeed <= 0) {
        if (playerInfo.intervalId) {
            clearInterval(playerInfo.intervalId)
        }

        playerInfo.downSpeed = 2
        playerInfo.intervalId = setInterval(playerFallDown, PLAYER_FALL_INTERVAL)
    }

    let player = document.getElementById(PLAYER_ID)
    let playerRect = player.getBoundingClientRect()

    let top = playerRect.top - playerInfo.upSpeed
    playerInfo.upSpeed -= 5

    if (top < OFFSET_TOP) {
        top = OFFSET_TOP
        playerInfo.upSpeed = 0
    }

    player.style.top = top + "px"
}

const PLAYER_FALL_INTERVAL = 100

function playerFallDown() {
    console.log("down interval")

    let player = document.getElementById(PLAYER_ID)
    let playerRect = player.getBoundingClientRect()
    let maxTop = (GAME_HEIGHT + OFFSET_TOP) - playerRect.height
    let top = playerRect.top + playerInfo.downSpeed

    playerInfo.downSpeed *= 1.2

    if (top >= maxTop) {
        top = maxTop

        if (playerInfo.intervalId) {
            clearInterval(playerInfo.intervalId)
        }
    }

    player.style.top = top + "px"
}

const effectSound = (audioElementId) => {
    let audio = document.getElementById(audioElementId)
    audio.currentTime = 0
    audio.play()
}

// common functions
const getRandomInt = (max) => Math.floor(Math.random() * max)