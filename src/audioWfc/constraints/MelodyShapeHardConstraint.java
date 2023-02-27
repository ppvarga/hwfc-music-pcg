package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;

public class MelodyShapeHardConstraint implements HardConstraint<OctavedNote>{
    private MelodyShape melodyShape;
    private Grabber<MelodyShape> grabber;

    public MelodyShapeHardConstraint(Grabber<MelodyShape> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> tile) {
        return checkWithPrev(tile) && checkWithNext(tile);
    }

    private boolean checkWithPrev(Tile<OctavedNote> tile) {
        Tile<OctavedNote> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;

        OctavedNote note1 = tile.getPrev().getValue();
        OctavedNote note2 = tile.getValue();

        return checkConcrete(prev.getPosition(), note1, note2);
    }

    private boolean checkWithNext(Tile<OctavedNote> tile) {
        if(!tile.getNext().isCollapsed()) return true;

        OctavedNote note1 = tile.getValue();
        OctavedNote note2 = tile.getNext().getValue();

        return checkConcrete(tile.getPosition(), note1, note2);
    }

    private boolean checkConcrete(int pos, OctavedNote note1, OctavedNote note2) {
        if(pos > melodyShape.size()) throw new RuntimeException("Melody shape not long enough");

        MelodyStep step = melodyShape.get(pos);

        int distance = note2.MIDIValue() - note1.MIDIValue();

        switch (step){
            case ASCEND -> {return distance > 0;}
            case DESCEND -> {return distance < 0;}
            case STAGNATE -> {return distance == 0;}
            case WILDCARD -> {return true;}
            default -> throw new RuntimeException("Unknown melody step type");
        }
    }

    @Override
    public void init() {
        this.melodyShape = grabber.grab();
    }
}
