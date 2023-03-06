package audioWfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.constraints.concepts.HardConstraint;
import audioWfc.constraints.concepts.MelodyShape;
import audioWfc.constraints.concepts.MelodyStep;
import audioWfc.wfc.grabbers.Grabber;

public class MelodyShapeHardConstraint implements HardConstraint<OctavedNote> {
    private Grabber<MelodyShape> grabber;

    public MelodyShapeHardConstraint(Grabber<MelodyShape> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> tile, HigherValues higherValues) {
        return checkWithPrev(tile, higherValues) && checkWithNext(tile, higherValues);
    }

    private boolean checkWithPrev(Tile<OctavedNote> tile, HigherValues higherValues) {
        Tile<OctavedNote> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;

        OctavedNote note1 = tile.getPrev().getValue();
        OctavedNote note2 = tile.getValue();

        return checkConcrete(prev.getPosition(), note1, note2, higherValues);
    }

    private boolean checkWithNext(Tile<OctavedNote> tile, HigherValues higherValues) {
        if(!tile.getNext().isCollapsed()) return true;

        OctavedNote note1 = tile.getValue();
        OctavedNote note2 = tile.getNext().getValue();

        return checkConcrete(tile.getPosition(), note1, note2, higherValues);
    }

    private boolean checkConcrete(int pos, OctavedNote note1, OctavedNote note2, HigherValues higherValues) {
        if(pos > grabber.grab(higherValues).size()) throw new RuntimeException("Melody shape not long enough");

        MelodyStep step = grabber.grab(higherValues).get(pos);

        int distance = note2.MIDIValue() - note1.MIDIValue();

        switch (step){
            case ASCEND -> {return distance > 0;}
            case DESCEND -> {return distance < 0;}
            case STAGNATE -> {return distance == 0;}
            case WILDCARD -> {return true;}
            default -> throw new RuntimeException("Unknown melody step type");
        }
    }

}
