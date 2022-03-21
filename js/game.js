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
var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize:
    function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage                
    },
    attack: function(target) {
        target.takeDamage(this.damage);      
    },
    takeDamage: function(damage) {
        this.hp -= damage;        
    }
});

var Enemy = new Phaser.Class({
    Extends: Unit,
    initialize:
    function Enemy(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    }
});

var PlayerCharacter = new Phaser.Class({
    Extends: Unit,
    initialize:
    function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
        // flip the image so I don't have to edit it manually
        this.flipX = true;
        
        this.setScale(2);
    }
});

var Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    
    initialize:
            
    function Menu(x, y, scene, heroes) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.heroes = heroes;
        this.x = x;
        this.y = y;
    },     
    addMenuItem: function(unit) {
        var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);        
    },            
    moveSelectionUp: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex--;
        if(this.menuItemIndex < 0)
            this.menuItemIndex = this.menuItems.length - 1;
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex++;
        if(this.menuItemIndex >= this.menuItems.length)
            this.menuItemIndex = 0;
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and an element with index from it
    select: function(index) {
        if(!index)
            index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        this.menuItems[this.menuItemIndex].select();
    },
    // deselect this menu
    deselect: function() {        
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
    },
    confirm: function() {
        // wen the player confirms his slection, do the action
    },   
	clear: function() {
        for(var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },
    remap: function(units) {
        this.clear();        
        for(var i = 0; i < units.length; i++) {
            var unit = units[i];
            this.addMenuItem(unit.type);
        }
    }
});

var HeroesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function HeroesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);                    
    }
});

var ActionsMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function ActionsMenu(x, y, scene) {
        Menu.call(this, x, y, scene);   
        this.addMenuItem('Attack');
    },
    confirm: function() {
        // do something when the player selects an action
    }
    
});

var EnemiesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function EnemiesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);        
    },       
    confirm: function() {        
        // do something when the player selects an enemy
    }
});

class UIScene extends Phaser.Scene{
    constructor(){
        super({key: 'UIScene'});
    }
    create(){
		this.battleScene = this.scene.get('BattleScene');
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);        
        this.graphics.strokeRect(102, 500, 190, 100);
        this.graphics.fillRect(102, 500, 190, 100);
        this.graphics.strokeRect(295, 500, 190, 100);
        this.graphics.fillRect(295, 500, 190, 100);
        this.graphics.strokeRect(488, 500, 190, 100);
        this.graphics.fillRect(488, 500, 190, 100);
		this.menus = this.add.container();
                
		this.heroesMenu = new HeroesMenu(195, 153, this);           
		this.actionsMenu = new ActionsMenu(100, 153, this);            
		this.enemiesMenu = new EnemiesMenu(8, 153, this);   
        
		// the currently selected menu 
		this.currentMenu = this.actionsMenu;
        
		// add menus to the container
		this.menus.add(this.heroesMenu);
		this.menus.add(this.actionsMenu);
		this.menus.add(this.enemiesMenu);
	
		this.remapHeroes();
		this.remapEnemies();
    }
	remapHeroes() {
        var heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    }
    remapEnemies() {
        var enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
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
    var belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    var worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    var aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);



    worldLayer.setCollisionByExclusion([-1]);
    // worldLayer.setCollisionByProperty({collides:true}, true, true);
    belowLayer.setCollisionByExclusion([-1]);
    // worldLayer.setCollision(3, true, 'World');

    player = this.physics.add.sprite(150, 450, 'us').setSize(24,40).setOffset(19,18);
    
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, worldLayer);
    this.physics.add.collider(player, belowLayer);



    enemy1 = this.physics.add.sprite(200, 325, 'foe').setSize(24,40).setOffset(19,18);
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

    this.physics.add.overlap(player, enemy1, this.onMeetEnemy, false, this)
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

    onMeetEnemy() {
        game.scene.switch('WorldScene', 'BattleScene')
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
        this.load.image('cursor', 'assets/cursor.png');
    }
    create ()
    {   
        this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
		var cat = new PlayerCharacter(this, 100, 150, 'cat', 1, 'Rogue', 80, 8);
		this.add.existing(cat);
		var bevo = new PlayerCharacter(this, 100, 250, 'bevo', 1, 'Warrior', 120, 5);
        this.add.existing(bevo);
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
            debug: true
        }
    },
    scene: [WorldScene, BattleScene, UIScene]
  };

var game = new Phaser.Game(config);