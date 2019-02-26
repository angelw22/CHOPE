var throwable;
// var mouseDrag;
var bodyAs = [];
var cat1 = [];
var cat3 = [];
var game = new Phaser.Game(960, 600, Phaser.AUTO);
var base, bag, hand, attached, touching = false;
var throwable, throwableJoint, destroying, released = false, tick;
var tableCollision = false;
var money = 0, text;
var damping = 1.5;


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
	    this.load.image('check', 'assets/images/checked.png');

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

		this.bg = game.add.tileSprite(0, 0, 960, 600, 'tile');
		this.bg.tileScale.x = 0.5;
		this.bg.tileScale.y = 0.5

		var blocks = game.add.physicsGroup(Phaser.Physics.BOX2D);

		var tables = [
			bluetable1 = game.add.sprite(140, 90, 'bluetable'),
			bluetable2 = game.add.sprite(480, 90, 'bluetable'),
			bluetable3 = game.add.sprite(140, 270, 'bluetable'),
			yellowtable1 = game.add.sprite(490, 280, 'yellowtable'),
			yellowtable2 = game.add.sprite(830, 280, 'yellowtable'),
			yellowtable3 = game.add.sprite(830, 100, 'yellowtable')
		]

		for (i = 0; i < tables.length; i++) {
			game.physics.box2d.enable(tables[i]);
			tables[i].body.static = true;
			tables[i].body.setCollisionCategory(cat3);

			if (i < 3) {
				var sensor = tables[i].body.addRectangle(150, 80, 0, 0);
				sensor.SetSensor(true);
				tables[i].body.setFixtureContactCallback(sensor,  collision,  this)
			}
			else {
				var sensor = tables[i].body.addCircle(45, 0, 0)
				sensor.SetSensor(true);
				tables[i].body.setFixtureContactCallback(sensor,  collision,  this)
			}
		}

		var verticalConstraint = game.add.sprite(0, 600, 'tile');
		game.physics.box2d.enable(verticalConstraint);
		verticalConstraint.scale.setTo(0.1)
		verticalConstraint.body.static = true;
		
		//Arm creation
        {     
	        var rearArm = game.add.sprite(605, 570, 'arm');
	        rearArm.scale.setTo(0.3);
	        game.physics.box2d.enable(rearArm);

	        var foreArm = game.add.sprite(523, 570, 'arm');
	        foreArm.scale.setTo(0.3);
	        game.physics.box2d.enable(foreArm);
			foreArm.body.setCollisionCategory(cat1);

			hand = game.add.sprite(490, 570, 'hand');
	        hand.scale.setTo(0.3);
	        hand.anchor.set(0.5);
	        game.physics.box2d.enable(hand);
	        hand.body.setCollisionCategory(cat1);	
	        hand.inputEnabled = true;
	        hand.events.onInputDown.add(attachHand, this);
	        hand.body.collideWorldBounds = true;

	        bag = game.add.sprite(0, 600, 'bag');
	        game.physics.box2d.enable(bag);
	        //bag properties
			bag.anchor.x = 0;
			bag.anchor.y = 1;
			bag.inputEnabled = true;
	        bag.body.static = true;

	        bag.events.onInputDown.add(spawnThrowable, this);


	        base = game.add.sprite(600, 600, 'head');
	        game.physics.box2d.enable(base);
	        // base.body.static = true;
	        base.body.collideWorldBounds = true;
	        base.body.setCollisionCategory(cat1);
	        
	        //console.log(base.inputEnabled)

        	game.physics.box2d.prismaticJoint(verticalConstraint, base, 1, 0, 0, 0, 0, 0);
	        //bodyA, bodyB, ax, ay, bx, by, motorSpeed, motorTorque, motorEnabled, lowerLimit, upperLimit, limitEnabled
	        game.physics.box2d.revoluteJoint(base, rearArm, 40, -30, 35, 0, 0, 0, false, 30, 180, true);
	        
	        game.physics.box2d.revoluteJoint(rearArm, foreArm, -40, 0, 35, 0, 0, 0, false, -150, 0, true);

	        game.physics.box2d.revoluteJoint(foreArm, hand, -30, 0, 0, 0, 0, 0, false, 0, 1, true);

	        bodyAs.push(base.body);
	    }

	   	//Base movement
	   	left = game.input.keyboard.addKey(Phaser.Keyboard.A);
	   	left.onDown.add(moveLeft, this);
   		right = game.input.keyboard.addKey(Phaser.Keyboard.D);
   		right.onDown.add(moveRight, this);
   		
   		//Hand detachment
	   	esc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    	esc.onDown.add(detachHand, this);

	   	//Base freeze
	   	spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	   	game.input.keyboard.removeKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.ESC, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);



	},
	update: function() {
		//if throwable is stopped and destroying not in progress, change throwable value 
		if (throwable && !destroying && released) { 
			x = throwable.world.x;
			y = throwable.world.y
			if (throwable.body.velocity.x == 0 && throwable.body.velocity.y == 0) {
				
				if (throwable.alpha > 0) {
					throwable.alpha -= 0.2
				}
				else {
					throwable.destroy();
					throwable.kill();
					checkCollision(x, y)
				}
			}
		}

		// if (!destroying && tick) {
		// 	if (tick.alpha > 0) {
		// 		tick.alpha -= 0.1
		// 	}
		// 	else {
		// 		tick.destroy();
		// 		throwable.kill();
		// 		tick = 0;
		// 	}
		// }

		if (spaceKey.isDown) {
			base.body.static = true;
		}

		if (spaceKey.isUp) {
			base.body.static = false;
		}

	},
	render: function() {
		//game.debug.box2dWorld();
	}
};


function attachHand() {
    game.physics.box2d.mouseDragStart(game.input.mousePointer);
    game.input.addMoveCallback(moveHand, hand);
    attached = true
    
}

function moveHand() {
	game.physics.box2d.mouseDragMove(game.input.mousePointer);
}


function detachHand() {
	game.physics.box2d.mouseDragEnd();
	//attached = false
}

function moveLeft() {
	base.body.moveLeft(400);
}

function moveRight() {
	base.body.moveRight(400);
}

function spawnThrowable() {
	bag.events.onInputDown.add(spawn, this);
	function spawn() {
		released = false;
		if (!throwable) {
			tissue = Math.random() < 0.5 ? 'pinkt' : 'bluet'
			throwable = game.add.sprite(30, 520, tissue);
			throwable.scale.setTo(0.4)
			throwable.anchor.setTo(0.5);
			game.physics.box2d.enable(throwable);
			throwable.body.setRectangle(60,40, 0, 8);
			throwable.body.collideWorldBounds = true;

			//console.log(throwable);
			throwable.inputEnabled = true;

			throwable.events.onInputUp.add(releaseThrowable, this);
			throwable.body.setCategoryContactCallback(1, connectThrowable, this);
			
			//console.log(throwable.body)
		}
		else {
			throwable.destroy(true);
			throwable = false;
		}
	}

}


function connectThrowable() {
	throwable.events.onInputDown.add(connect, throwable);
	//console.log(throwableJoint);
	function connect() {
		if (!throwableJoint) {
			//console.log("creating join")
			throwableJoint = game.physics.box2d.revoluteJoint(hand, throwable, 0, 0, 0, 0, 0, 0, false, 0, 1, true);	
		}
		else return 
	}
}



function releaseThrowable() {
	released = true;
	//throwable.body.setCategoryContactCallback(cat3, tableCollision, this);
	throwable.body.angularDamping = damping;
	throwable.body.linearDamping = damping;

	throwable.game.physics.box2d.world.DestroyJoint(throwableJoint);
	throwableJoint = 0;
}

function collision(body1, body2, fixture1, fixture2, begin) {
	//console.log(begin);
	tableCollision = begin;
}

function checkCollision(x, y) {
	//console.log('checking collision', tableCollision)
	destroying = true;
	if (tableCollision) {
		//console.log('collision ok!')
		money ++ 
		text.innerHTML = money
	}
	released = false;
	destroying = false;
}

game.state.add('GameState', GameState);
game.state.start('GameState');
