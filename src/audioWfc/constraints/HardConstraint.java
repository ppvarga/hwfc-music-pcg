package audioWfc.constraints;

import audioWfc.HigherValues;
import audioWfc.Tile;

public interface HardConstraint<T> extends Constraint<T>{
    public abstract boolean check(Tile<T> tile, HigherValues higherValues);
}
