package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.OctavedNote;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.grabbers.Grabber;

import java.util.Set;

public class MelodyAbsoluteStepSizeHardConstraint implements HardConstraint<OctavedNote> {
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
        return "Melody step sizes";
    }

    @Override
    public String configText() {
        return grabber.configText();
    }
}
