package audioWfc.constraints;

import audioWfc.OctavedNote;
import audioWfc.Tile;
import audioWfc.musicTheory.Key;

import java.util.Set;

public class NoteInOctavesConstraint implements HardConstraint<OctavedNote> {
    private Set<Integer> octaves;

    public NoteInOctavesConstraint(Set<Integer> octaves){
        this.octaves = octaves;
    }

    @Override
    public boolean check(Tile<OctavedNote> item) {
        return octaves.contains(item.getValue().getOctave());
    }
}
