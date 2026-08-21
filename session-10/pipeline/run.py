"""The whole pipeline, one command: fetch -> extract -> research -> decide & store."""
import p1_fetch
import p2_extract
import p3_research
import p4_decide_store

if __name__ == "__main__":
    p1_fetch.main()
    p2_extract.main()
    p3_research.main()
    p4_decide_store.main()
