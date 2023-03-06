package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class ChordStepSizeHardConstraint implements HardConstraint<Chord> {
    private Grabber<Set<Integer>> grabber;

    @Override
    public boolean check(Tile<Chord> tile, HigherValues higherValues) {
        return checkWithPrev(tile, higherValues) && checkWithNext(tile, higherValues);
    }

    private boolean checkWithPrev(Tile<Chord> tile, HigherValues higherValues) {
        Tile<Chord> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;
        Chord chord1 = prev.getValue();
        Chord chord2 = tile.getValue();
        return checkConcrete(chord1, chord2, higherValues);
    }

    private boolean checkWithNext(Tile<Chord> tile, HigherValues higherValues) {
        Tile<Chord> next = tile.getNext();
        if(!next.isCollapsed()) return true;
        Chord chord1 = tile.getValue();
        Chord chord2 = next.getValue();
        return checkConcrete(chord1, chord2, higherValues);
    }


    private boolean checkConcrete(Chord chord1, Chord chord2, HigherValues higherValues) {
        int distance = NoteUtils.absoluteDistance(chord1.getRoot(), chord2.getRoot());
        return grabber.grab(higherValues).contains(distance);
    }

    public ChordStepSizeHardConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

}
