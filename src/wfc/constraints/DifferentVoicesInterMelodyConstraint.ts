import { OctavedNote, OctavedNoteIR } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { Chordesque } from "../hierarchy/Chordesque";
import { NoteLevelNode } from "../hierarchy/NoteLevelNode";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const DifferentVoicesInterMelodyConstraintInit = {
	type: "DifferentVoicesInterMelodyConstraint" as const,
    lowerNotes: [{ note: "C", octave: 5 }] as OctavedNoteIR[],
    higherNotes: [{ note: "B", octave: 6 }] as OctavedNoteIR[],
	validByDefault: true as const,
}

export type DifferentVoicesInterMelodyConstraintIR =
	typeof DifferentVoicesInterMelodyConstraintInit

export class DifferentVoicesInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string

    private lower: OctavedNoteIR[]
    private higher: OctavedNoteIR[]
    
    constructor(lowerNotes: OctavedNoteIR[], higherNotes: OctavedNoteIR[]) {
        this.name = "DifferentVoicesInterMelodyConstraint"

        this.lower = lowerNotes
        this.higher = higherNotes
    }

    public checkIM(tile: Tile<OctavedNote>, otherInstrument: TileCanvas<Chordesque, OctavedNote>) {
        const otherTile = tile.getPosition() < otherInstrument.getTiles().length ? otherInstrument.getTiles()[tile.getPosition()] : undefined
        if (!otherTile || !otherTile.isCollapsed()) {
            return true
        }
        let numInstruments = (tile.getCanvas().getNode() as NoteLevelNode).getParent()?.getSubNodes().length
        if (!numInstruments) numInstruments = 1
        else numInstruments = numInstruments / 2
        const instrumentNum = (tile.getCanvas().getNode() as NoteLevelNode).getInstrument()
        const otherInstrumentNum = (otherInstrument.getNode() as NoteLevelNode).getInstrument()

        if (tile.isCollapsed() && (instrumentNum - 1 > OctavedNote.getStepSize(new OctavedNote(this.lower[instrumentNum - 1].note, this.lower[instrumentNum - 1].octave), tile.getValue()) || (numInstruments - instrumentNum) > OctavedNote.getStepSize(tile.getValue(), new OctavedNote(this.higher[instrumentNum - 1].note, this.higher[instrumentNum - 1].octave)))) {
            return false
        }
        if (tile.isCollapsed() && ((instrumentNum < otherInstrumentNum && tile.getValue().compareTo(otherTile.getValue()) > -1) || (instrumentNum > otherInstrumentNum && tile.getValue().compareTo(otherTile.getValue()) < 1))) {
            return false
        }
        return true
    }
}