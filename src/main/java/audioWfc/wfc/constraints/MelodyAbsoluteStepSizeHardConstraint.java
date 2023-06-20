package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.constraints.concepts.IntegerSetConstraint;
import audioWfc.wfc.grabbers.Grabber;

import java.util.Set;

import static audioWfc.wfc.constraints.ConstraintUtils.MELODY_STEP_SIZES;

public class MelodyAbsoluteStepSizeHardConstraint implements HardConstraint<OctavedNote>, IntegerSetConstraint {
    private Grabber<Set<Integer>> grabber;

    @Override
    public boolean check(Tile<OctavedNote> tile, HigherValues higherValues) {
        return checkWithPrev(tile, higherValues) && checkWithNext(tile, higherValues);
    }

    private boolean checkWithPrev(Tile<OctavedNote> tile, HigherValues higherValues) {
        Tile<OctavedNote> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;
        OctavedNote note1 = prev.getValue();
        OctavedNote note2 = tile.getValue();
        return checkConcrete(note1, note2, higherValues);
    }

    private boolean checkWithNext(Tile<OctavedNote> tile, HigherValues higherValues) {
        Tile<OctavedNote> next = tile.getNext();
        if(!next.isCollapsed()) return true;
        OctavedNote note1 = tile.getValue();
        OctavedNote note2 = next.getValue();
        return checkConcrete(note1, note2, higherValues);
    }


    private boolean checkConcrete(OctavedNote note1, OctavedNote note2, HigherValues higherValues) {
        int distance = Math.abs(note2.MIDIValue() - note1.MIDIValue());
        return grabber.grab(higherValues).contains(distance);
    }

    public MelodyAbsoluteStepSizeHardConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

    @Override
    public String name() {
        return MELODY_STEP_SIZES;
    }

    @Override
    public String configText() {
        return grabber.configText();
    }

    @Override
    public String integerSetString(HigherValues higherValues) {
        return grabber.grab(higherValues).stream().sorted().map(x -> x.toString()).reduce((x, y) -> x + " " + y).orElseGet(() -> "");
    }
}
