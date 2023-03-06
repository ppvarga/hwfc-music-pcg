package audioWfc.constraints.grabbers;

import audioWfc.HigherValues;
import audioWfc.musicTheory.chords.ChordQuality;

public class ChordQualityConstantGrabber implements Grabber<ChordQuality>{
    private ChordQuality q;

    public ChordQualityConstantGrabber(ChordQuality q){
        this.q = q;
    }

    @Override
    public ChordQuality grab(HigherValues higherValues) {
        return q;
    }
}
