/*
plans:
	- Different people (soldiers and workers) require different amounts of money per second
	- Workers make same amount every second
	- Hovering over buttons gives info on current person and stats
	- If there is not enough gold to pay soldiers, soldiers will leave until there is enough gold to go around
	- Bug where if 1 raider dies then the raider whose index is after it is skipped and blinks, because the index goes down 1. Solution would be to make "i" (in the for loop that updates raiders) go down 1 when raider dies.
*/

/*
bug:


*/

document.write("<title>Soldier Tycoon</title>");
document.write("<canvas id='canvas' width='1347' height='587' style='border:2px solid black'></canvas>");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var raidTimer = new Date();
var minSoldierDamage = 40;
var soldierHealth = 100;
var soldiers = [{
  x: canvas.width / 2,
  y: (canvas.height + 150) / 2,
  radius: 5,
  x_vel: 0.5,
  y_vel: -0.5,
  health: soldierHealth,
  damage: Math.random() * 10 + minSoldierDamage,
  timer: new Date(),
  shootTime: Math.random() * 100 + 450,
  timeSinceLastFrame: new Date(),
  outpostNumber: -1,
  paid: false
}];
var payTimer = new Date();
var payTimerMillis = 0;
var paySeconds = 60;
var workers = [{
  x: canvas.width / 2,
  y: (canvas.height + 150) / 2,
  radius: 3,
  x_vel: 0.3,
  y_vel: 0.5,
  health: 50,
  goldTimer: new Date(),
  timeSinceLastFrame: new Date()
}];
var bullets = [];
var raiders = [];
var castle = {
  x: canvas.width / 2,
  y: (canvas.height + 150) / 2,
  radius: 25,
  scoutRange: 100,
  castleGPS: 15
};
var outposts = [];
var outpostCost = 100000;
var outpostPlacing = -1;
var pauseButtonDisabled = false;
var mouseX = 0;
var mouseY = 0;
var play = true;
var soldierCost = 200;
var workerCost = 500;
var gold = 25000;
var d = new Date();
var goldBefore = gold;
var gps = 0;
var frames = 0;
var fps = 0;
var castleUpgradeCost = 25000;
var maxPeople = 50;
var sandbox = false;
alert("Sandbox mode can be turned on after the first round.");
var workerUpgradeCost = 5000;
var soldierUpgradeCost = 7500;
var timePerGold = 100;
var firstTime = true;
var firstRaid = true;
var firstMaxPeople = true;
var firstOutpost = true;
var lost = false;
var betAmount = 0;
var autoBuyDead = false;

document.addEventListener("keydown", function(event) {
  if (event.key + "" === "b") {
    betAmount = gold + 1;
    var cancel = false;
    
    while (betAmount > gold || betAmount < 100) {
      if (!confirm("Are you sure you would like to bet?")) {
        cancel = true;
        break;
      }
      betAmount = parseInt(prompt("How much would you like to bet?"));
      
      if (betAmount > gold) {
        alert("You have to bet less than your gold(" + gold + ").");
      }
      else if (betAmount + "" === "NaN") {
        alert("Please enter a number.");
        betAmount = gold + 1;
      }
      else if (betAmount < 100) {
        alert("You need to bet at least 100 gold.");
      }
      else {
        if (!(confirm("You would like to bet " + betAmount + " gold?"))) {
          betAmount = gold + 1;
        }
      }
    }
    if (!cancel) {
      if (Math.random() > 0.5) {
        gold += Math.floor(betAmount * .98);
        alert("Congrats! You won " + Math.floor(betAmount * .98)  + " gold! (Including House Tax)");
      }
      else {
        gold -= betAmount;
        alert("Sorry! You lost " + betAmount + " gold!");
      }
    }
    for (var i = 0; i < soldiers.length; i++) {
      soldiers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].timeSinceLastFrame = new Date();
    }

    for (var i = 0; i < workers.length; i++) {
      workers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < raiders.length; i++) {
      raiders[i].timeSinceLastFrame = new Date();
    }
  }
});

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener("mousemove", function(e) {
  mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft - 2;
  mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop - 2;

  if (!lost) {
    if ((mouseX > canvas.width - 60 && mouseX < canvas.width - 10 && mouseY > 50 && mouseY < 100 && !pauseButtonDisabled) ||
        (mouseX > 10 && mouseX < 130 && mouseY > 75 && mouseY < 125 && gold >= soldierCost && soldiers.length + workers.length + 1 <= maxPeople) ||
        (mouseX > 200 && mouseX < 320 && mouseY > 75 && mouseY < 125 && gold >= workerCost && soldiers.length + workers.length + 1 <= maxPeople) ||
        (mouseX > 390 && mouseX < 510 && mouseY > 75 && mouseY < 125 && gold >= castleUpgradeCost) ||
        (mouseX > 600 && mouseX < 720 && mouseY > 75 && mouseY < 125 && gold >= workerUpgradeCost) || 
        (mouseX > 810 && mouseX < 930 && mouseY > 75 && mouseY < 125 && gold >= soldierUpgradeCost) ||
        (mouseX > 1020 && mouseX < 1140 && mouseY > 75 && mouseY < 125 && gold >= outpostCost) || 
        (mouseX > 1190 && mouseX < 1240 && mouseY > 75 && mouseY < 125) || 
        (mouseX > canvas.width - 30 && mouseX < canvas.width - 10 && mouseY < 30 && mouseY > 5)) {
      document.getElementById('canvas').style.cursor = "pointer";
    } else {
      var pointer = false;
      for (var i = 0; i < outposts.length; i ++) {
        if (outposts[i].selected && ((mouseX > outposts[i].x + 5 && mouseX < outposts[i].x + 17 && mouseY < outposts[i].y + 25 && mouseY > outposts[i].y + 13) || 
            (mouseX > outposts[i].x + 30 && mouseX < outposts[i].x + 42 && mouseY < outposts[i].y + 25 && mouseY > outposts[i].y + 13)) || 
	          (Math.sqrt(Math.pow(outposts[i].x - mouseX, 2) + Math.pow(outposts[i].y - mouseY, 2), 2) <= outposts[i].radius)) {
          document.getElementById('canvas').style.cursor = "pointer";
          pointer = true;
          break;
        }
      }
      
      if (!pointer) {
        document.getElementById('canvas').style.cursor = "default";
      }
    }
  } else {
    if (mouseX > canvas.width / 2 - 100 && mouseX < canvas.width / 2 + 100 && mouseY > canvas.height / 2 - 50 && mouseY < canvas.height / 2 + 50) {
      document.getElementById('canvas').style.cursor = "pointer";
    } else {
      document.getElementById('canvas').style.cursor = "default";
    }
  }
});

document.onmouseup = function() {
  if (!lost) {
    if (mouseX > 1190 && mouseX < 1240 && mouseY > 75 && mouseY < 125) {
      autoBuyDead = !autoBuyDead;
    }
    
    if (mouseX > canvas.width - 30 && mouseX < canvas.width - 10 && mouseY < 30 && mouseY > 5) {
      alert("\u2022 Try to stay alive as long as possible against the raiders! \n\u2022 Soldiers(green) are troops used to protect your castle. They shoot bullets at raiders. Each soldier gets paid 50 gold per minute. When there is not enough gold, soldiers will leave. \n\u2022 Workers(blue) produce gold. You will need them to buy units/upgrades. \n\n\u2022 Press \"b\" to bet.");
    
      for (var i = 0; i < soldiers.length; i++) {
        soldiers[i].timeSinceLastFrame = new Date();
      }
    
      for (var i = 0; i < bullets.length; i++) {
        bullets[i].timeSinceLastFrame = new Date();
      }

      for (var i = 0; i < workers.length; i++) {
        workers[i].timeSinceLastFrame = new Date();
      }
    
      for (var i = 0; i < raiders.length; i++) {
        raiders[i].timeSinceLastFrame = new Date();
      }
    }
    
    if (!pauseButtonDisabled && mouseX > canvas.width - 60 && mouseX < canvas.width - 10 && mouseY > 50 && mouseY < 100) {
      play = !play;
      payTimerMillis = new Date().getTime() - payTimer.getTime();
    }

    if (mouseX > 10 && mouseX < 130 && mouseY > 75 && mouseY < 125) {
      if (gold >= soldierCost && soldiers.length + workers.length + 1 <= maxPeople) {
        gold -= soldierCost;
        soldiers.push({
          x: castle.x,
          y: castle.y,
          radius: 5,
          x_vel: Math.random() / 2,
          y_vel: Math.random() - 0.5,
          health: soldierHealth,
          damage: Math.random() * 10 + minSoldierDamage,
          timer: new Date(),
          shootTime: Math.random() * 100 + 450,
          timeSinceLastFrame: new Date(),
          outpostNumber: -1,
          paid: false
        });
      }
    }

    if (mouseX > 200 && mouseX < 320 && mouseY > 75 && mouseY < 125) {
      if (gold >= workerCost && soldiers.length + workers.length + 1 <= maxPeople) {
        workers.push({
          x: canvas.width / 2,
          y: (canvas.height + 150) / 2,
          radius: 3,
          x_vel: 0.3,
          y_vel: 0.5,
          health: 50,
          goldTimer: new Date(),
          timeSinceLastFrame: new Date()
        });
        gold -= workerCost;
      }
    }

    if (mouseX > 390 && mouseX < 510 && mouseY > 75 && mouseY < 125) {
      if (gold >= castleUpgradeCost) {
        castle.scoutRange += (190 - castle.scoutRange) / 50;
        maxPeople += 10;
        gold -= castleUpgradeCost;
        castle.castleGPS += 10;
        castleUpgradeCost += Math.round(castleUpgradeCost / 15);
      }
    }

    if (mouseX > 600 && mouseX < 720 && mouseY > 75 && mouseY < 125) {
      if (gold >= workerUpgradeCost) {
        timePerGold /= 1.1;
        gold -= workerUpgradeCost;
        workerUpgradeCost += Math.round(workerUpgradeCost / 15);
      }
    }
    
    if (mouseX > 810 && mouseX < 930 && mouseY > 75 && mouseY < 125) {
      if (gold >= soldierUpgradeCost) {
        minSoldierDamage += 10;
        soldierHealth += 10;
        gold -= soldierUpgradeCost;
        soldierUpgradeCost += Math.round(soldierUpgradeCost / 15);
        
        for (var i = 0; i < soldiers.length; i ++) {
          soldiers[i].damage = Math.random() * 10 + minSoldierDamage;
          soldiers[i].health += 10;
        }
      }
    }
    
    if (outpostPlacing < 0 && mouseX > 1020 && mouseX < 1140 && mouseY > 75 && mouseY < 125) {
      if (gold >= outpostCost) {
        gold -= outpostCost;
        outposts.push({x: mouseX, y: mouseY, size: 25, radius: 10, unitLimit: 4, selected: false, unitsContained: 0});
        outpostPlacing = outposts.length - 1;
        play = false;
        pauseButtonDisabled = true;
      }
    }
    
    for (var i = 0; i < outposts.length; i ++) {
      if (outposts[i].selected && !(mouseX > outposts[i].x && mouseX < outposts[i].x + 50 && mouseY > outposts[i].y && mouseY < outposts[i].y + 25)) {
        outposts[i].selected = false;
      }
    }
    
    for (var i = 0; i < outposts.length; i ++) {
      if (Math.sqrt(Math.pow(outposts[i].x - mouseX, 2) + Math.pow(outposts[i].y - mouseY, 2), 2) <= outposts[i].radius) {
        outposts[i].selected = true;
      }
    }
    
    if (outpostPlacing >= 0 && mouseY > 150 + outposts[outpostPlacing].size && mouseY < canvas.height - outposts[outpostPlacing].size && mouseX > outposts[outpostPlacing].size && mouseX < canvas.width - outposts[outpostPlacing].size) {
      if (outpostPlacing >= 0 && !(mouseY < castle.y + castle.scoutRange + outposts[outpostPlacing].size && mouseY > castle.y - castle.scoutRange - outposts[outpostPlacing].size && mouseX < castle.x + castle.scoutRange + outposts[outpostPlacing].size && mouseX > castle.x - castle.scoutRange - outposts[outpostPlacing].size)) {
        outpostPlacing = -1;
        play = true;
        pauseButtonDisabled = false;
      } else {
        alert("Invalid outpost placement.");
      }
    }
    
    for (var i = 0; i < outposts.length; i ++) {
      if (outposts[i].selected && outposts[i].unitsContained > 0 && mouseX > outposts[i].x + 5 && mouseX < outposts[i].x + 17 && mouseY < outposts[i].y + 25 && mouseY > outposts[i].y + 13) {
        for (var j = 0; j < soldiers.length; j ++) {
          if (soldiers[j].outpostNumber === i) {
            soldiers[j].outpostNumber = -1;
            soldiers[j].x = castle.x;
            soldiers[j].y = castle.y;
            outposts[i].unitsContained -= 1;
            break;
          }
        }
      }
      
      if (outposts[i].selected && outposts[i].unitsContained < outposts[i].unitLimit && mouseX > outposts[i].x + 30 && mouseX < outposts[i].x + 42 && mouseY < outposts[i].y + 25 && mouseY > outposts[i].y + 13) {
        for (var j = 0; j < soldiers.length; j ++) {
          if (soldiers[j].outpostNumber === -1) {
            soldiers[j].outpostNumber = i;
            soldiers[j].x = outposts[i].x;
            soldiers[j].y = outposts[i].y;
            outposts[i].unitsContained += 1;
            break;
          }
        }
      }
    }
    
  } else {
    if (mouseX > canvas.width / 2 - 100 && mouseX < canvas.width / 2 + 100 && mouseY > canvas.height / 2 - 50 && mouseY < canvas.height / 2 + 50) {
      autoBuyDead = false;
      minSoldierDamage = 40;
      soldierHealth = 100;
      play = true;
      paySeconds = 60;
      soldiers = [{
        x: canvas.width / 2,
        y: (canvas.height + 150) / 2,
        radius: 5,
        x_vel: 0.5,
        y_vel: -0.5,
        health: soldierHealth,
        damage: Math.random() * 10 + minSoldierDamage,
        timer: new Date(),
        shootTime: Math.random() * 100 + 450,
        timeSinceLastFrame: new Date(),
        outpostNumber: -1,
        paid: false
      }];
      workers = [{
        x: canvas.width / 2,
        y: (canvas.height + 150) / 2,
        radius: 3,
        x_vel: 0.3,
        y_vel: 0.5,
        health: 50,
        goldTimer: new Date(),
        timeSinceLastFrame: new Date()
      }];
      bullets = [];
      raiders = [];
      outposts = [];
      outpostCost = 100000;
      outpostPlacing = -1;
      pauseButtonDisabled = false;
      castle = {
        x: canvas.width / 2,
        y: (canvas.height + 150) / 2,
        radius: 25,
        scoutRange: 100,
        castleGPS: 15
      };
      mouseX = 0;
      mouseY = 0;
      play = true;
      soldierCost = 200;
      workerCost = 500;
      gold = 25000;
      d = new Date();
      goldBefore = gold;
      gps = 0;
      frames = 0;
      fps = 0;
      castleUpgradeCost = 25000;
      workerUpgradeCost = 5000;
	    soldierUpgradeCost = 7500;
      timePerGold = 100;
      maxPeople = 50;
      lost = false;
			sandbox = false;
			if (confirm("Do you want to turn on sandbox mode?")) {
  			gold = Infinity;
        sandbox = true;
      }
    }
  }
};

function moveSoldier(i) {
  ctx.beginPath();
  ctx.arc(soldiers[i].x, soldiers[i].y, soldiers[i].radius, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();

  soldiers[i].timeSinceLastFrame = new Date() - soldiers[i].timeSinceLastFrame;

  if (play) {
    var distance = 0;

    for (var k = 0; k < bullets.length; k++) {
      distance = Math.sqrt((Math.pow(bullets[k].x - soldiers[i].x, 2) + Math.pow(bullets[k].y - soldiers[i].y, 2)));

      if (distance <= soldiers[i].radius + bullets[k].radius && bullets[k].from !== "soldier") {
        soldiers[i].health -= bullets[k].damage;
        bullets.splice(k, 1);
      }
    }

    if (soldiers[i].health <= 0) {
      if (soldiers[i].outpostNumber >= 0) {
        outposts[soldiers[i].outpostNumber].unitsContained -= 1;
      }
      
      if (autoBuyDead && gold >= soldierCost) {
        gold -= soldierCost;
        if (soldiers[i].outpostNumber >= 0) {
          soldiers.push({
            x: outposts[soldiers[i].outpostNumber].x,
            y: outposts[soldiers[i].outpostNumber].y,
            radius: 5,
            x_vel: Math.random() / 2,
            y_vel: Math.random() - 0.5,
            health: soldierHealth,
            damage: Math.random() * 10 + minSoldierDamage,
            timer: new Date(),
            shootTime: Math.random() * 100 + 450,
            timeSinceLastFrame: new Date(),
            outpostNumber: soldiers[i].outpostNumber,
            paid: false
          });
          
          outposts[soldiers[i].outpostNumber].unitsContained += 1;
        }
        else {
          soldiers.push({
            x: castle.x,
            y: castle.y,
            radius: 5,
            x_vel: Math.random() / 2,
            y_vel: Math.random() - 0.5,
            health: soldierHealth,
            damage: Math.random() * 10 + minSoldierDamage,
            timer: new Date(),
            shootTime: Math.random() * 100 + 450,
            timeSinceLastFrame: new Date(),
            outpostNumber: -1,
            paid: false
          });
        }
      }
      
      soldiers.splice(i, 1);
    } else {
      if (new Date() - soldiers[i].timer > soldiers[i].shootTime) {
        for (var j = 0; j < raiders.length; j++) {
          if (Math.sqrt(Math.pow(soldiers[i].x - raiders[j].x, 2) + Math.pow(soldiers[i].y - raiders[j].y, 2), 2) < 100) {
            bullets.push({
              x: soldiers[i].x,
              y: soldiers[i].y,
              damage: soldiers[i].damage,
              x_vel: (raiders[j].x - soldiers[i].x) / (Math.sqrt(Math.pow(raiders[j].x - soldiers[i].x, 2) + Math.pow(raiders[j].y - soldiers[i].y, 2), 2) / 10),
              y_vel: (raiders[j].y - soldiers[i].y) / (Math.sqrt(Math.pow(raiders[j].x - soldiers[i].x, 2) + Math.pow(raiders[j].y - soldiers[i].y, 2), 2) / 10),
              from: "soldier",
              radius: 2,
              timeSinceLastFrame: new Date()
            });
            soldiers[i].timer = new Date();
            soldiers[i].x_vel = 0;
            soldiers[i].y_vel = 0;
            break;
          }
        }
      }

      soldiers[i].y += soldiers[i].y_vel * (soldiers[i].timeSinceLastFrame / (50 / 3));
      soldiers[i].x += soldiers[i].x_vel * (soldiers[i].timeSinceLastFrame / (50 / 3));

      if (soldiers[i].outpostNumber < 0 && (soldiers[i].x > castle.x + castle.scoutRange - soldiers[i].radius || soldiers[i].x < castle.x - castle.scoutRange + soldiers[i].radius)) {
        soldiers[i].x_vel *= -1;
        soldiers[i].x += soldiers[i].x_vel * (soldiers[i].timeSinceLastFrame / (50 / 3));
      }

      if (soldiers[i].outpostNumber < 0 && (soldiers[i].y > castle.y + castle.scoutRange - soldiers[i].radius || soldiers[i].y < castle.y - castle.scoutRange + soldiers[i].radius)) {
        soldiers[i].y_vel *= -1;
        soldiers[i].y += soldiers[i].y_vel * (soldiers[i].timeSinceLastFrame / (50 / 3));
      }
      
      for (var j = 0; j < outposts.length; j ++) {
        if (soldiers[i].outpostNumber === j && (soldiers[i].x > outposts[j].x + outposts[j].size - soldiers[i].radius || soldiers[i].x < outposts[j].x - outposts[j].size + soldiers[i].radius)) {
          soldiers[i].x_vel *= -1;
          soldiers[i].x += soldiers[i].x_vel * (soldiers[i].timeSinceLastFrame / (50 / 3));
        }

        if (soldiers[i].outpostNumber === j && (soldiers[i].y > outposts[j].y + outposts[j].size - soldiers[i].radius || soldiers[i].y < outposts[j].y - outposts[j].size + soldiers[i].radius)) {
          soldiers[i].y_vel *= -1;
          soldiers[i].y += soldiers[i].y_vel * (soldiers[i].timeSinceLastFrame / (50 / 3));
        }
      }

      if (Math.random() > 0.99) {
        soldiers[i].x_vel = Math.random() - 0.5;
      }

      if (Math.random() > 0.99) {
        soldiers[i].y_vel = Math.random() - 0.5;
      }
    }

    if (!soldiers[i].paid && paySeconds === 1) {
      if (gold >= 50) {
        gold -= 50;
        soldiers[i].paid = true;
      } else {
        soldiers.splice(i, 1);
      }
    } else if (soldiers[i].paid && paySeconds > 1) {
      soldiers[i].paid = false;
    }
  }

  if (i < soldiers.length) {
    soldiers[i].timeSinceLastFrame = new Date();
  }
}

function moveWorker(i) {
  ctx.beginPath();
  ctx.arc(workers[i].x, workers[i].y, workers[i].radius, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();

  workers[i].timeSinceLastFrame = new Date() - workers[i].timeSinceLastFrame;

  if (play) {
    var distance = 0;

    for (var k = 0; k < bullets.length; k++) {
      distance = Math.sqrt((Math.pow(bullets[k].x - workers[i].x, 2) + Math.pow(bullets[k].y - workers[i].y, 2)));

      if (distance <= workers[i].radius + bullets[k].radius && bullets[k].from !== "soldier") {
        workers[i].health -= bullets[k].damage;
        bullets.splice(k, 1);
      }
    }

    if (workers[i].health <= 0) {
      workers.splice(i, 1);
      if (autoBuyDead && gold >= workerCost) {
        gold -= workerCost;
        workers.push({
          x: canvas.width / 2,
          y: (canvas.height + 150) / 2,
          radius: 3,
          x_vel: 0.3,
          y_vel: 0.5,
          health: 50,
          goldTimer: new Date(),
          timeSinceLastFrame: new Date()
        });
      }
    } else {
      if (new Date() - workers[i].goldTimer > timePerGold) {
        gold++;
        workers[i].goldTimer = new Date();
      }

      workers[i].y += workers[i].y_vel * (workers[i].timeSinceLastFrame / (50 / 3));
      workers[i].x += workers[i].x_vel * (workers[i].timeSinceLastFrame / (50 / 3));

      if (workers[i].x > castle.x + castle.scoutRange - workers[i].radius || workers[i].x < castle.x - castle.scoutRange + workers[i].radius) {
        workers[i].x_vel *= -1;
        workers[i].x += workers[i].x_vel * (workers[i].timeSinceLastFrame / (50 / 3));
      }

      if (workers[i].y > castle.y + castle.scoutRange - workers[i].radius || workers[i].y < castle.y - castle.scoutRange + workers[i].radius) {
        workers[i].y_vel *= -1;
        workers[i].y += workers[i].y_vel * (workers[i].timeSinceLastFrame / (50 / 3));
      }

      if (Math.random() > 0.99) {
        workers[i].x_vel = Math.random() - 0.5;
      }

      if (Math.random() > 0.99) {
        workers[i].y_vel = Math.random() - 0.5;
      }
    }
  }

  if (i < workers.length) {
    workers[i].timeSinceLastFrame = new Date();
  }
}

function moveRaider(i) {
  ctx.beginPath();
  ctx.arc(raiders[i].x, raiders[i].y, raiders[i].radius, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();

  raiders[i].timeSinceLastFrame = new Date() - raiders[i].timeSinceLastFrame;

  if (play) {
    var distance = 0;

    for (var k = 0; k < bullets.length; k++) {
      distance = Math.sqrt((Math.pow(bullets[k].x - raiders[i].x, 2) + Math.pow(bullets[k].y - raiders[i].y, 2)));

      if (distance <= raiders[i].radius + bullets[k].radius && bullets[k].from !== "raider" + i) {
        raiders[i].health -= bullets[k].damage;
        bullets.splice(k, 1);
      }
    }

    if (raiders[i].health <= 0) {
      raiders.splice(i, 1);
    } else {

      if (new Date() - raiders[i].timer > raiders[i].shootTime) {
        var ifFound = false;
        for (var j = 0; j < soldiers.length; j++) {
          if (Math.sqrt(Math.pow(raiders[i].x - soldiers[j].x, 2) + Math.pow(raiders[i].y - soldiers[j].y, 2), 2) < 100) {
            bullets.push({
              x: raiders[i].x,
              y: raiders[i].y,
              damage: raiders[i].damage,
              x_vel: (soldiers[j].x - raiders[i].x) / (Math.sqrt(Math.pow(soldiers[j].x - raiders[i].x, 2) + Math.pow(soldiers[j].y - raiders[i].y, 2), 2) / 10),
              y_vel: (soldiers[j].y - raiders[i].y) / (Math.sqrt(Math.pow(soldiers[j].x - raiders[i].x, 2) + Math.pow(soldiers[j].y - raiders[i].y, 2), 2) / 10),
              from: "raider" + i,
              radius: 2,
              timeSinceLastFrame: new Date()
            });
            ifFound = true;
            break;
          }
        }

        if (!ifFound) {
          for (j = 0; j < workers.length; j++) {
            if (Math.sqrt(Math.pow(raiders[i].x - workers[j].x, 2) + Math.pow(raiders[i].y - workers[j].y, 2), 2) < 100) {
              bullets.push({
                x: raiders[i].x,
                y: raiders[i].y,
                damage: raiders[i].damage,
                x_vel: (workers[j].x - raiders[i].x) / (Math.sqrt(Math.pow(workers[j].x - raiders[i].x, 2) + Math.pow(workers[j].y - raiders[i].y, 2), 2) / 10),
                y_vel: (workers[j].y - raiders[i].y) / (Math.sqrt(Math.pow(workers[j].x - raiders[i].x, 2) + Math.pow(workers[j].y - raiders[i].y, 2), 2) / 10),
                from: "raider" + i,
                radius: 2,
                timeSinceLastFrame: new Date()
              });
              ifFound = true;
              break;
            }
          }
        }

        if (ifFound) {
          raiders[i].timer = new Date();
        }
      }

      if (soldiers.length > 0 || workers.length > 0) {
        if (raiders[i].y < castle.y + castle.scoutRange + raiders[i].radius && raiders[i].y > castle.y - castle.scoutRange - raiders[i].radius) {
          if (raiders[i].x > castle.x - castle.scoutRange - raiders[i].radius && raiders[i].x < castle.x + castle.scoutRange + raiders[i].radius) {
            raiders[i].x_vel = 0;
            raiders[i].y_vel = 0;
          }
        }
        if (raiders[i].x < castle.x + castle.scoutRange + raiders[i].radius && raiders[i].x > castle.x - castle.scoutRange - raiders[i].radius) {
          if (raiders[i].y > castle.y - castle.scoutRange - raiders[i].radius && raiders[i].y < castle.y + castle.scoutRange + raiders[i].radius) {
            raiders[i].x_vel = 0;
            raiders[i].y_vel = 0;
          }
        }
	      for (var j = 0; j < outposts.length; j ++) {
          if (outposts[j].unitsContained > 0 && raiders[i].x < outposts[j].x + outposts[j].size + raiders[i].radius && raiders[i].x > outposts[j].x - outposts[j].size - raiders[i].radius) {
            if (raiders[i].y > outposts[j].y - outposts[j].size - raiders[i].radius && raiders[i].y < outposts[j].y + outposts[j].size + raiders[i].radius) {
              raiders[i].x_vel = 0;
              raiders[i].y_vel = 0;
            }
          }
          if (outposts[j].unitsContained > 0 && raiders[i].y < outposts[j].y + outposts[j].size + raiders[i].radius && raiders[i].y > outposts[j].y - outposts[j].size - raiders[i].radius) {
            if (raiders[i].x > outposts[j].x - outposts[j].size - raiders[i].radius && raiders[i].x < outposts[j].x + outposts[j].size + raiders[i].radius) {
              raiders[i].x_vel = 0;
              raiders[i].y_vel = 0;
            }
          }
        }
      } else {
        raiders[i].x_vel = (castle.x - raiders[i].x) / 50;
        raiders[i].y_vel = (castle.y - raiders[i].y) / 50;
      }

      raiders[i].y += raiders[i].y_vel * (raiders[i].timeSinceLastFrame / (50 / 3));
      raiders[i].x += raiders[i].x_vel * (raiders[i].timeSinceLastFrame / (50 / 3));

      if (raiders[i].x > canvas.width - raiders[i].radius || raiders[i].x < raiders[i].radius) {
        raiders[i].x_vel *= -1;
        raiders[i].x += raiders[i].x_vel * (raiders[i].timeSinceLastFrame / (50 / 3));
      }

      if (raiders[i].y > canvas.height - raiders[i].radius || raiders[i].y < 150 + raiders[i].radius) {
        raiders[i].y_vel *= -1;
        raiders[i].y += raiders[i].y_vel * (raiders[i].timeSinceLastFrame / (50 / 3));
      }

      if (Math.random() > 0.999) {
        raiders[i].x_vel = Math.random() * 2 - 1;
      }

      if (Math.random() > 0.999) {
        raiders[i].y_vel = Math.random() * 2 - 1;
      }
    }
  }

  if (i < raiders.length) {
    raiders[i].timeSinceLastFrame = new Date();
  }
}

function moveBullet(i) {
  if (bullets[i].y > 148 + bullets[i].radius) {
    ctx.beginPath();
    ctx.arc(bullets[i].x, bullets[i].y, bullets[i].radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
  }

  bullets[i].timeSinceLastFrame = new Date() - bullets[i].timeSinceLastFrame;

  if (play) {
    if (bullets[i].x > canvas.width - bullets[i].radius || bullets[i].x < bullets[i].radius || bullets[i].y > canvas.height - bullets[i].radius || bullets[i].y < 150 + bullets[i].radius) {
      bullets.splice(i, 1);
    } else {
      bullets[i].x += bullets[i].x_vel * (bullets[i].timeSinceLastFrame / (50 / 3));
      bullets[i].y += bullets[i].y_vel * (bullets[i].timeSinceLastFrame / (50 / 3));
    }
  }

  if (i < bullets.length) {
    bullets[i].timeSinceLastFrame = new Date();
  }
}

function startRaid() {
  var raiders1 = Math.floor((Math.random() * ((soldiers.length + workers.length) / 25)) + ((soldiers.length + workers.length) / 15)) + ((soldierHealth - 100)/10);
  var x1;
  for (var i = 0; i < raiders1; i++) {
    if (Math.random() >= 0.5) {
      x1 = Math.random() * (canvas.width / 2 - castle.scoutRange - 10) + 10;
    } else {
      x1 = canvas.width / 2 + (Math.random() * (canvas.width / 2 - castle.scoutRange - 10)) + castle.scoutRange - 10;
    }
    var y1 = (Math.random() * (canvas.height - 150 - 20) + 150 + 10);
    raiders.push({
      x: x1,
      y: y1,
      radius: 10,
      x_vel: (castle.x - x1) / (Math.sqrt(Math.pow(castle.x - x1, 2) + Math.pow(castle.y - y1, 2), 2) / Math.sqrt(2, 2)),
      y_vel: (castle.y - y1) / (Math.sqrt(Math.pow(castle.x - x1, 2) + Math.pow(castle.y - y1, 2), 2) / Math.sqrt(2, 2)),
      health: 200,
      timer: new Date(),
      shootTime: Math.random() * 100 + 450,
      damage: Math.random() * 90 + 10,
      timeSinceLastFrame: new Date()
    });
  }
}

function topBar() {

  ctx.fillStyle = "black";
  ctx.fillRect(0, 148, canvas.width, 2);

  ctx.font = "15px Arial";
  ctx.fillText("Soldier Tycoon Game", 10, 20);
  if (sandbox) {
    ctx.fillText("Sandbox mode", canvas.width - 105, 130);
  }

  ctx.font = "15px Arial";
  ctx.fillText("You have " + gold + " gold! You earn " + gps + " gold per second. You have " + fps + " fps.    Your population: " + (soldiers.length + workers.length) + "/" + maxPeople + "    There are " + raiders.length + " raiders." + "    Next pay for Soldiers: " + (paySeconds) + "  Total pay: " + soldiers.length * 50, 200, 20);
  ctx.fillStyle = "yellow";
  ctx.fillRect(10, 30, gold / 1000, 25);

  ctx.fillStyle = "green";
  ctx.fillRect(10, 75, 120, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Hire Soldier for " + soldierCost + " gold.", 10, 70);
  ctx.font = "12px Arial";
  if (soldiers.length === 1) {
    ctx.fillText("You have " + soldiers.length + " soldier", 10, 135);
  } else {
    ctx.fillText("You have " + soldiers.length + " soldiers", 10, 135);
  }

  ctx.fillStyle = "blue";
  ctx.fillRect(200, 75, 120, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Hire Worker for " + workerCost + " gold.", 200, 70);
  ctx.font = "12px Arial";
  if (workers.length === 1) {
    ctx.fillText("You have " + workers.length + " worker", 200, 135);
  } else {
    ctx.fillText("You have " + workers.length + " workers", 200, 135);
  }

  ctx.fillStyle = "grey";
  ctx.fillRect(390, 75, 120, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Upgrade your castle for " + castleUpgradeCost + " gold.", 390, 70);

  ctx.fillStyle = "blue";
  ctx.fillRect(600, 75, 120, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Upgrade your workers for " + workerUpgradeCost + " gold.", 600, 70);

  ctx.fillStyle = "green";
  ctx.fillRect(810, 75, 120, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Upgrade your soldiers for " + soldierUpgradeCost + " gold.", 810, 70);
  
  ctx.fillStyle = "grey";
  ctx.fillRect(1020, 75, 120, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Buy an outpost for " + outpostCost + " gold.", 1020, 70);
  
  if (autoBuyDead) {
    ctx.fillStyle = "green";
  } else {
    ctx.fillStyle = "red";
  }
  ctx.fillRect(1190, 75, 50, 50);
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("Auto-Replace Dead", 1160, 135);
  ctx.fillStyle = "white";
  ctx.fillText("On/Off", 1197, 105);
  
  ctx.fillStyle = "grey";
  ctx.fillRect(canvas.width - 60, 50, 50, 50);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  if (play) {
    ctx.fillText("||", canvas.width - 45, 83);
  } else {
    ctx.fillText("\u{25B7}", canvas.width - 50, 87);
  }
  
  ctx.fillStyle = "black";
  ctx.fillText("?", canvas.width - 30, 30);
}

function drawBackground() {
  for (var m = 0; m < outposts.length; m ++) {
    ctx.beginPath();
    ctx.arc(outposts[m].x, outposts[m].y, outposts[m].radius, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
    
    ctx.strokeRect(outposts[m].x - outposts[m].size, outposts[m].y - outposts[m].size, 2 * outposts[m].size, 2 * outposts[m].size);
    
    if (outposts[m].selected) {
      ctx.fillStyle = "grey";
      ctx.fillRect(outposts[m].x, outposts[m].y, 50, 25);
      
      ctx.fillStyle = "white";
      ctx.font = "7px Arial";
      ctx.fillText("Move Soldiers", outposts[m].x + 2, outposts[m].y + 10);
      ctx.font = "15px Arial";
      ctx.fillText("-", outposts[m].x + 5, outposts[m].y + 22);
      ctx.fillText("+", outposts[m].x + 30, outposts[m].y + 22);
    }
  }

  ctx.beginPath();
  ctx.arc(castle.x, castle.y, castle.radius, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();

  ctx.strokeRect(castle.x - castle.scoutRange, castle.y - castle.scoutRange, 2 * castle.scoutRange, 2 * castle.scoutRange);
}

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!lost) {
    if (new Date() - d >= 1000 && play) {
      if (gold - goldBefore >= 0) {
        gps = gold - goldBefore;
      }
      goldBefore = gold;
      d = new Date();
      fps = frames;
      frames = 0;

      gold += castle.castleGPS;
    }

    frames++;

    if (!play) {
      ctx.fillStyle = "lightgrey";
      ctx.fillRect(0, 150, canvas.width, canvas.height - 150);
      ctx.fillStyle = "black";
      ctx.font = "15px Arial";
      ctx.fillText("Paused", canvas.width / 2 - 20, 170);
      d = new Date();
    } else {
      if (new Date() - raidTimer >= 15000 && Math.random() >= 0.99) {
        raidTimer = new Date();
        startRaid();
      }
    }

    for (var i = 0; i < bullets.length; i++) {
      moveBullet(i);
    }

    for (var i = 0; i < workers.length; i++) {
      moveWorker(i);
    }

    for (var i = 0; i < soldiers.length; i++) {
      moveSoldier(i);
    }
    if (play && new Date() - payTimer > 1000) {
      payTimer = new Date();
      paySeconds -= 1;
      if (paySeconds === 0) {
        paySeconds = 60;
      }
    }
    if (!play) {
      payTimer = new Date();
      payTimer.setTime(payTimer.getTime() - payTimerMillis);
    }

    for (var i = 0; i < raiders.length; i++) {
      if (soldiers.length + workers.length === 0 && Math.sqrt(Math.pow(raiders[i].x - castle.x, 2) + Math.pow(raiders[i].y - castle.y, 2)) < castle.radius - raiders[i].radius) {
        lost = true;
      }
      moveRaider(i);
    }
    
    if (outpostPlacing >= 0) {
      outposts[outpostPlacing].x = mouseX;
      outposts[outpostPlacing].y = mouseY;
    }
    
    drawBackground();

    topBar();

  } else {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("You have lost!", canvas.width / 2 - 90, canvas.height / 2 - 75);

    ctx.fillStyle = "grey";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
    ctx.fillStyle = "black";
    ctx.font = "15px Arial";
    ctx.fillText("Click here to play again!", canvas.width / 2 - 80, canvas.height / 2 - 25);
  }

  if (firstTime) {
    alert("Try to stay alive as long as possible against the raiders!");
    alert("Soldiers are troops used to protect your castle. They shoot bullets at raiders. Each soldier gets paid 50 gold per minute. When there is not enough gold, soldiers will leave.");
    alert("Workers produce gold. You will need them to buy units/upgrades.");
    alert("Need gold? Press B to bet!");
    
    for (var i = 0; i < soldiers.length; i++) {
      soldiers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].timeSinceLastFrame = new Date();
    }

    for (var i = 0; i < workers.length; i++) {
      workers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < raiders.length; i++) {
      raiders[i].timeSinceLastFrame = new Date();
    }
    
    firstTime = false;
  }
  
  if (firstOutpost && gold >= outpostCost) {
    if (!sandbox) {
      alert("Congrats on 100k! You can now afford an outpost! Outposts can help fend off raiders. Station soldiers in them to protect your workers. They can only hold 4 soldiers, though.");
    } else {
      alert("Outposts can help fend off raiders. Station soldiers in them to protect your workers. They can only hold 4 soldiers, though.");
    }
    
    firstOutpost = false;
    
    for (var i = 0; i < soldiers.length; i++) {
      soldiers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].timeSinceLastFrame = new Date();
    }

    for (var i = 0; i < workers.length; i++) {
      workers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < raiders.length; i++) {
      raiders[i].timeSinceLastFrame = new Date();
    }
  }
	
	if (firstMaxPeople && soldiers.length + workers.length === 50 && maxPeople === 50) {
    alert("Castle Full? Upgrade it to fit more people.");
    firstMaxPeople = false;
  }

  if (firstRaid && raiders.length > 0) {
    play = false;
    alert("Raiders try to take over your castle. Buy soldiers to protect your castle.");
    
    for (var i = 0; i < soldiers.length; i++) {
      soldiers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].timeSinceLastFrame = new Date();
    }

    for (var i = 0; i < workers.length; i++) {
      workers[i].timeSinceLastFrame = new Date();
    }
    
    for (var i = 0; i < raiders.length; i++) {
      raiders[i].timeSinceLastFrame = new Date();
    }
    
    play = true;
    firstRaid = false;
  }

  requestAnimationFrame(draw);
}

draw();
