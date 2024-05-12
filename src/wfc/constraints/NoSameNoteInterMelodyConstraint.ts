import { OctavedNote, noteToInt } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const NoSameNoteInterMelodyConstraintInit = {
	type: "NoSameNoteInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type NoSameNoteInterMelodyConstraintIR =
	typeof NoSameNoteInterMelodyConstraintInit

export class NoSameNoteInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "NoSameNoteInterMelodyConstraint"
    }

    public checkIM(tile: Tile<OctavedNote>, otherInstrument: TileCanvas<OctavedNote>) {
        const otherTile = tile.getPosition() < otherInstrument.getTiles().length ? otherInstrument.getTiles()[tile.getPosition()] : undefined
        if (!otherTile || !otherTile.isCollapsed()) {
            return true
        }
        if (tile.isCollapsed() && noteToInt(tile.getValue().getNote()) == noteToInt(otherTile.getValue().getNote())) {
            return false
        }
        return true
    }
}