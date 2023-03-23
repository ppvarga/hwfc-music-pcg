package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;
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

    @Override
    public String configText() {
        return q.toString();
    }
}
