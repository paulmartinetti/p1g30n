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

    // background photo
    this.load.image('gpp', 'assets/images/grospepere1200.jpg');

    // pigeon
    this.load.atlas('pigeon', 'assets/images/spritesheet.png', 'assets/images/sprites.json');

    // bread
    this.load.image('pain', 'assets/images/pain.png');

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

    this.pconfig = {
        minScale: 0.6,
        maxScale: 1.6
    };

    this.painA = [];

    /**
     * Depths - bg = 1
     *          br = 3 or 7
     *          p = 5
     */
}

function create() {

    // background photo
    this.bg = this.add.sprite(0, 0, 'gpp').setDepth(1).setOrigin(0, 0).setInteractive();

    // pigeon - origin is bottom center, displayHeight = 232
    // depth of 5
    this.p = this.add.sprite(600, ((this.gameH/2)+(232/2)), 'pigeon').setDepth(5).setOrigin(0.5, 1);
    //console.log(this.p);

    /**
     * User clicks on sidewalk, bread appears, pigeon walks over and eats it
     */

    // pigeon est libre pour chercher un bout de pain
    this.dispo = true;
    // il y en a (du pain - there is bread)
    this.yena = false;
    // listen for finger or mouse press on the sidewalk (y between 232 and 1196)
    this.bg.on('pointerdown', function (pointer, localX, localY) {

        // find pigeon
        let px = this.p.x;
        let py = this.p.y;

        // put bread on ground
        let br = this.add.sprite(pointer.downX, pointer.downY, 'pain');
        // set level of bread, so if behind him, not on top
        br.setDepth((py - pointer.downY) > 0 ? 3 : 7);
        

    }, this);


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

    // eatForwards
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
    this.p.on('animationupdate-eatF', function () {
        this.jackS.play();
    }, this);

    // eatBackwards
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
    this.p.on('animationupdate-eatB', function () {
        this.jackS.play();
    }, this);


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