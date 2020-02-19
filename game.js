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

    //this.cursors;

    this.pconfig = {
        minScale: 0.6,
        maxScale: 1.6
    };

    // to manage multiple breads
    this.painA = [];
    this.closestB = { x: 1201, y: 1201 };

    // pigeon movement
    this.step = 2;
    this.etat = 0;
    this.moveX = 0;
    this.moveY = 0;

    /**
     * Depths - background = 1
     *          breads = 3 or 7
     *          pigeon = 5
     */
}

function create() {

    // background photo
    this.bg = this.add.sprite(0, 0, 'gpp').setDepth(1).setOrigin(0, 0).setInteractive();

    // pigeon - origin is bottom center bc of animations, displayHeight = 232
    // depth of 5
    this.p = this.add.sprite(600, ((this.gameH / 2) + (232 / 2)), 'pigeon').setDepth(5).setOrigin(0.5, 1);
    //console.log(this.p);

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
    // eating sound
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
    // eating sound
    this.p.on('animationupdate-eatB', function () {
        this.jackS.play();
    }, this);


    /**
     * User clicks on sidewalk, bread appears, pigeon walks over and eats it
     */

    // pigeon est libre pour chercher un bout de pain
    this.dispo = true;
    // il y en a (du pain - there is bread)
    this.yena = false;
    // listen for finger or mouse press on the sidewalk (y between 232 and 1196)
    this.bg.on('pointerdown', function (pointer, localX, localY) {

        // put bread on ground - display W=52, H=71
        let br = this.add.sprite(pointer.downX, pointer.downY, 'pain').setDepth(3);

        // set level of bread, so if behind pigeon, not on top
        //br.setDepth((br.y-this.p.y) < 0 ? 3 : 7);

        // state of bread
        br.eaten = false;

        // store bread coordinates - center
        br.x = pointer.downX;
        br.y = pointer.downY;

        // store 
        painA.push(br);

    }, this);

}

function update() {

    /**
     * pigeon etat
     * 0 = not moving, not eating
     * 1 = bread available, moving
     * 2 = eating
     */

    // if bread available and pigeon not moving
    if (this.painA.length > 0 && this.etat == 0) {
        // look for closest bread
        this.painA.forEach(pain => {
            // if not eaten, consider distance for closest (sum of x and y deltas)
            if (!pain.eaten) {
                // there is at least one bread
                this.etat = 1;
                // capture distance and direction to each bread
                let dx = pain.x - this.p.x;
                let dy = pain.y - this.p.y;
                // this bread is closest, note it
                if ((Math.abs(dx) + Math.abs(dy)) < (Math.abs(this.closestB.x) + Math.abs(this.closestB.y))) {
                    this.closestB = { x: dx, y: dy };
                }
            }
        });
    } else {
        // wait for bread
        this.etat = 0;
    }

    // set direction based on left / right or x movement
    if (this.etat = 1) {
        // moving to follow belly until arrived
        this.p.play('walk', true);
        // move X
        if (this.closestB.x < 0) {
            // look left
            this.p.scaleX = 1;
            this.moveX = -1 * this.step;
            // 
        } else {
            this.p.scaleX = -1;
            this.moveX = this.step;
        }
        // move y
        if (this.closestB.x < 0) {
            this.moveY = -1 * this.step;
        } else {
            this.moveY = this.step;
        }
        // always move after belly
        if (this.p.anims.getProgress() * 10 > 6) {
            this.gp1S.play();
            // when values are zero, he's just not moving
            this.p.x += this.moveX;
            this.p.y += this.moveY;
        }
        // check for arrival at bread
        let bRect = .getBounds();
        let tRect = this.terre.getBounds();
        if (!Phaser.Geom.Intersects.RectangleToRectangle(bRect, tRect)) {
            balloon.state = 2;
            balloon.setFrame(1);
        }
    }
    //this.p.play('eatB', true);
    //this.p.play('eatF', true);
}

    
