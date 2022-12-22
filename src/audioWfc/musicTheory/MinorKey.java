package audioWfc.musicTheory;

import audioWfc.musicTheory.chords.ChordQuality;

import java.util.List;
import java.util.Set;

import static audioWfc.musicTheory.chords.ChordQuality.DIMINISHED;
import static audioWfc.musicTheory.chords.ChordQuality.MAJOR;
import static audioWfc.musicTheory.chords.ChordQuality.MINOR;
import static audioWfc.musicTheory.chords.ChordQuality.NULL;

public class MinorKey extends Key {
    @Override
    public Set<Integer> noteValues()
    {
        return Set.of(0,2,3,5,7,8,10);
    }

    @Override
    public List<ChordQuality> basicChordQualities() {
        return List.of(MINOR, NULL, DIMINISHED, MAJOR, NULL, MINOR, NULL, MINOR, MAJOR, NULL, MAJOR, NULL);
    }

    public MinorKey(Note root){
        super(root);
    }
}
