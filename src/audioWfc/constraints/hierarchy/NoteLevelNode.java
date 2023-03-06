package audioWfc.constraints.hierarchy;

import audioWfc.HigherValues;
import audioWfc.OctavedNote;
import audioWfc.TileCanvas;
import audioWfc.constraints.CanvasAttributes;
import audioWfc.musicTheory.Note;

import java.util.List;
import java.util.Random;

public class NoteLevelNode {
    private ChordLevelNode parent;
    private HigherValues higherValues;
    private CanvasAttributes<OctavedNote> noteAttributes;
    private TileCanvas<OctavedNote> canvas;

    public NoteLevelNode(ChordLevelNode parent, HigherValues higherValues, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this.parent = parent;
        this.noteAttributes = noteAttributes;
        this.canvas = new TileCanvas<>(
                noteAttributes.size(),
                noteAttributes.options(),
                noteAttributes.constraints(),
                higherValues,
                random);
    }

    public List<OctavedNote> generate(){
        return canvas.generate();
    }

}

