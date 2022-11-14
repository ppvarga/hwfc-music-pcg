import java.util.*;

public class WFC<T> {
    Set<NeighborPair<T>> neighborPairs;
    Set<T> values;
    Random random;

    public WFC(){
        this.neighborPairs = new HashSet<>();
        this.values = new HashSet<>();
        this.random = new Random();
    }

    public WFC(List<T> example){
        this();
        Set<NeighborPair<T>> neighborPairs = new HashSet<>();
        for (int i = 0; i < example.size()-1; i++) {
            NeighborPair<T> np = new NeighborPair<>(example.get(i), example.get(i+1));
            neighborPairs.add(np);
        }
        this.setNeighborPairs(neighborPairs);
    }

    public WFC(Set<NeighborPair<T>> neighborPairs){
        this(neighborPairs, new Random());
    }

    public WFC(Set<NeighborPair<T>> neighborPairs, Random random){
        this.neighborPairs = neighborPairs;
        this.values = new HashSet<>();
        for (NeighborPair<T> np : neighborPairs){
            this.values.add(np.getFirst());
            this.values.add(np.getSecond());
        }

        this.random = random;
    }

    public List<T> generate(List<Optional<T>> in){

        WFCCanvas<T> canvas = new WFCCanvas<>(this, in);

        while (canvas.collapseNext());

        return canvas.output();
    }

    /**
     * Collapses the item at the given index in the given list
     * @param in the list
     * @param i the index
     * @return the collapsed item
     */
    private T collapse(List<Optional<T>> in, int i){
        List<T> allowed = new ArrayList<>(this.values);

        //set up constraints based on previous element
        if(i>0 && in.get(i-1).isPresent()){
            T prev = in.get(i-1).get();

            Set<T> allowedByPrev = new HashSet<>();
            for(NeighborPair<T> np : neighborPairs){
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
            for(NeighborPair<T> np : neighborPairs){
                if(np.getSecond().equals(next)){
                    allowedByNext.add(np.getFirst());
                }
            }

            allowed.retainAll(allowedByNext);
        }

        int numOptions = allowed.size();
        if(numOptions == 0){
            throw new RuntimeException("Collapse unsuccessful");
        }
        int randomIndex = random.nextInt(numOptions);
        return allowed.get(randomIndex);
    }

    private PriorityQueue<Integer> queueIndices(List<Optional<T>> in){
        PriorityQueue<Integer> out = new PriorityQueue<>();
        //TODO
        return out;
    }

    public Set<NeighborPair<T>> getNeighborPairs() {
        return neighborPairs;
    }

    public void setNeighborPairs(Set<NeighborPair<T>> neighborPairs) {
        this.neighborPairs = neighborPairs;
        this.values = new HashSet<>();
        for (NeighborPair<T> np : neighborPairs){
            this.values.add(np.getFirst());
            this.values.add(np.getSecond());
        }
    }
}
