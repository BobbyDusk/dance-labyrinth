import { Assets } from "pixi.js";

export const assets = [
    { alias: "arrowUp", src: "arrow-up-colored.png"},
    { alias: "arrowDown", src: "arrow-down-colored.png"},
    { alias: "arrowLeft", src: "arrow-left-colored.png"},
    { alias: "arrowRight", src: "arrow-right-colored.png"},
    { alias: "arrowUpHollow", src: "arrow-up-hollow-colored.png"},
    { alias: "arrowDownHollow", src: "arrow-down-hollow-colored.png"},
    { alias: "arrowLeftHollow", src: "arrow-left-hollow-colored.png"},
    { alias: "arrowRightHollow", src: "arrow-right-hollow-colored.png"},
]

export default async function preload() {
  await Assets.load(assets);
}
