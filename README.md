# Dance Labyrinth

## Description

Dance dance revolution combined with navigating a maze. You're only allowed to move if you dance well.

## Game

- Speed is defined by BPM.
- The smallest precision is 1/64 of a beat.

## JSON song file

- *arrows* - beat, subbeat, direction with 0 = left, 1 = down, 2 = up, 3 = right

## TODO

- Have a deteministic play field, i.e. based on the time elapsed since start song, the beats and subbeats since start are calculated. Therefore the beat values of the lines are updated every loop. The arrows are then simply mapped onto the field.
- No queue. Just have an index of the first relevant arrow. Then, go through the arrows until you've reached an arrow that is not yet relevant
- Have a polling system that is independant of the rendering loop. Then graphics might render at 60 pfs, but the inputs are actually checked at 120 or 240 fps.
- Open source fps display.
- maybe combine with bomberman gameplay?
- add (skeletal) animated figure in middle of screen that dances when doing well
- controls configuration for both hands independendly.
  - options for left hand:
    - awsd
    - asdf
  - options for right hand:
    - jkl;
    - jikl
    - arrow keys

- set character facing active direction
- move on every beat to active direction
- combine labyrinth and music such that only move if all arrows between last beat and current beat were performed well
- figure out how to give extra reward for perfect or great notes