package audioWfc.wfc;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class OptionsPerCell<T> {
    private Map<Integer, Set<T>> cells;
    private Set<T> allOptions;
    private int size;

    public OptionsPerCell(Set<T> allOptions){
        this.cells = new HashMap<>();
        this.allOptions = allOptions;
    }

    public void setOptions(int pos, Set<T> options){
        cells.put(pos, options);
    }

    public void setValue(int pos, T value){
        cells.put(pos, Set.of(value));
    }

    public Set<T> get(int pos){
        if(!cells.containsKey(pos)) return allOptions;
        return cells.get(pos);
    }

    public Set<T> getAllOptions() {
        return allOptions;
    }
}
