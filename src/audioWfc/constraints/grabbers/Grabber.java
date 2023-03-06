package audioWfc.constraints.grabbers;

import audioWfc.HigherValues;

public interface Grabber<T> {
    public T grab(HigherValues higherValues);
}
