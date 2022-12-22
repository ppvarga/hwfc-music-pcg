package audioWfc.constraints;

import audioWfc.NeighborPair;

import java.util.Set;

public abstract class SingleConstraint<T> extends Constraint<T>{
    public abstract Set<T> allowedTiles();
}
