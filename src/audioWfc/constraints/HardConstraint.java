package audioWfc.constraints;

import audioWfc.Tile;

public interface HardConstraint<T> extends Constraint<T>{
    public abstract boolean check(Tile<T> tile);
}
