package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;

import java.util.Set;

public class NoteInOctavesConstraint implements HardConstraint<OctavedNote> {
    private Set<Integer> octaves;
    private Grabber<Set<Integer>> grabber;

    public NoteInOctavesConstraint(Grabber<Set<Integer>> grabber){
        this.grabber = grabber;
    }

    @Override
    public boolean check(Tile<OctavedNote> item) {
        return octaves.contains(item.getValue().getOctave());
    }

    @Override
    public void init() {
        this.octaves = grabber.grab();
    }
}
