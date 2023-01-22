package audioWfc.constraints;

import audioWfc.Tile;

public interface SoftConstraint<T> extends Constraint<T>{
    double weight(Tile<T> item);
}
