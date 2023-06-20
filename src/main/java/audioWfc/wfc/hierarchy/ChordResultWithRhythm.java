package audioWfc.wfc.hierarchy;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.rhythm.RhythmPattern;

import java.util.List;

public record ChordResultWithRhythm(Chord chord, RhythmPattern rhythmPattern, List<OctavedNote> notes) {
}
