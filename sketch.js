const Engine=Matter.Engine
const World= Matter.World;
const Bodies = Matter.Bodies;

var PLAY = 1;
var END = 0;
var game;
var gameState = PLAY;
var engine, world;
var playerCount=1;
var distance = 0;
var database;
var pterodactyl;
var CloudsGroup;
var PterodactylGroup;
var coin;
var CoinsGroup;

function preload(){
  loadImage("Pterodactyl.png");
  loadImage("Coin.png");
}
//create a trex sprite
function setup(){
  canvas = createCanvas(displayWidth-20,displayHeight-30);
  game = new Game();
  game.getState();
  game.start();
  player.add(trex);
database = firebase.database();

var trex = createSprite(200,380,20,50);
trex.setAnimation("trex");

engine = Engine.create();
world = engine.world;

//set collision radius for the trex
trex.setCollider("circle",0,0,30);

//scale and position the trex
trex.scale = 0.5;
trex.x = 50;

//create a ground sprite
var ground = createSprite(200,380,400,20);
ground.setAnimation("ground2");
ground.x = ground.width /2;

//invisible Ground to support Trex
var invisibleGround = createSprite(200,385,400,5);
invisibleGround.visible = false;

//create Obstacle and Cloud Groups
var ObstaclesGroup = createGroup();
var CloudsGroup = createGroup();

//place gameOver and restart icon on the screen
var gameOver = createSprite(200,300);
var restart = createSprite(200,340);
gameOver.setAnimation("gameOver");
gameOver.scale = 0.5;
restart.setAnimation("restart");
restart.scale = 0.5;

gameOver.visible = false;
restart.visible = false;
}
//set text
textSize(18);
textFont("Georgia");
textStyle(BOLD);

//score
var count = 0;

function draw() {
  //set background to white
  background("white");
  //display score
  text("Score: "+ count, 250, 100);
  console.log(gameState);
  
  if(gameState === PLAY){
    //move the ground
    ground.velocityX = 0;
    //scoring
    count = count+Math.round(World.frameRate/60);
    
    if (count>0 && count%100 === 0){
      playSound("checkPoint.mp3");
    }

    if (trex.isTouching(CoinsGroup)){
      coin.lifetime=0;
      count+20;
    }
    
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
    if (keyDown(RIGHT_ARROW)){
      ground.velocityX=-(6 + 3*count/100);
    }
    
     //jump when the space key is pressed
    if(keyDown("space") && trex.y >= 359){
      trex.velocityY = -12 ;
      playSound("jump.mp3");
    }
  
    //add gravity
    trex.velocityY = trex.velocityY + 0.8;
    
    //spawn the clouds
    spawnClouds();
  
    //spawn obstacles
    spawnObstacles();

    //spawn pterodactyls
    spawnPterodactyls();
    
    //End the game when trex is touching the obstacle
    if(ObstaclesGroup.isTouching(trex)){
      playSound("jump.mp3");
      gameState = END;
      playSound("die.mp3");
    }
  }
  
  else if(gameState === END) {
    gameOver.visible = true;
    restart.visible = true;
    
    //set velcity of each game object to 0
    ground.velocityX = 0;
    trex.velocityY = 0;
    ObstaclesGroup.setVelocityXEach(0);
    CloudsGroup.setVelocityXEach(0);
    PterodactylGroup.setVelocityXEach(0);
    CoinsGroup.setVelocityXEach(0);
    
    //change the trex animation
    trex.setAnimation("trex_collided");
    
    //set lifetime of the game objects so that they are never destroyed
    ObstaclesGroup.setLifetimeEach(-1);
    CloudsGroup.setLifetimeEach(-1);
    PterodactylGroup.setLifetimeEach(-1);
    CoinsGroup.setLifetimeEach(-1);
    
    
  }
  
  if(mousePressedOver(restart)) {
    reset();
  }
  
  //console.log(trex.y);
  
  //stop trex from falling down
  trex.collide(invisibleGround);
  
  drawSprites();
}

function reset(){
  gameState=PLAY;
  count=0;
  gameOver.visible=false;
  restart.visible=false;
  ObstaclesGroup.destroyEach();
  CloudsGroup.destroyEach();
  PterodactylGroup.destroyEach();
  CoinsGroup.destroyEach();
  trex.setAnimation("trex");
}

function spawnObstacles() {
  if(World.frameCount % 60 === 0) {
    var obstacle = createSprite(400,365,10,40);
    obstacle.velocityX = - (6 + 3*count/100);
    
    //generate random obstacles
    var rand = randomNumber(1,6);
    obstacle.setAnimation("obstacle" + rand);
    
    //assign scale and lifetime to the obstacle           
    obstacle.scale = 0.5;
    obstacle.lifetime = 70;
    //add each obstacle to the group
    ObstaclesGroup.add(obstacle);
  }
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (World.frameCount % 60 === 0) {
    var cloud = createSprite(400,320,40,10);
    cloud.y = randomNumber(280,320);
    cloud.setAnimation("cloud");
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //assign lifetime to the variable
    cloud.lifetime = 134;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //add each cloud to the group
    CloudsGroup.add(cloud);
  }
  if(gameState === 1){
    clear();
    game.play();
  }
}
function spawnPterodactyls() {
  if (World.frameCount % 10 === 0,count>0 && count%100 === 0) {
    var pterodactyl = createSprite(400,320,40,10);
    pterodactyl.y = randomNumber(290,320);
    pterodactyl.loadImage("Pterodactyl.png")
    pterodactyl.scale = 0.5;
    pterodactyl.velocityX = -3;
    
    pterodactyl.lifetime = 134;
    
    pterodactyl.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    PterodactylGroup.add(pterodactyl);
  }
  if(gameState === 1){
    clear();
    game.play();
  }
}
function spawnCoins() {
  if (World.frameCount % 30 === 0,count>0 && count%100 === 0) {
    var coin = createSprite(400,320,40,10);
    coin.y = randomNumber(240,300);
    coin.loadImage("Coin.png")
    coin.scale = 0.4;
    coin.velocityX = -3;
    
    coin.lifetime = 134;
    
    coin.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    CoinsGroup.add(coin);
  }
  if(gameState === 1){
    clear();
    game.play();
  }
}
