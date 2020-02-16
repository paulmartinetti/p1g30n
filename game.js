var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 1200,
    physics: {
        default: 'matter',
        matter: {
            debug: true
        }
    },
    scene: {
        preload: preload,
        init: init,
        create: create,
        update: update
    },
    title: 'p1g30n',
    pixelArt: false,
    backgroundColor: '555555'
};

// global vars

var game = new Phaser.Game(config);

function preload() {

    // pigeon
    this.load.atlas('pigeon', 'assets/spritesheet.png', 'assets/sprites.json');
    this.load.image('gpp','assets/grospepere1200.png');
}

function init() {
    this.gameW = this.sys.game.config.width;
    this.gameH = this.sys.game.config.height;

    this.cursors;
}

function create() {

    console.log(this.anims.create({
        key: 'agauche',
        frames: this.anims.generateFrameNames('pigeon',{
                prefix: 'body_',
                start: 0,
                end: 15,
                zeroPad: 1
            }),
        repeat: -1
    }));
    // bg
    this.add.sprite(0,0,'gpp').setDepth(1).setOrigin(0,0);
    this.p = this.add.sprite(400,400,'pigeon').setDepth(5);
    //this.p.msPerFrame = 125;
    this.p.play('agauche');


    // physics - matter
    this.matter.world.setBounds(0, 0, 1200, 1200);
    //let wall = this.matter.add.sprite(0, 1100, 'wall');

    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (this.cursors.up.isDown) {

    } else {
        //
    }
    // turning
    if (this.cursors.left.isDown) {

    } else if (this.cursors.right.isDown) {

    } else {

    }
}