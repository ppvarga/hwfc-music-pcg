package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.SoftConstraint;

import static audioWfc.wfc.constraints.ConstraintUtils.ASCENDING_MELODY;

public class AscendingMelodySoftConstraint extends SoftConstraint<OctavedNote> {
    public AscendingMelodySoftConstraint(double factor){
        super(factor);
    }

    @Override
    public double weight(Tile<OctavedNote> item, HigherValues higherValues) {
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
    public String name() {
        return ASCENDING_MELODY;
    }

    @Override
    public String configText() {
        return "Bonus: " + factor;
    }
}
