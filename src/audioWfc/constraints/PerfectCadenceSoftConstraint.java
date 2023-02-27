package audioWfc.constraints;

import audioWfc.constraints.grabbers.ChordQualityConstantGrabber;
import audioWfc.constraints.grabbers.Grabber;
import audioWfc.constraints.grabbers.IntegerConstantGrabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.ChordQuality;

public class PerfectCadenceSoftConstraint extends GenericCadenceSoftConstraint{

    public PerfectCadenceSoftConstraint(double factor, Grabber<Key> grabber){
        super(factor, grabber, new IntegerConstantGrabber(7), new ChordQualityConstantGrabber(ChordQuality.MAJOR),
                new IntegerConstantGrabber(0), new ChordQualityConstantGrabber(ChordQuality.MAJOR));
    }


}
