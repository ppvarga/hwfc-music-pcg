package audioWfc.wfc;

import java.util.HashMap;
import java.util.HashSet;
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

    public void reset(){
        this.cells = new HashMap<>();
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

    public OptionsPerCell<T> union(OptionsPerCell<T> other){
        Set<T> newAllOptions = new HashSet<>();
        newAllOptions.addAll(this.allOptions);
        newAllOptions.addAll(other.allOptions);
        OptionsPerCell<T> out = new OptionsPerCell<>(newAllOptions);

        for(Map.Entry<Integer, Set<T>> entry : this.cells.entrySet()){
            out.setOptions(entry.getKey(), entry.getValue());
        }

        for(Map.Entry<Integer, Set<T>> entry : other.cells.entrySet()){
            out.setOptions(entry.getKey(), entry.getValue());
        }

        return out;
    }
}
