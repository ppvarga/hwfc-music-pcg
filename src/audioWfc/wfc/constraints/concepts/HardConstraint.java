package audioWfc.wfc.constraints.concepts;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;

public interface HardConstraint<T> extends Constraint<T> {
    public abstract boolean check(Tile<T> tile, HigherValues higherValues);
}
