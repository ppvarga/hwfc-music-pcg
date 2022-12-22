package audioWfc.constraints;

import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.Note;
import audioWfc.musicTheory.chords.Chord;

import java.util.Set;

public class ChordsInKeyConstraint implements SingleConstraint<Chord>{
    private Key key;

    public ChordsInKeyConstraint(Key key){
        this.key = key;
    }

    @Override
    public Set<Chord> allowedTiles() {
        return key.getBasicChords();
    }
}
