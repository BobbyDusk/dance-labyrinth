import { Application, Assets, Sprite, Ticker } from 'pixi.js';

let app = new Application();

export async function setup(container: HTMLElement) {
    await app.init({width: 600, height: 1000 });
    container.appendChild(app.canvas);

    const arrows = await Promise.all([
        createArrow(ArrowDirection.Left),
        createArrow(ArrowDirection.Down),
        createArrow(ArrowDirection.Up),
        createArrow(ArrowDirection.Right),
    ])

    arrows.forEach((arrow, index) => {
        arrow.x = app.screen.width / 8 * (index * 2 + 1);
        arrow.y = 100;
        app.stage.addChild(arrow);
    })

    // Listen for animate update
    app.ticker.add(loop);
};

enum ArrowDirection
{
    Left,
    Down,
    Up,
    Right
}

async function createArrow(arrowDirection: ArrowDirection): Promise<Sprite> {
    let texture
    switch (arrowDirection) {
        case ArrowDirection.Up:
            texture = await Assets.load('/arrow-up.png');
            break;
        case ArrowDirection.Right:
            texture = await Assets.load('/arrow-right.png');
            break;
        case ArrowDirection.Down:
            texture = await Assets.load('/arrow-down.png');
            break;
        case ArrowDirection.Left:
            texture = await Assets.load('/arrow-left.png');
            break;
    }

    let arrow = new Sprite(texture);
    arrow.scale = 0.25
    arrow.anchor.set(0.5);

    return arrow
}

function getxPosition(arrowDirection: ArrowDirection): number {
    return app.screen.width / 8 * (arrowDirection * 2 + 1);
}

interface Arrow {
    sprite: Sprite,
    direction: ArrowDirection
}

let queue: Arrow[] = []
let bpm = 120
let timePassedSinceLastArrow = 0
let timeBetweenArrows = 60 * 1000 / bpm
async function loop(time: Ticker) {
    timePassedSinceLastArrow += time.deltaMS

    // add arrows
    if (timePassedSinceLastArrow > timeBetweenArrows)
    {
        timePassedSinceLastArrow = timePassedSinceLastArrow - timeBetweenArrows
        let randomArrowDirection = Math.floor(Math.random() * 4)
        let arrowSprite = await createArrow(randomArrowDirection)
        arrowSprite.x = getxPosition(randomArrowDirection)
        arrowSprite.y = app.screen.height
        app.stage.addChild(arrowSprite)
        queue.push({ sprite: arrowSprite, direction: randomArrowDirection })
    }

    // move arrows
    queue.forEach((arrow: Arrow) => {
        arrow.sprite.y -= 10 * time.deltaTime
        if (arrow.sprite.y < 0) {
            arrow.sprite.destroy()
            queue.shift()
        }
    })
}