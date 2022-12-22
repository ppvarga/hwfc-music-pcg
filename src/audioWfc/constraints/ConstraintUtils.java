package audioWfc.constraints;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class ConstraintUtils {
    public static <T> Set<T> applyHardConstraint(Set<T> options, HardConstraint<T> constraint){
        Set<T> out = new HashSet<>(options);
        return out.stream().filter(option -> constraint.check(option)).collect(Collectors.toSet());
    }
}
