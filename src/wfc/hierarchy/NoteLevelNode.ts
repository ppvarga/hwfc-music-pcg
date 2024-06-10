import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvas, TileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { HWFCNode } from "./HWFCNode"

export class NoteLevelNode extends HWFCNode<Chordesque, OctavedNote>{
	protected canvas: TileCanvas<Chordesque, OctavedNote>
	protected subNodes: HWFCNode<OctavedNote, any>[] = []
	private instrument!: number

	constructor(
		canvasProps: TileCanvasProps<OctavedNote>,
		higherValues: HigherValues,
		random: Random,
		protected parent: ChordLevelNode,
		protected position: number,
		instrument?: number
	) {
		super()
		this.canvas = new TileCanvas<Chordesque, OctavedNote>(
			higherValues.melodyLength,
			canvasProps,
			higherValues,
			random,
			this
		)
		if (instrument) this.instrument = instrument
	}

	public generate(): OctavedNote[] {
		return this.canvas.generate()
	}

	public generateOtherInstruments(otherInstruments: NoteLevelNode[]) {
		return this.canvas.generateOtherInstruments(otherInstruments)
	}

	public getCanvas(): TileCanvas<Chordesque, OctavedNote> {
		return this.canvas
	}

	public getInstrument(): number {
		return this.instrument
	}
}
