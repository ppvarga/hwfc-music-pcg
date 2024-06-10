import { OctavedNote, noteToInt } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { Chordesque } from "../hierarchy/Chordesque";
import { NoteLevelNode } from "../hierarchy/NoteLevelNode";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const ProperSpacingInterMelodyConstraintInit = {
	type: "ProperSpacingInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type ProperSpacingInterMelodyConstraintIR =
	typeof ProperSpacingInterMelodyConstraintInit

export class ProperSpacingInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "ProperSpacingInterMelodyConstraint"
    }

    public checkIM(tile: Tile<OctavedNote>, otherInstrument: TileCanvas<Chordesque, OctavedNote>) {
        const otherTile = tile.getPosition() < otherInstrument.getTiles().length ? otherInstrument.getTiles()[tile.getPosition()] : undefined
        if (!otherTile || !otherTile.isCollapsed()) {
            return true
        }
        const instrumentNum = (tile.getCanvas().getNode() as NoteLevelNode).getInstrument()
        const otherInstrumentNum = (otherInstrument.getNode() as NoteLevelNode).getInstrument()
        if (instrumentNum == 1 || otherInstrumentNum == 1 || Math.abs(instrumentNum - otherInstrumentNum) > 1) {
            return true;
        }
        const dist = Math.abs((tile.getValue().getOctave() - otherTile.getValue().getOctave()) * 12 + (noteToInt(tile.getValue().getNote()) - noteToInt(otherTile.getValue().getNote())))
        if (tile.isCollapsed() && dist > 12) {
            return false
        }
        return true 
    }
}