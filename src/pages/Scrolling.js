import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const items = Array.from({ length: 10000 }, (_, index) => ({
  id: Math.random().toString(36).slice(2),
  text: String(index),
}));

const itemHeight = 40;
const containerHeight = 600;
const overscan = 3;
const scrollongDelay = 100;

export default function Scrolling() {
  const [listItems, setListItems] = useState(items);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef(null);

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) {
      return;
    }
    let timeOutId = null;
    const handleScroll = () => {
      setIsScrolling(true);

      if (typeof timeOutId === "number") {
        clearTimeout(timeOutId);
      }
      timeOutId = setTimeout(() => {
        setIsScrolling(false);
      }, scrollongDelay);
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      if (typeof timeOutId === "number") {
        clearTimeout(timeOutId);
      }
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) {
      return;
    }
    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;
      setScrollTop(scrollTop);
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);
  console.log(isScrolling, "isScrolling");

  const virtualItems = useMemo(() => {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + containerHeight;

    let startIndex = Math.floor(rangeStart / itemHeight);
    let endIndex = Math.ceil(rangeEnd / itemHeight);

    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(listItems.length - 1, endIndex + overscan);

    const virtualItems = [];

    for (let index = startIndex; index <= endIndex; index++) {
      virtualItems.push({
        index,
        offsetTop: index * itemHeight,
      });
    }
    return virtualItems;
  }, [scrollTop]);

  // const itemsToRender = listItems.slice(startIndex, endIndex + 1);
  const totalListHeight = itemHeight * listItems.length;

  return (
    <div style={{ padding: "0 12px" }}>
      <h1>List</h1>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setListItems((items) => items.slice().reverse())}
        >
          reverse
        </button>
      </div>
      <div
        ref={scrollElementRef}
        style={{
          height: containerHeight,
          overflow: "auto",
          border: "1px solid lightgrey",
          position: "relative",
        }}
      >
        <div style={{ height: totalListHeight }}>
          {virtualItems.map((virtualItem) => {
            const item = listItems[virtualItem.index];
            return (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  transform: `translateY(${virtualItem.offsetTop}px)`,
                  height: itemHeight,
                  padding: "6px 12px",
                }}
                key={item.id}
              >
                {isScrolling ? "scrolling ... " : item.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
