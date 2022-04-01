var cursors;
var controls;
var player;
var camera;
var enemy1;
var battle_token;
var graphics;
var meet;
var prof;
var medic;

var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: "BootScene" });
    },
	
    create: function ()
    {
        this.scene.start("WorldScene");
    }
});

var BattleScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
	
	function BattleScene ()
    {
        Phaser.Scene.call(this, { key: "BattleScene" });
    },
    preload: function()
    {
        this.load.spritesheet('cat', 'assets/Cat.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('bevo', 'assets/bevo.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('turt', 'assets/turt.png', {frameWidth: 32, frameHeight:32});
        this.load.spritesheet('squir', 'assets/squir.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('foe', 'assets/a&mfoe.png', {frameWidth: 64, frameHeight: 64});
        this.load.image('cursor', 'assets/cursor.png');
        this.load.image('background', 'assets/battle_background.png');
    },
    create: function()
    {   
        this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
        this.startBattle();
        // on wake event we call startBattle too
        this.sys.events.on('wake', this.endBattle, this); 

        // temporary end battle thing
        this.input.on('pointerdown', this.endBattle, this);
    },
    startBattle: function()
    {
		var cat = new PlayerCharacter(this, 100, 150, 'cat', 1, 'Rogue', 80, 8, 'slash');
		this.add.existing(cat);
		var bevo = new PlayerCharacter(this, 100, 250, 'bevo', 1, 'Warrior', 120, 5, 'charge');
        this.add.existing(bevo);
		var turt = new PlayerCharacter(this, 100, 350, 'turt', 1, 'Wizard', 60, 10, 'freeze');
		this.add.existing(turt);
		var squir = new PlayerCharacter(this, 100, 450, 'squir', 1, 'Bard', 70, 3, 'confuse');
		this.add.existing(squir);
		var foe1 = new Enemy(this, 600, 200, 'foe', 1, 'Bandit', 20, 6, 'none');
        this.add.existing(foe1);
        var foe2 = new Enemy(this, 600, 400, 'foe', 1, 'Bandit', 20, 6, 'none');
        this.add.existing(foe2);
		
		this.heroes = [ cat, bevo, turt, squir];
		
		this.enemies = [foe1, foe2];
		
		this.units = this.heroes.concat(this.enemies);
		
		
		this.index = -1; 
        
        this.anims.create({
        key: 'cat_anim',
        frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
        });
        cat.anims.play('cat_anim', true);
        
        this.scene.launch("UIScene");
    },
    //wake: function() {
      //  this.scene.run('UIScene');  
        //this.time.addEvent({delay: 2000, callback: this.exitBattle, callbackScope: this});        
    //},
	nextTurn: function() {  
        // if we have victory or game over
        if(this.checkEndBattle()) {           
            this.endBattle();
            return;
        }
        do {
            // currently active unit
            this.index++;
            // if there are no more units, we start again from the first one
            if(this.index >= this.units.length) {
                this.index = 0;
            }            
        } while(!this.units[this.index].living);
        // if its player hero
        if(this.units[this.index] instanceof PlayerCharacter) {
            // we need the player to select action and then enemy
            this.events.emit("PlayerSelect", this.index);
        } else { // else if its enemy unit
            // pick random living hero to be attacked
            var r;
            do {
                r = Math.floor(Math.random() * this.heroes.length);
            } while(!this.heroes[r].living) 
            // call the enemy's attack function 
            this.units[this.index].attack(this.heroes[r]);  
            // add timer for the next turn, so will have smooth gameplay
            this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
        }
    },    
    // check for game over or victory
    checkEndBattle: function() {        
        var victory = true;
        // if all enemies are dead we have victory
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].living)
                victory = false;
        }
        var gameOver = true;
        // if all heroes are dead we have game over
        for(var i = 0; i < this.heroes.length; i++) {
            if(this.heroes[i].living)
                gameOver = false;
        }
        return victory || gameOver;
    },
    // when the player have selected the enemy to be attacked
    receivePlayerSelection: function(action, target) {
        if(action == "attack") {            
            this.units[this.index].attack(this.enemies[target]);              
        }
        else if(action == "spell") {
            this.units[this.index].spell(this.enemies[target]);
        }
        // next turn in 3 seconds
        this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });        
    },    
    endBattle: function() {       
        // clear state, remove sprites
        this.heroes.length = 0;
        this.enemies.length = 0;
        for(var i = 0; i < this.units.length; i++) {
            // link item
            this.units[i].destroy();            
        }
        this.units.length = 0;
        // sleep the UI
        this.scene.sleep('UIScene');
        // return to WorldScene and sleep current BattleScene
        this.scene.switch('WorldScene');
    },
});

var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Unit(scene, x, y, texture, frame, type, hp, damage, spell) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage     
        this.spell = spell
        this.living = true;         
        this.menuItem = null;
    },
    // we will use this to notify the menu item when the unit is dead
    setMenuItem: function(item) {
        this.menuItem = item;
    },
    // attack the target unit
    attack: function(target) {
        if(target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit("Message", this.type + " attacks " + target.type + " for " + this.damage + " damage");
        }
    },    
    // spell the target unit
    spell: function(target) {
        if (target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit("Message", this.type + " uses " + this.spell + " on " + target.type + " for " + this.damage + " damage");
        }
    },
    
    takeDamage: function(damage) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hp = 0;
            this.menuItem.unitKilled();
            this.living = false;
            this.visible = false;   
            this.menuItem = null;
        }
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
        // flip the image so I don"t have to edit it manually
        this.flipX = false;
        
        this.setScale(1);
    }
});

var MenuItem = new Phaser.Class({
    Extends: Phaser.GameObjects.Text,
    
    initialize:
            
    function MenuItem(x, y, text, scene) {
        Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: "#ffffff", align: "left", fontSize: 15});
    },
    
    select: function() {
        this.setColor("#f8ff38");
    },
    
    deselect: function() {
        this.setColor("#ffffff");
    },
    unitKilled: function() {
        this.active = false;
        this.visible = false;
    }
    
});

var Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    
    initialize:
            
    function Menu(x, y, scene, heroes) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.x = x;
        this.y = y;        
        this.selected = false;
    },     
    addMenuItem: function(unit) {
        var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem); 
        return menuItem;
    },  
    // menu navigation 
    moveSelectionUp: function() {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex--;
            if(this.menuItemIndex < 0)
                this.menuItemIndex = this.menuItems.length - 1;
        } while(!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function() {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex++;
            if(this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
        } while(!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and highlight the choosen element
    select: function(index) {
        if(!index)
            index = 0;       
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        while(!this.menuItems[this.menuItemIndex].active) {
            this.menuItemIndex++;
            if(this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
            if(this.menuItemIndex == index)
                return;
        }        
        this.menuItems[this.menuItemIndex].select();
        this.selected = true;
    },
    // deselect this menu
    deselect: function() {        
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
        this.selected = false;
    },
    confirm: function() {
        // when the player confirms his slection, do the action
    },
    // clear menu and remove all menu items
    clear: function() {
        for(var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },
    // recreate the menu items
    remap: function(units) {
        this.clear();        
        for(var i = 0; i < units.length; i++) {
            var unit = units[i];
            unit.setMenuItem(this.addMenuItem(unit.type));            
        }
        this.menuItemIndex = 0;
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
        this.addMenuItem("Attack");
        this.addMenuItem("Spell");
    },
    confirm: function() {      
        this.scene.events.emit("SelectEnemies");        
    }
    
});

var EnemiesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function EnemiesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);        
    },       
    confirm: function() {        
        this.scene.events.emit("Enemy", this.menuItemIndex);
    }
});

var UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function UIScene ()
    {
        Phaser.Scene.call(this, { key: "UIScene" });
    },

    create: function ()
    {    
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);        
        this.graphics.strokeRect(212, 490, 90, 100);
        this.graphics.fillRect(212, 490, 90, 100);
        this.graphics.strokeRect(305, 490, 90, 100);
        this.graphics.fillRect(305, 490, 90, 100);
        this.graphics.strokeRect(398, 490, 130, 100);
        this.graphics.fillRect(398, 490, 130, 100);
        
        // basic container to hold all menus
        this.menus = this.add.container();
                
        this.heroesMenu = new HeroesMenu(404, 495, this);           
        this.actionsMenu = new ActionsMenu(311, 495, this);            
        this.enemiesMenu = new EnemiesMenu(218, 495, this);   
        
        // the currently selected menu 
        this.currentMenu = this.actionsMenu;
        
        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);
        
        this.battleScene = this.scene.get("BattleScene");
        
        this.remapHeroes();
        this.remapEnemies();
        
        this.input.keyboard.on("keydown", this.onKeyInput, this);   
        
        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
        
        this.events.on("SelectEnemies", this.onSelectEnemies, this);
        
        this.events.on("Enemy", this.onEnemy, this);
        
        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);        
        
        this.battleScene.nextTurn();                
    },
    onEnemy: function(index) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection("attack", index);
    },
    onPlayerSelect: function(id) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    },
    onSelectEnemies: function() {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    },
    remapHeroes: function() {
        var heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    },
    remapEnemies: function() {
        var enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    },
    onKeyInput: function(event) {
        if(this.currentMenu) {
            if(event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if(event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if(event.code === "ArrowRight" || event.code === "Shift") {

            } else if(event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            } 
        }
    },
});

var TutorialScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function TutorialScene (){
        Phaser.Scene.call(this, { key: 'TutorialScene'});
    },
    preload: function(){
        this.load.spritesheet('us', 'assets/utperson.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('foe', 'assets/a&mfoe.png', { frameWidth: 64, frameHeight: 64 });
    },
    create: function(){
        this.add.text(16,104,"A&M has disrespected us by showing a Horns", { fontSize: '30px', color: '#CC5500' })
        this.add.text(16,134,"Down, and now they've taken over!", { fontSize: '30px', color: '#CC5500' })
        this.add.text(16,194,"There's an enemy! To move, use arrow keys", { fontSize: '30px', color: '#CC5500' })

        player = this.physics.add.sprite(150, 400, 'us').setSize(24,40).setScale(3);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        enemy = this.physics.add.sprite(600, 450, 'foe').setSize(24,40).setScale(3);

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

        cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(player, enemy, this.startGame, false, this);

        // function startGame(){
        //     game.scene.start('WorldScene')
        //     game.scene.remove('TutorialScene')
        // }
        // this.input.on('pointerdown', startGame, this);
    },
    update: function(){
        // sprite movement
        if (cursors.left.isDown)
        {
            player.setVelocityX(-200);
            player.setVelocityY(0);
            player.anims.play('usTurn', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(200);
            player.setVelocityY(0);
            player.anims.play('usTurn', true);
        }
        else if (cursors.up.isDown)
        {
            player.setVelocityX(0);
            player.setVelocityY(-200);
            player.anims.play('usTurn', true);
        }
        else if (cursors.down.isDown)
        {
            player.setVelocityX(0);
            player.setVelocityY(200);
            player.anims.play('usTurn', true);
        }
        else
        {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play('usStraight');
        }
    },

    startGame: function() 
	{
        this.scene.start('WorldScene');
        this.scene.remove('TutorialScene');
    },
});

var WorldScene  = new Phaser.Class({
	Extends: Phaser.Scene,
	
	initialize: 
    function WorldScene (){
		Phaser.Scene.call(this, { key: "WorldScene" });
	},
    preload: function()
    {
        this.load.image("tiles", "assets/tilesets/newtileset.png");
        this.load.tilemapTiledJSON("map", "assets/TileMap1.json");
        this.load.spritesheet('us', 'assets/utperson.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('foe', 'assets/a&mfoe.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('medic', 'assets/utmedic.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('prof', 'assets/utprof.png', { frameWidth: 64, frameHeight: 64});
    },
    create: function()
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
   
    player = this.physics.add.sprite(150, 450, 'us').setSize(24,40);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, worldLayer);
    this.physics.add.collider(player, belowLayer);
    
    this.message = new Message(this, this.events);
    this.add.existing(this.message); 

    // enemy = this.physics.add.group();
    // enemy.setBounce(1);
    // enemy.setCollideWorldBounds(true);
    // this.physics.add.collider(enemy, worldLayer);
    // this.physics.add.collider(enemy, belowLayer);
    // enemy1 = enemy.create(200, 325, 'foe').setSize(24,40).setOffset(19,18);

    enemy1 = this.physics.add.sprite(200, 325, 'foe').setSize(24,40).setOffset(19,18);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);
    enemy1.setVelocityX(-180);
    this.physics.add.collider(enemy1, worldLayer);
    this.physics.add.collider(enemy1, belowLayer);

    medic = this.physics.add.staticGroup();
    medic.create(1250, 100, 'medic').setSize(24,40).setOffset(19,18);
    medic.create(1535, 1050, 'medic').setSize(24,40).setOffset(19,18);

    prof = this.physics.add.staticGroup();
    prof.create(85, 60, 'prof').setSize(24,40).setOffset(19,18);
    prof.create(275, 60, 'prof').setSize(24,40).setOffset(19,18);
    prof.create(450, 60, 'prof').setSize(24,40).setOffset(19,18);
        
      
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
    this.input.keyboard.on("keydown", this.onKeyInput, this);   

    // set up camera
    camera = this.cameras.main;
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(player);
    camera.setZoom(1.5);

    this.physics.add.overlap(player, enemy1, this.onMeetEnemy, false, this);
    this.physics.add.collider(player, medic, this.onMeetMedic, false, this);
    this.physics.add.collider(player, prof, this.onMeetProf, false, this);
    },
    update: function(){
        player.anims.play('usTurn', false);
    },
    /* update: function(){
        // sprite movement
        if (cursors.left.isDown)
        {
            player.setVelocityX(-200);
            player.setVelocityY(0);
            player.anims.play('usTurn', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(200);
            player.setVelocityY(0);
            player.anims.play('usTurn', true);
        }
        else if (cursors.up.isDown)
        {
            player.setVelocityX(0);
            player.setVelocityY(-200);
            player.anims.play('usTurn', true);
        }
        else if (cursors.down.isDown)
        {
            player.setVelocityX(0);
            player.setVelocityY(200);
            player.anims.play('usTurn', true);
        }
        else
        {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play('usStraight');
        }
    },*/
    onKeyInput: function(event) {
            if(event.code === "ArrowUp" && meet !== true) {
                player.setVelocityX(0);
                player.setVelocityY(-160);
                player.anims.play('usTurn', true);
            } else if(event.code === "ArrowDown" && meet !== true) {
                player.setVelocityX(0);
                player.setVelocityY(160);
                player.anims.play('usTurn', true);
            } else if(event.code === "ArrowRight" && meet !== true) {
                player.setVelocityX(160);
                player.setVelocityY(0);
                player.anims.play('usTurn', true);
            } else if(event.code === "ArrowLeft" && meet !== true) {
                player.setVelocityX(-160);
                player.setVelocityY(0);
                player.anims.play('usTurn', true);
            } else if(event.code === "Space" && meet === true) {
                this.scene.switch("BattleScene");
            } else if(event.code === "None") {
                player.setVelocityX(0);
                player.setVelocityY(0);
            }
    },

    
    onMeetEnemy: function() 
	{  
        player.setVelocityX(0);
        player.setVelocityY(0);
        meet = true;
        enemy1.setVelocityX(0);
        this.events.emit("Message", 'What are you doing here?')
    },
                                   
    onMeetMedic: function()
    {
        console.log('healing dialogue');
    },

    onMeetProf: function()
    {
        console.log('skill progression menu');
    }
});

var Message = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize:
    function Message(scene, events) {
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

var config = {
    type: Phaser.AUTO, // Which renderer to use
	parent: "content",
    width: 800, // Canvas width in pixels
    height: 600, // Canvas height in pixels
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 300 },
            debug: false
        }
    },
    scene: [TutorialScene, BootScene, WorldScene, BattleScene, UIScene]
  };

var game = new Phaser.Game(config);