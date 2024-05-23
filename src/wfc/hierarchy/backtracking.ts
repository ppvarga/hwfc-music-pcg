import { OctavedNote } from "../../music_theory/Note";
import { Decision } from "../TileCanvas";
import { Chordesque } from "./Chordesque";
import { Section } from "./Section";

export type SharedDecision = ({
    level : "section";
} & Decision<Section>) | ({
    level : "chord";
    sectionNumber : number;
} & Decision<Chordesque>) | ({
    level : "melody";
    sectionNumber : number;
    chordNumber : number;
} & Decision<OctavedNote>)

export class DecisionManager {
    private sectionDecisions : SharedDecision[] = []
	private chordDecisions : SharedDecision[] = []
	private melodyDecisions : SharedDecision[] = []

    constructor(){}
    
    public getSectionDecisions() {
		return this.sectionDecisions
	}

	public getChordDecisions() {
		return this.chordDecisions
	}

	public getMelodyDecisions() {
		return this.melodyDecisions
	}
}