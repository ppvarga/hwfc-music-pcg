package audioWfc.constraints;

import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.ChordQuality;

public class PlagalCadenceSoftConstraint extends GenericCadenceSoftConstraint{

    public PlagalCadenceSoftConstraint(double factor, Key key){
        super(factor, key, 5, ChordQuality.MAJOR, 0, ChordQuality.MAJOR);
    }
}
