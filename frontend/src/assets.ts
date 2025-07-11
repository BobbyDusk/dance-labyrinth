import { Assets } from "pixi.js";
import logger from "./Logger";

export const assets = [
  {alias: "track_background", src: "track_background.svg"},
];

export default async function preload() {
  await Assets.load(assets);
  logger.debug("Assets preloaded:", assets.map(asset => asset.alias).join(", "));
}
