import { OctavedNote, noteToInt } from "../../music_theory/Note";
import { Tile } from "../Tile";
import { TileCanvas } from "../TileCanvas";
import { Chordesque } from "../hierarchy/Chordesque";
import { NoteLevelNode } from "../hierarchy/NoteLevelNode";
import { InterMelodyConstraint } from "./concepts/Constraint";

export const NoDirectFifthEightInterMelodyConstraintInit = {
	type: "NoDirectFifthEightInterMelodyConstraint" as const,
	validByDefault: true as const,
}

export type NoDirectFifthEightInterMelodyConstraintIR =
	typeof NoDirectFifthEightInterMelodyConstraintInit

export class NoDirectFifthEightInterMelodyConstraint implements InterMelodyConstraint<OctavedNote> {
    public name: string
    
    constructor() {
        this.name = "NoDirectFifthEightInterMelodyConstraint"
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

        if (tile.isCollapsed() 
            && ((instrumentNum == 1 && otherInstrumentNum == numInstruments) || (instrumentNum == numInstruments && otherInstrumentNum == 1)) 
            && ((((Math.abs(noteToInt(tile.getValue().getNote()) - noteToInt(otherTile.getValue().getNote())) == 7) || (Math.abs(noteToInt(tile.getValue().getNote()) - noteToInt(otherTile.getValue().getNote())) == 0))
                && (tile.getPrev(true).isCollapsed() && otherTile.getPrev(true).isCollapsed() && tile.getPrev(true).getValue().compareTo(tile.getValue()) == otherTile.getPrev(true).getValue().compareTo(otherTile.getValue())))
            || ((tile.getNext(true).isCollapsed() && otherTile.getNext(true).isCollapsed())
                && (tile.getNext(true).getValue().compareTo(tile.getValue()) == otherTile.getNext(true).getValue().compareTo(otherTile.getValue()))
                && ((Math.abs(noteToInt(tile.getNext(true).getValue().getNote()) - noteToInt(otherTile.getNext(true).getValue().getNote())) == 7) || (Math.abs(noteToInt(tile.getNext(true).getValue().getNote()) - noteToInt(otherTile.getNext(true).getValue().getNote())) == 0))))) {
            return false
        }
        return true
    }
}