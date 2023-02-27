package audioWfc;

import audioWfc.constraints.Constraint;
import audioWfc.constraints.ConstraintSet;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class HierarchyLevel<T> {
    private int size;
    private Map<Class<?>, Object> higherLevels;
    Map<Class<?>, ConstraintSet<?>> allConstraints;

    public HierarchyLevel(int size, Map<Class<?>, Object> higherLevels, Map<Class<?>, ConstraintSet<?>> allConstraints) {
        this.size = size;
        this.higherLevels = higherLevels;
        this.allConstraints = allConstraints;
    }

    public void create(){
        ConstraintSet<T> constraintSet = (ConstraintSet<T>) allConstraints.get(T.class);
    }
}
