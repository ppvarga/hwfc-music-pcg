package audioWfc.constraints.hierarchy;

import audioWfc.constraints.ConstraintSet;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class WFCTreeNode<T> {
    private WFCTreeNode<?> parent;
    private List<WFCTreeNode<?>> children;
    private Set<Object> attributes;
    private Set<ConstraintSet<?>> allConstraints;
    private ConstraintSet<T> constraintSet;
    private int size;

    public WFCTreeNode(WFCTreeNode<?> parent, Set<Object> attributes, Set<ConstraintSet<?>> allConstraints, int size){
        this.parent = parent;
        this.attributes = attributes;
        this.allConstraints = allConstraints;
        this.size = size;
        this.children = new ArrayList<>();
    }
}
