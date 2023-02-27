package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.constraints.grabbers.Grabber;

import java.util.Set;

public class NoteInOctavesConstraint implements HardConstraint<OctavedNote> {
    private Set<Integer> octaves;

    public NoteInOctavesConstraint(Grabber<Set<Integer>> octaves){
        this.octaves = octaves.grab();
    }

    @Override
    public boolean check(Tile<OctavedNote> item) {
        return octaves.contains(item.getValue().getOctave());
    }
}
