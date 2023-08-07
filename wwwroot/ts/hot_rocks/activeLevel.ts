import { BoundingBox } from "./boundingBox";
import * as Constants from "./constants";
import { Key, KeyboardState } from "./keyboardState";
import { vec2 } from "gl-matrix";

export enum CharacterFacing { Left, Right };
export enum CollisionOutcome { None, Collision, Victory }
export enum LevelResetCause { Start, Death, Victory }

export class ActiveLevel {
    public mcPosition: vec2 = vec2.fromValues(0, 0);
    public mcVelocity: vec2 = vec2.fromValues(0, 0);

    public mcGrounded: boolean = false;
    public mcRunning: boolean = false;

    public lavaHeight: number = 0;
    public facing: CharacterFacing = CharacterFacing.Left;
    public tiles: number[][];

    public editorMode: boolean = false;

    constructor (tiles: number[][]) {
        this.tiles = tiles;
        this.resetLevel( LevelResetCause.Start);
    }

    public getStartingPosition()
    {
        for ( let tileX: number = 0; tileX < Constants.LEVEL_WIDTH; ++tileX )
            for ( let tileY: number = 0; tileY <= Constants.LEVEL_HEIGHT; ++tileY )
                if ( this.tiles[tileX][tileY] == Constants.TILE_ID_FLAG_WHITE )
                {
                    return vec2.fromValues(
                        tileX * Constants.TILE_SIZE + Constants.TILE_SIZE * 0.5 - Constants.SPRITE_SUIT_SIZE / 2,
                        (tileY + 0.05) * Constants.TILE_SIZE
                    );
                }
        return vec2.fromValues(256, 256);
    }

    public resetLevel( resetCause: LevelResetCause )
    {
        // if (resetCause == LevelResetCause.Start)
        //     this.levelNumber = 1;
        // else if (resetCause == LevelResetCause.Victory)
        // {
        //     ++this.levelNumber;
        //     if (LevelNumber == 5)
        //     {
        //         GameWon = true;
        //         return;
        //     }
        // }

        this.mcPosition = this.getStartingPosition();
    }

    public saveTilesToFile(): void
    {

    }

    public loadTilesFromFile(): void
    {

    }

    public getPlayerBoundingBox( playerX: number, playerY: number ): BoundingBox
    {
        let left: number = playerX + (Constants.SPRITE_SUIT_SIZE / 2) - Constants.CHAR_PHYSICS_WIDTH;
        let right: number = playerX + (Constants.SPRITE_SUIT_SIZE / 2) + Constants.CHAR_PHYSICS_WIDTH;
        let bottom: number = playerY;
        let top: number = playerY + Constants.SPRITE_SUIT_SIZE;

        return new BoundingBox(left, right, bottom, top);
    }

    public bbLevelIntersection( gameWon: boolean, bb: BoundingBox ): CollisionOutcome
    {
        if ( gameWon )
            return CollisionOutcome.None;

        let McLeftTile: number = Math.floor(bb.left);
        let McRightTile: number = Math.floor(bb.right);
        let McBottomTile: number = Math.floor(bb.bottom);
        let McTopTile: number = Math.floor(bb.top);

        let collision: boolean = false;

        for (let tileX: number = McLeftTile; tileX <= McRightTile; ++tileX)
            for (let tileY: number = McBottomTile; tileY <= McTopTile; ++tileY)
            {
                if (tileX < 0 || tileX >= Constants.LEVEL_WIDTH
                    || tileY < 0 || tileY >= Constants.LEVEL_HEIGHT)
                    collision = true;
                else if (this.tiles[tileX][tileY] == Constants.TILE_ID_ROCK)
                    collision = true;
                else if (this.tiles[tileX][tileY] == Constants.TILE_ID_FLAG_RED)
                    return CollisionOutcome.Victory;
            }

        if (collision)
            return CollisionOutcome.Collision;
        else
            return CollisionOutcome.None;
    }

    public getPlayerBoundingBoxTiles( playerX: number, playerY: number )
    {
        let bb = this.getPlayerBoundingBox(playerX, playerY);
        return new BoundingBox(
            bb.left / Constants.TILE_SIZE,
            bb.right / Constants.TILE_SIZE,
            bb.bottom / Constants.TILE_SIZE,
            bb.top / Constants.TILE_SIZE
        );
    }

    public isIntersectionWithLevel( gameWon: boolean, playerX: number, playerY: number): CollisionOutcome
    {
        if ( gameWon )
            return CollisionOutcome.None;

        let boundingBox: BoundingBox = this.getPlayerBoundingBoxTiles(playerX, playerY);
        return this.bbLevelIntersection( gameWon, boundingBox );
    }

    public isLavaCollision( playerY: number ): boolean
    {
        return false;
    }

    public processPlayerMovement(gameWon: boolean, prevKeyState: KeyboardState, keyState: KeyboardState, elapsedTime: number)
    {
        if ( gameWon )
            return;

        if ( this.editorMode )
        {
            if (keyState.isKeyDown(Key.F1) && !prevKeyState.isKeyDown(Key.F1))
                this.saveTilesToFile();
            if (keyState.isKeyDown(Key.F2) && !prevKeyState.isKeyDown(Key.F2))
                this.loadTilesFromFile();
        }
        if (keyState.isKeyDown(Key.F12) && !prevKeyState.isKeyDown(Key.F12))
            this.editorMode = !this.editorMode;

        let newPosition: vec2 = vec2.clone( this.mcPosition );

        let moveLeft: boolean = keyState.isKeyDown(Key.Left) || keyState.isKeyDown(Key.A);
        let moveRight: boolean = keyState.isKeyDown(Key.Right) || keyState.isKeyDown(Key.D);

        if (moveLeft && !moveRight)
        {
            this.mcRunning = true;
            newPosition[0] -= Constants.CHARACTER_MOVE_SPEED * elapsedTime;
            this.facing = CharacterFacing.Left;
        }
        else if (moveRight && !moveLeft)
        {
            this.mcRunning = true;
            newPosition[0] += Constants.CHARACTER_MOVE_SPEED * elapsedTime;
            this.facing = CharacterFacing.Right;
        }
        else
        {
            this.mcRunning = false;
        }

        if ((keyState.isKeyDown(Key.Space) || keyState.isKeyDown(Key.W)) && !(prevKeyState.isKeyDown(Key.Space) || prevKeyState.isKeyDown(Key.W)))
        {
            if ( this.mcGrounded )
            {
                this.mcGrounded = false;
                this.mcVelocity[1] += Constants.JUMP_SPEED;
            }
        }

        let outcome: CollisionOutcome = this.isIntersectionWithLevel(gameWon, newPosition[0], newPosition[1]);
        switch (outcome)
        {
            case CollisionOutcome.None:
                this.mcPosition = newPosition;
                break;
            case CollisionOutcome.Victory:
                this.resetLevel( LevelResetCause.Victory);
                return;
            default:
                break;
        }
        
        newPosition = vec2.clone( this.mcPosition );

        // collisions - process Y only
        // TODO - check whether X is required too
        this.mcVelocity[1] -= Constants.GRAVITY * elapsedTime;
        newPosition[1] += this.mcVelocity[1] * elapsedTime;

        outcome = this.isIntersectionWithLevel(gameWon, newPosition[0], newPosition[1]);
        switch (outcome)
        {
            case CollisionOutcome.None:
                this.mcPosition = newPosition;
                this.mcGrounded = false;
                break;
            case CollisionOutcome.Victory:
                this.resetLevel( LevelResetCause.Victory);
                return;
            default:
                vec2.zero( this.mcVelocity );
                this.mcGrounded = true;             // TODO: try setting the character position to some intermediate value
                break;
        }

        if ( this.isLavaCollision( this.mcPosition[1] ) )
        {
            this.resetLevel(LevelResetCause.Death);
            return;
        }
    }

    public update(gameWon: boolean, prevKeyState: KeyboardState, keyState: KeyboardState, elapsedTime: number)
    {
        this.processPlayerMovement(gameWon, prevKeyState, keyState, elapsedTime);
    }
}
