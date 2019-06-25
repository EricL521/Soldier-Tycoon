alert("By clicking the ok button, you are accepting that your mouse and keyboard will be tracked, while you are on this website (all information used for this game will stay on this device). X out this tab if you do not consent to this.");
alert("Green circles are soldiers (protect and kill enemies). Blue circles are workers (make gold). Your castle is green. When it gets overrun, you lose. Raiders are red. (If you are looking to right click, right click outside of the border, not inside.)");
document.write("<title>Soldier Tycoon</title>");
document.write("<canvas id='canvas' width='1347' height='587' style='border:2px solid black'></canvas>");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var soldiers = [{x: canvas.width/2, y: (canvas.height + 150) / 2, radius: 5, x_vel: 0.5, y_vel: -0.5, health: 100, damage: Math.random() * 25 + 25, timer: new Date(), shootTime: Math.random()*100+450}];
var workers = [{x: canvas.width/2, y: (canvas.height + 150) / 2, radius: 3, x_vel: 0.3, y_vel: 0.5, income: Math.random() * 10 + 80, health: 50}];
var bullets = [];
var raiders = [];
var castle = {x: canvas.width/2, y: (canvas.height + 150) / 2, radius:25, scoutRange: 100};
var mouseX = 0;
var mouseY = 0;
var play = true;
var soldierCost = 200;
var workerCost = 500;
var gold = 10000;
var d = new Date();
var goldBefore = gold;
var gps = 0;
var frames = 0;
var fps = 0;
var castleUpgradeCost = 50000;
var maxPeople = 50;

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener("mousemove", function(e) {
	mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft;
	mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop;
});

document.onmouseup = function() {
	if (mouseX > canvas.width - 60 && mouseX < canvas.width - 10 && mouseY > 50 && mouseY < 100) {
		play = !play;
	}

	if (mouseX > 10 && mouseX < 130 && mouseY > 75 && mouseY < 125) {
		if (gold >= soldierCost && soldiers.length + workers.length + 1 <= maxPeople) {
			soldiers.push({x: castle.x, y: castle.y, radius: 5, x_vel: Math.random()/2, y_vel: Math.random()-0.5, health: 100, damage: Math.random() * 25 + 25, timer: new Date(), shootTime: Math.random()*100+450});
			gold -= soldierCost;
			soldierCost += Math.floor(Math.random() * 50 + 25);
    }

		else if (soldiers.length + workers.length + 1 > maxPeople) {
			alert("You have reached your maximum number of people your castle can support. Upgrade your castle to keep hiring!");
		}

		else {
			alert("You don’t have enough gold! You need " + (soldierCost - gold) + " more gold!");
        }
	}

	if (mouseX > 200 && mouseX < 320 && mouseY > 75 && mouseY < 125) {
		if (gold >= workerCost && soldiers.length + workers.length + 1 <= maxPeople) {
			workers.push({x: canvas.width/2, y: (canvas.height + 150) / 2, radius: 3, x_vel: 0.3, y_vel: 0.5, income: Math.random() * 10 + 80, health: 50});
			gold -= workerCost;
			workerCost+= Math.floor(Math.random() * 50 + 50);
		}

		else if (soldiers.length + workers.length + 1 > maxPeople) {
			alert("You have reached your maximum number of people your castle can support. Upgrade your castle to keep hiring!");
		}

		else {
			alert("You don’t have enough gold! You need " + (workerCost - gold) + " more gold!");
		}
	}

	if (mouseX > 390 && mouseX < 510 && mouseY > 75 && mouseY < 125) {
		if (gold >= castleUpgradeCost) {
			castle.scoutRange += (190 - castle.scoutRange) / 50;
			maxPeople += 10;
			gold -= castleUpgradeCost;
			castleUpgradeCost += Math.floor(Math.random() * 50 + 50) * 100;
        }

		else {
			alert("You don't have enough gold! You need " + (castleUpgradeCost - gold) + " more gold!");
		}
    }
};

function moveSoldier(i) {
	ctx.beginPath();
	ctx.arc(soldiers[i].x, soldiers[i].y, soldiers[i].radius, 0, 2 * Math.PI);
	ctx.fillStyle = "green";
	ctx.fill();

	if (play) {
		var distance = 0;

		for (var k = 0; k < bullets.length; k ++) {
			distance = Math.sqrt((Math.pow(bullets[k].x - soldiers[i].x, 2) + Math.pow(bullets[k].y - soldiers[i].y, 2)));

			if (distance <= soldiers[i].radius + bullets[k].radius && bullets[k].from !== "soldier") {
				soldiers[i].health -= bullets[k].damage;
				bullets.splice[k, 1];
      }
    }

		if (soldiers[i].health <= 0) {
			soldiers.splice(i, 1);
		}

		else {
			if (new Date() - soldiers[i].timer > soldiers[i].shootTime) {
				for (var j = 0; j < raiders.length; j ++) {
					if (Math.abs(soldiers[i].x - raiders[j].x) < 100 && Math.abs(soldiers[i].y - raiders[j].y) < 100) {
						bullets.push({x: soldiers[i].x, y: soldiers[i].y, damage: soldiers[i].damage, x_vel: (raiders[j].x - soldiers[i].x)/10, y_vel: (raiders[j].y - soldiers[i].y)/10, from: "soldier", radius: 2});
						soldiers[i].timer = new Date();
						break;
					}
				}
			}

			soldiers[i].y += soldiers[i].y_vel;
			soldiers[i].x += soldiers[i].x_vel;

			if (soldiers[i].x > castle.x + castle.scoutRange - soldiers[i].radius || soldiers[i].x < castle.x - castle.scoutRange + soldiers[i].radius) {
				soldiers[i].x_vel *= -1;
				soldiers[i].x += soldiers[i].x_vel;
			}

			if (soldiers[i].y > castle.y + castle.scoutRange - soldiers[i].radius || soldiers[i].y < castle.y - castle.scoutRange + soldiers[i].radius) {
				soldiers[i].y_vel *= -1;
				soldiers[i].y += soldiers[i].y_vel;
			}

			if (Math.random() > 0.99) {
				soldiers[i].x_vel = Math.random() - 0.5;
  	  		}

			if (Math.random() > 0.99) {
				soldiers[i].y_vel = Math.random() - 0.5;
    		}
 		}
	}
}

function moveWorker(i) {
	ctx.beginPath();
	ctx.arc(workers[i].x, workers[i].y, workers[i].radius, 0, 2 * Math.PI);
	ctx.fillStyle = "blue";
	ctx.fill();

	if (play) {

		for (var k = 0; k < bullets.length; k ++) {
			distance = Math.sqrt((Math.pow(bullets[k].x - workers[i].x, 2) + Math.pow(bullets[k].y - workers[i].y, 2)));

			if (distance <= workers[i].radius + bullets[k].radius && bullets[k].from !== "soldier") {
				workers[i].health -= bullets[k].damage;
				bullets.splice[k, 1];
      }
    }

		if (workers[i].health <= 0) {
			workers.splice(i, 1);
		}

		else {
			workers[i].y += workers[i].y_vel;
			workers[i].x += workers[i].x_vel;
			if (Math.random()*100 > workers[i].income) {
				gold ++;
			}

			if (workers[i].x > castle.x + castle.scoutRange - workers[i].radius || workers[i].x < castle.x - castle.scoutRange + workers[i].radius) {
				workers[i].x_vel *= -1;
				workers[i].x += workers[i].x_vel;
			}

			if (workers[i].y > castle.y + castle.scoutRange - workers[i].radius || workers[i].y < castle.y - castle.scoutRange + workers[i].radius) {
				workers[i].y_vel *= -1;
				workers[i].y += workers[i].y_vel;
			}

			if (Math.random() > 0.99) {
				workers[i].x_vel = Math.random() - 0.5;
	   	}

			if (Math.random() > 0.99) {
				workers[i].y_vel = Math.random() - 0.5;
    	}
 		}
	}
}

function moveRaider(i) {
	ctx.beginPath();
	ctx.arc(raiders[i].x, raiders[i].y, raiders[i].radius, 0, 2 * Math.PI);
	ctx.fillStyle = "red";
	ctx.fill();

	if (play) {
		var distance = 0;

		for (var k = 0; k < bullets.length; k ++) {
			distance = Math.sqrt((Math.pow(bullets[k].x - raiders[i].x, 2) + Math.pow(bullets[k].y - raiders[i].y, 2)));

			if (distance <= raiders[i].radius + bullets[k].radius && bullets[k].from !== "raider" + i) {
				raiders[i].health -= bullets[k].damage;
				bullets.splice[k, 1];
        }
    	}

		if (raiders[i].health <= 0) {
			raiders.splice(i, 1);
		}

		else {

			if (new Date() - raiders[i].timer > raiders[i].shootTime) {
				var ifFound = false;
				for (var j = 0; j < soldiers.length; j ++) {
					if (Math.abs(raiders[i].x - soldiers[j].x) < 100 && Math.abs(raiders[i].y - soldiers[j].y) < 100) {
						bullets.push({x: raiders[i].x, y: raiders[i].y, damage: raiders[i].damage, x_vel: (soldiers[j].x - raiders[i].x)/10, y_vel: (soldiers[j].y - raiders[i].y)/10, from: "raider" + i, radius: 2});
						ifFound = true;
						break;
					}
				}

				if (!ifFound) {
					for (var n = 0; n < workers.length; n ++) {
						if (Math.abs(raiders[i].x - workers[n].x) < 100 && Math.abs(raiders[i].y - workers[n].y) < 100) {
							bullets.push({x: raiders[i].x, y: raiders[i].y, damage: raiders[i].damage, x_vel: (workers[n].x - raiders[i].x)/10, y_vel: (workers[n].y - raiders[i].y)/10, from: "raider" + i, radius: 2});
							ifFound = true;
							break;
						}
					}
				}

				if (ifFound) {
					raiders[i].timer = new Date();
				}
      }

			raiders[i].y += raiders[i].y_vel;
			raiders[i].x += raiders[i].x_vel;

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
			}

			if (raiders[i].x > canvas.width - raiders[i].radius|| raiders[i].x < raiders[i].radius) {
				raiders[i].x_vel *= -1;
				raiders[i].x += raiders[i].x_vel;
			}

			if (raiders[i].y > canvas.height - raiders[i].radius|| raiders[i].y < 150 + raiders[i].radius) {
				raiders[i].y_vel *= -1;
				raiders[i].y += raiders[i].y_vel;
			}

			if (Math.random() > 0.999) {
				raiders[i].x_vel = Math.random() * 2 - 1;
	   	}

			if (Math.random() > 0.999) {
				raiders[i].y_vel = Math.random() * 2 - 1;
    	}
 		}
	}
}

function moveBullet(i) {
	ctx.beginPath();
	ctx.arc(bullets[i].x, bullets[i].y, bullets[i].radius, 0, 2 * Math.PI);
	ctx.fillStyle = "black";
	ctx.fill();

	if (play) {
		if (bullets[i].x > canvas.width - bullets[i].radius || bullets[i].x < bullets[i].radius || bullets[i].y > canvas.height - bullets[i].radius || bullets[i].y < 150 + bullets[i].radius) {
			bullets.splice(i, 1);
    	}
		else {
			bullets[i].x += bullets[i].x_vel;
			bullets[i].y += bullets[i].y_vel;
        }
    }
}

function startRaid() {
	var raiders1 = Math.floor((Math.random() * ((soldiers.length + workers.length)/ 32)) + ((soldiers.length + workers.length)/ 16));
	for (var i = 0; i < raiders1; i ++) {
    raiders.push({x: (Math.random() * (canvas.width/2 - castle.scoutRange - 20) + 10), y : (Math.random() * (canvas.height - 150 - 20) + 150 + 10), radius: 10, x_vel: Math.random() * 2 - 1, y_vel: Math.random() * 2 - 1, health: 100, timer: new Date(), shootTime: Math.random()*100+450});
	}
	if (raiders1 > 0) {
		alert("A raid is starting. " + raiders1 + " people have dropped onto land west of your castle! There are now " + raiders.length + " raiders near your castle.");
}
}

function topBar() {

	ctx.fillStyle = "black";
	ctx.fillRect(0, 148, canvas.width, 2);

	ctx.font = "15px Arial";
	ctx.fillText("Soldier Tycoon Game By Eric", 10, 20);

	ctx.font = "15px Arial";
	ctx.fillText("You have " + gold + " gold! You earn " + gps + " gold per second. You have " + fps + " fps.        Your population: " + (soldiers.length + workers.length) + "/" + maxPeople + "         There are " + raiders.length + " raiders.", 250, 20);
	ctx.fillStyle = "yellow";
	ctx.fillRect(10, 30, gold/1000, 25);

	ctx.fillStyle = "green";
	ctx.fillRect(10, 75, 120, 50);
	ctx.fillStyle = "black";
	ctx.font = "12px Arial";
	ctx.fillText("Hire Soldier for " + soldierCost + " gold.", 10, 70);
	ctx.font = "12px Arial";
	if (soldiers.length === 1) {
		ctx.fillText("You have " + soldiers.length + " soldier", 10, 135);
	}
	else {
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
	}
	else {
		ctx.fillText("You have " + workers.length + " workers", 200, 135);
	}

	ctx.fillStyle = "grey";
	ctx.fillRect(390, 75, 120, 50);
	ctx.fillStyle = "black";
	ctx.font = "12px Arial";
	ctx.fillText("Upgrade your castle for " + castleUpgradeCost + " gold.", 390, 70);

	ctx.fillStyle = "grey";
	ctx.fillRect(canvas.width - 60, 50, 50, 50);
	ctx.fillStyle = "black";
	ctx.font = "30px Arial";
	if (play) {
		ctx.fillText("||", canvas.width - 45, 83);
	}
	else {
		ctx.fillText(">", canvas.width - 45, 85);
	}
}

function drawBackground() {

	ctx.beginPath();
	ctx.arc(castle.x, castle.y, castle.radius, 0, 2 * Math.PI);
	ctx.fillStyle = "green";
	ctx.fill();

	ctx.strokeRect(castle.x - castle.scoutRange, castle.y - castle.scoutRange, 2 * castle.scoutRange, 2 * castle.scoutRange);
}

function draw() {

	if (new Date() - d >= 1000 && play) {
		gps = gold - goldBefore;
		goldBefore = gold;
		d = new Date();
		fps = frames;
		frames = 0;
	}

	frames ++;

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (!play) {
		ctx.fillStyle = "grey";
		ctx.fillRect(0, 150, canvas.width, canvas.height - 150);
		ctx.fillStyle = "black";
		ctx.font = "15px Arial";
		ctx.fillText("paused", canvas.width/2 - 20, 170);
	}
	else {
		if (Math.random() > .995) {
			startRaid();
		}
	}

	for (var m = 0; m < bullets.length; m ++) {
		moveBullet(m);
	}

	for (var k = 0; k < workers.length; k ++) {
		moveWorker(k);
	}

	for (var j = 0; j < soldiers.length; j ++) {
		moveSoldier(j);
	}

	for (var n = 0; n < raiders.length; n ++) {
		moveRaider(n);
	}

	drawBackground();

	topBar();

	requestAnimationFrame(draw);

}

draw();
