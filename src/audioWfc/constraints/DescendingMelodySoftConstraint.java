package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

public class DescendingMelodySoftConstraint extends SoftConstraint<Note>{
    public DescendingMelodySoftConstraint(double factor){
        super(factor);
    }

    @Override
    public double weight(Tile<Note> item) {
        Note note = item.getValue();

        Tile<Note> prev = item.getPrev();
        Tile<Note> next = item.getNext();

        double out = 0d;

        if(prev.isCollapsed() && checkDescending(prev.getValue(), note)){
            out += factor;
        }

        if(next.isCollapsed() && checkDescending(note, next.getValue())){
            out += factor;
        }

        return out;
    }

    private boolean checkDescending(Note first, Note second){
        return NoteUtils.distance(first, second) < 0;
    }
}
