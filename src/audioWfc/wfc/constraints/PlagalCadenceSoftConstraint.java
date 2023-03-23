package audioWfc.wfc.constraints;

import audioWfc.wfc.constraints.concepts.GenericCadenceSoftConstraint;
import audioWfc.wfc.grabbers.ChordQualityConstantGrabber;
import audioWfc.wfc.grabbers.Grabber;
import audioWfc.wfc.grabbers.IntegerConstantGrabber;
import audioWfc.musicTheory.Key;
import audioWfc.musicTheory.chords.ChordQuality;

public class PlagalCadenceSoftConstraint extends GenericCadenceSoftConstraint {

    public PlagalCadenceSoftConstraint(double factor, Grabber<Key> keyGrabber){
        super(factor, keyGrabber, new IntegerConstantGrabber(5), new ChordQualityConstantGrabber(ChordQuality.MAJOR),
                new IntegerConstantGrabber(0), new ChordQualityConstantGrabber(ChordQuality.MAJOR));
    }

    @Override
    public String name() {
        return "Plagal cadences";
    }

    @Override
    public String configText() {
        return keyGrabber.configText() + ", Bonus: " + factor;
    }
}
