import { OctavedNote, noteToInt } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { Chordesque } from "../hierarchy/Chordesque";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const NoParallelFifthInterMelodyConstraintInit = {
	type: "NoParallelFifthInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type NoParallelFifthInterMelodyConstraintIR =
	typeof NoParallelFifthInterMelodyConstraintInit

export class NoParallelFifthInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "NoParallelFifthInterMelodyConstraint"
    }

    public checkIM(tile: Tile<OctavedNote>, otherInstrument: TileCanvas<Chordesque, OctavedNote>) {
        const otherTile = tile.getPosition() < otherInstrument.getTiles().length ? otherInstrument.getTiles()[tile.getPosition()] : undefined
        if (!otherTile || !otherTile.isCollapsed()) {
            return true
        }
        if (tile.isCollapsed() && ((noteToInt(tile.getValue().getNote()) - noteToInt(otherTile.getValue().getNote())) == 7 
            && ((tile.getNext(true).isCollapsed() && otherTile.getNext(true).isCollapsed() && (noteToInt(tile.getNext(true).getValue().getNote()) - noteToInt(otherTile.getNext(true).getValue().getNote())) == 7)
            || (tile.getPrev(true).isCollapsed() && otherTile.getPrev(true).isCollapsed() && (noteToInt(tile.getPrev(true).getValue().getNote()) - noteToInt(otherTile.getPrev(true).getValue().getNote()) == 7))))
            || ((noteToInt(tile.getValue().getNote()) - noteToInt(otherTile.getValue().getNote())) == -7
            && ((tile.getNext(true).isCollapsed() && otherTile.getNext(true).isCollapsed() && (noteToInt(tile.getNext(true).getValue().getNote()) - noteToInt(otherTile.getNext(true).getValue().getNote())) == -7)
            || (tile.getPrev(true).isCollapsed() && otherTile.getPrev(true).isCollapsed() && (noteToInt(tile.getPrev(true).getValue().getNote()) - noteToInt(otherTile.getPrev(true).getValue().getNote()) == -7)))
        ))  {
            return false
        }
        return true
    }
}