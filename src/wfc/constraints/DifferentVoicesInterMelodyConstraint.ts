import { OctavedNote, noteToInt } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { Chordesque } from "../hierarchy/Chordesque";
import { NoteLevelNode } from "../hierarchy/NoteLevelNode";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const DifferentVoicesInterMelodyConstraintInit = {
	type: "DifferentVoicesInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type DifferentVoicesInterMelodyConstraintIR =
	typeof DifferentVoicesInterMelodyConstraintInit

export class DifferentVoicesInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "DifferentVoicesInterMelodyConstraint"
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

        if (tile.isCollapsed() && (tile.getValue().getOctave() == 5 && (instrumentNum - 1 > noteToInt(tile.getValue().getNote()) || (tile.getValue().getOctave() == 6 && numInstruments - instrumentNum - 1 > 12 - noteToInt(tile.getValue().getNote()))))) {
            return false
        }
        if (tile.isCollapsed() && ((instrumentNum < otherInstrumentNum && tile.getValue().compareTo(otherTile.getValue()) > -1) || (instrumentNum > otherInstrumentNum && tile.getValue().compareTo(otherTile.getValue()) < 1))) {
            return false
        }
        return true
    }
}