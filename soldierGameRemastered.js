document.write("<title>Soldier Tycoon</title>");
document.write("<canvas id='canvas' width='1347' height='587' style='border:2px solid black'></canvas>");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var mouseX, mouseY;
var units = [];
var mouseX = 0;
var mouseY = 0;

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener("mousemove", function(e) {
  mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
  mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
});

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener("mousemove", function(e) {
  mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
  mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
});

class Unit {
  /*
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
  */

  constructor(health, speed, damage, bulletSpeed, range, size, coords, peaceful, enemy) {
    this.health = health;
    this.speed = speed;
    this.damage = damage;
    this.bulletSpeed = bulletSpeed;
    this.range = range;
    this.size = size;
    this.coords = coords;
    this.momentum = {xVel:0, yVel:0};
    this.peaceful = peaceful;
    this.enemy = enemy;
    this.bullets = {};
    this.timeSinceLastFrame = new Date();


    this.updateUnit = function() {
      var alreadyShot = false;
      this.timeSinceLastFrame = new Date() - this.timeSinceLastFrame;

      ctx.beginPath();
      ctx.arc(this.coords.x, this.coords.y, this.size, 0, 2 * Math.PI);
      if (this.peaceful) {
        ctx.fillStyle = "blue";
      }
      else {
        ctx.fillStyle = "gray";
      }
      ctx.fill();

      this.coords.x += this.momentum.xVel / (this.timeSinceLastFrame/(50/3));
      this.coords.y += this.momentum.yVel / (this.timeSinceLastFrame/(50/3));

      if (!this.peaceful) {
        for(var i = 0; i < units.length; i ++) {
          if (!alreadyShot && units[i].enemy !== this.enemy && Math.sqrt((Math.pow(this.coords.x - units[i].coords.x, 2) + Math.pow(this.coords.y - units[i].coords.y, 2)), 2)) {
            var xVel = units[i].coords.x - this.coords.x;
            var yVel = units[i].coords.y - this.coords.y;
            var ratio = Math.sqrt((Math.pow(xVel, 2) + Math.pow(yVel, 2)), 2)/10;
            xVel /= ratio;
            yVel /= ratio;

            this.bullets.push({coords:{x:this.x, y:this.y}, momentum:{xVel:xVel, yVel:yVel}, size: 3});

            alreadyShot = true;
          }
        }

        for (var bullet in this.bullets) {
          if (this.bullets.hasOwnProperty(bullet)) {
            ctx.beginPath();
            ctx.arc(bullet.coords.x, bullet.coords.y, bullet.size, 0, 2 * Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
            bullet.coords.x += bullet.momentum.x / (this.timeSinceLastFrame/(50/3));
            bullet.coords.y += bullet.momentum.y / (this.timeSinceLastFrame/(50/3));

            for (i = 0; i < units.length; i ++) {
              if (units[i].enemy !== this.enemy && Math.sqrt((Math.pow(this.bullets.coords.x, 2) + Math.pow(this.bullets.coords.y, 2)), 2) - this.bullets.size <= 0) {
                units[i].health -= this.damage;
                this.bullets.splice(this.bullets.findIndex(bullet), 1);
              }
            }
          }
        }
      }
      this.timeSinceLastFrame = new Date();
    };

  }

}

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < units.length; i ++) {
      units[i].updateUnit();
  }


  requestAnimationFrame(draw);
}

units.push(new Unit(100, 3, 10, 10, 50, 5, {x:50, y:50}, false, false));

draw();
