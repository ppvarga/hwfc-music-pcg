package audioWfc.audio;

import audioWfc.musicTheory.OctavedNote;

public class PlayableNote{
    OctavedNote pitch;
    int start;
    int end;
    int velocity;

    public PlayableNote(OctavedNote pitch, int start, int end, int velocity) {
        this.pitch = pitch;
        this.start = start;
        this.end = end;
        this.velocity = velocity;
    }
}
