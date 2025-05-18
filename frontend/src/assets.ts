import { Assets } from "pixi.js";

export const assets = [
    { alias: "arrowUp", src: "arrow-up-colored.png"},
    { alias: "arrowDown", src: "arrow-down-colored.png"},
    { alias: "arrowLeft", src: "arrow-left-colored.png"},
    { alias: "arrowRight", src: "arrow-right-colored.png"},
]

export default async function preload() {
  await Assets.load(assets);
}
