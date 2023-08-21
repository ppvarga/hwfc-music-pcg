import { OctavedNote } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { HardConstraint } from "./concepts/Constraint"
import { noteConstraintTypeToName } from "./constraintUtils"

export class MelodyInRangeHardConstraint implements HardConstraint<OctavedNote> {
	private lowerGrabber: Grabber<OctavedNote>
	private upperGrabber: Grabber<OctavedNote>
	name = noteConstraintTypeToName.get("MelodyInRangeHardConstraint") as string
	configText = () => `Lower: ${this.lowerGrabber.configText()}, Upper: ${this.upperGrabber.configText()}`
	constructor(lowerGrabber: Grabber<OctavedNote>, upperGrabber: Grabber<OctavedNote>) {
		this.lowerGrabber = lowerGrabber
		this.upperGrabber = upperGrabber
	}

	check(tile: Tile<OctavedNote>, higherValues: HigherValues): boolean {
		const note = tile.getValue()
		const lower = this.lowerGrabber.grab(higherValues)
		const upper = this.upperGrabber.grab(higherValues)
		return note.toMIDIValue() >= lower.toMIDIValue() && note.toMIDIValue() <= upper.toMIDIValue()
	}
}