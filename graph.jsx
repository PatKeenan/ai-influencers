import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

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

const PEOPLE = [
  // ANCHOR
  {
    id: "swyx",
    name: "swyx",
    fullName: "Shawn Wang",
    layer: 0,
    domains: ["context", "orchestration", "evals", "aidev"],
    role: "Latent Space Host · AI Engineer Summit Organizer",
    handle: "@swyx",
    platform: "X · latent.space · swyx.io",
    description:
      "Coined 'AI Engineer'. Organizes AIE Summit, World's Fair, and Code Summit. Highest-connectivity node across all four domains. Active weekly through March 2026.",
    inbound: 14,
    anchor: true,
  },

  // LAYER 1 — seeded from AIE conferences + Latent Space
  {
    id: "alessio",
    name: "Alessio",
    fullName: "Alessio Fanelli",
    layer: 1,
    domains: ["orchestration", "aidev"],
    role: "Latent Space Co-host · Partner @ Decibel VC",
    handle: "@fanahova",
    platform: "X · latent.space",
    description:
      "Co-hosts Latent Space. Investor lens on AI engineering infrastructure. Co-curates AIE conference content.",
    inbound: 6,
  },
  {
    id: "simon",
    name: "Simon Willison",
    fullName: "Simon Willison",
    layer: 1,
    domains: ["context", "aidev", "evals"],
    role: "Creator of Datasette & LLM CLI · Independent",
    handle: "@simonw",
    platform: "X · simonwillison.net",
    description:
      "Won best-of-conference AIE World's Fair 2025. Posts multiple times daily through March 2026. Coined 'prompt injection'. 39 Karpathy citations on blog.",
    inbound: 11,
  },
  {
    id: "harrison",
    name: "Harrison Chase",
    fullName: "Harrison Chase",
    layer: 1,
    domains: ["orchestration", "context"],
    role: "Co-founder & CEO, LangChain",
    handle: "@hwchase17",
    platform: "X · blog.langchain.com",
    description:
      "Built LangChain ($1.25B, 99k stars). LangGraph is the dominant agent orchestration framework. Coined 'ambient agents'. Pioneering 'harness engineering'. Active March 2026.",
    inbound: 9,
  },
  {
    id: "hamel",
    name: "Hamel Husain",
    fullName: "Hamel Husain",
    layer: 1,
    domains: ["evals"],
    role: "Independent AI Consultant (ex-GitHub, HuggingFace)",
    handle: "@HamelHusain",
    platform: "X · hamel.dev",
    description:
      "Community's foremost expert on production LLM evals. Co-teaches AI Evals for Engineers (3,000+ students). Simon Willison cites him repeatedly.",
    inbound: 8,
  },
  {
    id: "shreya",
    name: "Shreya Shankar",
    fullName: "Shreya Shankar",
    layer: 1,
    domains: ["evals", "context"],
    role: "PhD @ UC Berkeley · AI Evals Course Co-founder",
    handle: "@sh_reya",
    platform: "X · sh-reya.com",
    description:
      "Built DocETL. Co-teaches evals course with Hamel. Research co-author with Harrison Chase on LangSmith eval alignment. Adopted by LangChain and OpenAI.",
    inbound: 7,
  },
  {
    id: "eugene",
    name: "Eugene Yan",
    fullName: "Eugene Yan",
    layer: 1,
    domains: ["evals", "context"],
    role: "Applied Scientist · Practitioner Writer",
    handle: "@eugeneyan",
    platform: "X · eugeneyan.com",
    description:
      "Signal-dense writing on evals, RAG, and long-context QA. Endorsed on Latent Space about page. Latest post June 2025. swyx recommends alongside Chip Huyen.",
    inbound: 7,
  },
  {
    id: "jason",
    name: "Jason Liu",
    fullName: "Jason Liu",
    layer: 1,
    domains: ["context", "evals"],
    role: "Creator of Instructor · AI Engineering Consultant",
    handle: "@jxnlco",
    platform: "X · jxnl.co",
    description:
      "Built Instructor (structured LLM outputs). 'No evals, no serious app' is his signature thesis. Cited in AI Engineer roadmap.",
    inbound: 6,
  },
  {
    id: "jeremy",
    name: "Jeremy Howard",
    fullName: "Jeremy Howard",
    layer: 1,
    domains: ["aidev", "context"],
    role: "Co-founder Answer.ai · Creator of fast.ai",
    handle: "@jeremyphoward",
    platform: "X · jeremy.fast.ai",
    description:
      "Building Answer.ai for practical AI productivity tools. fast.ai democratized ML education. Latent Space guest.",
    inbound: 6,
  },
  {
    id: "dex",
    name: "Dex Horthy",
    fullName: "Dex Horthy",
    layer: 1,
    domains: ["context", "orchestration"],
    role: "CEO of Humanloop",
    handle: "@dexhorthy",
    platform: "X · humanloop.com",
    description:
      "Coined 'context engineering' on stage at AIE Summit 2025. Humanloop builds context and prompt management infrastructure for production agents.",
    inbound: 6,
  },
  {
    id: "sasha",
    name: "Sasha Rush",
    fullName: "Alexander Rush",
    layer: 1,
    domains: ["evals", "orchestration"],
    role: "MIT Professor · DSPy ecosystem",
    handle: "@srush_nlp",
    platform: "X · srush.github.io",
    description:
      "Keynoted AIE World's Fair. Academic rigor applied to production LLM programming. Appeared at AIE Code Summit alongside Lee Robinson.",
    inbound: 5,
  },
  {
    id: "beyang",
    name: "Beyang Liu",
    fullName: "Beyang Liu",
    layer: 1,
    domains: ["aidev", "orchestration"],
    role: "Co-founder & CTO, Sourcegraph / Amp Code",
    handle: "@beyang",
    platform: "X",
    description:
      "3x AIE Top Speaker. Built Sourcegraph and Amp Code (team-scale coding agent). Deep practitioner on agent-ready codebases. Active Nov 2025.",
    inbound: 6,
  },
  {
    id: "yegge",
    name: "Steve Yegge",
    fullName: "Steve Yegge",
    layer: 1,
    domains: ["aidev"],
    role: "Principal Engineer, Sourcegraph",
    handle: "@Steve_Yegge",
    platform: "X · medium.com/@steve-yegge",
    description:
      "'2026: The Year the IDE Died' at AIE Code Summit was one of the most-cited talks. Famous for legendary developer manifestos. Original long-form thinker.",
    inbound: 5,
  },
  {
    id: "leerob",
    name: "Lee Robinson",
    fullName: "Lee Robinson",
    layer: 1,
    domains: ["aidev"],
    role: "Head of DX, Cursor",
    handle: "@leeerob",
    platform: "X · leerob.com",
    description:
      "Runs developer experience at Cursor. Gave the Cursor Composer infrastructure, training, and evals talk at AIE Code Summit 2025. Active developer advocate.",
    inbound: 5,
  },
  {
    id: "catasta",
    name: "M. Catasta",
    fullName: "Michele Catasta",
    layer: 1,
    domains: ["aidev", "orchestration"],
    role: "President of Engineering, Replit",
    handle: "@pirroh",
    platform: "X",
    description:
      "'Autonomy Is All You Need' at AIE Code Summit 2025. Running Replit's entire AI agent platform. Deep practitioner on autonomous agent design.",
    inbound: 5,
  },
  {
    id: "eno",
    name: "Eno Reyes",
    fullName: "Eno Reyes",
    layer: 1,
    domains: ["aidev", "orchestration"],
    role: "CTO, Factory AI",
    handle: "@enoreyes_",
    platform: "X",
    description:
      "Spoke at AIE Code Summit 2025 on 'eight categories for agent-ready codebases' — genuinely novel framework. Factory AI builds production coding agents.",
    inbound: 4,
  },
  {
    id: "brennan",
    name: "R. Brennan",
    fullName: "Robert Brennan",
    layer: 1,
    domains: ["orchestration", "aidev"],
    role: "CEO, AllHands AI (OpenHands)",
    handle: "@rbrennan_tech",
    platform: "X · github.com/All-Hands-AI",
    description:
      "OpenHands is #1 open-source coding agent on SWE-bench. Building the open alternative to Devin. AIE Code Summit Nov 2025 speaker.",
    inbound: 5,
  },
  {
    id: "lance",
    name: "Lance Martin",
    fullName: "Lance Martin",
    layer: 1,
    domains: ["context", "orchestration"],
    role: "AI Researcher, LangChain",
    handle: "@RLanceMartin",
    platform: "X · rlancemartin.github.io",
    description:
      "Dedicated Latent Space episode on 'Context Engineering for Agents' in 2025. His post and dbreunig's 'How Contexts Fail' are the two foundational practitioner pieces on the topic.",
    inbound: 5,
  },

  // LAYER 2 — snowballed from Simon, Harrison, Hamel networks + LS archive
  {
    id: "chip",
    name: "Chip Huyen",
    fullName: "Chip Huyen",
    layer: 2,
    domains: ["evals", "context", "orchestration"],
    role: "Author, AI Engineering (O'Reilly 2025)",
    handle: "@chipro",
    platform: "X · huyenchip.com",
    description:
      "Wrote 'AI Engineering' — #1 most-read book on O'Reilly 2025. Cited by swyx for context + agents. Active original long-form writing. Endorsed by Hamel Husain in book acknowledgments.",
    inbound: 8,
  },
  {
    id: "dbreunig",
    name: "D. Breunig",
    fullName: "David Breunig",
    layer: 2,
    domains: ["context", "orchestration"],
    role: "Analyst & Writer, dbreunig.com",
    handle: "@dbreunig",
    platform: "X · dbreunig.com",
    description:
      "Wrote 'How Contexts Fail and How to Fix Them' — foundational piece Lance Martin's LS episode was structured around. Active analyst of agent reliability. Dec 2025 post on enterprise agents.",
    inbound: 5,
  },
  {
    id: "nathan",
    name: "Nathan Lambert",
    fullName: "Nathan Lambert",
    layer: 2,
    domains: ["evals"],
    role: "Researcher · Interconnects Newsletter",
    handle: "@natolambert",
    platform: "X · interconnects.ai",
    description:
      "Runs Interconnects — most-cited newsletter on post-training and evals. Appeared with swyx on SAIL Live #6 Feb 2026. Bridges research-to-production evals thinking.",
    inbound: 5,
  },
  {
    id: "karpathy",
    name: "A. Karpathy",
    fullName: "Andrej Karpathy",
    layer: 2,
    domains: ["aidev", "context"],
    role: "Independent Researcher · nanochat · vibe coding",
    handle: "@karpathy",
    platform: "X · karpathy.ai",
    description:
      "Coined 'vibe coding'. Building nanochat (from-scratch LLM). Simon Willison tags him 39 times in 2025-2026. Sets the conceptual vocabulary the field adopts. Very active through March 2026.",
    inbound: 7,
  },
];

const EDGES = [
  {
    source: "swyx",
    target: "alessio",
    weight: 3,
    label: "Co-hosts Latent Space",
  },
  {
    source: "swyx",
    target: "simon",
    weight: 2.5,
    label: "Recurring LS guest · AIE keynote best-of-conference 2025",
  },
  {
    source: "swyx",
    target: "harrison",
    weight: 2.5,
    label: "LS guest · AIE Summit · LangChain community",
  },
  {
    source: "swyx",
    target: "hamel",
    weight: 2,
    label: "AIE speaker · evals community",
  },
  {
    source: "swyx",
    target: "shreya",
    weight: 2,
    label: "AIE speaker · evals overlap",
  },
  {
    source: "swyx",
    target: "eugene",
    weight: 2,
    label: "LS about page endorsement",
  },
  {
    source: "swyx",
    target: "jason",
    weight: 2,
    label: "Evals community discourse",
  },
  {
    source: "swyx",
    target: "jeremy",
    weight: 2,
    label: "LS guest · Answer.ai",
  },
  {
    source: "swyx",
    target: "dex",
    weight: 2,
    label: "AIE Summit · coined context engineering",
  },
  {
    source: "swyx",
    target: "sasha",
    weight: 1.5,
    label: "AIE World's Fair 2025 keynote",
  },
  {
    source: "swyx",
    target: "beyang",
    weight: 1.5,
    label: "3x AIE Top Speaker",
  },
  {
    source: "swyx",
    target: "yegge",
    weight: 1.5,
    label: "AIE Code Summit · IDE talk",
  },
  {
    source: "swyx",
    target: "leerob",
    weight: 1.5,
    label: "AIE Code Summit · Cursor",
  },
  {
    source: "swyx",
    target: "catasta",
    weight: 1.5,
    label: "AIE Code Summit · Replit",
  },
  {
    source: "swyx",
    target: "brennan",
    weight: 1.5,
    label: "AIE Code Summit · OpenHands",
  },
  {
    source: "swyx",
    target: "lance",
    weight: 2,
    label: "Dedicated LS episode on context engineering",
  },
  {
    source: "swyx",
    target: "chip",
    weight: 2,
    label: "LS reading list · cited for context + agents",
  },
  {
    source: "swyx",
    target: "nathan",
    weight: 1.5,
    label: "SAIL Live collab Feb 2026",
  },
  {
    source: "swyx",
    target: "karpathy",
    weight: 1.5,
    label: "Community discourse · vibe coding era",
  },
  {
    source: "hamel",
    target: "shreya",
    weight: 3,
    label: "Co-teach AI Evals for Engineers course",
  },
  {
    source: "harrison",
    target: "shreya",
    weight: 2,
    label: "Research co-author (paper)",
  },
  {
    source: "harrison",
    target: "hamel",
    weight: 2,
    label: "LangSmith evals collaboration",
  },
  {
    source: "harrison",
    target: "lance",
    weight: 2.5,
    label: "LangChain colleagues · LS episode",
  },
  {
    source: "harrison",
    target: "dex",
    weight: 1.5,
    label: "Context / harness engineering discourse",
  },
  {
    source: "simon",
    target: "hamel",
    weight: 2,
    label: "Cites & amplifies regularly on blog",
  },
  {
    source: "simon",
    target: "eugene",
    weight: 1.5,
    label: "Mutual amplification",
  },
  {
    source: "simon",
    target: "karpathy",
    weight: 2,
    label: "39 Karpathy citations on blog 2025-2026",
  },
  {
    source: "simon",
    target: "chip",
    weight: 1.5,
    label: "Cited in AI engineering discourse",
  },
  {
    source: "simon",
    target: "dbreunig",
    weight: 1.5,
    label: "Cites context engineering analysis",
  },
  {
    source: "hamel",
    target: "jason",
    weight: 1.5,
    label: "Evals community discourse",
  },
  {
    source: "hamel",
    target: "chip",
    weight: 1.5,
    label: "Acknowledged in AI Engineering book",
  },
  {
    source: "eugene",
    target: "shreya",
    weight: 1.5,
    label: "Evals research overlap",
  },
  {
    source: "eugene",
    target: "chip",
    weight: 1.5,
    label: "Peer practitioner writing community",
  },
  {
    source: "jason",
    target: "chip",
    weight: 1.5,
    label: "AI engineering discourse overlap",
  },
  {
    source: "alessio",
    target: "harrison",
    weight: 1.5,
    label: "LS · agent architecture",
  },
  {
    source: "beyang",
    target: "yegge",
    weight: 2,
    label: "Sourcegraph colleagues · IDE thesis",
  },
  {
    source: "sasha",
    target: "leerob",
    weight: 1.5,
    label: "AIE Code Summit · Cursor Composer talk",
  },
  {
    source: "brennan",
    target: "beyang",
    weight: 1,
    label: "Open source coding agent ecosystem",
  },
  {
    source: "eno",
    target: "brennan",
    weight: 1,
    label: "Production coding agent discourse",
  },
  {
    source: "catasta",
    target: "eno",
    weight: 1,
    label: "Autonomous agent design discourse",
  },
  {
    source: "dbreunig",
    target: "lance",
    weight: 2.5,
    label: "'How Contexts Fail' cited in Lance's LS episode",
  },
  {
    source: "dbreunig",
    target: "dex",
    weight: 1.5,
    label: "Context engineering term overlap",
  },
  {
    source: "nathan",
    target: "hamel",
    weight: 1.5,
    label: "Evals / post-training practitioner overlap",
  },
  {
    source: "nathan",
    target: "chip",
    weight: 1,
    label: "AI engineering evals overlap",
  },
  {
    source: "karpathy",
    target: "yegge",
    weight: 1.5,
    label: "AI-assisted dev discourse · vibe coding era",
  },
  {
    source: "karpathy",
    target: "leerob",
    weight: 1,
    label: "Coding agent ecosystem",
  },
  {
    source: "chip",
    target: "harrison",
    weight: 1.5,
    label: "AI engineering ecosystem",
  },
];

function getDomColor(domains) {
  return DOMAINS[domains[0]]?.color || "#aaa";
}
const LAYER_LABEL_COLORS = {
  0: "#e8f4ff",
  1: "rgba(180,205,225,0.85)",
  2: "rgba(140,175,200,0.65)",
};

export default function App() {
  const svgRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [domFilters, setDomFilters] = useState(new Set(Object.keys(DOMAINS)));
  const [layerFilter, setLayerFilter] = useState(new Set([0, 1, 2]));
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [dims, setDims] = useState({ w: 900, h: 580 });

  useEffect(() => {
    const upd = () =>
      setDims({
        w: Math.min(window.innerWidth, 1100),
        h: Math.max(window.innerHeight - 200, 480),
      });
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const { w, h } = dims;
    const visNodes = PEOPLE.filter(
      (n) =>
        n.domains.some((d) => domFilters.has(d)) && layerFilter.has(n.layer),
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

    const sim = d3
      .forceSimulation(nodeData)
      .force(
        "link",
        d3
          .forceLink(edgeData)
          .id((d) => d.id)
          .distance((d) => 145 - d.weight * 13)
          .strength(0.4),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force(
        "collide",
        d3.forceCollide().radius((d) => getR(d) + 22),
      );

    function getR(d) {
      return d.anchor ? 30 : 9 + d.inbound * 1.6;
    }

    const links = svg
      .append("g")
      .selectAll("line")
      .data(edgeData)
      .join("line")
      .attr("stroke", (d) => {
        const s = nodeData.find((n) => n.id === (d.source.id || d.source));
        return s ? getDomColor(s.domains) : "rgba(255,255,255,0.1)";
      })
      .attr("stroke-opacity", 0.15)
      .attr("stroke-width", (d) => Math.sqrt(d.weight) * 1.2)
      .style("cursor", "pointer")
      .on("mouseenter", function (ev, d) {
        d3.select(this)
          .attr("stroke-opacity", 0.85)
          .attr("stroke-width", Math.sqrt(d.weight) * 2.5);
        setHoveredEdge(d);
      })
      .on("mouseleave", function (ev, d) {
        d3.select(this)
          .attr("stroke-opacity", 0.15)
          .attr("stroke-width", Math.sqrt(d.weight) * 1.2);
        setHoveredEdge(null);
      });

    const nodeG = svg
      .append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
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
          }),
      )
      .on("click", (ev, d) => {
        ev.stopPropagation();
        setSelected((p) => (p?.id === d.id ? null : d));
      });

    nodeG.each(function (d) {
      const g = d3.select(this);
      const r = getR(d),
        rw = d.anchor ? 7 : 4,
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
      d.domains.forEach((dom, i) => {
        const seg = d.domains.length,
          arcPad = 0.1;
        const sa = (i / seg) * Math.PI * 2 - Math.PI / 2 + arcPad,
          ea = ((i + 1) / seg) * Math.PI * 2 - Math.PI / 2 - arcPad;
        g.append("path")
          .attr(
            "d",
            d3
              .arc()
              .innerRadius(r + 2)
              .outerRadius(r + rw)
              .startAngle(sa)
              .endAngle(ea)(),
          )
          .attr("fill", DOMAINS[dom].color)
          .attr("opacity", isL2 ? 0.55 : 0.9);
      });
      if (isL2) {
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
        .attr("dy", r + rw + (d.anchor ? 14 : 11))
        .attr("text-anchor", "middle")
        .attr("fill", LAYER_LABEL_COLORS[d.layer] || "#c8d7e6")
        .attr("font-family", "'Courier New',monospace")
        .attr("font-size", d.anchor ? 13 : 10.5)
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
    svg.on("click", () => setSelected(null));

    sim.on("tick", () => {
      links
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      nodeG.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
    return () => sim.stop();
  }, [domFilters, layerFilter, dims]);

  const sp = PEOPLE.find((p) => p.id === selected?.id);
  const spEdges = sp
    ? EDGES.filter((e) => e.source === sp.id || e.target === sp.id)
    : [];

  const toggleDom = (key) =>
    setDomFilters((prev) => {
      const n = new Set(prev);
      if (n.has(key)) {
        if (n.size > 1) n.delete(key);
      } else n.add(key);
      return n;
    });
  const toggleLayer = (l) =>
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
        minHeight: "100vh",
        fontFamily: "'Courier New',monospace",
        color: "#c8d7e6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <div>
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
          <div
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#e8f4ff",
              letterSpacing: "0.06em",
            }}
          >
            NETWORK GRAPH v0.2 · {PEOPLE.length} NODES · {EDGES.length} EDGES
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { l: 0, label: "ANCHOR" },
              { l: 1, label: "LAYER 1" },
              { l: 2, label: "LAYER 2" },
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
                  padding: "3px 8px",
                  fontSize: 8,
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

      <div
        style={{
          padding: "7px 22px",
          display: "flex",
          gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.2)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
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
        {Object.entries(DOMAINS).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => toggleDom(key)}
            style={{
              background: domFilters.has(key)
                ? `${color}15`
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${domFilters.has(key) ? color + "80" : "rgba(255,255,255,0.07)"}`,
              color: domFilters.has(key) ? color : "rgba(200,215,230,0.28)",
              padding: "3px 10px",
              fontSize: 9,
              letterSpacing: "0.1em",
              cursor: "pointer",
              borderRadius: 2,
              fontFamily: "'Courier New',monospace",
              transition: "all 0.15s",
            }}
          >
            {label.toUpperCase()}
          </button>
        ))}
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
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <svg
            ref={svgRef}
            width={dims.w}
            height={dims.h}
            style={{ display: "block" }}
          />
          {hoveredEdge && (
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
                  ? hoveredEdge.source.id
                  : hoveredEdge.source}
                {" → "}
                {typeof hoveredEdge.target === "object"
                  ? hoveredEdge.target.id
                  : hoveredEdge.target}
              </span>
              {" · "}
              <span style={{ color: "rgba(200,215,230,0.7)" }}>
                {hoveredEdge.label}
              </span>
            </div>
          )}
        </div>

        {sp && (
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
            <div
              style={{
                fontSize: 8,
                color: "rgba(200,215,230,0.3)",
                letterSpacing: "0.15em",
                marginBottom: 10,
              }}
            >
              — NODE DOSSIER — LAYER {sp.layer === 0 ? "0 (ANCHOR)" : sp.layer}
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
              {sp.domains.map((d) => (
                <span
                  key={d}
                  style={{
                    background: `${DOMAINS[d].color}18`,
                    border: `1px solid ${DOMAINS[d].color}70`,
                    color: DOMAINS[d].color,
                    fontSize: 8,
                    padding: "2px 7px",
                    letterSpacing: "0.1em",
                    borderRadius: 2,
                  }}
                >
                  {DOMAINS[d].short}
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
                const dir = e.source === sp.id ? "→" : "←";
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
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "7px 22px",
          display: "flex",
          gap: 18,
          background: "rgba(0,0,0,0.35)",
          flexWrap: "wrap",
          alignItems: "center",
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
    </div>
  );
}
