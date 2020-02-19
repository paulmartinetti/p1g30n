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
    this.closestB = { dx: this.gameW, dy: this.gameH };
    this.nextB;

    // pigeon movement
    this.step = 2;
    this.etat = 0;
    this.moveX = 0;
    this.moveY = 0;

    this.pH = function pH (ay) {
        //return ay;
        return ay-100;
    }

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
    },this);

    // eatForwards
    this.anims.create({
        key: 'eatF',
        frames: this.anims.generateFrameNames('pigeon', {
            prefix: 'body_',
            start: 16,
            end: 28,
            zeroPad: 1
        }),
        repeat: 0,
    },this);
    // eating sound
    this.p.on('animationupdate-eatF', function () {
        this.jackS.play();
    }, this);

    // done eating
    this.p.on('animationcomplete-eatF', function () {
        this.nextB.x = -500;
        this.etat = 0;
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
        repeat: 0,
    });
    // eating sound
    this.p.on('animationupdate-eatB', function () {
        this.jackS.play();
    }, this);
    
    // done eating
    this.p.on('animationcomplete-eatB', function () {
        this.nextB.x = -500;
        this.etat = 0;
    }, this);
    //


    /**
     * User clicks on sidewalk, bread appears, pigeon walks over and eats it
     */

    // listen for finger or mouse press on the sidewalk (y between 232 and 1196)
    this.bg.on('pointerdown', function (pointer, localX, localY) {

        // must be on the sidewalk
        if (pointer.downY < 232) return;

        // put bread on ground - display W=52, H=71, depth always covered by pigeon
        let br = this.add.sprite(pointer.downX, pointer.downY, 'pain').setDepth(3);

        // state of bread
        br.eaten = false;

        // store bread coordinates - center
        br.bx = pointer.downX;
        br.by = pointer.downY;

        // store all breads
        this.painA.push(br);

        // any new bread means reconsider pursuit of bread
        this.etat = 0;

    }, this);

}

function update() {

    /**
     * pigeon etat
     * 0 = not moving, not eating, looking for food
     * 1 = bread available, moving toward closest bread
     * 2 = eating
     */

    // if bread available and pigeon not moving
    if (this.painA.length > 0 && this.etat == 0) {
        // bread is always closer than edges of game
        this.closestB = { dx: this.gameW, dy: this.gameH };
        // look for closest bread
        let yena = false;
        this.painA.forEach(pain => {
            // if not eaten, consider distance for closest (sum of x and y deltas)
            if (!pain.eaten) {
                // there is bread
                yena = true;
                // capture distance and direction to each bread
                let dx = pain.bx - this.p.x;
                let dy = pain.by - this.pH(this.p.y);
                // this bread is closest, note it
                if ((Math.abs(dx) + Math.abs(dy)) < (Math.abs(this.closestB.dx) + Math.abs(this.closestB.dy))) {
                    // includes direction
                    this.closestB = { dx: dx, dy: dy };
                    // for pigeon movement and collision detection
                    this.nextB = pain;
                }

            }
        });
        // there is bread, go get it
        if (yena) this.etat = 1;
    }

    // set direction based on left / right or x movement
    if (this.etat == 1) {
        // moving to follow belly until arrived
        this.p.play('walk', true);
        // move X
        if (this.closestB.dx < 0) {
            // look left
            this.p.scaleX = 1;
            // move left
            this.moveX = -1 * this.step;
            // adjust if arrived
            if (this.p.x < this.nextB.bx) this.moveX = 0;
        } else {
            // look right
            this.p.scaleX = -1;
            // move right
            this.moveX = this.step;
             // adjust if arrived
             if (this.p.x > this.nextB.bx) this.moveX = 0;
        }
        // move y
        if (this.closestB.dy < 0) {
            this.moveY = -1 * this.step;
            // adjust if arrived
            if (this.pH(this.p.y) < this.nextB.by) this.moveY = 0;
        }  else {
            this.moveY = this.step;
            // adjust if arrived
            if (this.pH(this.p.y) > this.nextB.by) this.moveY = 0;
        }

        // always move after belly
        if (this.p.anims.getProgress() * 10 > 6) {
            //this.gp1S.play();
            this.p.x += this.moveX;
            this.p.y += this.moveY;
        }
        // check for arrival at bread
        let bRect = this.nextB.getBounds();
        let pRect = this.p.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(bRect, pRect)) {
            this.etat = 2;
        }
    }
    // pigeon is eating
    if (this.etat == 2) {
        
        // if bread was above, eat behind
        this.pH(this.p.y) > this.nextB.by ? this.p.play('eatB', true) : this.p.play('eatF', true);

        // get rid of bread
        this.nextB.eaten = true;

    }
    
}


