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