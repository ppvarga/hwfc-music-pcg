package audioWfc.wfc.hierarchy;

import audioWfc.musicTheory.chords.Chord;
import audioWfc.musicTheory.rhythm.RhythmPattern;
import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.TileCanvas;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.hierarchy.prototypes.ChordPrototype;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ChordLevelNode {
    private SectionLevelNode parent;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteAttributes;
    private TileCanvas<Chordesque> chordesqueTileCanvas;
    private TileCanvas<RhythmPattern> rhythmPatternCanvas;

    private Random random;

    public ChordLevelNode(SectionLevelNode parent, HigherValues higherValues, CanvasAttributes<Chordesque> chordAttributes, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this.parent = parent;
        this.higherValues = higherValues;
        this.noteAttributes = noteAttributes;
        this.chordesqueTileCanvas = new TileCanvas<>(
                chordAttributes,
                higherValues,
                random);
        this.random = random;
    }

    public ChordLevelNode(SectionLevelNode parent, HigherValues higherValues, CanvasAttributes<Chordesque> chordAttributes, CanvasAttributes<RhythmPattern> rhythmAttributes, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this(parent, higherValues, chordAttributes, noteAttributes, random);
        this.rhythmPatternCanvas = new TileCanvas<RhythmPattern>(
                rhythmAttributes,
                higherValues,
                random
        );
    }

    public List<ChordResult> generateWithoutRhythm(){
        List<Chordesque> chords = chordesqueTileCanvas.generate();
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

    public List<ChordResultWithRhythm> generateWithRhythm(){
        List<Chordesque> chords = chordesqueTileCanvas.generate();
        List<RhythmPattern> rhythmPatterns = rhythmPatternCanvas.generate();
        List<ChordResultWithRhythm> out = new ArrayList<>();

        for (int i = 0; i < chords.size(); i++) {
            Chordesque chord = chords.get(i);
            RhythmPattern rhythmPattern = rhythmPatterns.get(i);

            CanvasAttributes<OctavedNote> actualNoteAttributes = noteAttributes;
            if (chord instanceof ChordPrototype proto) {
                actualNoteAttributes = noteAttributes.union(proto.getNoteAttributes());
            }
            actualNoteAttributes.setSize(rhythmPattern.numberOfNotes());
            NoteLevelNode noteNode = new NoteLevelNode(this, higherValues.copyWithChord(chord.getValue()).copyWithRhythmPattern(rhythmPattern), actualNoteAttributes, random);
            List<OctavedNote> notes = noteNode.generate();
            out.add(new ChordResultWithRhythm(chord.getValue(), rhythmPattern, notes));
        }
        return out;
    }

}

