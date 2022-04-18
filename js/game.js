var cursors;
var keyA;
var keyS;
var keyD;
var keyW;
var up;
var controls;
var player;
var camera;
var battle_token;
var graphics;
var meet;
var aMeet = 1;
var eMeet = 1;
var e1, e2, e3, e4, e5;
var p1, p1, p3;
var m1;
var a1, a2, a3, a4;
var choice;
var bruteHP, nerdHP;
var dHP, bHP, tHP, sHP;

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
        
        this.load.spritesheet('cat', 'assets/party/Cat.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('bevo', 'assets/party/bevo.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('turt', 'assets/party/turt.png', {frameWidth: 32, frameHeight:32});
        this.load.spritesheet('squir', 'assets/party/squir.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('brute', 'assets/spritesheets/a&mbrute.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('nerd', 'assets/spritesheets/a&mnerd.png', {frameWidth: 64, frameHeight: 64});
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
		var cat = new PlayerCharacter(this, 100, 150, 'cat', 1, 'Domino', 80, 8, 'slash');
		this.add.existing(cat);
		var bevo = new PlayerCharacter(this, 100, 250, 'bevo', 1, 'Bevo', 120, 5, 'charge');
        this.add.existing(bevo);
		var turt = new PlayerCharacter(this, 100, 350, 'turt', 1, 'Pond Turtle', 60, 10, 'freeze');
		this.add.existing(turt);
		var squir = new PlayerCharacter(this, 100, 450, 'squir', 1, 'Albino Squirrel', 70, 3, 'confuse');
		this.add.existing(squir);
		var foeBrute = new Enemy(this, 600, 200, 'brute', 1, 'Brute', 20, 6, 'none').setScale(2.5);
        this.add.existing(foeBrute);
        var foeNerd = new Enemy(this, 600, 400, 'nerd', 1, 'Nerd', 20, 6, 'none').setScale(2.5);
        this.add.existing(foeNerd);
        
        var catHP = this.add.text(16, 150, cat.hp + "hp", { fontSize: '12px', fill: '#000' });
        var bevoHP = this.add.text(16, 250, bevo.hp + "hp", { fontSize: '12px', fill: '#000' });
        var turtHP =  this.add.text(16, 350, turt.hp + "hp", { fontSize: '12px', fill: '#000' });
        var squirHP = this.add.text(16, 450, squir.hp + "hp", { fontSize: '12px', fill: '#000' });
        bruteHP = this.add.text(660, 200, foeBrute.hp + "hp", { fontSize: '12px', fill: '#000' });
        nerdHP = this.add.text(660, 400, foeNerd.hp + "hp", { fontSize: '12px', fill: '#000' });
		
		this.heroes = [cat, bevo, turt, squir];
		
		this.enemies = [foeBrute, foeNerd];

        // this.actions = ["Attack", "Skip"]
		
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
        else if(action == "skip") {
            this.battleScene.nextTurn();
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
        // return to WorldScene and sleep current BattleScene
        this.scene.restart();
        this.scene.sleep('UIScene');
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
    },
    confirm: function() {      
        this.scene.events.emit("SelectEnemies");        
    }
});

// var ActionsMenu = new Phaser.Class({
//     Extends: Menu,
    
//     initialize:
            
//     function ActionsMenu(x, y, scene) {
//         Menu.call(this, x, y, scene);   
//         this.addMenuItem("Attack");
//         this.addMenuItem("Skip");
//     },
    // confirm: function() {      
    //     this.scene.events.emit("SelectEnemies");        
    // }
    
// });

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
        // this.graphics.strokeRect(212, 490, 145, 100);
        // this.graphics.fillRect(212, 490, 145, 100);
        // this.graphics.strokeRect(360, 490, 90, 100);
        // this.graphics.fillRect(360, 490, 90, 100);
        // this.graphics.strokeRect(453, 490, 90, 100);
        // this.graphics.fillRect(453, 490, 90, 100);
        this.graphics.strokeRect(252, 490, 145, 100);
        this.graphics.fillRect(252, 490, 145, 100);
        this.graphics.strokeRect(400, 490, 90, 100);
        this.graphics.fillRect(400, 490, 90, 100);
        
        // basic container to hold all menus
        this.menus = this.add.container();
                
        this.heroesMenu = new HeroesMenu(256, 495, this);           
        // this.actionsMenu = new ActionsMenu(364, 495, this);            
        this.enemiesMenu = new EnemiesMenu(404, 495, this);   
        
        // the currently selected menu 
        // this.currentMenu = this.actionsMenu;
        this.currentMenu = this.heroesMenu;
        
        // add menus to the container
        this.menus.add(this.heroesMenu);
        // this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);
        
        this.battleScene = this.scene.get("BattleScene");
        
        this.remapHeroes();
        this.remapEnemies();
        // this.remapActions();
        
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
        // this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection("attack", index);
    },
    onPlayerSelect: function(id) {
        // this.heroesMenu.select(id);
        // this.currentMenu = this.actionsMenu;
        // this.actionsMenu.select(0);
        this.heroesMenu.select(0);
        this.currentMenu = this.heroesMenu;
    },
    onSelectEnemies: function() {
        // this.actionsMenu.select(id);
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
    // remapActions: function() {
    //     var actions = this.battleScene.actions;
    //     this.actionsMenu.remap(actions);
    // },
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

var WorldScene  = new Phaser.Class({
	Extends: Phaser.Scene,
	
	initialize: 
    function WorldScene (){
		Phaser.Scene.call(this, { key: "WorldScene" });
	},
    preload: function()
    {
        this.load.image("tiles", "assets/tilesets/newtileset.png");
        this.load.tilemapTiledJSON("map", "assets/TileMapSmall.json");
        this.load.spritesheet('us', 'assets/spritesheets/utperson.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('foe', 'assets/spritesheets/a&mfoe.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('medic', 'assets/spritesheets/utmedic.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('prof', 'assets/spritesheets/utprof.png', { frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('advisor', 'assets/spritesheets/utadvisor.png', { frameWidth: 64, frameHeight: 64});
    },
    create: function()
    {
        var map = this.make.tilemap({ key: "map" });

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)

    var tileset = map.addTilesetImage("newtileset", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    var belowLayer = map.createStaticLayer("Below Player", tileset);
    var worldLayer = map.createStaticLayer("World", tileset);
    var abovelayer = map.createStaticLayer("Above Player", tileset);

    worldLayer.setCollisionByExclusion([-1]);
   
    player = this.physics.add.sprite(125, 925, 'us').setSize(24,40);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, worldLayer);
    
    this.message = new Message(this, this.events);
    this.add.existing(this.message); 

    var advisors = this.physics.add.staticGroup();
    a1 = advisors.create(130, 600, 'advisor').setSize(24,40).setOffset(19,18);
    a2 = advisors.create(465, 925, 'advisor').setSize(24,40).setOffset(19,18);
    a3 = advisors.create(1150, 750, 'advisor').setSize(24,40).setOffset(19,18);
    a4 = advisors.create(1327, 950, 'advisor').setSize(24,40).setOffset(19,18);
    this.physics.add.overlap(player, advisors, this.onMeetAdvisor, false, this);

    var enemies = this.physics.add.staticGroup();
    e1 = enemies.create(465, 700, 'foe').setSize(24,40).setOffset(19,18);
    e2 = enemies.create(895, 675, 'foe').setSize(24,40).setOffset(19,18);
    e3 = enemies.create(1327, 675, 'foe').setSize(24,40).setOffset(19,18);
    e4 = enemies.create(1240, 855, 'foe').setSize(24,40).setOffset(19,18);
    e5 = enemies.create(1410, 855, 'foe').setSize(24,40).setOffset(19,18);
    this.physics.add.overlap(player, enemies, this.onMeetEnemy, false, this);

    var medics = this.physics.add.staticGroup();
    m1 = medics.create(875, 615, 'medic').setSize(24,40).setOffset(19,18);
    this.physics.add.collider(player, medics, this.onMeetMedic, false, this);

    var profs = this.physics.add.staticGroup();
    p1 = profs.create(1200, 875, 'prof').setSize(24,40).setOffset(19,18);
    p2 = profs.create(1450, 875, 'prof').setSize(24,40).setOffset(19,18);
    p3 = profs.create(1327, 625, 'prof').setSize(24,40).setOffset(19,18);
    this.physics.add.collider(player, profs, this.onMeetProf, false, this);
        
      
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

    // set up camera
    camera = this.cameras.main;
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(player);
    camera.setZoom(0.5);

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
         } else {
            player.setVelocity(0);
            player.anims.play('usStraight', true);
         };
         this.scene.sleep('UIScene');

        },

    onMeetAdvisor: function()
    {
        this.events.emit("Message", "stuff about beating enemy");
        player.setVelocity(0);
        if (aMeet == 1)
        {
            this.events.emit("Message", "stuff about beating enemy");
        }
        else if (aMeet == 2)
        {
            this.events.emit("Message", "stuff about healing w medic");
        }
        else if (aMeet == 3)
        {
            this.events.emit("Message", "stuff about optional skill prog");
        }
        aMeet++;
    },
    
    onMeetEnemy: function() 
	{  
        player.setVelocityX(0);
        player.setVelocityY(0);
        meet = true;
        this.events.emit("Message", 'What are you doing here?')

        if (eMeet == 1)
        {
            e1.destroy();
        }
        else if (eMeet == 2)
        {
            e2.destroy();
        }
        else if (eMeet == 3)
        {
            e3.destroy();
        }
        else if (eMeet == 4)
        {
            e4.destroy();
        }
        else if (eMeet == 5)
        {
            e5.destroy();
        }
        eMeet++;
        this.scene.switch('BattleScene');
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
    scene: [BootScene, WorldScene, BattleScene, UIScene]
  };

var game = new Phaser.Game(config);