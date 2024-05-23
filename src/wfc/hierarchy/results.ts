import { Chord } from "../../music_theory/Chord"
import { OctavedNote } from "../../music_theory/Note"
import { RhythmPattern } from "../../music_theory/Rhythm"
import { Canvasable } from "../../util/utils"
import { ConflictError } from "../Tile"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { NoteLevelNode } from "./NoteLevelNode"
import { Section } from "./Section"
import { SectionLevelNode } from "./SectionLevelNode"

export type EntireResult = Result<any> & SectionResult[]

export type SectionResult = Result<Section> & ChordResult[]

export type ChordResult = Result<Chordesque> & {
	chord: Chord
	notes: OctavedNote[]
	rhythmPattern: RhythmPattern
	bpm: number
}

export type MelodyResult = Result<OctavedNote> & OctavedNote

export interface Result<T extends Canvasable<T>> {}

export class ResultManager {
	public chordLevelNodes : (ChordLevelNode | undefined)[] = []
	public noteLevelNodes : (NoteLevelNode | undefined)[][] = []
	
	constructor(public sectionLevelNode : SectionLevelNode) {}

	public generate(): EntireResult {
		const sectionResults: Result<Chordesque>[] = []
		for (let i = 0; i < this.chordLevelNodes.length; i++) {
			const chordResults: Result<OctavedNote>[] = []
			for(let j = 0; j < this.noteLevelNodes[i].length; j++) {
				const noteLevelNode = this.noteLevelNodes[i][j]
				if(noteLevelNode === undefined) throw new Error("Node not added")
				chordResults.push(noteLevelNode.mergeResults(noteLevelNode.getCanvas().generate()))
			}
			const chordLevelNode = this.chordLevelNodes[i]
			if(chordLevelNode === undefined) throw new Error("Node not added")
			sectionResults.push(chordLevelNode.mergeResults(chordResults))
		}
		return this.sectionLevelNode.mergeResults(sectionResults) as EntireResult
	}

	public tryAnotherLastNote(): boolean {
		const noteLevelNode = last(this.noteLevelNodes.flat())
		if(noteLevelNode === undefined) return false
		const canvas = noteLevelNode.getCanvas()
		const lastNote = canvas.getValueAtPosition(canvas.getSize() - 1)
		try{
			while(canvas.getValueAtPosition(canvas.getSize() - 1).equals(lastNote)){
				canvas.tryAnother()
			}
			canvas.initialize()
			return true

		} catch (e) {
			if (e instanceof ConflictError) return false
			throw e
		}
	}

	public tryAnotherLastChord(): boolean {
		const chordLevelNode = last(this.chordLevelNodes)
		if(chordLevelNode === undefined) return false
		const canvas = chordLevelNode.getCanvas()
		const lastChord = canvas.getValueAtPosition(canvas.getSize() - 1)
		try {
			while(canvas.getValueAtPosition(canvas.getSize() - 1).equals(lastChord)){
				canvas.tryAnother()
			}
			canvas.initialize()
			return true

		} catch (e) {
			if (e instanceof ConflictError) return false
			throw e
		}
	}

	public tryAnotherLastChordBefore(position: number): boolean {
		if(position == 0) return false
		const chordLevelNode = this.chordLevelNodes[position - 1]
		if(chordLevelNode === undefined) return false
		const canvas = chordLevelNode.getCanvas()
		const lastChord = canvas.getValueAtPosition(canvas.getSize() - 1)
		try {
			while(canvas.getValueAtPosition(canvas.getSize() - 1).equals(lastChord)){
				canvas.tryAnother()
			}
			canvas.initialize()
			return true

		} catch (e) {
			if (e instanceof ConflictError) return false
			throw e
		}
	}

	public tryAnotherLastNoteBefore(chordPosition: number, notePosition: number): boolean {
		let noteLevelNode;
		if(notePosition == 0){
			if(chordPosition == 0) return false
			noteLevelNode = last(this.noteLevelNodes[chordPosition - 1])
		} else {
			noteLevelNode = this.noteLevelNodes[chordPosition][notePosition - 1]
		}
		if(noteLevelNode === undefined) return false
		const canvas = noteLevelNode.getCanvas()
		const lastNote = canvas.getValueAtPosition(canvas.getSize() - 1)
		try{
			while(canvas.getValueAtPosition(canvas.getSize() - 1).equals(lastNote)){
				canvas.tryAnother()
			}
			canvas.initialize()
			return true

		} catch (e) {
			if (e instanceof ConflictError) return false
			throw e
		}
	}
}

function last<T>(xs: T[]): T {
	return xs[xs.length - 1]
}