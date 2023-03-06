package audioWfc.constraints.hierarchy;

import audioWfc.OctavedNote;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.chords.Chord;

import java.util.List;

public record ChordResult(Chord chord, List<OctavedNote> notes) {

}
