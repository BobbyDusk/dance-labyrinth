import { Assets } from "pixi.js";

export const assets = [
    { alias: "arrowUp", src: "arrow-up.png"},
    { alias: "arrowDown", src: "arrow-down.png"},
    { alias: "arrowLeft", src: "arrow-left.png"},
    { alias: "arrowRight", src: "arrow-right.png"},
]

export default async function preload() {
  await Assets.load(assets);
}
