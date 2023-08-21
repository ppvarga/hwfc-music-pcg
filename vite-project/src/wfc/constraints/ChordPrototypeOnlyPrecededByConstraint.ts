import { Chord } from "../../music_theory/Chord"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { Chordesque, ChordPrototype } from "../hierarchy/prototypes"

export class ChordPrototypeOnlyPrecededByConstraint implements HardConstraint<Chordesque> {
	private chordPrototypeName: string
	private grabber: Grabber<Set<Chord>>

	name = "Chord Prototype Only Preceded By"
	configText = () => `Chord Prototype: ${this.chordPrototypeName}, Chord Set: ${this.grabber.configText()}`

	constructor(chordPrototypeName: string, grabber: Grabber<Set<Chord>>) {
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
		if(!(second instanceof ChordPrototype)) return true
		if(second.getName() !== this.chordPrototypeName) return true
		const chordSet = this.grabber.grab(higherValues)
		return chordSet.has(first.getChord())
	}
}