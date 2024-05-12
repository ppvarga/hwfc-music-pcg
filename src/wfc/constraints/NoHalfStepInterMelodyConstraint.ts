import { OctavedNote, noteToInt } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const NoHalfStepInterMelodyConstraintInit = {
	type: "NoHalfStepInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type NoHalfStepInterMelodyConstraintIR =
	typeof NoHalfStepInterMelodyConstraintInit

export class NoHalfStepInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "NoHalfStepInterMelodyConstraint"
    }

    public checkIM(tile: Tile<OctavedNote>, otherInstrument: TileCanvas<OctavedNote>) {
        const otherTile = tile.getPosition() < otherInstrument.getTiles().length ? otherInstrument.getTiles()[tile.getPosition()] : undefined
        if (!otherTile || !otherTile.isCollapsed()) {
            return true
        }
        if (tile.isCollapsed() && Math.abs(noteToInt(tile.getValue().getNote()) - noteToInt(otherTile.getValue().getNote())) == 1) {
            return false
        }
        return true
    }
}