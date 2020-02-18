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
    audio: {
        disableWebAudio: true
    },
    title: 'p1g30n',
    pixelArt: false,
    backgroundColor: '555555'
};

// global vars

var game = new Phaser.Game(config);

function preload() {

    // pigeon
    this.load.atlas('pigeon', 'assets/images/spritesheet.png', 'assets/images/sprites.json');
    this.load.image('gpp', 'assets/images/grospepere1200.jpg');

    // audio
    this.load.audio('jack', 'assets/audio/Jackhammer-sound.mp3');
    this.load.audio('gp1', 'assets/audio/Grospepere1.mp3');
    this.load.audio('gp2', 'assets/audio/Grospepere2.mp3');

}

function init() {
    this.gameW = this.sys.game.config.width;
    this.gameH = this.sys.game.config.height;

    this.cursors;
    this.step = 2;
    this.move = 0;
}

function create() {

    // background photo
    this.bg = this.add.sprite(0, 0, 'gpp').setDepth(1).setOrigin(0, 0).setInteractive();
    this.bg.on('pointerdown', function (pointer, localX, localY) {
        console.log(pointer);
    }, this);
    // pigeon
    this.p = this.add.sprite(400, 500, 'pigeon').setDepth(5).setOrigin(0.5, 1);

    // audio - must be here in Scene create()
    this.jackS = this.sound.add('jack');
    this.gp1S = this.sound.add('gp1');
    this.gp2S = this.sound.add('gp2');

    // walking
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('pigeon', {
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
        frames: this.anims.generateFrameNames('pigeon', {
            prefix: 'body_',
            start: 16,
            end: 28,
            zeroPad: 1
        }),
        repeat: 0
    });
    this.p.on('animationupdate-eatF', function (){
        this.jackS.play();
    },this);
    // eatB
    this.anims.create({
        key: 'eatB',
        frames: this.anims.generateFrameNames('pigeon', {
            prefix: 'body_',
            start: 29,
            end: 40,
            zeroPad: 1
        }),
        repeat: 0
    });
    this.p.on('animationupdate-eatB', function (){
        this.jackS.play();
    },this);

    // physics - matter
    this.matter.world.setBounds(0, 0, 1200, 1200);
    //let wall = this.matter.add.sprite(0, 1100, 'wall');

    this.cursors = this.input.keyboard.createCursorKeys();


}

function update() {


    // mid-anim move
    if (this.move != 0) {
        // move to follow belly
        if (this.p.anims.getProgress() * 10 > 6) {
            this.gp1S.play();
            this.p.x += this.move;
        }
    }

    // turning
    if (this.cursors.left.isDown) {
        this.p.scaleX = 1;
        this.p.play('walk', true);
        this.move = -1 * this.step;
    } else if (this.cursors.right.isDown) {
        this.p.scaleX = -1;
        this.p.play('walk', true);
        this.move = this.step;
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