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
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  var game = new Phaser.Game(config);
  var cursors;
  var controls;
  var player;
  var camera;
  
  function preload() {
    this.load.image("tiles", "assets/tilesets/newtileset.png");
    this.load.tilemapTiledJSON("map", "assets/TileMap1.json");
    this.load.spritesheet('us', 'assets/utperson.png', { frameWidth: 64, frameHeight: 83 });
    this.load.spritesheet('foe', 'assets/a&mfoe.png', { frameWidth: 64, frameHeight: 83 });
  }
  
  function create() {
    var map = this.make.tilemap({ key: "map" });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)

    var tileset = map.addTilesetImage("newtileset", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    var belowLayer = map.createStaticLayer("Below Player", tileset)
    var worldLayer = map.createStaticLayer("World", tileset)

    worldLayer.setCollisionByExclusion(-1, true);

    player = this.physics.add.sprite(150, 450, 'us');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    enemy1 = this.physics.add.sprite(200, 325, 'foe');
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);
    enemy1.setVelocityX(-180);

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

    // controls = new Phaser.Cameras.Controls.FixedKeyControl({
    //     camera: camera,
    //     left: cursors.left,
    //     right: cursors.right,
    //     up: cursors.up,
    //     down: cursors.down,
    //     speed: 0.1
    // });

  }
  
  function update(time, delta) {
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