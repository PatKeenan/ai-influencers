import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import * as d3 from "d3";
import { Maximize2 } from "lucide-react";
import graphData from "../../graph-data.json";
import { DOMAINS, getDomColor, LAYER_LABEL_COLORS } from "../../lib/constants";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { Person, Edge, DomainKey } from "../../lib/types";

const PEOPLE = graphData.people as Person[];
const EDGES = graphData.edges as Edge[];

export function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<Person | null>(null);
  const [domFilters, setDomFilters] = useState(new Set(Object.keys(DOMAINS)));
  const [layerFilter, setLayerFilter] = useState(new Set([0, 1, 2]));
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);
  const [dims, setDims] = useState({ w: 900, h: 580 });
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const upd = () => {
      const sidebarW = isMobile ? 0 : 56; // 14 * 4 = 56px sidebar
      setDims({
        w: isMobile ? window.innerWidth : Math.min(window.innerWidth - sidebarW, 1200),
        h: isMobile ? window.innerHeight - 56 : window.innerHeight, // 56px bottom tabs on mobile
      });
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, [isMobile]);

  useEffect(() => {
    if (!svgRef.current) return;
    const { w, h } = dims;
    const visNodes = PEOPLE.filter(
      (n) =>
        n.domains.some((d: string) => domFilters.has(d)) &&
        layerFilter.has(n.layer),
    );
    const visIds = new Set(visNodes.map((n) => n.id));
    const visEdges = EDGES.filter(
      (e) => visIds.has(e.source) && visIds.has(e.target),
    );
    const nodeData = visNodes.map((n) => ({ ...n }));
    const edgeData = visEdges.map((e) => ({ ...e }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const gp = defs
      .append("pattern")
      .attr("id", "grid")
      .attr("width", 50)
      .attr("height", 50)
      .attr("patternUnits", "userSpaceOnUse");
    gp.append("path")
      .attr("d", "M 50 0 L 0 0 0 50")
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.02)")
      .attr("stroke-width", "0.5");

    svg
      .append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "url(#grid)");

    ["glow", "strongGlow"].forEach((id, i) => {
      const f = defs.append("filter").attr("id", id);
      f.append("feGaussianBlur")
        .attr("stdDeviation", i === 0 ? "2.5" : "5")
        .attr("result", "cb");
      const m = f.append("feMerge");
      m.append("feMergeNode").attr("in", "cb");
      m.append("feMergeNode").attr("in", "SourceGraphic");
    });

    const container = svg.append("g");

    const chargeStrength = isMobile ? -200 : -300;
    const linkDist = isMobile
      ? (d: any) => 100 - d.weight * 8
      : (d: any) => 145 - d.weight * 13;

    const sim = d3
      .forceSimulation(nodeData as any)
      .force(
        "link",
        d3
          .forceLink(edgeData)
          .id((d: any) => d.id)
          .distance(linkDist)
          .strength(0.4),
      )
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force(
        "collide",
        d3.forceCollide().radius((d: any) => getR(d) + (isMobile ? 16 : 22)),
      );

    function getR(d: any) {
      if (isMobile) return d.anchor ? 22 : 7 + d.inbound * 1.2;
      return d.anchor ? 30 : 9 + d.inbound * 1.6;
    }

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);
    if (isMobile) {
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(w * 0.05, h * 0.05).scale(0.9),
      );
    }

    svg.on("click", (event) => {
      if (event.target === svgRef.current || event.target.tagName === "rect") {
        setSelected(null);
      }
    });

    const links = container
      .append("g")
      .selectAll("line")
      .data(edgeData)
      .join("line")
      .attr("stroke", (d: any) => {
        const s = nodeData.find(
          (n: any) => n.id === (d.source.id || d.source),
        );
        return s ? getDomColor(s.domains) : "rgba(255,255,255,0.1)";
      })
      .attr("stroke-opacity", 0.15)
      .attr("stroke-width", (d: any) => Math.sqrt(d.weight) * 1.2)
      .style("cursor", "pointer")
      .on("mouseenter", function (this: any, _ev: any, d: any) {
        d3.select(this)
          .attr("stroke-opacity", 0.85)
          .attr("stroke-width", Math.sqrt(d.weight) * 2.5);
        setHoveredEdge(d);
      })
      .on("mouseleave", function (this: any, _ev: any, d: any) {
        d3.select(this)
          .attr("stroke-opacity", 0.15)
          .attr("stroke-width", Math.sqrt(d.weight) * 1.2);
        setHoveredEdge(null);
      });

    const nodeG = container
      .append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .call(
        (d3
          .drag<SVGGElement, any>()
          .on("start", (ev, d) => {
            if (!ev.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (ev, d) => {
            d.fx = ev.x;
            d.fy = ev.y;
          })
          .on("end", (ev, d) => {
            if (!ev.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })) as any,
      )
      .on("click", (ev: any, d: any) => {
        ev.stopPropagation();
        setSelected((p: any) => (p?.id === d.id ? null : d));
      });

    nodeG.each(function (this: any, d: any) {
      const g = d3.select(this);
      const r = getR(d),
        rw = d.anchor ? (isMobile ? 5 : 7) : isMobile ? 3 : 4,
        isL2 = d.layer === 2;
      if (d.anchor) {
        [r + 16, r + 9].forEach((pr, i) =>
          g
            .append("circle")
            .attr("r", pr)
            .attr("fill", "none")
            .attr("stroke", getDomColor(d.domains))
            .attr("stroke-width", 0.8)
            .attr("stroke-opacity", i === 0 ? 0.12 : 0.22)
            .attr("filter", "url(#glow)"),
        );
      }
      g.append("circle")
        .attr("r", r)
        .attr(
          "fill",
          d.anchor
            ? "rgba(0,212,255,0.07)"
            : isL2
              ? "rgba(15,20,30,0.85)"
              : "rgba(8,12,18,0.92)",
        )
        .attr(
          "stroke",
          isL2 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
        )
        .attr("stroke-width", isL2 ? 0.5 : 1)
        .attr("stroke-dasharray", isL2 ? "3,2" : "none")
        .attr("filter", "url(#glow)");
      d.domains.forEach((dom: string, i: number) => {
        const seg = d.domains.length,
          arcPad = 0.1;
        const sa = (i / seg) * Math.PI * 2 - Math.PI / 2 + arcPad,
          ea = ((i + 1) / seg) * Math.PI * 2 - Math.PI / 2 - arcPad;
        g.append("path")
          .attr(
            "d",
            d3
              .arc<any, any>()
              .innerRadius(r + 2)
              .outerRadius(r + rw)
              .startAngle(sa)
              .endAngle(ea)({} as any) as string,
          )
          .attr("fill", DOMAINS[dom as DomainKey].color)
          .attr("opacity", isL2 ? 0.55 : 0.9);
      });
      if (isL2 && !isMobile) {
        g.append("circle")
          .attr("r", 5)
          .attr("cx", r - 2)
          .attr("cy", -(r - 2))
          .attr("fill", "rgba(8,12,18,0.9)")
          .attr("stroke", "rgba(200,215,230,0.2)")
          .attr("stroke-width", 0.5);
        g.append("text")
          .attr("x", r - 2)
          .attr("y", -(r - 2) + 3.5)
          .attr("text-anchor", "middle")
          .attr("fill", "rgba(200,215,230,0.4)")
          .attr("font-family", "var(--font-mono)")
          .attr("font-size", 9)
          .text("L2");
      }
      g.append("text")
        .attr("dy", r + rw + (d.anchor ? 14 : isMobile ? 9 : 11))
        .attr("text-anchor", "middle")
        .attr("fill", LAYER_LABEL_COLORS[d.layer] || "#c8d7e6")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", d.anchor ? (isMobile ? 11 : 13) : isMobile ? 10 : 10.5)
        .attr("font-weight", d.anchor ? "bold" : "normal")
        .attr("letter-spacing", "0.04em")
        .attr("opacity", isL2 ? 0.75 : 1)
        .text(d.name);
    });

    nodeG
      .on("mouseenter", function (this: any) {
        d3.select(this).select("circle").attr("filter", "url(#strongGlow)");
      })
      .on("mouseleave", function (this: any) {
        d3.select(this).select("circle").attr("filter", "url(#glow)");
      });

    sim.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
    return () => { sim.stop(); };
  }, [domFilters, layerFilter, dims, isMobile]);

  const sp = PEOPLE.find((p) => p.id === selected?.id);
  const spEdges = sp
    ? EDGES.filter((e) => e.source === sp.id || e.target === sp.id)
    : [];

  const toggleDom = (key: string) =>
    setDomFilters((prev) => {
      const n = new Set(prev);
      if (n.has(key)) {
        if (n.size > 1) n.delete(key);
      } else n.add(key);
      return n;
    });
  const toggleLayer = (l: number) =>
    setLayerFilter((prev) => {
      const n = new Set(prev);
      if (n.has(l)) {
        if (n.size > 1) n.delete(l);
      } else n.add(l);
      return n;
    });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* HEADER */}
      <div className="border-b border-border px-4 py-2.5 md:px-5 md:py-3 flex items-center justify-between bg-black/50 shrink-0">
        <div className="min-w-0">
          {!isMobile && (
            <div className="text-label font-mono text-accent tracking-[0.2em] mb-0.5">
              AI ENGINEER INFLUENCE MAP — SEED: SWYX / LATENT SPACE
            </div>
          )}
          <div className="text-sm md:text-lg font-bold text-text-primary tracking-wide whitespace-nowrap font-mono">
            {isMobile ? "AIE MAP" : "NETWORK GRAPH"} v0.3 · {PEOPLE.length} NODES · {EDGES.length} EDGES
          </div>
        </div>
        <div className="flex gap-1.5 md:gap-3 items-center shrink-0">
          {!isMobile && (
            <div className="text-label font-mono text-text-muted text-right leading-relaxed">
              <div>MARCH 2026</div>
              <div>L1 + L2 EXPANSION</div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2.5 py-1.5 text-label font-mono tracking-wider border rounded-sm cursor-pointer transition-all duration-[var(--transition-base)] ${
                showFilters
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-surface-hover border-border-emphasis text-text-muted"
              }`}
            >
              FILTER
            </button>
          )}
          <div className="flex gap-1">
            {[
              { l: 0, label: isMobile ? "A" : "ANCHOR" },
              { l: 1, label: isMobile ? "L1" : "LAYER 1" },
              { l: 2, label: isMobile ? "L2" : "LAYER 2" },
            ].map(({ l, label }) => (
              <button
                key={l}
                onClick={() => toggleLayer(l)}
                className={`px-2 py-1.5 md:py-1 text-label font-mono tracking-wider border rounded-sm cursor-pointer transition-all duration-[var(--transition-base)] ${
                  layerFilter.has(l)
                    ? "bg-surface-active border-border-strong text-text-secondary"
                    : "bg-surface-hover/30 border-border text-text-faint"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DOMAIN FILTERS */}
      {(!isMobile || showFilters) && (
        <div className="px-3 md:px-5 py-2 flex gap-1.5 border-b border-border-subtle bg-black/20 flex-wrap items-center shrink-0">
          {!isMobile && (
            <span className="text-label font-mono text-text-muted tracking-[0.12em] mr-1">
              DOMAIN:
            </span>
          )}
          {Object.entries(DOMAINS).map(([key, { label, color, short }]) => (
            <button
              key={key}
              onClick={() => toggleDom(key)}
              style={{
                background: domFilters.has(key) ? `${color}15` : undefined,
                borderColor: domFilters.has(key) ? `${color}80` : undefined,
                color: domFilters.has(key) ? color : undefined,
              }}
              className={`px-2.5 py-1.5 md:py-1 text-label font-mono tracking-wider border rounded-sm cursor-pointer transition-all duration-[var(--transition-base)] ${
                !domFilters.has(key) ? "bg-surface-hover/30 border-border text-text-faint" : ""
              }`}
            >
              {isMobile ? short : label.toUpperCase()}
            </button>
          ))}
          {!isMobile && (
            <span className="text-label font-mono text-text-muted ml-auto">
              CLICK NODE FOR DOSSIER · DRAG TO REPOSITION · HOVER EDGE FOR RELATIONSHIP
            </span>
          )}
        </div>
      )}

      {/* MAIN GRAPH AREA */}
      <div className="flex flex-1 relative overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            width={dims.w}
            height={dims.h}
            className="block touch-none"
          />
          {hoveredEdge && !isMobile && (
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 bg-[rgba(5,9,15,0.97)] border border-border-emphasis px-4 py-1.5 text-xs font-mono text-text-secondary pointer-events-none whitespace-nowrap tracking-tight">
              <span className="text-text-muted">
                {typeof hoveredEdge.source === "object"
                  ? (hoveredEdge.source as any).id
                  : hoveredEdge.source}
                {" → "}
                {typeof hoveredEdge.target === "object"
                  ? (hoveredEdge.target as any).id
                  : hoveredEdge.target}
              </span>
              {" · "}
              <span className="text-text-tertiary">
                {hoveredEdge.label}
              </span>
            </div>
          )}
        </div>

        {/* DOSSIER — side panel on desktop */}
        {sp && !isMobile && (
          <div className="w-72 bg-surface border-l border-border p-4 overflow-y-auto shrink-0">
            <DossierContent sp={sp} spEdges={spEdges} onClose={() => setSelected(null)} isMobile={false} />
          </div>
        )}
      </div>

      {/* DOSSIER — bottom sheet on mobile */}
      {sp && isMobile && (
        <div className="absolute bottom-14 left-0 right-0 max-h-[60vh] bg-[rgba(5,9,15,0.97)] border-t border-border-emphasis p-4 overflow-y-auto z-modal rounded-t-xl">
          <DossierContent sp={sp} spEdges={spEdges} onClose={() => setSelected(null)} isMobile={true} />
        </div>
      )}

      {/* FOOTER — desktop only */}
      {!isMobile && (
        <div className="border-t border-border-subtle px-5 py-2 flex gap-4 bg-black/35 flex-wrap items-center shrink-0">
          {Object.entries(DOMAINS).map(([k, { label, color }]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-sm"
                style={{ background: color }}
              />
              <span className="text-label font-mono text-text-tertiary tracking-wider">
                {label.toUpperCase()}
              </span>
            </div>
          ))}
          <div className="w-px h-3 bg-border-emphasis mx-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full border border-dashed border-text-faint bg-[rgba(15,20,30,0.85)]" />
            <span className="text-label font-mono text-text-tertiary tracking-wider">
              LAYER 2 NODE
            </span>
          </div>
          <span className="ml-auto text-label font-mono text-text-tertiary tracking-wide">
            NODE SIZE = INBOUND CONNECTIONS · ARC SEGMENTS = DOMAINS
          </span>
        </div>
      )}
    </div>
  );
}

function ExpandButton({ personId }: { personId: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/person/${personId}`)}
      className="p-1.5 rounded-md border border-border hover:border-border-emphasis text-text-muted hover:text-accent bg-transparent hover:bg-accent/10 transition-all duration-[var(--transition-base)] cursor-pointer shrink-0"
      title="View full profile"
    >
      <Maximize2 className="w-3.5 h-3.5" />
    </button>
  );
}

function DossierContent({
  sp,
  spEdges,
  onClose,
  isMobile,
}: {
  sp: Person;
  spEdges: Edge[];
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-2.5">
        <div className="text-label font-mono text-text-muted tracking-[0.15em]">
          — NODE DOSSIER — LAYER {sp.layer === 0 ? "0 (ANCHOR)" : sp.layer}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="bg-transparent border border-border-emphasis text-text-muted text-xs font-mono px-2 py-0.5 cursor-pointer rounded-sm"
          >
            CLOSE
          </button>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-bold text-text-primary mb-0.5">{sp.name}</div>
          <div className="text-xs text-text-muted mb-3">{sp.fullName}</div>
        </div>
        <ExpandButton personId={sp.id} />
      </div>
      <div className="flex gap-1 flex-wrap mb-3">
        {sp.domains.map((d: DomainKey) => (
          <span
            key={d}
            className="text-label font-mono px-2 py-0.5 tracking-wider rounded-sm border"
            style={{
              background: `${DOMAINS[d].color}18`,
              borderColor: `${DOMAINS[d].color}70`,
              color: DOMAINS[d].color,
            }}
          >
            {DOMAINS[d].short}
          </span>
        ))}
      </div>
      <div className="text-xs text-accent/70 mb-2.5 leading-relaxed">{sp.role}</div>
      <div className="text-xs text-text-tertiary leading-relaxed border-t border-border-subtle pt-2.5 mb-2.5">
        {sp.description}
      </div>
      <div className="border-t border-border-subtle pt-2.5 mb-3">
        <div className="text-label font-mono text-text-muted tracking-[0.12em] mb-1.5">FIND THEM</div>
        <div className="text-sm text-accent">{sp.handle}</div>
        <div className="text-xs text-text-muted mt-0.5">{sp.platform}</div>
      </div>
      {sp.reading && sp.reading.length > 0 && (
        <div className="border-t border-border-subtle pt-2.5 mb-3">
          <div className="text-label font-mono text-text-muted tracking-[0.12em] mb-2">
            READING ({sp.reading.length})
          </div>
          {sp.reading.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-accent mb-1.5 no-underline leading-snug hover:text-accent-hover transition-colors duration-[var(--transition-fast)]"
            >
              {r.title}
            </a>
          ))}
        </div>
      )}
      <div className="border-t border-border-subtle pt-2.5">
        <div className="text-label font-mono text-text-muted tracking-[0.12em] mb-2">
          EDGES ({spEdges.length})
        </div>
        {spEdges.map((e, i) => {
          const oid = e.source === sp.id ? e.target : e.source;
          const other = PEOPLE.find((p) => p.id === oid);
          const dir = e.source === sp.id ? "\u2192" : "\u2190";
          return (
            <div
              key={i}
              className="text-xs text-text-tertiary mb-1.5 pl-2 border-l-2"
              style={{ borderColor: `${getDomColor(other?.domains || ["context"])}50` }}
            >
              <span className="text-text-muted text-label">{dir} </span>
              <span className="text-text-secondary text-xs">{other?.name}</span>
              <span className="text-text-muted block mt-px text-label">{e.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
