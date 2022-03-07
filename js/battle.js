var MyGame = {};

MyGame.Boot = function ()
{
};

MyGame.Boot.prototype.constructor = MyGame.Boot;

MyGame.Boot.prototype = {

    preload: function ()
    {
        this.load.image('background', 'assets/battle_background.png');
        this.load.spritesheet('cat', 'assets/Cat.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('bevo', 'assets/bevo.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('squir', 'assets/squir.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('turt', 'assets/turt.png', {frameWidth: 32, frameHeight:32});
    },

    create: function ()
    {
        cat = this.physics.add.sprite(50, 250, 'cat')
        bevo = this.physics.add.sprite(50, 350, 'bevo')
        squir = this.physics.add.sprite(50, 450, 'squir')
        turt = this.physics.add.sprite(50, 550, 'turt')
    }

};