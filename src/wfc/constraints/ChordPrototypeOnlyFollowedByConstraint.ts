import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { Chordesque, ChordPrototype } from "../hierarchy/prototypes"
import { Grabber } from "../Grabber"
import { HardConstraint } from "./concepts/Constraint"

export class ChordPrototypeOnlyFollowedByConstraint implements HardConstraint<Chordesque> {
	private chordPrototypeName: string
	private grabber: Grabber<string[]>

	name = "Chord Prototype Only Followed By"

	constructor(chordPrototypeName: string, grabber: Grabber<string[]>) {
		this.chordPrototypeName = chordPrototypeName
		this.grabber = grabber
	}

	check(tile: Tile<Chordesque>, higherValues: HigherValues): boolean {
		const chordesque = tile.getValue()
		const prev = tile.getPrev()
		const next = tile.getNext()

		let out = true
		if(prev.isCollapsed()) out = out && this.checkPair(prev.getValue(), chordesque, higherValues)
		if(next.isCollapsed()) out = out && this.checkPair(chordesque, next.getValue(), higherValues)
		return out
	}

	private checkPair(first: Chordesque, second: Chordesque, higherValues: HigherValues): boolean {
		if(!(first instanceof ChordPrototype)) return true
		if(first.getName() !== this.chordPrototypeName) return true
		const chordSet = this.grabber(higherValues)
		return chordSet.some(chordString => chordString === second.getName())
	}
}