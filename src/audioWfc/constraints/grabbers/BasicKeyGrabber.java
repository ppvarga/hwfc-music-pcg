package audioWfc.constraints.grabbers;

import audioWfc.HigherValues;
import audioWfc.musicTheory.Key;

public class BasicKeyGrabber implements Grabber<Key>{
    @Override
    public Key grab(HigherValues higherValues) {
        return higherValues.getKey();
    }
}
