import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvas, TileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"

export class NoteLevelNode {
	private parent : ChordLevelNode
	private canvas : TileCanvas<OctavedNote>

	constructor(parent : ChordLevelNode, canvasProps: TileCanvasProps<OctavedNote>, higherValues: HigherValues, random: Random) {
		this.parent = parent
		this.canvas = new TileCanvas<OctavedNote>(canvasProps, higherValues, random) 
	}

	public generate() : OctavedNote[] {
		return this.canvas.generate()
	}
}