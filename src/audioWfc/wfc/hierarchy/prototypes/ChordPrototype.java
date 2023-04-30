package audioWfc.wfc.hierarchy.prototypes;

import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.ConstraintSet;
import audioWfc.wfc.OptionsPerCell;

import java.awt.*;
import java.util.Set;

public class ChordPrototype implements Chordesque{
    private CanvasAttributes<OctavedNote> noteCanvasAttributes;
    private Chord value;
    private String name;

    public ChordPrototype(String name, Chord value, CanvasAttributes<OctavedNote> noteCanvasAttributes) {
        this.name = name;
        this.value = value;
        this.noteCanvasAttributes = noteCanvasAttributes;
    }

    @Override
    public Chord getValue() {
        return value;
    }

    public CanvasAttributes<OctavedNote> getNoteAttributes() {
        return noteCanvasAttributes;
    }
}
