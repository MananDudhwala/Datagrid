import { useState, useEffect, useMemo, type RefObject } from "react";

export interface useVirtualizeOptions {
    containerHeight: number;
    overscan?: number;
    rowHeight: number;
    count: number;
    scrollRef?: RefObject<HTMLElement | null>
}

export type VirtualItem = {
    offsetTop: number;
    index: number;
}

export interface VirtualizeOutput {
    startIndex: number;
    endIndex: number;
    virtualItems: VirtualItem[];
    visibleCount: number;
}

export function useVirtualize({ containerHeight, rowHeight, count, overscan = 3, scrollRef }: useVirtualizeOptions) {

    const [scrollTop, setScrollTop] = useState(0);

    useEffect(() => {

        const el = scrollRef?.current;

        if (el === null) return;

        let rafID: number | null;

        const handleScroll = () => {

            if (rafID !== null) cancelAnimationFrame(rafID);

            rafID = requestAnimationFrame(() => {
                setScrollTop(el?.scrollTop as unknown as number)
            });
        }

        el?.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (rafID !== null) cancelAnimationFrame(rafID);
            el?.removeEventListener('scroll', handleScroll);
        }

    }, [scrollRef])

    const totalHeight = count * rowHeight;

    const { startIndex, endIndex, virtualItems } = useMemo(() => {

        const rawStart = Math.floor(scrollTop / rowHeight);
        const start = Math.max(0, rawStart - overscan);

        const visibleCount = Math.ceil(containerHeight / rowHeight);
        const end = Math.min(count - 1, rawStart + visibleCount + overscan);

        const listArr: VirtualItem[] = [];

        for (let i = start; i <= end; i++) {

            listArr.push({
                index: i,
                offsetTop: i * rowHeight
            });


        }

        return {
            totalHeight,
            startIndex: start,
            endIndex: end,
            virtualItems: listArr
        }

    }, [scrollTop, containerHeight, rowHeight, count, overscan

    ])

    return {
        totalHeight,
        virtualItems,
        startIndex,
        endIndex,
    };

}