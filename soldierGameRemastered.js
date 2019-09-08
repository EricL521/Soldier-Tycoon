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
          var xVel = unit.coords.x - this.coords.x;
          var yVel = unit.coords.y - this.coords.y;
          var ratio = Math.sqrt((Math.pow(xVel, 2) + Math.pow(yVel, 2)), 2)/10;
          var xVel /= ratio;
          var yVel /= ratio;

          bullets.push({coords:{x:this.x, y:this.y}, momentum:{xVel:xVel, yVel:yVel}, size: 3});

          alreadyShot = true;
        }
      }

      for (bullet in bullets) {
          ctx.beginPath();
          ctx.arc(bullets.coords.x, bullets.coords.y, bullets.size, 0, 2 * Math.PI);
          ctx.fillStyle = "black";
          ctx.fill();
          bullets.coords.x += bullets.momentum.x;
          bullets.coords.y += bullets.momentum.y;

          for (unit in units) {
            if (unit.enemy !== this.enemy && Math.sqrt((Math.pow(bullets.coords.x, 2) + Math.pow(bullets.coords.y, 2)), 2) - bullets.size <= 0) {
              unit.health -= this.damage;
              bullets.splice(bullets.findIndex(bullet),1);
            }
          }
      }
    }
  }
}
