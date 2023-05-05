package audioWfc.wfc.hierarchy.prototypes;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.OptionsPerCell;

public class Section {
    private CanvasAttributes<Chordesque> chordAttributes;
    private CanvasAttributes<OctavedNote> noteAttributes;
    private String name;

    public Section(CanvasAttributes<Chordesque> chordAttributes, CanvasAttributes<OctavedNote> noteAttributes, String name) {
        this.chordAttributes = chordAttributes;
        this.noteAttributes = noteAttributes;
        this.name = name;
    }

    public CanvasAttributes<Chordesque> getChordAttributes() {
        return chordAttributes;
    }

    public CanvasAttributes<OctavedNote> getNoteAttributes() {
        return noteAttributes;
    }

    public String getName() {
        return name;
    }
}
