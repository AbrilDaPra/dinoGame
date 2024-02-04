// GAME LOOP

let time = new Date();
let deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

// GAME LOGIC
let floorY = 22;
let velY = 0;
let impulse = 900;
let gravity = 2500;

let dinoPosX = 42;
let dinoPosY = sueloY; 

let floorX = 0;
let velScenary = 1280/3;
let gameVel = 1;
let score = 0;

let standing = false;
let jumping = false;

let timeToObstacle = 2;
let timeObstacleMin = 0.7;
let timeObstacleMax = 1.8;
let obstaclePosY = 16;
let obstacles = [];

let timeToCloud = 0.5;
let timeCloudMin = 0.7;
let timeCloudMax = 2.7;
let maxCloudY = 270;
let minCloudY = 100;
let clouds = [];
let velCloud = 0.5;

let container;
let dino;
let textScore;
let floor;
var gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    floor = document.querySelector(".floor");
    container = document.querySelector(".container");
    textScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown);
}


function Update() {
    if(standing) return;
    
    MoveDinosaur();
    MoveFloor();
    DecideToCreateObstacle();
    DecideToCreateCloud();
    MoveObstacle();
    MoveClouds();
    DetecteCollision();

    velY -= gravity * deltaTime;
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){
        Jump();
    }
}

function Jump(){
    if(dinoPosY === floorY){
        jumping = true;
        velY = impulse;
        dino.classList.remove("dino-running");
    }
}

function MoveDinosaur() {
    dinoPosY += velY * deltaTime;
    if(dinoPosY < floorY){
        
        TouchFloor();
    }
    dino.style.bottom = dinoPosY+"px";
}

function TouchFloor() {
    dinoPosY = floorY;
    velY = 0;
    if(jumping){
        dino.classList.add("dino-running");
    }
    jumping = false;
}

function MoveFloor() {
    floorX += CalculateDisplacement();
    floor.style.left = -(floorX % container.clientWidth) + "px";
}

function CalculateDisplacement() {
    return velScenary * deltaTime * gameVel;
}

function Crash() {
    dino.classList.remove("dino-running");
    dino.classList.add("dino-crush");
    standing = true;
}

function DecideToCreateObstacle() {
    timeToObstacle -= deltaTime;
    if(timeToObstacle <= 0) {
        CreateObstacle();
    }
}

function DecideToCreateCloud() {
    timeToCloud -= deltaTime;
    if(timeToCloud <= 0) {
        CreateCloud();
    }
}

function CreateObstacle() {
    let obstacle = document.createElement("div");
    container.appendChild(obstacle);
    obstacle.classList.add("cactus");
    if(Math.random() > 0.5) obstacle.classList.add("cactus2");
    obstacle.posX = container.clientWidth;
    obstacle.style.left = container.clientWidth+"px";

    obstacle.push(obstacle);
    timeToObstacle = timeObstacleMin + Math.random() * (timeObstacleMax-timeObstacleMin) / gameVel;
}

function CreateCloud() {
    let cloud = document.createElement("div");
    container.appendChild(cloud);
    cloud.classList.add("cloud");
    cloud.posX = container.clientWidth;
    cloud.style.left = container.clientWidth+"px";
    cloud.style.bottom = minCloudY + Math.random() * (maxCloudY-minCloudY)+"px";
    
    clouds.push(cloud);
    timeToCloud = timeCloudMin + Math.random() * (timeCloudMax-timeCloudMin) / gameVel;
}

function MoveObstacle() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if(obstacles[i].posX < -obstacles[i].clientWidth) {
            obstacles[i].parentNode.removeChild(obstacles[i]);
            obstacles.splice(i, 1);
            WinPoints();
        }else{
            obstacles[i].posX -= CalculateDisplacement();
            obstacles[i].style.left = obstacles[i].posX+"px";
        }
    }
}

function MoveClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
        if(clouds[i].posX < -clouds[i].clientWidth) {
            clouds[i].parentNode.removeChild(clouds[i]);
            clouds.splice(i, 1);
        }else{
            clouds[i].posX -= CalculateDisplacement() * velClouds;
            clouds[i].style.left = clouds[i].posX+"px";
        }
    }
}

function WinPoints() {
    score++;
    textScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        container.classList.add("noon");
    }else if(score == 10) {
        gameVel = 2;
        container.classList.add("afternoon");
    } else if(score == 20) {
        gameVel = 3;
        container.classList.add("night");
    }
    floor.style.animationDuration = (3/gameVel)+"s";
}

function GameOver() {
    Crash();
    gameOver.style.display = "block";
}

function DetecteCollition() {
    for (let i = 0; i < obstacles.length; i++) {
        if(obstacles[i].posX > dinoPosX + dino.clientWidth) {
            //EVADE
            break;
        }else{
            if(IsCollision(dino, obstacles[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}