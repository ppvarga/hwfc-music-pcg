package audioWfc.constraints.hierarchy;

import audioWfc.HigherValues;
import audioWfc.OctavedNote;
import audioWfc.TileCanvas;
import audioWfc.constraints.CanvasAttributes;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.chords.Chord;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ChordLevelNode {
    private SectionLevelNode parent;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteAttributes;
    private TileCanvas<Chord> canvas;
    private Random random;

    public ChordLevelNode(SectionLevelNode parent, HigherValues higherValues, CanvasAttributes<Chord> chordAttributes, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this.parent = parent;
        this.higherValues = higherValues;
        this.noteAttributes = noteAttributes;
        this.canvas = new TileCanvas<>(
                chordAttributes.size(),
                chordAttributes.options(),
                chordAttributes.constraints(),
                higherValues,
                random);
        this.random = random;
    }

    public List<ChordResult> generate(){
        List<Chord> chords = canvas.generate();
        List<ChordResult> out = new ArrayList<>();
        for(int i = 0; i < chords.size(); i++){
            Chord chord = chords.get(i);
            NoteLevelNode noteNode = new NoteLevelNode(this, higherValues.copyWithChord(chord), noteAttributes, random);
            List<OctavedNote> notes = noteNode.generate();
            out.add(new ChordResult(chord, notes));
        }
        return out;
    }



}

