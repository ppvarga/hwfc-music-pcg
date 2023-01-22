package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

import java.util.Set;

public class MelodyShapeHardConstraint implements HardConstraint<Note>{
    private MelodyShape melodyShape;

    public MelodyShapeHardConstraint(MelodyShape melodyShape){
        this.melodyShape = melodyShape;
    }

    @Override
    public boolean check(Tile<Note> tile) {
        return checkWithPrev(tile) && checkWithNext(tile);
    }

    private boolean checkWithPrev(Tile<Note> tile) {
        Tile<Note> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;

        Note note1 = tile.getPrev().getValue();
        Note note2 = tile.getValue();

        return checkConcrete(prev.getPosition(), note1, note2);
    }

    private boolean checkWithNext(Tile<Note> tile) {
        if(!tile.getNext().isCollapsed()) return true;

        Note note1 = tile.getValue();
        Note note2 = tile.getNext().getValue();

        return checkConcrete(tile.getPosition(), note1, note2);
    }

    private boolean checkConcrete(int pos, Note note1, Note note2) {
        if(pos > melodyShape.size()) throw new RuntimeException("Melody shape not long enough");

        MelodyStep step = melodyShape.get(pos);

        int distance = NoteUtils.distance(note1, note2);

        switch (step){
            case ASCEND -> {return distance > 0;}
            case DESCEND -> {return distance < 0;}
            case STAGNATE -> {return distance == 0;}
            case WILDCARD -> {return true;}
            default -> throw new RuntimeException("Unknown melody step type");
        }
    }
}
