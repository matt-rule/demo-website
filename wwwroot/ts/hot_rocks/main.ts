import { Renderer, ImagesDictionary } from "./renderer";
import { vec2 } from "gl-matrix";

const SQUARE_SPEED: number = 60;

export class Game {
    // Define members (properties)
    public canvas: HTMLCanvasElement;
    public renderer: Renderer;
    public lastUpdateTime: number;
    public squarePosition: vec2;
    
    // Define a constructor
    constructor(canvas: HTMLCanvasElement)
    {
        this.canvas = canvas;
        this.renderer = new Renderer();
        this.lastUpdateTime = 0;
        this.squarePosition = vec2.fromValues(200, 100);
    }

    init( stillImages: ImagesDictionary, animatedImages: ImagesDictionary ) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.canvas.style.maxWidth = `${window.innerWidth}px`;
        this.canvas.style.maxHeight = `${window.innerHeight}px`;
        let gl: WebGL2RenderingContext | null = this.canvas.getContext("webgl2");
        if (gl) {
            this.renderer.init( gl, this.canvas.width, this.canvas.height, stillImages, animatedImages );
        }
        else {
            alert('Your browser does not support webgl2');
        }
    }

    update() {

    }    
}

let stillImageUrls = [
    "assets/hot_rocks/lava-bomb.png",
    "assets/hot_rocks/tile.png",
    "assets/hot_rocks/bg1.png",
    "assets/hot_rocks/sprite-standing.png",
    "assets/hot_rocks/spitter.png",
    "assets/hot_rocks/lava-bullet-2.png",
    "assets/hot_rocks/flag-red.png",
    "assets/hot_rocks/flag-white.png",
    "assets/hot_rocks/spitter-flame.png"
];

let animatedImageUrls = [
    "assets/hot_rocks/sprite-suit.png",
    "assets/hot_rocks/sprite-font.png",
    "assets/hot_rocks/sprite-lava-lake.png",
    "assets/hot_rocks/sprite-lava-surface.png",
    "assets/hot_rocks/sprite-flames-big.png"
];

function promiseFunction(url : string) {
    return new Promise<{[key: string]: HTMLImageElement}>((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve({[url]: img});
        img.onerror = reject;
        img.src = url;
    });
}

let loadStillImagePromises = stillImageUrls.map(promiseFunction);
let loadAnimatedImagePromises = animatedImageUrls.map(promiseFunction);

let canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement;
if (canvas) {
    let game : Game = new Game(canvas);

    Promise.all(loadStillImagePromises).then(stillImageObjects => {
        let stillImages: ImagesDictionary = Object.assign({}, ...stillImageObjects);
    
        Promise.all(loadAnimatedImagePromises).then(animatedImageObjects => {
            if (!canvas)
                return;

            let animatedImages: ImagesDictionary = Object.assign({}, ...animatedImageObjects);
    
            game = new Game( canvas );
            game.init(stillImages, animatedImages);
            requestAnimationFrame(animate);
        }).catch(err => {
            console.error("Error occurred loading animated images: ", err);
        });
    
    }).catch(err => {
        console.error("Error occurred loading still images: ", err);
    });

    function animate(time: number) {
        if (game.lastUpdateTime == 0) {
            game.lastUpdateTime = time;
            requestAnimationFrame(animate);
            return;    
        }

        let deltaTime = time - game.lastUpdateTime; // time since last frame in milliseconds
        game.lastUpdateTime = time;
    
        // convert deltaTime to seconds
        deltaTime /= 1000;
    
        // update position based on speed and time
        game.squarePosition[0] += SQUARE_SPEED * deltaTime;

        game.renderer.draw(game.squarePosition);
    
        requestAnimationFrame(animate);
    }
}