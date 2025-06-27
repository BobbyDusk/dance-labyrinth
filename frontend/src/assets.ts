import { Assets } from "pixi.js";

export const assets = [
]

export default async function preload() {
  await Assets.load(assets);
}
