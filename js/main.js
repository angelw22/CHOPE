var game = new Phaser.Game(960, 700, Phaser.AUTO);
var base, bag, hand, attached, touching = false;
var throwables = {}, lastThrowableId, heldThrowable, releasedThrowable = [], destroyableSprite = [], damping = 1.8;
//var throwables = {}, lastThrowableId, throwableJoint, destroying = false, released = false, damping = 1.8;
var tableCollision = false, tableColliders = {};
var money = 0, text;
let personHit = false, peopleHit = {};
var timer;

var GameState = {
	preload: function() {
		this.load.image('tile', 'assets/images/tile.png');
		this.load.image('bluet', 'assets/sprites/bluet.png');
		this.load.image('pinkt', 'assets/sprites/pinkt.png');
		this.load.image('yellowtable', 'assets/sprites/yellowtable.png');
		this.load.image('bluetable', 'assets/sprites/bluetable.png');
	    this.load.image('arm', 'assets/sprites/arm.png');
	    this.load.image('hand', 'assets/sprites/hand.png');
	    this.load.image('head', 'assets/sprites/head.png');
	    this.load.image('bag', 'assets/sprites/bag.png');
	    this.load.image('peopleh', 'assets/sprites/people.png');
	    this.load.image('peoplev', 'assets/sprites/peoplevertical.png');
	    this.load.image('angry', 'assets/sprites/angry.png');

	},
	create: function() {
		text = document.getElementById("money");

		game.physics.startSystem(Phaser.Physics.BOX2D);
		game.physics.box2d.gravity.y = 0;
		game.physics.box2d.setBoundsToWorld();
	    game.physics.box2d.debugDraw.joints = true;
	    game.input.mouse.capture = true;
		
		game.stage.backgroundColor = "#ffffff";

		//text = game.add.text(

		this.bg = game.add.tileSprite(0, 0, 960, 800, 'tile');
		this.bg.tileScale.x = 0.5;
		this.bg.tileScale.y = 0.5

		var blocks = game.add.physicsGroup(Phaser.Physics.BOX2D);

		var tables = [
			bluetable1 = game.add.sprite(160, 120, 'bluetable'),
			bluetable2 = game.add.sprite(510, 120, 'bluetable'),
			bluetable3 = game.add.sprite(160, 350, 'bluetable'),
			yellowtable1 = game.add.sprite(510, 330, 'yellowtable'),
			yellowtable2 = game.add.sprite(830, 330, 'yellowtable'),
			yellowtable3 = game.add.sprite(830, 100, 'yellowtable')

		]

		for (i = 0; i < tables.length; i++) {
			game.physics.box2d.enable(tables[i]);
			tables[i].body.static = true;
			var position = tables[i].position;

			if (i < 3) {		
				var sensor = tables[i].body.setRectangle(65, 80, 40, 0);
				var sensor2 = tables[i].body.addRectangle(65, 80, -40, 0)

				var people = game.add.sprite(position.x + 50, position.y, 'peoplev');
				var people2 = game.add.sprite(position.x - 50, position.y, 'peoplev');

				people.scale.setTo(0.7);
				people2.scale.setTo(0.7);
				game.physics.box2d.enable(people);
				game.physics.box2d.enable(people2);


				var p1 = people.body.setCircle(30, 0, -80);
				var p2 = people.body.addCircle(30, 0, 80);
				var p3 = people2.body.setCircle(30, 0, -80);
				var p4 = people2.body.addCircle(30, 0, 80);

				peopleHit[p1.id] = {hit: false, x: position.x + 50, y: position.y - 80, sprite: people, emoji: game.add.sprite(position.x + 50, position.y - 80, 'angry')};
				peopleHit[p2.id] = {hit: false, x: position.x + 50, y: position.y + 80, sprite: people, emoji: game.add.sprite(position.x + 50, position.y + 80, 'angry')};
				peopleHit[p3.id] = {hit: false, x: position.x - 50, y: position.y - 80, sprite: people2, emoji: game.add.sprite(position.x - 50, position.y - 80, 'angry')};
				peopleHit[p4.id] = {hit: false, x: position.x - 50, y: position.y + 80, sprite: people2, emoji: game.add.sprite(position.x - 50, position.y + 80, 'angry')};

				// let emoji = game.add.sprite(p1.x, p1.y, 'angry');
				// let emoji2 = game.add.sprite(p2.x, p2.y, 'angry');
				// let emoji3 = game.add.sprite(p3.x, p3.y, 'angry');
				// let emoji4 = game.add.sprite(p4.x, p4.y, 'angry');

				peopleHit[p1.id].emoji.alpha = 0;
				peopleHit[p2.id].emoji.alpha = 0;
				peopleHit[p3.id].emoji.alpha = 0;
				peopleHit[p4.id].emoji.alpha = 0;
				

				p1.SetSensor(true);
				p2.SetSensor(true);
				p3.SetSensor(true);
				p4.SetSensor(true);

				people.body.setFixtureContactCallback(p1,  hitPerson,  this);
				people.body.setFixtureContactCallback(p2,  hitPerson,  this);
				people2.body.setFixtureContactCallback(p3,  hitPerson,  this);
				people2.body.setFixtureContactCallback(p4,  hitPerson,  this);
				
				people.alpha = 0;
				people2.alpha = 0;


				tableColliders[sensor.id] = {sprite: people, hit: false};
				tableColliders[sensor2.id] = {sprite: people2, hit: false};

				sensor.SetSensor(true);
				sensor2.SetSensor(true);
				tables[i].body.setFixtureContactCallback(sensor,  tableCollide,  this);
				tables[i].body.setFixtureContactCallback(sensor2,  tableCollide,  this);

			}
			else {
				var tableSensor = tables[i].body.setCircle(45, 0, 0)
				var people = game.add.sprite(position.x, position.y, 'peopleh');
				people.scale.setTo(0.7);
				game.physics.box2d.enable(people);

				var p1 = people.body.setCircle(30, -80, 0);
				var p2 = people.body.addCircle(30, 80, 0);
				peopleHit[p1.id] = {hit: false, x: position.x - 70, y: position.y, sprite: people, emoji: game.add.sprite(position.x - 70, position.y, 'angry')};
				peopleHit[p2.id] = {hit: false, x: position.x + 70, y: position.y, sprite: people, emoji: game.add.sprite(position.x + 70, position.y, 'angry')};

				p1.SetSensor(true);
				p2.SetSensor(true);

				peopleHit[p1.id].emoji.alpha = 0;
				peopleHit[p2.id].emoji.alpha = 0;

				people.body.setFixtureContactCallback(p1,  hitPerson,  this);
				people.body.setFixtureContactCallback(p2,  hitPerson,  this);

				people.alpha = 0;

				tableSensor.SetSensor(true);
				tableColliders[tableSensor.id] = {sprite: people, x: position.x + 50, y: position.y, active: false};
				tables[i].body.setFixtureContactCallback(tableSensor,  tableCollide,  this)
			}
			
		}

		var verticalConstraint = game.add.sprite(0, 700, 'tile');
		game.physics.box2d.enable(verticalConstraint);
		verticalConstraint.scale.setTo(0.1)
		verticalConstraint.body.static = true;
		verticalConstraint.body.setRectangle(1,1, 0, 700);
		
		//Arm creation
        var rearArm = game.add.sprite(605, 670, 'arm');
        rearArm.scale.setTo(0.3);
        game.physics.box2d.enable(rearArm);

        var foreArm = game.add.sprite(523, 670, 'arm');
        foreArm.scale.setTo(0.3);
        game.physics.box2d.enable(foreArm);
		foreArm.body.sensor = true;

		hand = game.add.sprite(480, 670, 'hand');
        hand.scale.setTo(0.3);
        hand.anchor.set(0.5);
        game.physics.box2d.enable(hand);
        //hand.body.setCollisionCategory(2);	
        hand.inputEnabled = true;
        hand.events.onInputDown.add(attachHand, this);
        hand.body.collideWorldBounds = true;
        hand.body.sensor = true;

        bag = game.add.sprite(400, 650, 'bag');
        game.physics.box2d.enable(bag);
        //bag properties
		bag.inputEnabled = true;
        bag.body.static = true;
        //bag.body.setRectangle(10,20, 0, 0);
        bag.body.sensor = true;
        bag.body.setBodyContactCallback(hand, touchBag, this);
        bag.kill()

        base = game.add.sprite(600, 700, 'head');
        game.physics.box2d.enable(base);
        base.body.setCircle(20, 0, 0)
        base.body.collideWorldBounds = true;


    	game.physics.box2d.prismaticJoint(verticalConstraint, base, 1, 0, 0, 0, 0, 0);
        //bodyA, bodyB, ax, ay, bx, by, motorSpeed, motorTorque, motorEnabled, lowerLimit, upperLimit, limitEnabled
        game.physics.box2d.revoluteJoint(base, rearArm, 40, -30, 35, 0, 0, 0, false, 30, 180, true);
        game.physics.box2d.revoluteJoint(rearArm, foreArm, -40, 0, 35, 0, 0, 0, false, -150, 0, true);
        game.physics.box2d.revoluteJoint(foreArm, hand, -40, 0, 0, 0, 0, 0, false, 0, 1, true);
   		
   		//Hand detachment
	   	esc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    	esc.onDown.add(detachHand, this);

	   	//Base freeze
	   	spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	   	game.input.keyboard.removeKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.ESC, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);

	   	timer = game.time.create();
        
        // Create a delayed event 1m and 30s from now
        timerEvent = timer.add(Phaser.Timer.MINUTE * 1 + Phaser.Timer.SECOND * 30, this.endTimer, this);
        

	},
	update: function() {

		if (releasedThrowable.length > 0) {
			tissueId = releasedThrowable[0];
			if (!throwables[tissueId].destroying && throwables[tissueId].sprite.body.velocity.x == 0 && throwables[tissueId].sprite.body.velocity.y == 0) { 
				releasedThrowable.shift();
				x = throwables[tissueId].sprite.world.x;
				y = throwables[tissueId].sprite.world.y;
				
				checkCollision(x, y, tissueId)
			}
		}

		if (spaceKey.isDown) {
			base.body.static = true;
		}

		if (spaceKey.isUp) {
			base.body.static = false;
		}

	},
	render: function () {
		// game.debug.box2dWorld();
        // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
        if (timer.running) {
            game.debug.text(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000)), 450, 14, "#000");
        }
        else {
            game.debug.text("Click on the hand to start!", 360, 24, "#000");
            bag.kill()
        }
    },
    endTimer: function() {
        // Stop the timer when the delayed event triggers
        timer.stop();
    },
    formatTime: function(s) {
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(s / 60);
        var seconds = "0" + (s - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);   
    }
};

//Functions for moving the player object 
function attachHand() {
    game.physics.box2d.mouseDragStart(game.input.mousePointer);
    game.input.addMoveCallback(moveHand, hand);
    timer.start();
    bag.revive();
    attached = true
    
}

function moveHand() {
	game.physics.box2d.mouseDragMove(game.input.mousePointer);
}


function detachHand() {
	game.physics.box2d.mouseDragEnd();
	//attached = false
}

//Callback function for collision between the hand and the bag
function touchBag(body1, body2, fixture1, fixture2, begin) {
	if (begin) {
		bag.input.enabled = true;
		bag.events.onInputDown.add(spawnThrowable, this);
	}
	else {
		bag.input.enabled = false;
	}
}


//Function to spawn the tissue paper 
function spawnThrowable() {
	if ((Object.getOwnPropertyNames(throwables).length > 0) ? throwables[lastThrowableId].released == true : true && releasedThrowable.length < 5) {
		tissueColour = Math.random() < 0.5 ? 'pinkt' : 'bluet';
		var tissue = game.add.sprite(400, 550, tissueColour);
		tissue.scale.setTo(0.4)
		tissue.anchor.setTo(0.5);
		game.physics.box2d.enable(tissue);
		tissueFixture = tissue.body.setRectangle(60,40, 0, 8);
		tissue.body.collideWorldBounds = true;
		//throwable.body.sensor = true;
		tissue.inputEnabled = true;
		lastThrowableId = tissue.body.id;
		tissue.body.setBodyContactCallback(hand, connectThrowable, this);
		throwables[tissue.body.id] = ({sprite: tissue, released : false, destroying: false, joint: false});
	}
}

//Check for collision between hand and throwable to enable connection 
function connectThrowable(body1, body2, fixture1, fixture2, begin) {
	if (begin && !heldThrowable) {
		throwables[body1.id].sprite.input.enabled = true;
		throwables[body1.id].sprite.events.onInputDown.add(connect, this);	
	}
	else {
		throwables[body1.id].sprite.input.enabled = false
	}
}

//Create revolute joint between hand and tissue
function connect() {
	for (var key in throwables) {
		let tissue = throwables[key];
		
		if (tissue.released == false) {
			tissue.joint = game.physics.box2d.revoluteJoint(hand, tissue.sprite, 0, 0, 0, 0, 0, 0, false, 0, 1, true);
			tissue.sprite.events.onInputUp.add(releaseThrowable, this);

			heldThrowable = tissue.sprite.body.id
		}
	}
}

//Function to release throwable
function releaseThrowable() {	
	if (heldThrowable) {
		heldId = heldThrowable
		heldThrowable = false
		releasedThrowable.push(heldId);
		tissue = throwables[heldId]
		heldThrowable = false;
		tissue.released = true;
		tissue.sprite.body.angularDamping = damping;
		tissue.sprite.body.linearDamping = damping;
		tissue.sprite.game.physics.box2d.world.DestroyJoint(tissue.joint);
		tissue.joint = false;
	}	
}

//Callback function for table collision
function tableCollide(body1, body2, fixture1, fixture2, begin) {
	//push table collision 
	tableCollision = begin;
	tableColliders[fixture1.id].hit = begin;
	begin ? tableColliders[fixture1.id].tissueId = body2.id : tableColliders[fixture1.id].tissueId = false;
}

//Callback function for when people are hit by tissue paper
function hitPerson(body1, body2, fixture1, fixture2, begin) {
	personHit = begin;
	peopleHit[fixture1.id].hit = begin;
	begin ? peopleHit[fixture1.id].tissueId = body2.id : peopleHit[fixture1.id].tissueId = false;

}

//Invoked when tissue paper is at stand-still
function checkCollision(x, y, throwableId) {
	throwables[throwableId].destroying = true;
	let addition = 0;
	if (tableCollision) {
		for (var key in tableColliders) {
			var collider = tableColliders[key];
			//if tissue is at an identified table
			if (collider.hit == true && collider.tissueId == throwableId) {
				if (collider.sprite.alpha < 0.3) {
					collider.sprite.alpha = 1;
					addition++;
					fadePeople(collider.sprite);
				}

				else if (personHit) {
					for (var key in peopleHit) {
						let person = peopleHit[key]
						if (person.hit == true && person.tissueId == throwableId && person.sprite.alpha == 1) {
							person.emoji.alpha = 1;
							addition = -0.5
							fadePeople(person.sprite, person.emoji);
						}
					}
				}
			}
		}
		destroyThrowable(throwableId, 'fade');
	}

	else if (personHit) {
		for (var key in peopleHit) {
			let person = peopleHit[key]
			if (person.hit == true && person.tissueId == throwableId && person.sprite.alpha == 1) {
				person.emoji.alpha = 1;
				addition = -0.5
				fadePeople(person.sprite, person.emoji);
			}
		}
		destroyThrowable(throwableId, 'fade');
	}
	else {
		destroyThrowable(throwableId);
	}

	money += addition;
	text.innerHTML = money.toFixed(2);

}

//Destroy throwable after it is thrown and stopped moving 
function destroyThrowable(id, method) {
	sprite = throwables[id].sprite
	if (method == "fade") {
		game.add.tween(sprite).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
	}
	else {
		game.add.tween(sprite.scale).to( { x: 0, y: 0 }, 1000, Phaser.Easing.Linear.None, true);
	}
	destroyableSprite.push(id);

	game.time.events.add(Phaser.Timer.SECOND * 0.5, destroySprite, this);
	
}

function destroySprite() {
	id = destroyableSprite.shift();
	throwables[id].sprite.destroy();
	// delete throwables[id]
}

//Fade people after they are spawned
function fadePeople(sprite, emoji) {
	tween1 = emoji ? game.add.tween(emoji).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, false) : false
	tween2 = game.add.tween(sprite).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, false);

	game.time.events.add(Phaser.Timer.SECOND * 10, fade, this);
	
	function fade() {
		if (tween1) {
			console.log('fading emoji and tween2')
			tween1.start();
			tween2.start()	
		}
		else {
			console.log('fading person only')
			tween2.start()
		}
	}
}



game.state.add('GameState', GameState);
game.state.start('GameState');
