package audioWfc.constraints;

import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.ChordQuality;

public class PerfectCadenceSoftConstraint extends GenericCadenceSoftConstraint{

    public PerfectCadenceSoftConstraint(double factor, Key key){
        super(factor, key, 7, ChordQuality.MAJOR, 0, ChordQuality.MAJOR);
    }
}
