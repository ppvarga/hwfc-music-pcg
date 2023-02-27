package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

public class AscendingMelodySoftConstraint extends SoftConstraint<OctavedNote>{
    public AscendingMelodySoftConstraint(double factor){
        super(factor);
    }

    @Override
    public double weight(Tile<OctavedNote> item) {
        OctavedNote note = item.getValue();

        Tile<OctavedNote> prev = item.getPrev();
        Tile<OctavedNote> next = item.getNext();

        double out = 0d;

        if(prev.isCollapsed() && checkAscending(prev.getValue(), note)){
            out += factor;
        }

        if(next.isCollapsed() && checkAscending(note, next.getValue())){
            out += factor;
        }

        return out;
    }

    private boolean checkAscending(OctavedNote first, OctavedNote second){
        return second.MIDIValue() > first.MIDIValue();
    }

    @Override
    public void init() {}
}
