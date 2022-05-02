var cursors;
var keyA, keyS, keyD, keyW;
var player;
var camera;
var battle_token;
var graphics;
var bruteHP, nerdHP;
var dHP, bHP, tHP, sHP;
var playerx, playery;
var eMeet;
var e1, e2, e3, e4, e5;
var p1, p1, p3;
var m1;
var a1, a2, a3, a4;
var partyCount = 0;
var space;

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
        this.scene.start("WorldScene");
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
    },
    create: function()
    {
    var map = this.make.tilemap({ key: "map" });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    var tileset = map.addTilesetImage("bigtileset", "tiles");
    var belowLayer = map.createStaticLayer("Below", tileset);
    var worldLayer = map.createStaticLayer("World", tileset);
    var aboveLayer = map.createStaticLayer("Above", tileset);

    worldLayer.setCollisionByExclusion([-1]);
    aboveLayer.setCollisionByExclusion([-1]);

    player = this.physics.add.sprite(225, 1820, 'us').setSize(24,40);

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
    e1 = enemies.create(225, 1350, 'foe').setSize(24,40).setOffset(19,18);
    e1.setVelocityX(100);
    e1.setBounce(1);
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
    camera.startFollow(player);
    camera.setZoom(1);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    },
    update: function(){

        if(keyA.isDown || left.isDown) {
            player.setVelocityX(-160);
            player.setVelocityY(0);
            player.anims.play('usTurn', true);
         } else if(keyS.isDown || down.isDown) {
            player.setVelocityX(0);
            player.setVelocityY(160);
            player.anims.play('usTurn', true);
         } else if(keyD.isDown || right.isDown) {
            player.setVelocityX(160);
            player.setVelocityY(0);
            player.anims.play('usTurn', true);
         } else if(keyW.isDown || up.isDown) {
            player.setVelocityX(0);
            player.setVelocityY(-160);
            player.anims.play('usTurn', true);
         } else if (space.isDown){
            //this.scene.sleep('Worldscene');
            //this.scene.switch('BattleScene');
         } else {
            player.setVelocity(0);
            player.anims.play('usStraight', true);
         };
        this.scene.sleep('UIScene');
        },

    onMeetParty: function(player, party)
    {
        party.destroy();
        partyCount += 1;
        console.log(partyCount);
    },  
    onMeetAdvisor: function()
    {
        this.message("tutorial", 140, 610);
    },
    onMeetBoss: function(player, enemy) 
	{  
        if (partyCount == 4)
        {
            player.setVelocityX(0);
            player.setVelocityY(0);
            this.message("What are you doing here!?", 475, 710)
            
            this.scene.sleep('WorldScene');
            this.scene.switch('BattleScene');
            enemy.destroy();
        }
    },
    onMeetEnemy: function(player, enemy)
    {
        player.x = 225;
        player.y = 1820;
    },
    onMeetMedic: function()
    {
        console.log('healing dialogue');
    },

    onMeetProf: function()
    {
        console.log('skill progression menu');
    },
    message: function(text, xCoord, yCoord)
    {
        var msg = this.add.text(xCoord,yCoord,text,{ font: "30px Arial", fill: "#ff0044"});
        msg.visible = true
        setTimeout(() => { msg.visible = false; }, 5);
    }
});

var config = {
    type: Phaser.AUTO,
	parent: "content",
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {},
            debug: true
        }
    },
    scene: [BootScene, WorldScene, BattleScene, UIScene]
  };

var game = new Phaser.Game(config);