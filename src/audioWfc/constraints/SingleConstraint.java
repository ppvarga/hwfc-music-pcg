package audioWfc.constraints;

import java.util.Set;

public interface SingleConstraint<T> extends Constraint<T>{
    public abstract Set<T> allowedTiles();
}
