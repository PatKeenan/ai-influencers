import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import graphData from "./graph-data.json";

const DOMAINS = {
  context: { label: "Context Engineering", color: "#00d4ff", short: "CTX" },
  evals: { label: "Evaluations", color: "#f5c542", short: "EVAL" },
  orchestration: {
    label: "Agent Orchestration",
    color: "#d966ff",
    short: "ORCH",
  },
  aidev: { label: "AI-Assisted Dev", color: "#4dff91", short: "DEV" },
};

const PEOPLE = graphData.people;
const EDGES = graphData.edges;

function getDomColor(domains: string[]) {
  return DOMAINS[domains[0] as keyof typeof DOMAINS]?.color || "#aaa";
}

const LAYER_LABEL_COLORS: Record<number, string> = {
  0: "#e8f4ff",
  1: "rgba(180,205,225,0.85)",
  2: "rgba(140,175,200,0.65)",
};

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

export default function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<(typeof PEOPLE)[number] | null>(
    null,
  );
  const [domFilters, setDomFilters] = useState(new Set(Object.keys(DOMAINS)));
  const [layerFilter, setLayerFilter] = useState(new Set([0, 1, 2]));
  const [hoveredEdge, setHoveredEdge] = useState<(typeof EDGES)[number] | null>(
    null,
  );
  const [dims, setDims] = useState({ w: 900, h: 580 });
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const upd = () => {
      const headerH = isMobile ? 52 : 100;
      const footerH = isMobile ? 0 : 36;
      setDims({
        w: isMobile ? window.innerWidth : Math.min(window.innerWidth, 1200),
        h: Math.max(window.innerHeight - headerH - footerH, 400),
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

    // Background rect for grid
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

    // Container group for zoom/pan
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

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);
    // Set initial zoom for mobile to fit better
    if (isMobile) {
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(w * 0.05, h * 0.05).scale(0.9),
      );
    }

    // Deselect on background click
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
      .on("mouseenter", function (_ev: any, d: any) {
        d3.select(this)
          .attr("stroke-opacity", 0.85)
          .attr("stroke-width", Math.sqrt(d.weight) * 2.5);
        setHoveredEdge(d);
      })
      .on("mouseleave", function (_ev: any, d: any) {
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
      .on("click", (ev, d: any) => {
        ev.stopPropagation();
        setSelected((p: any) => (p?.id === d.id ? null : d));
      });

    nodeG.each(function (d: any) {
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
          .attr("fill", DOMAINS[dom as keyof typeof DOMAINS].color)
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
          .attr("font-family", "'Courier New',monospace")
          .attr("font-size", 6)
          .text("L2");
      }
      g.append("text")
        .attr("dy", r + rw + (d.anchor ? 14 : isMobile ? 9 : 11))
        .attr("text-anchor", "middle")
        .attr("fill", LAYER_LABEL_COLORS[d.layer] || "#c8d7e6")
        .attr("font-family", "'Courier New',monospace")
        .attr("font-size", d.anchor ? (isMobile ? 11 : 13) : isMobile ? 8 : 10.5)
        .attr("font-weight", d.anchor ? "bold" : "normal")
        .attr("letter-spacing", "0.04em")
        .attr("opacity", isL2 ? 0.75 : 1)
        .text(d.name);
    });

    nodeG
      .on("mouseenter", function () {
        d3.select(this).select("circle").attr("filter", "url(#strongGlow)");
      })
      .on("mouseleave", function () {
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
    <div
      style={{
        background: "#080c12",
        height: "100vh",
        fontFamily: "'Courier New',monospace",
        color: "#c8d7e6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: isMobile ? "8px 12px" : "12px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.5)",
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {!isMobile && (
            <div
              style={{
                fontSize: 9,
                color: "#00d4ff",
                letterSpacing: "0.2em",
                marginBottom: 3,
              }}
            >
              AI ENGINEER INFLUENCE MAP — SEED: SWYX / LATENT SPACE
            </div>
          )}
          <div
            style={{
              fontSize: isMobile ? 11 : 16,
              fontWeight: "bold",
              color: "#e8f4ff",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? "AIE MAP" : "NETWORK GRAPH"} v0.3 ·{" "}
            {PEOPLE.length} NODES · {EDGES.length} EDGES
          </div>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 6 : 12, alignItems: "center", flexShrink: 0 }}>
          {!isMobile && (
            <div
              style={{
                fontSize: 9,
                color: "rgba(200,215,230,0.3)",
                textAlign: "right",
                lineHeight: 1.7,
              }}
            >
              <div>MARCH 2026</div>
              <div>L1 + L2 EXPANSION</div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters
                  ? "rgba(0,212,255,0.15)"
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${showFilters ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: showFilters ? "#00d4ff" : "rgba(200,215,230,0.6)",
                padding: "5px 10px",
                fontSize: 9,
                letterSpacing: "0.1em",
                cursor: "pointer",
                borderRadius: 2,
                fontFamily: "'Courier New',monospace",
              }}
            >
              FILTER
            </button>
          )}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { l: 0, label: isMobile ? "A" : "ANCHOR" },
              { l: 1, label: isMobile ? "L1" : "LAYER 1" },
              { l: 2, label: isMobile ? "L2" : "LAYER 2" },
            ].map(({ l, label }) => (
              <button
                key={l}
                onClick={() => toggleLayer(l)}
                style={{
                  background: layerFilter.has(l)
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${layerFilter.has(l) ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)"}`,
                  color: layerFilter.has(l)
                    ? "rgba(200,215,230,0.8)"
                    : "rgba(200,215,230,0.22)",
                  padding: isMobile ? "5px 8px" : "3px 8px",
                  fontSize: isMobile ? 9 : 8,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  borderRadius: 2,
                  fontFamily: "'Courier New',monospace",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DOMAIN FILTERS — always visible on desktop, toggle on mobile */}
      {(!isMobile || showFilters) && (
        <div
          style={{
            padding: isMobile ? "8px 12px" : "7px 22px",
            display: "flex",
            gap: 6,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(0,0,0,0.2)",
            flexWrap: "wrap",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {!isMobile && (
            <span
              style={{
                fontSize: 9,
                color: "rgba(200,215,230,0.3)",
                letterSpacing: "0.12em",
                marginRight: 4,
              }}
            >
              DOMAIN:
            </span>
          )}
          {Object.entries(DOMAINS).map(([key, { label, color, short }]) => (
            <button
              key={key}
              onClick={() => toggleDom(key)}
              style={{
                background: domFilters.has(key)
                  ? `${color}15`
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${domFilters.has(key) ? color + "80" : "rgba(255,255,255,0.07)"}`,
                color: domFilters.has(key) ? color : "rgba(200,215,230,0.28)",
                padding: isMobile ? "5px 10px" : "3px 10px",
                fontSize: isMobile ? 10 : 9,
                letterSpacing: "0.1em",
                cursor: "pointer",
                borderRadius: 2,
                fontFamily: "'Courier New',monospace",
                transition: "all 0.15s",
              }}
            >
              {isMobile ? short : label.toUpperCase()}
            </button>
          ))}
          {!isMobile && (
            <span
              style={{
                fontSize: 8,
                color: "rgba(200,215,230,0.18)",
                marginLeft: "auto",
              }}
            >
              CLICK NODE FOR DOSSIER · DRAG TO REPOSITION · HOVER EDGE FOR
              RELATIONSHIP
            </span>
          )}
        </div>
      )}

      {/* MAIN GRAPH AREA */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <svg
            ref={svgRef}
            width={dims.w}
            height={dims.h}
            style={{ display: "block", touchAction: "none" }}
          />
          {hoveredEdge && !isMobile && (
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(5,9,15,0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "5px 16px",
                fontSize: 10,
                color: "#c8d7e6",
                letterSpacing: "0.04em",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "rgba(200,215,230,0.4)" }}>
                {typeof hoveredEdge.source === "object"
                  ? (hoveredEdge.source as any).id
                  : hoveredEdge.source}
                {" → "}
                {typeof hoveredEdge.target === "object"
                  ? (hoveredEdge.target as any).id
                  : hoveredEdge.target}
              </span>
              {" · "}
              <span style={{ color: "rgba(200,215,230,0.7)" }}>
                {hoveredEdge.label}
              </span>
            </div>
          )}
        </div>

        {/* DOSSIER — side panel on desktop */}
        {sp && !isMobile && (
          <div
            style={{
              width: 278,
              background: "rgba(0,0,0,0.55)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              padding: "18px 16px",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <DossierContent sp={sp} spEdges={spEdges} onClose={() => setSelected(null)} isMobile={false} />
          </div>
        )}
      </div>

      {/* DOSSIER — bottom sheet on mobile */}
      {sp && isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: "60vh",
            background: "rgba(5,9,15,0.97)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "14px 16px",
            overflowY: "auto",
            zIndex: 100,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <DossierContent sp={sp} spEdges={spEdges} onClose={() => setSelected(null)} isMobile={true} />
        </div>
      )}

      {/* FOOTER — desktop only */}
      {!isMobile && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "7px 22px",
            display: "flex",
            gap: 18,
            background: "rgba(0,0,0,0.35)",
            flexWrap: "wrap",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {Object.entries(DOMAINS).map(([k, { label, color }]) => (
            <div
              key={k}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  background: color,
                  borderRadius: 1,
                }}
              />
              <span
                style={{
                  fontSize: 8,
                  color: "rgba(200,215,230,0.4)",
                  letterSpacing: "0.08em",
                }}
              >
                {label.toUpperCase()}
              </span>
            </div>
          ))}
          <div
            style={{
              width: 1,
              height: 12,
              background: "rgba(255,255,255,0.08)",
              margin: "0 4px",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "1px dashed rgba(200,215,230,0.2)",
                background: "rgba(15,20,30,0.85)",
              }}
            />
            <span
              style={{
                fontSize: 8,
                color: "rgba(200,215,230,0.35)",
                letterSpacing: "0.08em",
              }}
            >
              LAYER 2 NODE
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 8,
              color: "rgba(200,215,230,0.18)",
              letterSpacing: "0.06em",
            }}
          >
            NODE SIZE = INBOUND CONNECTIONS · ARC SEGMENTS = DOMAINS
          </div>
        </div>
      )}
    </div>
  );
}

function DossierContent({
  sp,
  spEdges,
  onClose,
  isMobile,
}: {
  sp: (typeof PEOPLE)[number];
  spEdges: (typeof EDGES)[number][];
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 8,
            color: "rgba(200,215,230,0.3)",
            letterSpacing: "0.15em",
          }}
        >
          — NODE DOSSIER — LAYER {sp.layer === 0 ? "0 (ANCHOR)" : sp.layer}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(200,215,230,0.6)",
              fontSize: 10,
              padding: "2px 8px",
              cursor: "pointer",
              borderRadius: 2,
              fontFamily: "'Courier New',monospace",
            }}
          >
            CLOSE
          </button>
        )}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#e8f4ff",
          marginBottom: 1,
        }}
      >
        {sp.name}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(200,215,230,0.4)",
          marginBottom: 12,
        }}
      >
        {sp.fullName}
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {sp.domains.map((d: string) => (
          <span
            key={d}
            style={{
              background: `${DOMAINS[d as keyof typeof DOMAINS].color}18`,
              border: `1px solid ${DOMAINS[d as keyof typeof DOMAINS].color}70`,
              color: DOMAINS[d as keyof typeof DOMAINS].color,
              fontSize: 8,
              padding: "2px 7px",
              letterSpacing: "0.1em",
              borderRadius: 2,
            }}
          >
            {DOMAINS[d as keyof typeof DOMAINS].short}
          </span>
        ))}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#7aaabb",
          marginBottom: 10,
          lineHeight: 1.5,
        }}
      >
        {sp.role}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(200,215,230,0.65)",
          lineHeight: 1.65,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 10,
          marginBottom: 10,
        }}
      >
        {sp.description}
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 9,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 8,
            color: "rgba(200,215,230,0.3)",
            letterSpacing: "0.12em",
            marginBottom: 5,
          }}
        >
          FIND THEM
        </div>
        <div style={{ fontSize: 11, color: "#00d4ff" }}>{sp.handle}</div>
        <div
          style={{
            fontSize: 9,
            color: "rgba(200,215,230,0.35)",
            marginTop: 2,
          }}
        >
          {sp.platform}
        </div>
      </div>
      {sp.reading && sp.reading.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 9,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: "rgba(200,215,230,0.3)",
              letterSpacing: "0.12em",
              marginBottom: 7,
            }}
          >
            READING ({sp.reading.length})
          </div>
          {sp.reading.map((r: any, i: number) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                fontSize: 10,
                color: "#00d4ff",
                marginBottom: 6,
                textDecoration: "none",
                lineHeight: 1.4,
              }}
            >
              {r.title}
            </a>
          ))}
        </div>
      )}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 9,
        }}
      >
        <div
          style={{
            fontSize: 8,
            color: "rgba(200,215,230,0.3)",
            letterSpacing: "0.12em",
            marginBottom: 7,
          }}
        >
          EDGES ({spEdges.length})
        </div>
        {spEdges.map((e, i) => {
          const oid = e.source === sp.id ? e.target : e.source;
          const other = PEOPLE.find((p) => p.id === oid);
          const dir = e.source === sp.id ? "\u2192" : "\u2190";
          return (
            <div
              key={i}
              style={{
                fontSize: 9,
                color: "rgba(200,215,230,0.55)",
                marginBottom: 6,
                paddingLeft: 7,
                borderLeft: `2px solid ${getDomColor(other?.domains || ["context"])}50`,
              }}
            >
              <span
                style={{ color: "rgba(200,215,230,0.35)", fontSize: 8 }}
              >
                {dir}{" "}
              </span>
              <span style={{ color: "#c8d7e6", fontSize: 10 }}>
                {other?.name}
              </span>
              <span
                style={{
                  color: "rgba(200,215,230,0.3)",
                  display: "block",
                  marginTop: 1,
                }}
              >
                {e.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
