package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.NoteUtils;

public class DescendingMelodySoftConstraint extends SoftConstraint<OctavedNote>{
    public DescendingMelodySoftConstraint(double factor){
        super(factor);
    }

    @Override
    public double weight(Tile<OctavedNote> item) {
        OctavedNote note = item.getValue();

        Tile<OctavedNote> prev = item.getPrev();
        Tile<OctavedNote> next = item.getNext();

        double out = 0d;

        if(prev.isCollapsed() && checkDescending(prev.getValue(), note)){
            out += factor;
        }

        if(next.isCollapsed() && checkDescending(note, next.getValue())){
            out += factor;
        }

        return out;
    }

    private boolean checkDescending(OctavedNote first, OctavedNote second){
        return first.MIDIValue() > second.MIDIValue();
    }

    @Override
    public void init() {

    }
}
