package audioWfc.constraints;

import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.NoteUtils;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class ChordStepSizeHardConstraint implements HardConstraint<Chord> {
    private Grabber<Set<Integer>> grabber;
    private Set<Integer> allowedStepSizes;

    @Override
    public boolean check(Tile<Chord> tile) {
        return checkWithPrev(tile) && checkWithNext(tile);
    }

    private boolean checkWithPrev(Tile<Chord> tile) {
        Tile<Chord> prev = tile.getPrev();
        if(!prev.isCollapsed()) return true;
        Chord chord1 = prev.getValue();
        Chord chord2 = tile.getValue();
        return checkConcrete(chord1, chord2);
    }

    private boolean checkWithNext(Tile<Chord> tile) {
        Tile<Chord> next = tile.getNext();
        if(!next.isCollapsed()) return true;
        Chord chord1 = tile.getValue();
        Chord chord2 = next.getValue();
        return checkConcrete(chord1, chord2);
    }


    private boolean checkConcrete(Chord chord1, Chord chord2) {
        int distance = NoteUtils.absoluteDistance(chord1.getRoot(), chord2.getRoot());
        return allowedStepSizes.contains(distance);
    }

    public ChordStepSizeHardConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

    @Override
    public void init() {
        this.allowedStepSizes = grabber.grab();
    }
}
