var cursors;
var controls;
var player;
var camera;
var enemy1;
var battle_token;
var graphics;

// class TutorialScene extends Phaser.Scene{
//     constructor(){
//         super({key: 'TutorialScene'});
//     }
//     preload(){}
//     create(){
//         function startGame(){
//             game.scene.start('WorldScene')
//         }
//         this.input.on('pointerdown', startGame(), this);
//     }
//     update(){}
// }

class UIScene extends Phaser.Scene{
    constructor(){
        super({key: 'UIScene'});
    }
    create(){
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);        
        this.graphics.strokeRect(2, 500, 190, 100);
        this.graphics.fillRect(2, 500, 190, 100);
        this.graphics.strokeRect(195, 500, 190, 100);
        this.graphics.fillRect(195, 500, 190, 100);
        this.graphics.strokeRect(388, 500, 190, 100);
        this.graphics.fillRect(388, 500, 190, 100);
    }
}

class WorldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldScene' });
    }
    preload()
    {
        this.load.image("tiles", "assets/tilesets/newtileset.png");
        this.load.tilemapTiledJSON("map", "assets/TileMap1.json");
        this.load.spritesheet('us', 'assets/utperson.png', { frameWidth: 64, frameHeight: 83 });
        this.load.spritesheet('foe', 'assets/a&mfoe.png', { frameWidth: 64, frameHeight: 83 });
    }
    create()
    {
        var map = this.make.tilemap({ key: "map" });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)

    var tileset = map.addTilesetImage("newtileset", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    var belowLayer = map.createStaticLayer("Below Player", tileset)
    var worldLayer = map.createStaticLayer("World", tileset)

    worldLayer.setCollisionByExclusion([-1]);
    worldLayer.setCollisionByProperty({ collision: true });

    player = this.physics.add.sprite(150, 450, 'us');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    enemy1 = this.physics.add.sprite(200, 325, 'foe');
    // enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);
    // enemy1.setVelocityX(-180);
      
    //  sprite animations
    this.anims.create({
        key: 'usTurn',
        frames: this.anims.generateFrameNumbers('us', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'usStraight',
        frames: [ { key: 'us', frame: 0 } ],
        frameRate: 20
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

    // set up camera
    camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(player);

    function battle(){
        // console.log("hi")
        game.scene.switch('WorldScene', 'BattleScene')
    }
    this.physics.add.collider(player, enemy1, battle(), null, this);
    }
  
    update(time, delta) {
    // sprite movement
    
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.setVelocityY(0);
        player.anims.play('usTurn', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.setVelocityY(0);
        player.anims.play('usTurn', true);
    }
    else if (cursors.up.isDown)
    {
        player.setVelocityX(0);
        player.setVelocityY(-160);
        player.anims.play('usTurn', true);
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityX(0);
        player.setVelocityY(160);
        player.anims.play('usTurn', true);
    }
    else
    {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play('usStraight');
    }
    }

};

class BattleScene extends Phaser.Scene {
    constructor(){ 
        super({ key: 'BattleScene' });
    }
    preload()
    {
        this.load.spritesheet('cat', 'assets/Cat.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('bevo', 'assets/bevo.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('turt', 'assets/turt.png', {frameWidth: 32, frameHeight:32});
        this.load.spritesheet('squir', 'assets/squir.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('foe', 'assets/a&mfoe.png', {frameWidth: 64, frameHeight: 83});
        this.load.image('background', "assets/battle_background.png");
        this.load.image('cursor', 'assets/cursor.png');
    }
    create ()
    {   
        this.add.image(400, 300, 'background');
        this.physics.add.sprite(100, 150, 'cat');
        this.physics.add.sprite(100, 250, 'bevo');
        this.physics.add.sprite(100, 350, 'turt');
        this.physics.add.sprite(100, 450, 'squir');
        this.physics.add.sprite(600, 300, 'foe');
        game.scene.start('UIScene');

        camera = this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
    }

};

var config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 800, // Canvas width in pixels
    height: 600, // Canvas height in pixels
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 300 },
            debug: false
        }
    },
    scene: [WorldScene, BattleScene, UIScene]
  };

var game = new Phaser.Game(config);