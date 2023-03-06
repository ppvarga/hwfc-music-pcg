package audioWfc.wfc.grabbers;

import audioWfc.wfc.HigherValues;

public interface Grabber<T> {
    public T grab(HigherValues higherValues);
}
