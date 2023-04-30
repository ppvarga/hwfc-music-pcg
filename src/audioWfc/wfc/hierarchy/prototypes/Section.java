package audioWfc.wfc.hierarchy.prototypes;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.OptionsPerCell;

public class Section {
    private OptionsPerCell<OctavedNote> noteOptionsPerCell;
    private ConstraintSet<OctavedNote> noteConstraintSet;
    private OptionsPerCell<Chord> chordOptionsPerCell;
    private ConstraintSet<Chord> chordConstraintSet;
    private String name;

    public Section(String name,
                   OptionsPerCell<OctavedNote> noteOptionsPerCell,
                   ConstraintSet<OctavedNote> noteConstraintSet,
                   OptionsPerCell<Chord> chordOptionsPerCell,
                   ConstraintSet<Chord> chordConstraintSet) {
        this.name = name;
        this.noteOptionsPerCell = noteOptionsPerCell;
        this.noteConstraintSet = noteConstraintSet;
        this.chordOptionsPerCell = chordOptionsPerCell;
        this.chordConstraintSet = chordConstraintSet;
    }
}
