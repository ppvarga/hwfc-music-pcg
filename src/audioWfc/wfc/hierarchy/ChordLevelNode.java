package audioWfc.wfc.hierarchy;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.TileCanvas;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.hierarchy.prototypes.ChordPrototype;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ChordLevelNode {
    private SectionLevelNode parent;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteAttributes;
    private TileCanvas<Chordesque> canvas;
    private Random random;

    public ChordLevelNode(SectionLevelNode parent, HigherValues higherValues, CanvasAttributes<Chordesque> chordAttributes, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this.parent = parent;
        this.higherValues = higherValues;
        this.noteAttributes = noteAttributes;
        this.canvas = new TileCanvas<>(
                chordAttributes.getSize(),
                chordAttributes.getOptions(),
                chordAttributes.getConstraints(),
                higherValues,
                random);
        this.random = random;
    }

    public List<ChordResult> generate(){
        List<Chordesque> chords = canvas.generate();
        List<ChordResult> out = new ArrayList<>();
        for (Chordesque chord : chords) {
            CanvasAttributes<OctavedNote> actualNoteAttributes = noteAttributes;
            if (chord instanceof ChordPrototype proto) {
                actualNoteAttributes = noteAttributes.union(proto.getNoteAttributes());
            }
            NoteLevelNode noteNode = new NoteLevelNode(this, higherValues.copyWithChord(chord.getValue()), actualNoteAttributes, random);
            List<OctavedNote> notes = noteNode.generate();
            out.add(new ChordResult(chord.getValue(), notes));
        }
        return out;
    }

}

