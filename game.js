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
    this.step = 2;
    this.move = 0;
}

function create() {

    // bg
    this.add.sprite(0,0,'gpp').setDepth(1).setOrigin(0,0);
    // pigeon
    this.p = this.add.sprite(400,500,'pigeon').setDepth(5).setOrigin(0.5, 1);
    
    // walking
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('pigeon',{
                prefix: 'body_',
                start: 0,
                end: 16,
                zeroPad: 1
            }),
        repeat: 0
    });
    // eatF
    this.anims.create({
        key: 'eatF',
        frames: this.anims.generateFrameNames('pigeon',{
                prefix: 'body_',
                start: 16,
                end: 28,
                zeroPad: 1
            }),
        repeat: 0
    });
    // eatB
    this.anims.create({
        key: 'eatB',
        frames: this.anims.generateFrameNames('pigeon',{
                prefix: 'body_',
                start: 29,
                end: 40,
                zeroPad: 1
            }),
        repeat: 0
    });


    // physics - matter
    this.matter.world.setBounds(0, 0, 1200, 1200);
    //let wall = this.matter.add.sprite(0, 1100, 'wall');

    this.cursors = this.input.keyboard.createCursorKeys();

    
}

function update() {


    // mid-anim move
    if (this.move != 0) {
        // move to follow belly
        if (this.p.anims.getProgress()*10 > 6) this.p.x+=this.move;
    }
    
    // turning
    if (this.cursors.left.isDown) {
        this.p.play('walk', true);
        this.p.scaleX = 1;
        this.move = -1*this.step;

    } else if (this.cursors.right.isDown) {
        this.p.play('walk', true);
        this.p.scaleX = -1;
        this.move = this.step
    } else {
        this.move = 0;
    }

    // eating
    if (this.cursors.up.isDown) {
        this.p.play('eatB', true);
    } 
    if (this.cursors.down.isDown) {
        this.p.play('eatF', true);
    } 
}