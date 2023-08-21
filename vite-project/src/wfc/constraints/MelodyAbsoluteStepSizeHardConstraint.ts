import { OctavedNote } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { HardConstraint } from "./concepts/Constraint"
import { noteConstraintTypeToName } from "./constraintUtils"

export class MelodyAbsoluteStepSizeHardConstraint implements HardConstraint<OctavedNote> {
	private grabber: Grabber<Set<number>>
	name = noteConstraintTypeToName.get("MelodyAbsoluteStepSizeHardConstraint") as string
	configText = () => `Step Size Set: ${this.grabber.configText()}`
	constructor(grabber: Grabber<Set<number>>) {
		this.grabber = grabber
	}

	check(tile: Tile<OctavedNote>, higherValues: HigherValues): boolean {
		const note = tile.getValue()
		const prev = tile.getPrev()
		const next = tile.getNext()

		let out = true
		if(prev.isCollapsed()) out = out && this.checkPair(prev.getValue(), note, higherValues)
		if(next.isCollapsed()) out = out && this.checkPair(note, next.getValue(), higherValues)
		return out
	}

	private checkPair(first: OctavedNote, second: OctavedNote, higherValues: HigherValues): boolean {
		const stepSizeSet = this.grabber.grab(higherValues)
		const stepSize = OctavedNote.getStepSizeAbs(first, second)
		return stepSizeSet.has(stepSize)
	}
}