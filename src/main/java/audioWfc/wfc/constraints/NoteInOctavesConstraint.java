package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.constraints.concepts.IntegerSetConstraint;
import audioWfc.wfc.grabbers.Grabber;

import java.util.Set;

import static audioWfc.wfc.constraints.ConstraintUtils.MELODY_IN_OCTAVES;

public class NoteInOctavesConstraint implements HardConstraint<OctavedNote>, IntegerSetConstraint {
    private Grabber<Set<Integer>> grabber;

    public NoteInOctavesConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> item, HigherValues higherValues) {
        return grabber.grab(higherValues).contains(item.getValue().getOctave());
    }

    @Override
    public String name() {
        return MELODY_IN_OCTAVES;
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
