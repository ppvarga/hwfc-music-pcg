package audioWfc.constraints;

import audioWfc.constraints.grabbers.Grabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.ChordQuality;

public class PlagalCadenceSoftConstraint extends GenericCadenceSoftConstraint{

    public PlagalCadenceSoftConstraint(double factor, Grabber<Key> key){
        super(factor, key.grab(), 5, ChordQuality.MAJOR, 0, ChordQuality.MAJOR);
    }
}
