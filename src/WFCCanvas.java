import java.util.*;

public class WFCCanvas<T> {
    private WFC<T> wfc;
    private List<Boolean> isCollapsed;
    private List<List<T>> possibleStatesList;
    private Random random;
    private List<Optional<T>> in;

    public WFCCanvas(WFC<T> wfc, List<Optional<T>> in){
        this.in = in;
        List<Boolean> isCollapsed = new ArrayList<>(in.size());
        List<List<T>> possibleStatesList = new ArrayList<>(in.size());

        this.isCollapsed = isCollapsed;
        this.possibleStatesList = possibleStatesList;
        this.wfc = wfc;
        this.random = wfc.random;

        for (int i = 0; i < in.size(); i++) {
            Optional<T> opt = in.get(i);
            if (opt.isPresent()){
                possibleStatesList.add(List.of(opt.get()));
                isCollapsed.add(true);
            } else {
                List<T> possibleStates = possibleStates(i);

                if(possibleStates.size() == 0) throw new RuntimeException("Invalid input");

                possibleStatesList.add(possibleStates);

                isCollapsed.add(false); //setting it false because other nodes didn't take this into account for possible states
            }
        }

    }

    private List<T> possibleStates(int i){ //TODO generate this from something else but the input
        List<T> allowed = new ArrayList<>(wfc.values);

        //set up constraints based on previous element
        if(i>0 && in.get(i-1).isPresent()){
            T prev = in.get(i-1).get();

            Set<T> allowedByPrev = new HashSet<>();
            for(NeighborPair<T> np : wfc.neighborPairs){
                if(np.getFirst().equals(prev)){
                    allowedByPrev.add(np.getSecond());
                }
            }
            allowed.retainAll(allowedByPrev);
        }

        //set up constraints based on next element
        if(i<in.size()-1 && in.get(i+1).isPresent()){
            T next = in.get(i+1).get();

            Set<T> allowedByNext = new HashSet<>();
            for(NeighborPair<T> np : wfc.neighborPairs){
                if(np.getSecond().equals(next)){
                    allowedByNext.add(np.getFirst());
                }
            }

            allowed.retainAll(allowedByNext);
        }

        return allowed;
    }

    /**
     * A very naive solution for collapsing the next field
     */
    public boolean collapseNext(){
        int indexToCollapse = -1;
        int numOfStates = -1;
        for (int i = 0; i < in.size(); i++){
            if(!isCollapsed.get(i)){
                List<T> possibleStates = possibleStatesList.get(i);
                if(possibleStates.size() < numOfStates || numOfStates == -1){
                    numOfStates = possibleStates.size();
                    indexToCollapse = i;
                }
            }
        }
        if(indexToCollapse == -1) return false;

        List<T> possibleStates = possibleStatesList.get(indexToCollapse);
        int randomIndex = random.nextInt(possibleStates.size());
        T chosenState = possibleStates.get(randomIndex);
        possibleStatesList.set(indexToCollapse, List.of(chosenState));
        isCollapsed.set(indexToCollapse, true);

        if(indexToCollapse > 0 && !isCollapsed.get(indexToCollapse-1)){
            refreshPossibleStates(indexToCollapse-1);
        }
        if(indexToCollapse < in.size() - 1 && !isCollapsed.get(indexToCollapse+1)){
            refreshPossibleStates(indexToCollapse+1);
        }

        return true;
    }

    void refreshPossibleStates(int i){
        List<T> possibleStates = possibleStates(i);
        possibleStatesList.set(i, possibleStates);
    }
    
    public List<T> output(){
        List<T> out = new ArrayList<>(in.size());
        for (int i = 0; i < in.size(); i++) {
            if(isCollapsed.get(i)){
                List<T> possibleStates = possibleStatesList.get(i);
                if (possibleStates.size() != 1) throw new RuntimeException("Wrongly collapsed field with size: " + possibleStates.size());
                out.add(possibleStates.get(0));
            } else {
                out.add(null);
            }
        }
        return out;
    }
}
