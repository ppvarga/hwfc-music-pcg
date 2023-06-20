package audioWfc.wfc.constraints;

import audioWfc.wfc.HigherValues;
import audioWfc.wfc.Tile;
import audioWfc.wfc.constraints.concepts.HardConstraint;
import audioWfc.wfc.hierarchy.prototypes.Section;

import java.util.Set;

public class SectionOnlyFollowedByConstraint implements HardConstraint<Section> {
    private String sectionName;
    private Set<String> followingSections;

    public SectionOnlyFollowedByConstraint(String sectionName, Set<String> followingSections) {
        this.sectionName = sectionName;
        this.followingSections = followingSections;
    }

    @Override
    public String name() {
        return "Section is followed by";
    }

    @Override
    public String configText() {
        return null;
    }

    @Override
    public boolean check(Tile<Section> tile, HigherValues higherValues) {
        Section section = tile.getValue();
        boolean out = true;

        Tile<Section> prevTile = tile.getPrev();
        if(prevTile.isCollapsed()){
            out &= check(prevTile.getValue(), section);
        }

        Tile<Section> nextTile = tile.getNext();
        if(prevTile.isCollapsed()){
            out &= check(section, nextTile.getValue());
        }

        return out;
    }

    private boolean check(Section a, Section b){
        if(!a.getName().equals(sectionName)) return true;
        return followingSections.contains(b.getName());
    }
}
