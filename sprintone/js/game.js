var player;
var enemy1;
var enemy2;
var treats;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var SceneA = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function SceneA ()
    {
        Phaser.Scene.call(this, {key: 'sceneA'});
    },

    preload: function() {
        this.load.image('sub_bg', 'assets/filler_background.png');
        this.load.image('sub_wall', 'assets/filler_wall.png');
        this.load.spritesheet('foe', 'assets/a&mfoe.png', { frameWidth: 64, frameHeight: 83 });
        this.load.spritesheet('us', 'assets/utperson.png', { frameWidth: 64, frameHeight: 83 });
    },

    create: function() {
        //  background, ledges, ground
        this.add.image(250, 150, 'sub_bg');
        platforms = this.physics.add.staticGroup();
        ground = this.physics.add.staticGroup();
        ground.create(400, 568, 'sub_wall').setScale(2).refreshBody();
        platforms.create(400, 400, 'sub_wall').setScale(0.5).refreshBody();
        platforms.create(100, 325, 'sub_wall').setScale(0.5).refreshBody();
        platforms.create(700, 325, 'sub_wall').setScale(0.5).refreshBody();

        // sprite and properties
        player = this.physics.add.sprite(400, 500, 'us');
        enemy1 = this.physics.add.sprite(700, 505, 'foe');
        enemy2 = this.physics.add.sprite(100, 300, 'foe');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        enemy1.setBounce(1);
        enemy1.setCollideWorldBounds(true);
        enemy1.setVelocityX(-180);
        enemy2.setVelocityY(-180);
        enemy2.setBounce(1);
        enemy2.setCollideWorldBounds(true);

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

        //  score and text

        //  collisions
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(player, ground);
        this.physics.add.collider(enemy1, platforms);
        this.physics.add.collider(enemy1, ground);
        this.physics.add.collider(enemy2, platforms);
        this.physics.add.collider(enemy2, ground);

        // next level
        this.input.on('pointerdown', function() {
            if (score == 12) {
                this.scene.start('sceneB');
            }
        }, this);
    },

    update: function() {
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
})

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 300 },
            debug: false
        }
    },
    scene: [SceneA]
};

var game = new Phaser.Game(config);