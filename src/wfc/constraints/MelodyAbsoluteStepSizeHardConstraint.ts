import { OctavedNote } from "../../music_theory/Note"
import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { HardConstraint } from "./concepts/Constraint"
import { noteConstraintTypeToName } from "./constraintUtils"

export const MelodyAbsoluteStepSizeHardConstraintInit = {
	type: "MelodyAbsoluteStepSizeHardConstraint" as const,
	stepSizes: [] as number[],
	validByDefault: false as const,
	reachOver: true
}

export type MelodyAbsoluteStepSizeHardConstraintIR =
	typeof MelodyAbsoluteStepSizeHardConstraintInit

export class MelodyAbsoluteStepSizeHardConstraint
	implements HardConstraint<OctavedNote>
{
	private grabber: Grabber<number[]>
	private reachOver: boolean
	name = noteConstraintTypeToName.get(
		MelodyAbsoluteStepSizeHardConstraintInit.type,
	)!.name as string
	constructor(grabber: Grabber<number[]>, reachOver: boolean) {
		this.grabber = grabber
		this.reachOver = reachOver
	}

	check(tile: Tile<OctavedNote>, higherValues: HigherValues): boolean {
		const note = tile.getValue()
		const prev = tile.getPrev(this.reachOver)
		const next = tile.getNext(this.reachOver)

		let out = true
		if (prev.isCollapsed())
			out = out && this.checkPair(prev.getValue(), note, higherValues)
		if (next.isCollapsed())
			out = out && this.checkPair(note, next.getValue(), higherValues)
		return out
	}

	private checkPair(
		first: OctavedNote,
		second: OctavedNote,
		higherValues: HigherValues,
	): boolean {
		const stepSizeSet = this.grabber(higherValues)
		const stepSize = OctavedNote.getStepSizeAbs(first, second)
		return stepSizeSet.includes(stepSize)
	}
}
