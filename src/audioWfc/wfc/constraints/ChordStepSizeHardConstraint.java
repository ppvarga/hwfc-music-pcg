package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.constraints.concepts.IntegerSetConstraint;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;
import audioWfc.wfc.grabbers.IntegerSetConstantGrabber;
import audioWfc.wfc.hierarchy.prototypes.Chordesque;

import java.util.Set;

public class ChordStepSizeHardConstraint implements HardConstraint<Chordesque>, IntegerSetConstraint {
    private Grabber<Set<Integer>> grabber;

    @Override
    public boolean check(Tile<Chordesque> tile, HigherValues higherValues) {
        return checkWithPrev(tile, higherValues) && checkWithNext(tile, higherValues);
    }

    private boolean checkWithPrev(Tile<Chordesque> tile, HigherValues higherValues) {
        Tile<Chordesque> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;
        Chord chord1 = prev.getValue().getValue();
        Chord chord2 = tile.getValue().getValue();
        return checkConcrete(chord1, chord2, higherValues);
    }

    private boolean checkWithNext(Tile<Chordesque> tile, HigherValues higherValues) {
        Tile<Chordesque> next = tile.getNext();
        if(!next.isCollapsed()) return true;
        Chord chord1 = tile.getValue().getValue();
        Chord chord2 = next.getValue().getValue();
        return checkConcrete(chord1, chord2, higherValues);
    }


    private boolean checkConcrete(Chord chord1, Chord chord2, HigherValues higherValues) {
        int distance = NoteUtils.absoluteDistance(chord1.getRoot(), chord2.getRoot());
        return grabber.grab(higherValues).contains(distance);
    }

    public ChordStepSizeHardConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

    @Override
    public String name() {
        return "Distances between adjacent chords";
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
