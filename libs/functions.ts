import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

export interface HorizontalLoopConfig {
  repeat?: number;
  paused?: boolean;
  speed?: number;
  draggable?: boolean;
  center?: boolean | HTMLElement | string;
  snap?: boolean | number;
  paddingRight?: number;
  reversed?: boolean;
  onChange?: (item: HTMLElement, index: number) => void;
}

export interface HorizontalLoop extends gsap.core.Timeline {
  next: (vars?: gsap.TweenVars) => gsap.core.Tween;
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween;
  current: () => number;
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
  times: number[];
  getCurrentIndex?: () => number;
  draggable?: Draggable;
}

export function horizontalLoop(
  items: HTMLElement[] | NodeListOf<HTMLElement> | string,
  config: HorizontalLoopConfig = {}
): HorizontalLoop {
  const elements: HTMLElement[] = gsap.utils.toArray(items) as HTMLElement[];
  let timeline: HorizontalLoop;

  const cleanup = gsap.context(() => {
    const {
      repeat,
      paused,
      speed = 1.2,
      draggable = false,
      center = false,
      snap = 1,
      paddingRight = 0,
      reversed = false,
      onChange,
    } = config;

    let curIndex = 0;
    let indexIsDirty = false;
    let lastIndex = 0;
    let proxy: HTMLDivElement | null = null;

    const tl = gsap.timeline({
      repeat,
      paused,
      defaults: { ease: "none" },
      onUpdate: onChange
        ? () => {
            const i = tl.closestIndex?.();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(elements[i], i);
            }
          }
        : undefined,
      onReverseComplete: () => {
        tl.totalTime(tl.rawTime() + tl.duration() * 100);
      },
    }) as HorizontalLoop;

    const length = elements.length;
    const times: number[] = [];
    const widths: number[] = [];
    const spaceBefore: number[] = [];
    const xPercents: number[] = [];

    let totalWidth = 0;
    const startX = elements[0].offsetLeft;

    const container =
      center === true
        ? (elements[0].parentNode as HTMLElement)
        : typeof center === "string"
        ? (document.querySelector(center) as HTMLElement)
        : (center as HTMLElement) || (elements[0].parentNode as HTMLElement);

    const getTotalWidth = () =>
      elements[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      spaceBefore[0] +
      elements[length - 1].offsetWidth *
        Number(gsap.getProperty(elements[length - 1], "scaleX")) +
      paddingRight;

    const snapFunc =
      snap === false
        ? (v: number) => v
        : gsap.utils.snap(snap === true ? 1 : snap);

    const pixelsPerSecond = speed * 100;
    let timeOffset = 0;
    let timeWrap: (n: number) => number = gsap.utils.wrap(0, 1);

    function populateWidths() {
      let b1 = container.getBoundingClientRect(),
        b2;
      elements.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
        xPercents[i] = snapFunc(
          (parseFloat(gsap.getProperty(el, "x", "px") as string) / widths[i]) *
            100 +
            (gsap.getProperty(el, "xPercent") as number)
        );
        b2 = el.getBoundingClientRect();
        spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
        b1 = b2;
      });
      gsap.set(elements, { xPercent: (i: number) => xPercents[i] });
      totalWidth = getTotalWidth();
    }

    function populateTimeline() {
      tl.clear();
      for (let i = 0; i < length; i++) {
        const item = elements[i];
        const curX = (xPercents[i] / 100) * widths[i];
        const distanceToStart =
          item.offsetLeft + curX - startX + spaceBefore[0];
        const distanceToLoop =
          distanceToStart +
          widths[i] * (gsap.getProperty(item, "scaleX") as number);
        tl.to(
          item,
          {
            xPercent: snapFunc(((curX - distanceToLoop) / widths[i]) * 100),
            duration: distanceToLoop / pixelsPerSecond,
          },
          0
        )
          .fromTo(
            item,
            {
              xPercent: snapFunc(
                ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
              ),
            },
            {
              xPercent: xPercents[i],
              duration:
                (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond
          )
          .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
      }
      timeWrap = gsap.utils.wrap(0, tl.duration());
    }

    function refresh(deep = false) {
      const progress = tl.progress();
      tl.progress(0, true);
      populateWidths();
      if (deep) populateTimeline();
      timeOffset = center
        ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
        : 0;
      if (center) {
        times.forEach((t, i) => {
          times[i] = timeWrap(
            tl.labels["label" + i] +
              (tl.duration() * widths[i]) / 2 / totalWidth -
              timeOffset
          );
        });
      }
      if (deep && tl.draggable && tl.paused()) {
        tl.time(times[curIndex], true);
      } else {
        tl.progress(progress, true);
      }
    }

    function syncCurrentIndexToScroll() {
      if (!container) return;

      // Calculate visible scroll position relative to startX
      const visibleCenter =
        container.scrollLeft / 1.4 + container.clientWidth / 1.4;

      // Find the index whose center is closest to visibleCenter
      let closestIndex = 0;
      let minDistance = Infinity;

      elements.forEach((el, i) => {
        const elCenter = el.offsetLeft + el.offsetWidth / 1.4;
        const distance = Math.abs(elCenter - visibleCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      });

      // Set timeline time to that index's label time
      const newTime = times[closestIndex];
      tl.time(newTime, true);
      curIndex = closestIndex;
      lastIndex = closestIndex;

      onChange?.(elements[closestIndex], closestIndex);
    }

    function getCenter(el: HTMLElement) {
      return container.clientWidth / 2 - secondItem.clientWidth / 1.4;
    }

    function toIndex(
      index: number,
      vars: gsap.TweenVars = {}
    ): gsap.core.Tween {
      if (Math.abs(index - curIndex) > length / 2) {
        index += index > curIndex ? -length : length;
      }
      const newIndex = gsap.utils.wrap(0, length, index);
      let time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      if (vars.duration === 0) {
        tl.time(timeWrap(time));
        // Return a dummy tween to satisfy the return type
        return gsap.to({}, { duration: 0 });
      } else {
        return tl.tweenTo(time, vars);
      }
    }

    function getClosest(values: number[], value: number, wrap: number) {
      let i = values.length;
      let closest = 1e10;
      let index = 0;
      while (i--) {
        let d = Math.abs(values[i] - value);
        if (d > wrap / 2) d = wrap - d;
        if (d < closest) {
          closest = d;
          index = i;
        }
      }
      return index;
    }

    tl.toIndex = toIndex;
    tl.closestIndex = (setCurrent = false) => {
      const index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;

    gsap.set(elements, { x: 0 });
    populateWidths();
    populateTimeline();
    refresh();
    syncCurrentIndexToScroll();

    if (tl.draggable && proxy) {
      const ratio = 1 / totalWidth;
      gsap.set(proxy, { x: -(tl.time() / tl.duration()) / ratio });
    }

    const secondItem = elements[1];
    if (container && secondItem) {
      const scrollLeft = getCenter(secondItem) - getCenter(container);
      container.scrollLeft = scrollLeft;
    }

    window.addEventListener("resize", () => refresh(true));

    if (reversed) {
      tl.vars.onReverseComplete?.();
      tl.reverse();
    }

    if (draggable) {
      proxy = document.createElement("div");
      let wrap = gsap.utils.wrap(0, 1);
      let ratio = 0;
      let startProgress = 0;
      let lastSnap = 0;
      let initChangeX = 0;
      let wasPlaying = false;

      const draggableInstance = Draggable.create(proxy, {
        trigger: elements[0].parentNode as HTMLElement,
        type: "x",
        inertia: true,
        overshootTolerance: 0,
        onPressInit() {
          const x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag() {
          tl.progress(wrap(startProgress + (this.startX - this.x) * ratio));
        },
        onThrowUpdate() {
          tl.progress(wrap(startProgress + (this.startX - this.x) * ratio));
        },
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX;
          }
          const time = -(value * ratio) * tl.duration();
          const wrappedTime = timeWrap(time);
          const snapTime = times[getClosest(times, wrappedTime, tl.duration())];
          let dif = snapTime - wrappedTime;
          if (Math.abs(dif) > tl.duration() / 2) {
            dif += dif < 0 ? tl.duration() : -tl.duration();
          }
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          tl.closestIndex(true);
        },
        onThrowComplete() {
          tl.closestIndex(true);
          if (wasPlaying) tl.play();
        },
      })[0];

      tl.draggable = draggableInstance;
    }

    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange?.(elements[curIndex], curIndex);

    timeline = tl;
  });

  return timeline!;
}

export const formatEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;

  const maskedName =
    name.length > 2
      ? `${name.slice(0, 2)}${"*".repeat(name.length - 2)}`
      : `${name[0]}*`;

  return `${maskedName}@${domain}`;
};

export function formatJoinedDate(dateString: string): string {
  const date = new Date(dateString);

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${weekday} ${day}${suffix}`;
}

export function capitalize(str?: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  useBaseUrl = false
) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
  }
  const url = useBaseUrl ? `${baseUrl}/v1${endpoint}` : `/api${endpoint}`;

  console.log(url , "url")

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}), 
    },
    credentials: "include",
    signal: AbortSignal.timeout(30000),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response?.status} ${response?.statusText}`);
  }

  return await response.json();
};
