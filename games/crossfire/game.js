import kaboom from "https://unpkg.com/kaboom@3000/dist/kaboom.mjs";    

kaboom({
    width: 128,
    height: 256,
    background: [30, 30, 30],
    crisp: true,
    stretch: true,
    letterbox: true,
    pixelDensity: 1,
    texFilter: "nearest",
    //canvas: document.querySelector("#gameCanvas")
});

randSeed(Date.now());

const TWO_PI = Math.PI * 2;

const COLORS = {
    object:     Color.fromHex(0xEA33F7),
    hazard:     Color.fromHex(0xFF0050),
    background: Color.fromHex(0x1E1E1E)
};

loadFont("font", "font.ttf", {filter: "nearest"});

let highScore = 0;

// SCENE: MENU

scene("menu", () => {

setCursor("none");

add([
    pos(width()/2, 64),
    anchor("center"),
    text("Crossed \nFire", {size: 18, font: "font"})
]);

add([
    pos(width()/2, 128),
    anchor("center"),
    text("click to start", {size: 16, font: "font"})
]);

// INPUT EVENTS
onKeyPress("space", () => {
    go("game");
});

onMousePress("left", () => {
    go("game");
});

onTouchEnd((pos, t) => {
    if (!isFullscreen()) {
        setFullscreen(true);
    }
});

onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
});
});

// SCENE: GAME
scene("game", () => {

console.log(highScore);

// UI

let startGame = false;

let score = 0;

const ScoreText = add([
    pos(width()/2, height()/2),
    text("0", {size: 48, font: "font"}),
    anchor("center"),
    color(COLORS.object),
    opacity(0.2),
    {anchor_y: height()/2}
]);

const HighScoreText = add([
    pos(width()/2, height()/2 + 32),
    text("0", {size: 24, font: "font"}),
    anchor("center"),
    color(COLORS.object),
    opacity(0.2),
    {anchor_y: height()/2}
]);

HighScoreText.text = highScore;

function setScore(newScore) {
    
    score = newScore;

    if (score > highScore) {
        highScore = score;
        HighScoreText.text = highScore;
    }

    switch (score) {
        case 3:
            hazards.push("bullets");
        break;

        case 10:
            hazards.push("disc");
        break;

        case 18:
            hazards.push("rockets");
        break;

        case 26:
            hazards.push("spikes");
        break;

        case 5:
            hazards.push("lasers");
        break;
    }

    ScoreText.text = score;
}

// WALLS

const wallWidth     = 1;
const wallHeight    = height();

const Walls = 
[

// Left Wall
add([
    rect(wallWidth, wallHeight, {fill: false}),
    body({isStatic: true}),
    pos(0, 0),
    area(),
    "wall"
]),

// Right Wall
add([
    rect(wallWidth, wallHeight, {fill: false}),
    body({isStatic: true}),
    pos(width()-wallWidth, 0),
    area(),
    "wall"
])
]

function drawWalls() {

    drawLine({
        p1: vec2(wallWidth, 0),
        p2: vec2(wallWidth, wallHeight),
        width: 2,
        color: COLORS.object
    });

    drawLine({
        p1: vec2(width()-wallWidth, 0),
        p2: vec2(width()-wallWidth, wallHeight),
        width: 2,
        color: COLORS.object
    });
}

// ROCKETS

function spawnRockets() {

    const gap = 8;

    const rocket_l = add([
        pos(-42, 0),
        rect(24, 32, {fill: false}),
        outline(2, COLORS.hazard),
        area(),
        offscreen({ destroy: true }),
        {
            is_active: false
        },
        "rockets",
        "damage"
    ]);

    const rocket_r = add([
        pos(width()+42, 0),
        color(COLORS.background),
        rect(24, 32, {fill: false}),
        outline(2, COLORS.hazard),
        area(),
        offscreen({ destroy: true }),
        {
            is_active: false
        },
        "rockets",
        "damage"
    ]);

    const intro_l = tween(rocket_l.pos.x, gap, 1,
        (x) => {rocket_l.pos.x = x},
        easings.easeOutBack
    );

    const intro_r = tween(rocket_r.pos.x, width()-(24+gap), 1,
        (x) => {rocket_r.pos.x = x},
        easings.easeOutBack
    );

    intro_l.onEnd(() =>  {
        wait(0.5, () => {
            rocket_l.is_active = true;
            rocket_r.is_active = true;
            moveRockets(rocket_l, rocket_r);
            shake(2);
        });
    });

    hasHazard = true;
}

function moveRockets(r1, r2) {
    const move_1 = tween(r1.pos.y, height()+8, 1, 
        (y) => {r1.pos.y = y}, 
        easings.linear
    );

    tween(r2.pos.y, height()+8, 1, 
        (y) => {r2.pos.y = y}, 
        easings.linear
    );

    move_1.onEnd(() => {
        destroy(r1);
        destroy(r2);
        hasHazard = false;
    });
}

// BULLETS

let bulletGap = 64;

function spawnBullets() {

    if (!startGame) {
        return;
    }

    const speed = 120;
    const h_space = 10;
    const v_space = 42;

    const dir = choose([-1, 1]);

    let y = Player.pos.y + (bulletGap/2) * dir;

    const bullet_l = add([
        pos(h_space, y),
        circle(6),
        color(COLORS.hazard),
        "bullets",
        "damage",
        area(),
        offscreen({ destroy: true }),
        {
            is_active: false,
            dir: 1,
            speed: speed
        }
    ]);

    bullet_l.add([
        color(COLORS.background),
        circle(4),
        anchor("center")
    ]);
    
    let gap = bulletGap * dir;
    let next_y = bullet_l.pos.y + gap;
    if (next_y < v_space || next_y > height() - 8) {
        next_y = bullet_l.pos.y - gap;
    }

    y = Player.pos.y - (bulletGap/2) * dir;
    
    const bullet_r = add([
        pos(width()-h_space, y),
        circle(6),
        color(COLORS.hazard),
        offscreen({ destroy: true }),
        "bullets",
        "damage",
        area(),
        {
            is_active: false,
            dir: -1,
            speed: speed
        }
    ]);

    bullet_r.add([
        color(COLORS.background),
        circle(4),
        anchor("center")
    ]);

    bullet_l.onExitScreen(() => {
        hasHazard = false;
    });

    wait(1, () => {
        bullet_l.is_active = true;
        bullet_r.is_active = true;
        shake(2);
    });

    hasHazard = true;
}

onUpdate("bullets", (b) => {
    if (b.is_active) {
        b.move(b.dir * b.speed, 0);
    }
});

// DISC

// Cycles per second
let discCycles = 0.5;
let discCyclesWait = 3;
let discSpeed = TWO_PI * discCycles;
let discDistance = 64;

function spawnDisc() {

    const disc = add([
        pos(width()/2, -16),
        anchor("center"),
        color(COLORS.hazard),
        circle(12),
        {
            anchor_y: height()/2,
            is_active: false,
            counter: Math.PI
        },
        area(),
        "disc",
        "damage"
    ]);

    disc.add([
        color(COLORS.background),
        circle(10),
        anchor("center")
    ]);

    let intro = tween(disc.pos.y, height()/2, 1, 
        (y) => {disc.pos.y = y}, 
        easings.easeOutBack
    );

    intro.onEnd(() => {
        disc.is_active = true;
        shake(2);
        wait(discCyclesWait / discCycles, () => {
            disc.is_active = false;
            wait(1, () => {discOutro(disc);});
        });
    });

    hasHazard = true;
}

function discOutro(disc) {
    const outro = tween(disc.pos.y, -32, 0.5, 
        (y) => {disc.pos.y = y}, 
        easings.linear
    );

    outro.onEnd(() => {
        destroy(disc);
        hasHazard = false;
    });
}

onUpdate("disc", (disc) => {
    if (disc.is_active) {
        disc.counter += discSpeed * dt();
        disc.counter = disc.counter % TWO_PI;
        disc.pos.y = disc.anchor_y + Math.sin(disc.counter) * discDistance
    }
});

//SPIKES

function spawnSpikes() {
    
    // Choose whether to spawn 1 or 2 spikes
    const n = choose([1, 2]);

    // Pick which side to spawn it at first
    let side = choose([-1, 1]);
    const w = 6;
    const h = 48;
    let _x;
    const _y = h/2 + rand(8, height() - h - 8);
    
    let spikes = []

    for (let i = 0; i < n; i++) {

        let target_x = width()/2 + 60 * side;
        _x = target_x + 108 * side;

        const spike = add([
            pos(_x, _y),
            rect(w, h),
            color(COLORS.hazard),
            area(),
            anchor("center"),
            {
                side: side,
                is_active: true
            },
            "damage"
        ]);

        const intro = tween(spike.pos.x, target_x, 1,
            (x) => {spike.pos.x = x},
            easings.linear
        );

        intro.onEnd(() => {
            shake(2);
        });

        spikes.push(spike);

        side = -side;
    }

    wait(2, () => {
        outroSpikes(spikes, (s) => {
            const tweenOut = tween(
                s.pos.x, 
                width()/2 + 168 * s.side, 
                1, 
                (x) => {s.pos.x = x}
            );

            tweenOut.onEnd(() => {
                destroy(s);
                hasHazard = false;
            });
        });
    });

    hasHazard = true;

    return spikes;
}

function outroSpikes(spikes, endFunction) {
    for (let i = 0; i < spikes.length; i++) {
        const s = spikes[i];
        s.is_active = false;
        endFunction(s);
    }
}

// LASERS
function spawnLasers() {

    const center = width()/2;
    const targetHeight = 8;

    const laser_l = add([
        pos(center, 8),
        rect(120, 0),
        color(COLORS.hazard),
        area(),
        anchor("center"),
        "damage",
        {is_active: false}
    ]);

    const laser_r = add([
        pos(center, height() - 16),
        rect(120, 0),
        color(COLORS.hazard),
        area(),
        "damage",
        anchor("center"),
        {is_active: false}
    ]);

    const intro = tween(laser_l.height, targetHeight, 0.6, (h) => {
        laser_l.height = h
    }, easings.easeOutBack);

    tween(laser_r.height, targetHeight, 0.6, (h) => {
        laser_r.height = h
    }, easings.easeOutBack);

    intro.onEnd(() => {
        laser_l.is_active = true;
        laser_r.is_active = true;
    });

    wait(2, () => {
        const outro = tween(laser_r.height, 0, 0.6, (h) => {
            laser_r.height = h
        }, easings.linear);
    
        tween(laser_l.height, 0, 0.6, (h) => {
            laser_l.height = h
        }, easings.easeOutBack);
    
        outro.onEnd(() => {
            destroy(laser_l);
            destroy(laser_r);
        });
    });
}

// SPAWNER

let previousHazard = null;
let hazards = []
let hasHazard = false;
let hazardTimer = 2;

function spawnHazard() {

    if (hazards.length == 0 || hasHazard) {
        return;
    }

    let pick = choose(hazards);

    while (pick == previousHazard) {
        if (hazards.length == 1) {break;}
        pick = choose(hazards);
    }

    let nextHazard = pick;

    switch (nextHazard) {
    
        case "bullets":
            spawnBullets();
        break;

        case "disc":
            spawnDisc();
        break;

        case "rockets":
            spawnRockets();
        break;

        case "spikes":
            spawnSpikes();
        break;

        case "lasers":
            spawnLasers();
        break;

        default:
        break;
    }

    previousHazard = nextHazard;
}

loop(hazardTimer, spawnHazard);

onUpdate("damage", (obj) => {
        if (obj.is_active) {
        obj.opacity = 1;
        } else {
        obj.opacity = 0.3;
        }
});

// PLAYER

const GRAVITY       = 1000;
const MOVE_SPEED    =  120;
const FALL_SPEED    =  420;
const SLIDE_SPEED   =  120;

const PLAYER_WIDTH  =   12;

let direction       = choose([-1, 1]);
let onWall          = false;
let fallSpeed       = FALL_SPEED;
let jumpSpeed       = 400;

const Player = add([
    color(COLORS.object),
    rect(PLAYER_WIDTH, PLAYER_WIDTH, {fill: false}),
    outline(2, COLORS.object),
    pos(width()/2, height()/2),
    anchor("center"),
    rotate(0),
    area(),
    body(),
    {
        is_alive: true,
        is_active: false
    }
]);

function playerJump() {
    
    if (!startGame) {
        startGame = true;
    }

    if (!Player.is_alive) {return;}

    if (onWall) {
        direction = -direction;
        onWall = false;
        fallSpeed = FALL_SPEED;
        setScore(score + 1);

    }

    Player.vel.y = -jumpSpeed;
}

Player.onCollide("wall", (wall) => {
    if (!Player.is_alive) {return;}
    Player.angle = 0;
    onWall = true;
    fallSpeed = SLIDE_SPEED;
});

// Dying
Player.onCollide("damage", (obj) => {
    if (!Player.is_alive || !obj.is_active) {return;}
    if (onWall) {
        onWall = false;
        fallSpeed = FALL_SPEED;
        direction = -direction;
    }
    Player.is_alive = false;
    Player.collisionIgnore = ["wall"];
    shake(8);
    Player.vel.y = -300;
    wait(2, () => { go("game"); });
});

Player.onUpdate(() => {

    let delta = dt();

    if (!startGame) {
        Player.pos.y = 128 + Math.sin(time() * 3) * 12;
        return;
    }

    if (!onWall) {
        Player.angle += 360 * delta * direction;
    }

    Player.vel.y += GRAVITY * delta;

    const holdJump = isMouseReleased("left") || isKeyReleased("space");

    if (holdJump && Player.vel.y < 0) {
        Player.vel.y = Math.max(Player.vel.y, -jumpSpeed * 0.4);
    }

    Player.vel.y = Math.min(Player.vel.y, fallSpeed);

    if (Player.is_alive) {
        // Loop around
        if (Player.pos.y > height()) {
            Player.moveTo(vec2(Player.pos.x, 0));
        } else if (Player.pos.y < 0) {
            Player.moveTo(vec2(Player.pos.x, height()));
        }
    }

    Player.vel.x = MOVE_SPEED * direction;

    Player.move(Player.vel);

});

// INPUT EVENTS

onKeyPress("space", () => {
    playerJump();
});

onMousePress("left", () => {
    playerJump();
});

onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
});

// CALLBACKS

onDraw(() => {
    drawWalls();
});
});

// START
start();

function start() {
    go("menu");
}