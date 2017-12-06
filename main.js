		"use strict";
		var myGamePiece;
		var myWalls = [];
		var myScore;
		var gameOver;
		var can = document.getElementsByTagName("canvas")[0];

		function startGame() {
			myGamePiece = new component(30, 30, "red", 50, 280); //þetta lætur inn spilarann á canvasinn
			myScore = new component("20px", "Comic Sans", "white", 280, 40, "text"); //Býr til texta objectið sem er fyrir stiginn, en textinn sjálfur er settur inn seinna
			gameOver = new component("5em", "Comic Sans", "violet", 60, 160, "text"); //Býr til texta objectið sem kemur þegar maður tapar, en hann heldur engum texta í sér
			myWalls = [];
			myGameArea.start();
		}

		function restartGame() { //Byrjar leikinn aftur
			myGameArea.stop(); //Stoppar leikinn, þannig að allt er sett í base values. 
			myGameArea.clear(); //Hreinsar canvasinn þannig að 
			startGame(); //Keyrir startGame function
		}

		var myGameArea = {
			canvas : can,
			start : function() {
				this.canvas.width = 480; //Þetta er lengd canvasins
				this.canvas.height = 280; //Þetta er hæð canvasins
				this.context = this.canvas.getContext("2d");
				document.body.insertBefore(this.canvas, document.getElementsByClassName('container')[0]); //
				this.frameNo = -49; //Þetta er initial frame number sem er alltaf bætt við 1 á, ég setti það á -49 til að spilarinn fær smá tíma til að sjá að hann er byrjaður.
				this.interval = setInterval(updateGameArea, 20); //Þetta setur upp interval sem er notað á eftir, það keyrir updateGameArea sem sagt á hverjum 20 millisekúndum.
				window.addEventListener('keydown', function(e) { //Keyrir ef ýtt er á einhvern takka á lyklaborðinu
					myGameArea.keys = (myGameArea.keys || []); //
					if ([32, 38, 39, 37, 40].indexOf(e.keyCode) > -1) {
						e.preventDefault();
					}
					myGameArea.keys[e.keyCode] = true;
				});
				window.addEventListener('keyup', function(e) {
					myGameArea.keys[e.keyCode] = false;
				});
			},
			clear : function() { //Clearar canvasinn til að hann fyllist ekki af hlutum
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			},
			stop : function() { //Stoppar leikinn
				clearInterval(this.interval); //Stoppar interval þannig að það er hægt að setja það aftur upp þegar leiknum er byrjað aftur
			}
		};

		function everyinterval(n) {
			if ((myGameArea.frameNo / n) % 1 === 0) {
				return true;
			}
			return false;
		}

		function component(width, height, color, x, y, type) {
			this.type = type;
			this.width = width;
			this.height = height;
			this.speedX = 0;
			this.speedY = 0;
			this.x = x;
			this.y = y;
			this.gravity = 0.15;
			this.gravitySpeed = 0;
			this.update = function() {
					var ctx = myGameArea.context;
					if (this.type == "text") {
						ctx.font = this.width + " " + this.height;
						ctx.fillStyle = color;
						ctx.fillText(this.text, this.x, this.y);
					}
					else {
						ctx.fillStyle = color;
						ctx.fillRect(this.x, this.y, this.width, this.height);
					}
				};
			this.newPos = function() {
				this.gravitySpeed += this.gravity; 
				this.x += this.speedX;
				this.y += this.speedY + this.gravitySpeed;
				this.hitEdge();
			};
			this.hitEdge = function() {
				var completeright = myGameArea.canvas.width - this.width;
				var completeleft = 0;
				var skyhigh = 0;
				var rockbottom = myGameArea.canvas.height - this.height;
				if (this.y > rockbottom) { //Ef kassinn fer á botninn þá breytir hann ekki um y position
					this.y = rockbottom;
				}
				if (this.y < skyhigh) { //Ef kassinn fer á loftið þá breytir hann ekki um y position
					this.y = skyhigh;
				}
				if (this.x > completeright) { //Ef kassinn fer á hægri vegginn þá breytir hann ekki um x position
					this.x = completeright;
				}
				if (this.x < completeleft) { //Ef kassinn fer á vinstri vegginn þá breytir hann ekki um x position
					this.x = completeleft;
				}
			};
			this.crashWith = function(otherobj) {
				var myleft = this.x;
				var myright = this.x + (this.width);
				var mytop = this.y;
				var mybottom = this.y + (this.height);
				var otherleft = otherobj.x;
				var otherright = otherobj.x + (otherobj.width);
				var othertop = otherobj.y;
				var otherbottom = otherobj.y + (otherobj.height);
				var crash = true;
				if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) { //Detectar ef spilarinn snertir einhvern vegg
					crash = false;
				}
				return crash;
			};
		}

		function updateGameArea() {
			var x, height, gap, minHeight, maxHeight, minGap, maxGap;
			for (var j = 0; j < myWalls.length; j++) {
				if (myGamePiece.crashWith(myWalls[j])) { //ef spilarinn klessir á vegg þá stoppar leikurinn
					myGameArea.stop();
					gameOver.text = "Game Over";
					gameOver.update();
					return;
				}
			}
			myGameArea.clear(); 
			myGameArea.frameNo += 1;
			var interval = 0;
			if (myGameArea.frameNo < 150) {
				interval = 0; //Setur interval á 0 til þess að það býr ekki til 2 veggi þegar fyrsti veggurin er búinn til.
			}
			else if (myGameArea.frameNo < 500) { //minnkar tímann á milli veggja á hvern fimm hundruð því annars væri of mikill tími á milli veggja og það væri allt of létt.
				interval = 150;
			}
			else if (myGameArea.frameNo < 1000) {
				interval = 135;
			}
			else if (myGameArea.frameNo < 1500) {
				interval = 120;
			}
			else if (myGameArea.frameNo < 2000) {
				interval = 110;
			}
			else {
				interval = 95;
			}
			if (myGameArea.frameNo == 1 || everyinterval(interval)) { //Runnar þegar frame number er 1 og á hverju interval sem er breytt hérna að ofan
				x = myGameArea.canvas.width; //x er lengd canvasins
				minHeight = 20;
				maxHeight = 200;
				height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight); //Reiknar hæð efri veggsins 
				minGap = 70;
				maxGap = 150;
				gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap); //Reiknar bilið á milli veggjanna þannig að það er hægt að spila leikinn almennilega
				myWalls.push(new component(15, height, "lime", x, 0));
				myWalls.push(new component(15, x - height - gap, "lime", x, height + gap)); //Bætir við nýjum vegg við hver interval í array-ið
			}
			for (var i = 0; i < myWalls.length; i++) {
				if (myGameArea.frameNo < 500) { //Hækkar hraðann á veggjunum fyrir hver fimm hundruð
					myWalls[i].x += -2;
					myWalls[i].update();	
				}
				else if (myGameArea.frameNo < 1000) {
					myWalls[i].x += -3;
					myWalls[i].update();
				}
				else if (myGameArea.frameNo < 1500) {
					myWalls[i].x += -4;
					myWalls[i].update();
				}
				else if (myGameArea.frameNo < 2000) {
					myWalls[i].x += -5;
					myWalls[i].update();
				}
				else {
					myWalls[i].x += -6;
					myWalls[i].update();
				}
			}
			myGamePiece.speedX = 0;
			myGamePiece.speedY = 0;
			if (myGameArea.keys && myGameArea.keys[87]) {myGamePiece.speedY = -2.5; myGamePiece.gravitySpeed = 0; } //Ef notandi ýtir á "W" þá hoppar spilarinn
			if (myGameArea.keys && myGameArea.keys[68]) {myGamePiece.speedX = 2.5; } //Ef notandi ýtir á "D" þá fer spilarinn til hægri
			if (myGameArea.keys && myGameArea.keys[65]) {myGamePiece.speedX = -2.5; } //Ef notandi ýtir á "A" þá fer spilarinn til vinstri
			if (myGameArea.keys && myGameArea.keys[38]) { myGamePiece.speedY = -2.5; myGamePiece.gravitySpeed = 0; } //Ef notandi ýtir á upp örvatakkann þá hoppar spilarinn
			//if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.speedY = 2.5; }
			if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = 2.5; } //Ef notandi ýtir á hægri örvatakkann þá fer spilarinn til hægri
			if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -2.5; } //Ef notandi ýtir á vinstri örvatakkann þá fer spilarinn til vinstri
			if (myGameArea.frameNo < 0) {
				myScore.text = "STIG: 0"; //Setur textann fyrir stiginn
			}
			else {
				myScore.text = "STIG: " + myGameArea.frameNo; //Setur textann fyrir stiginn þannig að það er með sömu tölu og frameNo
			}
			myScore.update();
			myGamePiece.newPos();
			myGamePiece.update();
		}
<<<<<<< HEAD:main.js
			var buton = document.getElementsByTagName("button")[0]; //lætur buton verða Restart takkinn
			buton.addEventListener("click", restartGame); //Bætir við event listener á Restart takkann til að runna restartGame function
=======
			var buton = document.getElementsByTagName("button")[0];
			buton.addEventListener("click", restartGame);
>>>>>>> 42bede26221b63f84e549a94ab49c7ef222ef050:main.js
