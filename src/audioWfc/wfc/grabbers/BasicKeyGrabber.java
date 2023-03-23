package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;
import audioWfc.musicTheory.Key;

public class BasicKeyGrabber implements Grabber<Key>{
    @Override
    public Key grab(HigherValues higherValues) {
        return higherValues.getKey();
    }

    @Override
    public String configText() {
        return "Globally defined key";
    }
}
