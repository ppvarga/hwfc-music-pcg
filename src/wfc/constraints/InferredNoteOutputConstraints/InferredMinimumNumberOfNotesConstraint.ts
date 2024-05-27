import { NoteOutput } from "../../../components/MidiPlayer";
import { RhythmPattern } from "../../../music_theory/Rhythm";
import { Grabber } from "../../Grabber";
import { MinimumNumberOfNotesHardConstraint } from "../MinimumNumberOfNotesHardConstraint";
import { InferredConstraint } from "../concepts/InferredConstraints";

export class InferredMinimumNumberOfNotesConstraint implements InferredConstraint<RhythmPattern>{
    private grabber: Grabber<NoteOutput>

    constructor(grabber: Grabber<NoteOutput>) {
		this.grabber = grabber
	}
    name = "NumberOfNotes";


    Infer(notes: NoteOutput[]){
        
        return new MinimumNumberOfNotesHardConstraint(notes.length)
    };
    
}