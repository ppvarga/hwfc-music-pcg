import { OctavedNote, noteDistance } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { Chordesque } from "../hierarchy/Chordesque";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const NoParallelEightInterMelodyConstraintInit = {
	type: "NoParallelEightInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type NoParallelEightInterMelodyConstraintIR =
	typeof NoParallelEightInterMelodyConstraintInit

export class NoParallelEightInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "NoParallelEightInterMelodyConstraint"
    }

    public checkIM(tile: Tile<OctavedNote>, otherInstrument: TileCanvas<Chordesque, OctavedNote>) {
        const otherTile = tile.getPosition() < otherInstrument.getTiles().length ? otherInstrument.getTiles()[tile.getPosition()] : undefined
        if (!otherTile || !otherTile.isCollapsed()) {
            return true
        }
        if (tile.isCollapsed() && noteDistance(tile.getValue().getNote(), otherTile.getValue().getNote()) == 0 
            && ((tile.getNext(true).isCollapsed() && otherTile.getNext(true).isCollapsed() && noteDistance(tile.getNext(true).getValue().getNote(), otherTile.getNext(true).getValue().getNote()) == 0)
            || (tile.getPrev(true).isCollapsed() && otherTile.getPrev(true).isCollapsed() && noteDistance(tile.getPrev(true).getValue().getNote(), otherTile.getPrev(true).getValue().getNote()) == 0))
        ) {
            return false
        }
        return true
    }
}