var config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 800, // Canvas width in pixels
    height: 600, // Canvas height in pixels
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  var game = new Phaser.Game(config);
  var controls;
  
  function preload() {
    this.load.image("testTilemap", "assets/TileMapTest.png");
    this.load.image("tiles", "assets/tilesets/newtileset.png");
    this.load.tilemapTiledJSON("map", "assets/TileMap1.json");
  }
  
  function create() {
    var map = this.make.tilemap({ key: "map" });
  
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)

    var tileset = map.addTilesetImage("newtileset", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    var belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    var worldLayer = map.createLayer("World", tileset, 0, 0);

    var camera = this.cameras.main;

    var cursors = this.input.keyboard.createCursorKeys();
    controls = new Phaser.Cameras.Controls.FixedKeyControl({
        camera: camera,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        speed: 0.5
    });

    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  }
  
  function update(time, delta) {
    controls.update(delta);
  }