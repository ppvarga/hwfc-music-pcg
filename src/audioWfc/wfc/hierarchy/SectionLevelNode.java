package audioWfc.wfc.hierarchy;

import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.CanvasAttributes;
import audioWfc.wfc.HigherValues;
import audioWfc.wfc.TileCanvas;
import audioWfc.wfc.hierarchy.prototypes.ChordPrototype;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;
import audioWfc.wfc.hierarchy.prototypes.Section;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class SectionLevelNode {
    private HigherValues higherValues;
    private CanvasAttributes<Chordesque> chordAttributes;
    private CanvasAttributes<OctavedNote> noteAttributes;
    private TileCanvas<Section> canvas;
    private Random random;

    public SectionLevelNode(HigherValues higherValues, CanvasAttributes<Section> sectionAttributes, CanvasAttributes<Chordesque> chordAttributes, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this.higherValues = higherValues;
        this.chordAttributes = chordAttributes;
        this.noteAttributes = noteAttributes;
        this.canvas = new TileCanvas<>(
                sectionAttributes.getSize(),
                sectionAttributes.getOptions(),
                sectionAttributes.getConstraints(),
                higherValues,
                random);
        this.random = random;
    }

    public List<SectionResult> generate(){
        List<Section> sections = canvas.generate();
        List<SectionResult> out = new ArrayList<>();
        for (Section section : sections) {
            ChordLevelNode chordLevelNode = new ChordLevelNode(this, higherValues.copyWithSection(section), chordAttributes.union(section.getChordAttributes()), noteAttributes.union(section.getNoteAttributes()), random);
            List<ChordResult> chords = chordLevelNode.generate();
            out.add(new SectionResult(chords));
        }
        return out;
    }
}

