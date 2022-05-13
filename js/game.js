var cursors;
var keyA, keyS, keyD, keyW;
var player;
var camera;
var battle_token;
var graphics;
var bruteHP, nerdHP, bossHP;
var bevoHP, turtHP, catHP, squirHP;
var dHP, bHP, tHP, sHP;
var playerx, playery;
var eMeet;
var e1, e2, e3, e4, e5;
var p1, p1, p3;
var m1;
var a1, a2, a3, a4;
var partyCount = 0;
var space;
var key;
var theme;
var ui_camera;
var go = false;

var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: "BootScene" });
    },

    preload: function ()
    {
        this.load.spritesheet('us', 'assets/spritesheets/utperson.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('advisor', 'assets/spritesheets/utadvisor.png', { frameWidth: 64, frameHeight: 64});
    },
	
    create: function ()
    {
        //  sprite animations
        this.anims.create({
            key: 'usTurn',
            frames: this.anims.generateFrameNumbers('us', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'usStraight',
            frames: [ { key: 'us', frame: 0 } ],
            frameRate: 6
        });
        this.anims.create({
            key: 'foeTurn',
            frames: this.anims.generateFrameNumbers('foe', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'foeStraight',
            frames: [ { key: 'foe', frame: 0 } ],
            frameRate: 20
        });

        //  arrow key inputs
        cursors = this.input.keyboard.createCursorKeys();
        // this.input.keyboard.on("keydown", this.onKeyInput, this);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

        this.physics.add.sprite(695, 385, 'advisor').setScale(8);

        var style = { font: "30px Bradley Hand", fill: "#000000", backgroundColor: "#fddab9"};
        var txtZero = this.add.text(20, 20, "Welcome to UT. I'm your Advisor.", style);
        setTimeout(() => { txtOne = this.add.text(20, 75, "A&M has disrespected UT by doing\na 'Horns Down!' They're overrunning campus.", style); }, 2000);
        setTimeout(() => { txtThr = this.add.text(20, 170, "Use WASD/arrow keys to move and shift to run to\nfind 4 UT animals to help you fight the boss -\nA&M's mascot, Reveille the dog!", style); }, 4000);
        setTimeout(() => { txtFour = this.add.text(20, 305, "In your fight, use arrow keys to\nmove your cursor and space to select\nan animal and an enemy.", style); }, 6000);
        setTimeout(() => { txtFive = this.add.text(20, 440, "Advisors will help you, but enemies\nwill hurt your animals.", style); }, 8000);
        setTimeout(() => { txtSix = this.add.text(20, 540, "Click Y to play", style); }, 10000);
        

        // setTimtout(() => { go = true; }, 10500);
        go = true;
    },

    update: function()
    {
        if(keyY.isDown && go == true)
        {
            this.scene.start("WorldScene");
        }
    }
});

var Message = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize:
    function Message(scene, events, x, y) {
        Phaser.GameObjects.Container.call(this, scene, 400, 470);
        var graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(1, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);        
        graphics.strokeRect(-90, -15, 180, 30);
        graphics.fillRect(-90, -15, 180, 30);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: "#ffffff", align: "center", fontSize: 15, wordWrap: { width: 180, useAdvancedWrap: true }});
        this.add(this.text);
        this.text.setOrigin(0.5);        
        events.on("Message", this.showMessage, this);
        this.visible = false;
    },
    showMessage: function(text) {
        this.text.setText(text);
        this.visible = true;
        if(this.hideEvent)
            this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
    },
    hideMessage: function() {
        this.hideEvent = null;
        this.visible = false;
    }
});

var WorldScene  = new Phaser.Class({
	Extends: Phaser.Scene,
	
	initialize: 
    function WorldScene (){
		Phaser.Scene.call(this, { key: "WorldScene" });
	},
    preload: function()
    {
        this.load.image("tiles", "assets/tilesets/bigtileset.png");
        this.load.tilemapTiledJSON("map", "assets/final.json");
        this.load.spritesheet('cat', 'assets/party/Cat.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('bevo', 'assets/party/bevo.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('turt', 'assets/party/turt.png', {frameWidth: 32, frameHeight:32});
        this.load.spritesheet('squir', 'assets/party/squir.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('foe', 'assets/spritesheets/a&mfoe.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('medic', 'assets/spritesheets/utmedic.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('prof', 'assets/spritesheets/utprof.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('advisor', 'assets/spritesheets/utadvisor.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('boss', 'assets/spritesheets/a&mboss.png', { frameWidth: 800, frameHeight: 533 });
        this.load.audio('texas_eyes', ['assets/audio/texas_eyes.mp3']);
    },
    create: function()
    {   
        var map = this.make.tilemap({ key: "map" });

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        theme = this.sound.add('texas_eyes');
        theme.loop = true;
        theme.play();

        var tileset = map.addTilesetImage("bigtileset", "tiles");
        var belowLayer = map.createStaticLayer("Below", tileset);
        var worldLayer = map.createStaticLayer("World", tileset);
        var aboveLayer = map.createStaticLayer("Above", tileset);

        worldLayer.setCollisionByExclusion([-1]);
        aboveLayer.setCollisionByExclusion([-1]);

        player = this.physics.add.sprite(225, 1820, 'us').setSize(24,30);

        var party = this.physics.add.staticGroup();
        cat = party.create(2000, 800, 'cat').setScale(0.8);
        turtle = party.create(3075, 745, 'turt').setScale(1.5);
        bevo = party.create(780, 2350, 'bevo').setScale(1.6);
        squirrel = party.create(2035, 1500, 'squir').setScale(1.5);
        this.physics.add.collider(player, party, this.onMeetParty, false, this);

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, worldLayer);
        this.physics.add.collider(player, aboveLayer);

        var advisors = this.physics.add.staticGroup();
        a1 = advisors.create(130, 600, 'advisor').setSize(24,40).setOffset(19,18);
        a2 = advisors.create(465, 925, 'advisor').setSize(24,40).setOffset(19,18);
        a3 = advisors.create(1150, 750, 'advisor').setSize(24,40).setOffset(19,18);
        a4 = advisors.create(1327, 950, 'advisor').setSize(24,40).setOffset(19,18);
        this.physics.add.overlap(player, advisors, this.onMeetAdvisor, false, this);

        var enemies = this.physics.add.group();
        this.physics.add.collider(enemies, worldLayer);
        // side to side
        e1 = enemies.create(225, 1350, 'foe').setSize(24,40).setOffset(19,18);
        e1.setVelocityX(100);
        e1.setBounce(1);
        e2 = enemies.create(1273, 1906, 'foe').setSize(24,40).setOffset(19,18);
        e2.setVelocityX(100);
        e2.setBounce(1);
        e3 = enemies.create(1337, 1077, 'foe').setSize(24,40).setOffset(19,18);
        e3.setVelocityX(100);
        e3.setBounce(1);
        e4 = enemies.create(1244, 755, 'foe').setSize(24,40).setOffset(19,18);
        e4.setVelocityX(100);
        e4.setBounce(1);
        e5 = enemies.create(2628, 1280, 'foe').setSize(24,40).setOffset(19,18);
        e5.setVelocityX(100);
        e5.setBounce(1);
        e6 = enemies.create(2628, 819, 'foe').setSize(24,40).setOffset(19,18);
        e6.setVelocityX(100);
        e6.setBounce(1);
        e7 = enemies.create(2177, 1391, 'foe').setSize(24,40).setOffset(19,18);
        e7.setVelocityX(100);
        e7.setBounce(1);
        e8 = enemies.create(1228, 1711, 'foe').setSize(24,40).setOffset(19,18);
        e8.setVelocityX(100);
        e8.setBounce(1);
        e9 = enemies.create(2635, 1807, 'foe').setSize(24,40).setOffset(19,18);
        e9.setVelocityX(100);
        e9.setBounce(1);
        // up and down
        e10 = enemies.create(1201, 249, 'foe').setSize(24,40).setOffset(19,18);
        e10.setVelocityY(100);
        e10.setBounce(1);
        e11 = enemies.create(1195, 1510, 'foe').setSize(24,40).setOffset(19,18);
        e11.setVelocityY(100);
        e11.setBounce(1);
        e12 = enemies.create(830, 2220, 'foe').setSize(24,40).setOffset(19,18);
        e12.setVelocityY(100);
        e12.setBounce(1);
        e13 = enemies.create(2127, 2189, 'foe').setSize(24,40).setOffset(19,18);
        e13.setVelocityY(100);
        e13.setBounce(1);
        e14 = enemies.create(2417, 310, 'foe').setSize(24,40).setOffset(19,18);
        e14.setVelocityY(100);
        e14.setBounce(1);
        e15 = enemies.create(2772, 472, 'foe').setSize(24,40).setOffset(19,18);
        e15.setVelocityY(100);
        e15.setBounce(1);
        this.physics.add.overlap(player, enemies, this.onMeetEnemy, false, this);

        var boss = this.physics.add.staticGroup();
        boss.create(1150, 500, 'boss').setScale(0.125).setSize(150, 100).setOffset(300, 200);
        this.physics.add.overlap(player, boss, this.onMeetBoss, false, this);

        var medics = this.physics.add.staticGroup();
        m1 = medics.create(875, 615, 'medic').setSize(24,40).setOffset(19,18);
        this.physics.add.collider(player, medics, this.onMeetMedic, false, this);

        var profs = this.physics.add.staticGroup();
        p1 = profs.create(1200, 875, 'prof').setSize(24,40).setOffset(19,18);
        p2 = profs.create(1450, 875, 'prof').setSize(24,40).setOffset(19,18);
        p3 = profs.create(1327, 625, 'prof').setSize(24,40).setOffset(19,18);
        this.physics.add.collider(player, profs, this.onMeetProf, false, this);

        camera = this.cameras.main;
        cameraDolly = new Phaser.Geom.Point(player.x, player.y);
        camera.startFollow(player);
        camera.startFollow(cameraDolly);
        camera.setZoom(1);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    },
    update: function(){

        cameraDolly.x = Math.floor(player.x);
        cameraDolly.y = Math.floor(player.y);

        player.setVelocity(0);
        let velX = 0;
        let velY = 0;


        if(keyA.isDown || left.isDown) {
            velX = -160
            player.anims.play('usTurn', true);
        } else if(keyS.isDown || down.isDown) {
            velY = 160
            player.anims.play('usTurn', true);
        } else if(keyD.isDown || right.isDown) {
            velX = 160
            player.anims.play('usTurn', true);
        } else if(keyW.isDown || up.isDown) {
            velY = -160
            player.anims.play('usTurn', true);
        } else if (space.isDown){
            theme.stop();
            this.scene.sleep('Worldscene');
            this.scene.switch('BattleScene');
        } 
        else {
            player.anims.play('usStraight',true);
        }
        if (cursors.shift.isDown) {
            velX *= 2;
            velY *= 2;
        }

        player.setVelocity(velX, velY);

        this.scene.sleep('UIScene');

        // console.log(player.x, player.y);
        // console.log(this.time.now);
    },
        

    onMeetParty: function(player, party)
    {
        party.destroy();
        partyCount += 1;
        if (party.texture.key == 'bevo')
        {
            this.message("Bevo has joined\nyour party! " + (4 - partyCount) +  " left.", player.x - 80, player.y + 40);
        }
        else if (party.texture.key == 'cat')
        {
            this.message("Domino has joined\nyour party! " + (4 - partyCount) +  " left.", player.x - 80, player.y + 40);
        }
        else if (party.texture.key == 'turt')
        {
            this.message("Turtle has joined\nyour party! " + (4 - partyCount) +  " left.", player.x - 80, player.y + 40);
        }
        else
        {
            this.message("Albino Squirrel has\njoined your party!\n" + (4 - partyCount) +  " left.", player.x - 80, player.y + 40);
        }

    },  
    onMeetAdvisor: function(player, advisors)
    {
        this.message("tutorial", 140, 610);
        console.log(advisors);
    },
    onMeetBoss: function(player, enemy) 
	{  
        if (partyCount == 4)
        {
            player.setVelocityX(0);
            player.setVelocityY(0);
            this.message("What are you doing here!?", 475, 710)
            theme.stop();
            
            this.scene.sleep('WorldScene');
            this.scene.switch('BattleScene');
            enemy.destroy();
        }
    },
    onMeetEnemy: function(player, enemy)
    {
        player.x = 225;
        player.y = 1820;
        this.message("Your animals took damage.\nBe careful out there!", player.x - 60, player.y - 100, 3000);
        window.ouch++;
    },
    onMeetMedic: function()
    {
        console.log('healing dialogue');
    },
    onMeetProf: function()
    {
        console.log('skill progression menu');
    },
    message: function(text, xCoord, yCoord, time = 2000)
    {
        var style = { font: "25px Bradley Hand", fill: "#000000", backgroundColor: "#fddab9"};
        var msg = this.add.text(xCoord,yCoord,text,style);
        msg.visible = true
        setTimeout(() => { msg.visible = false; }, time);
    }
});

var VictoryScene = new Phaser.Class ({
    Extends: Phaser.Scene,
	
	initialize: 
    function WorldScene (){
		Phaser.Scene.call(this, { key: "VictoryScene" });
	},
    preload: function()
    {
        this.load.spritesheet('cat', 'assets/party/Cat.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('bevo', 'assets/party/bevo.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('turt', 'assets/party/turt.png', {frameWidth: 32, frameHeight:32});
        this.load.spritesheet('squir', 'assets/party/squir.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('us', 'assets/spritesheets/utperson.png', { frameWidth: 32, frameHeight: 32 });
    },
    create: function()
    {
    camera = this.cameras.main;
    camera.setBackgroundColor(0xbababa);
    var group = this.physics.add.staticGroup();
    cat = group.create(250, 400, 'cat').setScale(0.8);
    turtle = group.create(350, 400, 'turt').setScale(1.5);
    bevo = group.create(450, 400, 'bevo').setScale(1.6);
    squirrel = group.create(550, 400, 'squir').setScale(1.5);
    us = group.create(400, 500, 'us').setScale(1);

    this.add.text(200, 200, "Thank you for playing!", { font: "30px Arial", fill: "#000000"});
    }
});

var DefeatScene = new Phaser.Class ({
    Extends: Phaser.Scene,
	
	initialize: 
    function WorldScene (){
		Phaser.Scene.call(this, { key: "DefeatScene" });
	},
    preload: function()
    {
        this.load.spritesheet('boss', 'assets/spritesheets/a&mboss.png', { frameWidth: 800, frameHeight: 533 });
        this.load.spritesheet('foe', 'assets/spritesheets/a&mfoe.png', { frameWidth: 64, frameHeight: 64 }); 
    },
    create: function()
    {
    camera = this.cameras.main;
    camera.setBackgroundColor(0xbababa);
    var group = this.physics.add.staticGroup();
    cat = group.create(350, 400, 'boss').setScale(.125);
    turtle = group.create(200, 400, 'foe');
    bevo = group.create(500, 400, 'foe');

    this.add.text(300, 200, "Game Over", { font: "30px Arial", fill: "#ff0044"});
    }
});

var config = {
    type: Phaser.AUTO,
	parent: "content",
    width: 800,
    height: 600,
    pixelArt: true,
    // roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {},
            debug: false
        }
    },
    scene: [BootScene, WorldScene, BattleScene, UIScene, VictoryScene, DefeatScene]
  };

var game = new Phaser.Game(config);