package audioWfc.wfc.hierarchy;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;

import java.util.List;

public record ChordResult(Chord chord, List<OctavedNote> notes) {

}
