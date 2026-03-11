import * as Matter from "matter-js";
import { PIECE_COLORS, SHAPES } from "./constants";
import type { TetrominoBody, TetrominoName } from "./types";

function colorFor(name: TetrominoName): string {
  return PIECE_COLORS[name];
}

export function isTetrominoBody(body: Matter.Body): body is TetrominoBody {
  const plugin = body.plugin as Partial<TetrominoBody["plugin"]> | undefined;
  return plugin?.isTetromino === true;
}

export function getTetrominoParts(body: TetrominoBody): Matter.Body[] {
  return body.parts.length > 1 ? body.parts.slice(1) : [body];
}

export function makeTetromino(
  name: TetrominoName,
  x: number,
  y: number,
  size: number,
  friction: number,
  restitution: number,
  isInsulating: boolean,
): TetrominoBody {
  const cells = SHAPES[name];
  const xs = cells.map(([cellX]) => cellX);
  const ys = cells.map(([, cellY]) => cellY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const offsetX = ((minX + maxX + 1) / 2) * size;
  const offsetY = ((minY + maxY + 1) / 2) * size;

  const parts = cells.map(([cellX, cellY]) => {
    const partX = x + (cellX * size - offsetX + size / 2);
    const partY = y + (cellY * size - offsetY + size / 2);
    const color = colorFor(name);

    return Matter.Bodies.rectangle(partX, partY, size, size, {
      chamfer: { radius: size * 0.15 },
      frictionAir: 0.01,
      friction,
      restitution,
      render: isInsulating
        ? {
            fillStyle: "transparent",
            strokeStyle: color,
            lineWidth: Math.max(2, Math.round(size * 0.14)),
          }
        : {
            fillStyle: color,
          },
    });
  });

  const tetromino = Matter.Body.create({ parts }) as TetrominoBody;
  tetromino.frictionAir = 0.01;
  tetromino.plugin = {
    isTetromino: true,
    name,
    frozen: false,
    isInsulating,
  };

  return tetromino;
}

export function freezeTetromino(body: TetrominoBody): void {
  body.plugin.frozen = true;
  Matter.Body.setVelocity(body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(body, 0);
  Matter.Body.setStatic(body, true);
}

export function wakeTetromino(body: TetrominoBody): void {
  Matter.Body.setVelocity(body, { x: 0, y: 0.1 });
  Matter.Sleeping.set(body, false);
}

export function sleepTetromino(body: TetrominoBody): void {
  Matter.Body.setVelocity(body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(body, 0);
  Matter.Sleeping.set(body, true);
}
