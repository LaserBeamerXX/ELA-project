var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

// Declare our Scoring varibles
var score = 0;
var scoreText;

// create our game
var game = new Phaser.Game(config);

function preload() {
	// For assets, go to: https://examples.phaser.io/assets/
	this.load.image(
		"sky",
		"https://phaser.io/content/tutorials/making-your-first-phaser-3-game/part3.png"
	);
	this.load.image(
		"ground",
		"https://phaser.io/content/tutorials/making-your-first-phaser-3-game/platform.png"
	);
	this.load.image(
		"star",
		"https://examples.phaser.io/assets/particlestorm/star.png"
	);
	this.load.image(
		"bomb",
		"https://examples.phaser.io/assets/particlestorm/particles/bomb.png"
	);
	this.load.spritesheet(
		"dude",
		"https://phaser.io/content/tutorials/making-your-first-phaser-3-game/dude.png",
		{ frameWidth: 32, frameHeight: 48 }
	);
	
	// load the webfont library
	this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
}

function create() {
	this.add.image(0, 0, "sky").setOrigin(0, 0);

	// Add our static (non-moving) platforms
	platforms = this.physics.add.staticGroup();

	// the ground
	platforms.create(400, 568, "ground").setScale(2).refreshBody();

	// levitating platforms
	platforms.create(600, 400, "ground");
	platforms.create(50, 250, "ground");
	platforms.create(750, 220, "ground");

	// Create our player
	player = this.physics.add.sprite(100, 450, "dude");

	player.setBounce(0.2);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300);
	this.physics.add.collider(player, platforms);

	this.anims.create({
		key: "left",
		frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: "turn",
		frames: [{ key: "dude", frame: 4 }],
		frameRate: 20
	});

	this.anims.create({
		key: "right",
		frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1
	});

	// Add keyboard input
	cursors = this.input.keyboard.createCursorKeys();
	
	// sprinkle our world with stars
	stars = this.physics.add.group({
			key: 'star',
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
	});

	stars.children.iterate(function (child) {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
	});
	this.physics.add.collider(stars, platforms);
	this.physics.add.overlap(player, stars, collectStar, null, this);
	
	var add = this.add;
	
	// Scoring: Load Google Web Font/s
	WebFont.load({
        google: {
            families: [ 'Bangers' ]
        },
        active: function ()
        {
					// Add an initial score text (reset the game to 0 points)
					scoreText = add.text(16, 16, 'score: 0  ', { fontFamily: 'Bangers', fontSize: '32px', fill: '#000' });
				}	
			});
	
	//Add bombs and colliders with platforms and players
	bombs = this.physics.add.group();
	this.physics.add.collider(bombs, platforms);
	this.physics.add.collider(player, bombs, hitBomb, null, this);
	
}

function update() {
	// Keyboard control of player:
	if (cursors.left.isDown) {
		player.setVelocityX(-160);

		player.anims.play("left", true);
	} 
	else if (cursors.right.isDown) {
		player.setVelocityX(160);

		player.anims.play("right", true);
	} 
	else {
		player.setVelocityX(0);

		player.anims.play("turn");
	}
	// jump mechanic
	if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(-500);
}
}

function collectStar (player, star) {
    star.disableBody(true, true);
	
	  // Add 10 points to score and update the screen
    score += 10;
    scoreText.setText('Score: ' + score + ' ');	
	
	  // if all stars are collected
		if (stars.countActive(true) === 0)
	  {
		  // re-populate world with stars
			stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
      });
	    // set a random horizontal position on the opposite half of the screen as the player
		var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);		
			
			// Spawn the bomb at the random horizontal position 16 pixels from the top
			// Give it a good bounce and add world boundaries
			// set volocity to a random horizontal direction
			var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}
}

// Add a hit bomb function
function hitBomb (player, bomb)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}