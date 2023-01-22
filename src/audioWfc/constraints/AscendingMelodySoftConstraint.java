package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

public class AscendingMelodySoftConstraint extends SoftConstraint<Note>{
    public AscendingMelodySoftConstraint(double factor){
        super(factor);
    }

    @Override
    public double weight(Tile<Note> item) {
        Note note = item.getValue();

        Tile<Note> prev = item.getPrev();
        Tile<Note> next = item.getNext();

        double out = 0d;

        if(prev.isCollapsed() && checkAscending(prev.getValue(), note)){
            out += factor;
        }

        if(next.isCollapsed() && checkAscending(note, next.getValue())){
            out += factor;
        }

        return out;
    }

    private boolean checkAscending(Note first, Note second){
        return NoteUtils.distance(first, second) > 0;
    }
}
