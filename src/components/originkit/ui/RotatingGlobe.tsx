"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

// Ported from 原型教學轉code/design_handoff_architecture_site/建築事務所首頁.dc.html's
// mobile "rotating globe" hero widget (dark-mode palette only), trimmed down
// to a pure decorative visual for the 原型數位 chapter banner per explicit
// request:
//   - Drag-to-rotate kept, same inertia + slow idle-spin feel as the source.
//   - Pinch-zoom, search-to-node "fly to" animation, and dot/label
//     click-navigation are all removed — every node here is inert, this is
//     not a site-navigation widget on this page.
//   - The source widget's center "原型 × 未來" title (its own homepage
//     brand mark) is dropped too — this chapter banner already has its own
//     title elsewhere on the page, and reusing the homepage's title here
//     would read as a mismatched/duplicate brand mark.
//
// Node positions are placed once via the same golden-angle Fibonacci-sphere
// algorithm as the source (see computeSphereUnits below — special/regular
// nodes placed as two independent groups so the "chapter" nodes don't
// clump together, exactly per the source's hard-won comment on that bug),
// then just re-rotated every frame. DOM updates are written directly via
// refs — bypassing React re-render — exactly like the source widget's
// paintGlobe(), since pushing ~100 nodes through React state at 60fps would
// be wasteful.

type GlobeNode = { id: string; label: string };

// id + display label (mobileName where the source had one, else name) for
// every node in the source widget's nodeData, in the source's original
// order — hrefs/translations dropped since nothing here is clickable or
// multi-language.
const NODE_DATA: GlobeNode[] = [
  { id: "r105", label: "2025成大建築×台南硓𥑮石．芳宅展" },
  { id: "r106", label: "2025 台南建築三年展衛星展" },
  { id: "r107", label: "2025ADA新銳建築獎×台南硓𥑮石．芳宅" },
  { id: "r108", label: "2025台南硓𥑮石．芳宅×原型未來展" },
  { id: "r116", label: "2025好感空間展" },
  { id: "r101", label: "原型展覽" },
  { id: "r110", label: "嘉義實驗木場" },
  { id: "r111", label: "馬祖東莒55光影美術館" },
  { id: "r112", label: "南寧老屋" },
  { id: "r113", label: "原型1號宅" },
  { id: "r114", label: "台南咾咕石芳宅" },
  { id: "r2", label: "原型教學" },
  { id: "r3", label: "實習" },
  { id: "r7", label: "設計方法" },
  { id: "r8", label: "工作文化" },
  { id: "r9", label: "大事記" },
  { id: "r11", label: "原型數位" },
  { id: "r134", label: "專題" },
  { id: "r16", label: "SDG" },
  { id: "r28", label: "成 construction" },
  { id: "r17", label: "海之博物館" },
  { id: "r18", label: "東京國際" },
  { id: "r19", label: "橫濱大棧橋" },
  { id: "r20", label: "原型三時期" },
  { id: "r21", label: "一人" },
  { id: "r15", label: "原型原點" },
  { id: "r22", label: "原型建築+原型結構" },
  { id: "r23", label: "原型結構" },
  { id: "r24", label: "木構造" },
  { id: "r25", label: "竹構造" },
  { id: "r26", label: "RC構造" },
  { id: "r27", label: "鋼構造" },
  { id: "r29", label: "媒體報導" },
  { id: "r30", label: "媽祖宗教文化園區眺望台" },
  { id: "r32", label: "雲林農博微笑餐廳" },
  { id: "r33", label: "構竹林鐵" },
  { id: "r35", label: "X-SITE 「未知質域」" },
  { id: "r36", label: "X-SITE「浮光之間」" },
  { id: "r37", label: "X-SITE 「膜」" },
  { id: "r38", label: "X-SITE 「爆炸容器」" },
  { id: "r39", label: "X-SITE 「藍屋」" },
  { id: "r40", label: "X-SITE 「途中」" },
  { id: "r59", label: "法 structure data" },
  { id: "r117", label: "2024 X-SITE 「林木林」獲獎" },
  { id: "r41", label: "左鎮菜寮化石文化園區" },
  { id: "r43", label: "金門水頭港遊客服務中心" },
  { id: "r58", label: "舊屋力競賽" },
  { id: "r127", label: "2026舊屋力永續創新提案競賽" },
  { id: "r115", label: "原型獲獎" },
  { id: "r60", label: "2013雲林農博" },
  { id: "r61", label: "新營服務區休息站" },
  { id: "r62", label: "2014 宜蘭中山小巨蛋" },
  { id: "r64", label: "2015 德光教會" },
  { id: "r66", label: "大溪木構造教堂" },
  { id: "r67", label: "2016 嘉義美術館" },
  { id: "r70", label: "嘉義火車站前雨遮" },
  { id: "r71", label: "台中橋" },
  { id: "r72", label: "橘月民宿" },
  { id: "r73", label: "ENISHI 澎湖緣宿" },
  { id: "r76", label: "故宮南院_覽月橋" },
  { id: "r79", label: "柳營車站" },
  { id: "r81", label: "太平國小" },
  { id: "r82", label: "台南市安平樹屋2.0" },
  { id: "r86", label: "友愛街立體停車場" },
  { id: "r88", label: "PARK2草悟廣場" },
  { id: "r89", label: "嘉義火車站前廣場改建" },
  { id: "r100", label: "構technics" },
  { id: "r92", label: "億載金城入口意象" },
  { id: "r93", label: "大阪世博TW館" },
  { id: "r94", label: "「弦閣」(KATENARA)" },
  { id: "r95", label: "萬大電廠辦公大樓" },
  { id: "r96", label: "繁花之頂" },
  { id: "r97", label: "長榮堂 長榮大學竹構集會堂" },
  { id: "r119", label: "台中馬禮遜美國學校" },
  { id: "r120", label: "見晴竹韻" },
  { id: "r121", label: "招霧亭" },
  { id: "r122", label: "遠雄永續接待中心" },
  { id: "r123", label: "漂浮會議室" },
  { id: "r124", label: "【旭日東昇】顏水龍壁畫檢測及結構補強" },
  { id: "r109", label: "原型建築" },
  { id: "r135", label: "台南硓𥑮石．芳宅" },
  { id: "r125", label: "石壁竹創森二期－杉嵐景觀台" },
  { id: "r126", label: "鹽埔漁港公廁" },
  { id: "r128", label: "夢湖湧泉" },
  { id: "r129", label: "新竹圖書館競圖" },
  { id: "r130", label: "原型結構事務所" },
  { id: "r131", label: "石壁竹創森二期－圓竹" },
  { id: "r132", label: "石壁竹創森二期－竹虹" },
  { id: "r133", label: "竹行動展覽館" },
  { id: "r98", label: "國立歷史博物館修復及再利用" },
  { id: "r99", label: "大巨蛋公共藝術「雨生光芽」" },
  { id: "r91", label: "構竹林鐵" },
  { id: "r84", label: "構竹林鐵" },
  { id: "r1", label: "章 architecture design" },
  { id: "r118", label: "嘉義城市博覽會生態牆：重生" },
  { id: "r104", label: "第七屆ADA新銳建築獎展覽" },
];

// Same connection graph as the source (drives per-node dot radius via
// degree, and the connecting lines drawn between nodes).
const EDGE_DATA: [string, string][] = [
  ["r105", "r101"], ["r106", "r101"], ["r107", "r101"], ["r108", "r101"],
  ["r116", "r23"], ["r116", "r24"], ["r116", "r67"], ["r116", "r101"],
  ["r116", "r114"], ["r101", "r118"], ["r101", "r111"], ["r101", "r113"],
  ["r101", "r114"], ["r101", "r112"], ["r101", "r133"], ["r110", "r109"],
  ["r111", "r109"], ["r112", "r109"], ["r113", "r109"], ["r114", "r24"],
  ["r114", "r109"], ["r2", "r3"], ["r2", "r7"], ["r2", "r8"], ["r2", "r9"],
  ["r134", "r109"], ["r134", "r23"], ["r134", "r24"], ["r134", "r25"],
  ["r134", "r26"], ["r134", "r27"], ["r16", "r15"], ["r17", "r15"],
  ["r18", "r15"], ["r19", "r15"], ["r20", "r15"], ["r21", "r15"],
  ["r15", "r23"], ["r15", "r22"], ["r23", "r24"], ["r23", "r25"],
  ["r23", "r26"], ["r23", "r27"], ["r23", "r61"], ["r23", "r62"],
  ["r23", "r64"], ["r23", "r67"], ["r23", "r70"], ["r23", "r71"],
  ["r23", "r72"], ["r23", "r73"], ["r23", "r76"], ["r23", "r79"],
  ["r23", "r86"], ["r23", "r91"], ["r23", "r94"], ["r23", "r95"],
  ["r23", "r60"], ["r23", "r66"], ["r23", "r81"], ["r23", "r82"],
  ["r23", "r88"], ["r23", "r89"], ["r23", "r92"], ["r23", "r93"],
  ["r23", "r96"], ["r23", "r97"], ["r23", "r98"], ["r23", "r99"],
  ["r23", "r119"], ["r23", "r120"], ["r23", "r121"], ["r23", "r122"],
  ["r23", "r123"], ["r23", "r126"], ["r23", "r130"], ["r23", "r131"],
  ["r23", "r132"], ["r23", "r133"], ["r23", "r135"], ["r24", "r118"],
  ["r24", "r64"], ["r24", "r67"], ["r24", "r71"], ["r24", "r39"],
  ["r24", "r41"], ["r24", "r66"], ["r24", "r81"], ["r24", "r95"],
  ["r24", "r119"], ["r24", "r127"], ["r24", "r130"], ["r24", "r135"],
  ["r25", "r91"], ["r25", "r92"], ["r25", "r60"], ["r25", "r84"],
  ["r25", "r96"], ["r25", "r97"], ["r25", "r120"], ["r25", "r121"],
  ["r25", "r122"], ["r25", "r125"], ["r25", "r131"], ["r25", "r132"],
  ["r25", "r133"], ["r26", "r72"], ["r26", "r76"], ["r26", "r73"],
  ["r26", "r130"], ["r26", "r135"], ["r27", "r37"], ["r27", "r38"],
  ["r27", "r40"], ["r27", "r43"], ["r27", "r61"], ["r27", "r70"],
  ["r27", "r79"], ["r27", "r94"], ["r27", "r35"], ["r27", "r36"],
  ["r27", "r62"], ["r27", "r82"], ["r27", "r86"], ["r27", "r88"],
  ["r27", "r89"], ["r27", "r93"], ["r27", "r98"], ["r27", "r99"],
  ["r27", "r117"], ["r27", "r123"], ["r27", "r124"], ["r27", "r126"],
  ["r27", "r128"], ["r27", "r129"], ["r27", "r130"], ["r27", "r135"],
  ["r30", "r115"], ["r32", "r115"], ["r33", "r115"], ["r35", "r115"],
  ["r36", "r115"], ["r37", "r115"], ["r38", "r115"], ["r39", "r115"],
  ["r40", "r115"], ["r117", "r115"], ["r41", "r115"], ["r43", "r115"],
  ["r58", "r115"], ["r127", "r109"], ["r127", "r115"], ["r115", "r128"],
  ["r115", "r129"], ["r70", "r109"], ["r120", "r109"], ["r121", "r109"],
  ["r124", "r109"], ["r109", "r125"], ["r109", "r128"], ["r109", "r129"],
  ["r109", "r130"], ["r109", "r135"],
];

// The 11 "chapter/category" nodes, placed as their own Fibonacci-sphere
// group (see computeSphereUnits) and drawn in the accent gold color.
const SPECIAL_IDS = new Set([
  "r101", "r2", "r28", "r15", "r23", "r59", "r115", "r100", "r109", "r1",
]);

const DOT_SCALE = 1.18;
const SPHERE_RADIUS_VB = 260;
const BASE_FONT_SIZE = 15;
const CENTER = 450;

// Dark-mode-only palette (matches the source widget's isDarkMode branch —
// this site never renders a light mode, so no ternary needed here).
const LINE_COLOR = "oklch(0.25 0 0)";
const DOT_COLOR = "oklch(0.95 0 0)";
const LABEL_COLOR = "oklch(0.95 0 0)";
const SPECIAL_COLOR = "#BDA434";

type Vec3 = { x: number; y: number; z: number };

function computeDegree(): Record<string, number> {
  const degree: Record<string, number> = {};
  NODE_DATA.forEach((d) => (degree[d.id] = 0));
  EDGE_DATA.forEach(([a, b]) => {
    if (a in degree) degree[a]++;
    if (b in degree) degree[b]++;
  });
  return degree;
}

function computeNodeRadiusMap(): Record<string, number> {
  const degree = computeDegree();
  const maxDegree = Math.max(1, ...Object.values(degree));
  const rMin = 4;
  const rMax = 24;
  const map: Record<string, number> = {};
  NODE_DATA.forEach((d) => {
    map[d.id] = rMin + (degree[d.id] / maxDegree) * (rMax - rMin);
  });
  return map;
}

// Golden-angle Fibonacci sphere placement. Special/regular nodes are placed
// as two independent groups (each running its own i=0..n-1 sequence) so the
// 10 chapter nodes spread evenly across the whole sphere instead of
// clustering — see the source widget's comment on this for the full
// derivation of why a shared/interleaved index sequence doesn't work.
function computeSphereUnits(): Record<string, Vec3> {
  const specialList = NODE_DATA.filter((d) => SPECIAL_IDS.has(d.id));
  const regularList = NODE_DATA.filter((d) => !SPECIAL_IDS.has(d.id));
  const units: Record<string, Vec3> = {};
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const placeGroup = (list: GlobeNode[]) => {
    const n = list.length;
    list.forEach((d, i) => {
      const y = 1 - (2 * i + 1) / n;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      units[d.id] = { x: Math.cos(theta) * rAtY, y, z: Math.sin(theta) * rAtY };
    });
  };
  placeGroup(specialList);
  placeGroup(regularList);
  return units;
}

function rotateProject(u: Vec3, yaw: number, pitch: number): Vec3 {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = u.x * cosY + u.z * sinY;
  const z1 = -u.x * sinY + u.z * cosY;
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = u.y * cosP - z1 * sinP;
  const z2 = u.y * sinP + z1 * cosP;
  return { x: x1, y: y2, z: z2 };
}

const NODE_RADIUS = computeNodeRadiusMap();
const SPHERE_UNITS = computeSphereUnits();

type NodeRefs = {
  group: SVGGElement | null;
  dot: SVGCircleElement | null;
  labelWrap: SVGGElement | null;
  fo: SVGForeignObjectElement | null;
  div: HTMLDivElement | null;
};

export default function RotatingGlobe({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const edgeRefs = useRef<Map<string, SVGLineElement>>(new Map());
  const nodeRefs = useRef<Map<string, NodeRefs>>(new Map());

  const getNodeRefs = (id: string): NodeRefs => {
    let entry = nodeRefs.current.get(id);
    if (!entry) {
      entry = { group: null, dot: null, labelWrap: null, fo: null, div: null };
      nodeRefs.current.set(id, entry);
    }
    return entry;
  };

  // Instance-style mutable rotation state, mirroring the source widget's
  // fields — kept in a ref (not React state) since it's written every
  // frame and doesn't need to trigger re-renders.
  const stateRef = useRef({
    yaw: 0,
    pitch: 0,
    velYaw: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    let raf = 0;

    const paint = () => {
      NODE_DATA.forEach((d) => {
        const u = SPHERE_UNITS[d.id];
        const p = rotateProject(u, s.yaw, s.pitch);
        const depthT = (p.z + 1) / 2;
        const scale = 0.5 + depthT * 0.8;
        const baseR = NODE_RADIUS[d.id] * DOT_SCALE;
        const r = baseR * scale;
        const screenX = CENTER + p.x * SPHERE_RADIUS_VB;
        const screenY = CENTER + p.y * SPHERE_RADIUS_VB;
        const isRight = p.x >= 0;
        const fontSize = Math.round(BASE_FONT_SIZE * Math.min(1.25, Math.max(0.8, scale)));
        const labelGap = 12;
        const labelPointX = screenX + (isRight ? 1 : -1) * (r + labelGap);
        const isSpecial = SPECIAL_IDS.has(d.id);
        const dotFill = isSpecial ? SPECIAL_COLOR : DOT_COLOR;
        const labelColor = isSpecial ? SPECIAL_COLOR : LABEL_COLOR;
        const labelVisible = depthT > 0.72;
        const depthOpacity = 0.15 + depthT * 0.85;

        const refs = getNodeRefs(d.id);
        if (refs.dot) {
          refs.dot.setAttribute("cx", String(screenX));
          refs.dot.setAttribute("cy", String(screenY));
          refs.dot.setAttribute("r", String(r));
          refs.dot.setAttribute("fill", dotFill);
        }
        if (refs.group) refs.group.style.opacity = String(depthOpacity);
        if (refs.labelWrap) refs.labelWrap.style.display = labelVisible ? "" : "none";
        if (refs.fo) {
          const boxW = Math.max(140, d.label.length * fontSize + 16);
          const boxH = fontSize * 1.4 + 4;
          refs.fo.setAttribute("x", String(isRight ? labelPointX : labelPointX - boxW));
          refs.fo.setAttribute("y", String(screenY - boxH / 2));
          refs.fo.setAttribute("width", String(boxW));
          refs.fo.setAttribute("height", String(boxH));
        }
        if (refs.div) {
          refs.div.style.fontSize = fontSize + "px";
          refs.div.style.textAlign = isRight ? "left" : "right";
          refs.div.style.color = labelColor;
        }
      });

      EDGE_DATA.forEach(([a, b], i) => {
        const ua = SPHERE_UNITS[a];
        const ub = SPHERE_UNITS[b];
        if (!ua || !ub) return;
        const pa = rotateProject(ua, s.yaw, s.pitch);
        const pb = rotateProject(ub, s.yaw, s.pitch);
        const avgDepth = ((pa.z + 1) / 2 + (pb.z + 1) / 2) / 2;
        const el = edgeRefs.current.get("e" + i);
        if (!el) return;
        el.setAttribute("x1", String(CENTER + pa.x * SPHERE_RADIUS_VB));
        el.setAttribute("y1", String(CENTER + pa.y * SPHERE_RADIUS_VB));
        el.setAttribute("x2", String(CENTER + pb.x * SPHERE_RADIUS_VB));
        el.setAttribute("y2", String(CENTER + pb.y * SPHERE_RADIUS_VB));
        el.style.opacity = String(0.04 + avgDepth * 0.5);
      });
    };

    // Idle spin + inertia decay every frame (skipped while actively
    // dragging, matching the source's globeTick()). No pinch-zoom, no
    // search "fly to" animation — both removed per explicit request.
    const tick = () => {
      if (!s.dragging) {
        s.velYaw *= 0.94;
        if (Math.abs(s.velYaw) < 0.0006) s.velYaw = 0;
        const idleSpeed = 0.0022;
        s.yaw += s.velYaw + idleSpeed;
        paint();
      }
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      const sens = 0.012;
      s.yaw += dx * sens;
      s.velYaw = dx * sens;
      s.pitch -= dy * sens;
      paint();
    };
    const onPointerUp = () => {
      s.dragging = false;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
    const onPointerDown = (e: PointerEvent) => {
      s.dragging = true;
      s.velYaw = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    };

    const surface = surfaceRef.current;
    surface?.addEventListener("pointerdown", onPointerDown);

    paint();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      surface?.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={surfaceRef}
      className={className}
      style={{
        touchAction: "none",
        cursor: "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        ...style,
      }}
    >
      <svg viewBox="0 0 900 900" width="100%" height="100%" style={{ overflow: "visible" }}>
        {EDGE_DATA.map((_edge, i) => (
          <line
            key={"e" + i}
            ref={(el) => {
              if (el) edgeRefs.current.set("e" + i, el);
            }}
            stroke={LINE_COLOR}
            strokeWidth={2}
          />
        ))}
        {NODE_DATA.map((d) => (
          <g
            key={d.id}
            ref={(el) => {
              getNodeRefs(d.id).group = el;
            }}
          >
            <circle
              ref={(el) => {
                getNodeRefs(d.id).dot = el;
              }}
              fill={DOT_COLOR}
            />
            <g
              ref={(el) => {
                getNodeRefs(d.id).labelWrap = el;
              }}
            >
              <foreignObject
                ref={(el) => {
                  getNodeRefs(d.id).fo = el;
                }}
                style={{ overflow: "visible" }}
              >
                <div
                  ref={(el) => {
                    getNodeRefs(d.id).div = el;
                  }}
                  style={{
                    fontFamily:
                      "'Helvetica Neue',Helvetica,Arial,'PingFang TC','Microsoft JhengHei',sans-serif",
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {d.label}
                </div>
              </foreignObject>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
