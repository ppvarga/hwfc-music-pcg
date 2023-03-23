package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.constraints.concepts.MelodyShape;

public class BasicMelodyShapeGrabber implements Grabber<MelodyShape>{
    private MelodyShape melodyShape;

    public BasicMelodyShapeGrabber(MelodyShape melodyShape){
        this.melodyShape = melodyShape;
    }

    @Override
    public MelodyShape grab(HigherValues higherValues) {
        return melodyShape;
    }

    @Override
    public String configText() {
        return melodyShape.toString();
    }
}
