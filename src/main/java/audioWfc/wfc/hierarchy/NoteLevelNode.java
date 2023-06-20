package audioWfc.wfc.hierarchy;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.TileCanvas;
import audioWfc.wfc.CanvasAttributes;

import java.util.List;
import java.util.Random;

public class NoteLevelNode {
    private ChordLevelNode parent;
    private HigherValues higherValues;
    private TileCanvas<OctavedNote> canvas;

    public NoteLevelNode(ChordLevelNode parent, HigherValues higherValues, CanvasAttributes<OctavedNote> noteAttributes, Random random){
        this.parent = parent;
        this.canvas = new TileCanvas<>(
                noteAttributes,
                higherValues,
                random);
    }

    public List<OctavedNote> generate(){
        return canvas.generate();
    }

}

