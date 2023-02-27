package audioWfc.constraints;

import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.ChordQuality;

public class PerfectCadenceSoftConstraint extends GenericCadenceSoftConstraint{

    public PerfectCadenceSoftConstraint(double factor, Grabber<Key> key){
        super(factor, key.grab(), 7, ChordQuality.MAJOR, 0, ChordQuality.MAJOR);
    }
}
