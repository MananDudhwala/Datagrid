import { useRef, useState, useMemo } from "react";

import type { BackupLog, BackupStatus, SortField, SortDirection } from "../types";
import { useVirtualize } from "../hooks/useVirtualizer";

interface Props {
    data: BackupLog[];
    height: number;
    rowHeight: number;
}

export const VirtualDataGrid = ({ data, height = 500, rowHeight = 44 }: Props) => {

    const scrollRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [sortField, setSortField] = useState<SortField>("timestamp");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field);
            setSortDirection('asc')
        }
    }

    const processedData = useMemo(() => {
        let result = data;

        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter((row) => row.id.toLocaleLowerCase().includes(q) || row.source.toLocaleLowerCase().includes(q) || row.targetCloud.toLocaleLowerCase().includes(q))
        }

        if (statusFilter !== 'ALL') {
            result = result.filter((row) => row.status === statusFilter)
        }

        return [...result].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            let cmp = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                cmp = valA.localeCompare(valB)
            } else {
                cmp = (valA as number) < (valB as number) ? -1 : 1
            }
            return sortDirection === 'asc' ? cmp : -cmp
        })
    }, [data, search, statusFilter, sortDirection, sortField]);

    console.log("pd", processedData)


    const { totalHeight, virtualItems } = useVirtualize({
        containerHeight: height,
        count: processedData.length,
        rowHeight: rowHeight,
        scrollRef: scrollRef,
        overscan: 3
    })

    const columns = '120px 2fr 100px 100px 120px 180px';

    const STATUS_COLORS: Record<BackupStatus, { bg: string; text: string; border: string }> = {
        SUCCESS: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
        RUNNING: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        FAILED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    };

    const stautsList = ['ALL', 'SUCCESS', 'RUNNING', 'FAILED']

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            {/* TOOLBAR */}
            <div style={{ display: 'flex' }}>

                <input value={search} onChange={(e) => {
                    setSearch(e.target.value)
                }} placeholder="Seach by id, source, cloud"></input>
                <select onChange={(e) => {
                    setStatusFilter(e.target.value)
                }} value={statusFilter}>
                    {
                        stautsList.map((it) => <option value={it} key={it} onSelect={(e) => {
                            setStatusFilter(e.currentTarget.value)
                        }} >
                            {it}
                        </option>)
                    }
                </select>

                <div style={{ margin: 'auto', marginRight: '0' }}>
                    <span>
                        {`showing ${processedData.length} of ${data.length} rows`}
                    </span>
                </div>

            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: columns,
                        background: '#f3f4f6',
                        fontWeight: 600,
                        fontSize: '13px',
                        borderBottom: '1px solid #ddd',
                        height: '40px',
                        alignItems: 'center',
                    }}
                >
                    {(['id', 'source', 'targetCloud', 'sizeGB', 'status', 'timestamp'] as const).map((col) => (
                        <div
                            key={col}
                            onClick={() => handleSort(col as SortField)}
                            style={{ padding: '0 12px', cursor: 'pointer', userSelect: 'none' }}
                        >
                            {col.toUpperCase()}
                            {sortField === col && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </div>
                    ))}
                </div>
            </div>
            <div
                ref={scrollRef}
                style={{ height: `${height}px`, overflowY: 'auto', position: 'relative' }}
            >
                {/* 2. PHANTOM SPACER */}
                <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>

                    {/* 3. FLOATING ROWS */}
                    {virtualItems.map(({ index, offsetTop }) => {
                        const row = processedData[index];
                        if (!row) return null;
                        return (
                            <div
                                key={row.id}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${rowHeight}px`,
                                    transform: `translateY(${offsetTop}px)`,
                                    display: 'grid',
                                    gridTemplateColumns: columns,
                                    alignItems: 'center',
                                    borderBottom: '1px solid #eee',
                                    background: index % 2 === 0 ? '#fff' : '#f9fafb',
                                    fontSize: '13px',
                                }}
                            >
                                <div style={{ padding: '0 12px' }}>{row.id}</div>
                                <div style={{ padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {row.source}
                                </div>
                                <div style={{ padding: '0 12px' }}>{row.targetCloud}</div>
                                <div style={{ padding: '0 12px' }}>{row.sizeGB} GB</div>
                                <div style={{ padding: '0 12px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        background: STATUS_COLORS[row.status].bg,
                                        color: STATUS_COLORS[row.status].text,
                                    }}>
                                        {row.status}
                                    </span>
                                </div>
                                <div style={{ padding: '0 12px', color: '#666' }}>
                                    {new Date(row.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
