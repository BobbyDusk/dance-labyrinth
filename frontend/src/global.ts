import { Application } from "pixi.js"

export interface Global {
    app: Application
}

export let global: Global = {
    app: new Application()
}