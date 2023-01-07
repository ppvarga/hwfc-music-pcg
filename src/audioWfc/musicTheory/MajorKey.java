package audioWfc.musicTheory;

import audioWfc.musicTheory.chords.ChordQuality;

import java.util.List;
import java.util.Set;

import static audioWfc.musicTheory.chords.ChordQuality.DIMINISHED;
import static audioWfc.musicTheory.chords.ChordQuality.MAJOR;
import static audioWfc.musicTheory.chords.ChordQuality.MINOR;
import static audioWfc.musicTheory.chords.ChordQuality.NULL;

public class MajorKey extends Key {
    @Override
    public Set<Integer> noteValues()
    {
        return Set.of(0,2,4,5,7,9,11);
    }

    @Override
    public List<ChordQuality> basicChordQualities() {
        return List.of(MAJOR, NULL, MINOR, NULL, MINOR, MAJOR, NULL, MAJOR, NULL, MINOR, NULL, NULL);
    }

    public MajorKey(Note root){
        super(root);
    }
}
