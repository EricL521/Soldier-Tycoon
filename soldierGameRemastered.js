document.write("<title>Soldier Tycoon</title>");
document.write("<canvas id='canvas' width='1347' height='587' style='border:2px solid black'></canvas>");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var units = {};

class Unit {
  var health = 0;
  var speed = 0;
  var damage = 0;
  var bulletSpeed = 0;
  var range = 0;
  var size = 0;
  var coords = {x:0, y:0};
  var momentum = {xVel:0, yVel:0};
  var peaceful = false;
  var enemy = false;
  var bullets = {};
  
  constructor(health, speed, damage, bulletSpeed, range, size, coords, peaceful, enemy) {
    this.health = health;
    this.speed = speed;
    this.damage = damage;
    this.bulletSpeed = bulletSpeed;
    this.range = range;
    this.size = size;
    this.coords = coords;
    this.peaceful = peaceful;
    this.enemy = enemy;
  }
  
  updateUnit() {
    var alreadyShot = false;
    
    ctx.beginPath();
    ctx.arc(this.coords.x, this.coords.y, this.size, 0, 2 * Math.PI);
    if (peaceful) {
      ctx.fillStyle = "green";
    }
    else {
      ctx.fillStyle = "red";
    }
    ctx.fill();
    
    if (!peaceful) {
      for(unit in units) {
        if (!alreadyShot && unit.enemy !== this.enemy && Math.sqrt((Math.pow(this.coords.x - unit.coords.x, 2) + Math.pow(this.coords.y - unit.coords.y, 2)), 2)) {
          var xVel = unit.coords.x
          bullets.push({coords:{x:this.x, y:this.y}, momentum:{xVel:, yVel:}});
        }
      }
    }
  }
}
