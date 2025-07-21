import { MoveDirection, setActiveDirection, activeDirection } from "../labyrinthApp"
import { inputManager, KeyPress, Input } from "../Input"
import { danceManager } from "./DanceManager";

export default function setupInput() {
  inputManager.addInputGroup("MoveLeft");
  inputManager.addInput("MoveLeft", new KeyPress("a"));
  inputManager.addAction("MoveLeft", () => setActiveDirection(MoveDirection.Left));
  inputManager.addInputGroup("MoveRight");
  inputManager.addInput("MoveRight", new KeyPress("f"));
  inputManager.addAction("MoveRight", () => setActiveDirection(MoveDirection.Right));
  inputManager.addInputGroup("MoveUp");
  inputManager.addInput("MoveUp", new KeyPress("d"));
  inputManager.addAction("MoveUp", () => setActiveDirection(MoveDirection.Up));
  inputManager.addInputGroup("MoveDown");
  inputManager.addInput("MoveDown", new KeyPress("s"));
  inputManager.addAction("MoveDown", () => setActiveDirection(MoveDirection.Down));
  inputManager.addInputGroup("Lane0");
  inputManager.addInput("Lane0", new KeyPress("j"));
  inputManager.addAction("Lane0", () => danceManager.press(0));
  inputManager.addInputGroup("Lane1");
  inputManager.addInput("Lane1", new KeyPress("k"));
  inputManager.addAction("Lane1", () => danceManager.press(1));
  inputManager.addInputGroup("Lane2");
  inputManager.addInput("Lane2", new KeyPress("l"));
  inputManager.addAction("Lane2", () => danceManager.press(2));
  inputManager.addInputGroup("Lane3");
  inputManager.addInput("Lane3", new KeyPress(";"));
  inputManager.addAction("Lane3", () => danceManager.press(3));
}