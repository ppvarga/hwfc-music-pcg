package audioWfc.constraints;

import audioWfc.Tile;

public interface SoftConstraint<T> extends Constraint<T>{
    public double weight(Tile<T> item);
}
