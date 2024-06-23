import { MusicalKey } from "../../music_theory/MusicalKey"
import { Note, OctavedNote } from "../../music_theory/Note"
import { Grabber, NoteGrabberIR } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { HardConstraint } from "./concepts/Constraint"
import { noteConstraintTypeToName } from "./constraintUtils"

export const DescendingMelodyHardConstraintInit = {
	type: "DescendingMelodyHardConstraint" as const,
	noteGrabber: "MelodyGrabber" as NoteGrabberIR,
	validByDefault: true as const,
}

export type DescendingMelodyHardConstraintIR =
	typeof DescendingMelodyHardConstraintInit
export class DescendingMelodyHardConstraint implements HardConstraint<OctavedNote> {
	name = noteConstraintTypeToName.get(
		DescendingMelodyHardConstraintInit.type,
	)!.name as string
    private grabber: Grabber<Note>
	constructor(grabber: Grabber<Note>) {
		this.grabber = grabber
	}
    check (tile: Tile<OctavedNote>, higherValues: HigherValues): boolean {
        const note = tile.getValue()
		const prev = tile.getPrev()
		const next = tile.getNext()

        let res = true;

		if (prev.isCollapsed() && this.isAscending(prev.getValue(), note))
			res = false
		if (next.isCollapsed() && this.isAscending(note, next.getValue()))
			res = false

		return res
    }

	private isAscending(first: OctavedNote, second: OctavedNote): boolean {
		return first.toMIDIValue() < second.toMIDIValue()
	}
	private isDescending(first: OctavedNote, second: OctavedNote): boolean {
		return first.toMIDIValue() > second.toMIDIValue()
	}
}
