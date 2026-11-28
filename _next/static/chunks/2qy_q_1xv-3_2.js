(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,36429,e=>{"use strict";var t=e.i(43476),r=e.i(71645),a=e.i(22016);e.i(36180);var l=e.i(84477),o=e.i(63802),i=e.i(21052),n=e.i(51235);let s="America/Los_Angeles";function d(e){let t=new Date(e),r=new Intl.DateTimeFormat("en-US",{timeZone:s,year:"numeric",month:"2-digit",day:"2-digit",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:!1}).formatToParts(t),a={};for(let e of r)"literal"!==e.type&&(a[e.type]=e.value);let l=parseInt(a.hour,10);24===l&&(l=0);let o=parseInt(a.minute,10);return{dateKey:`${a.year}-${a.month}-${a.day}`,weekday:a.weekday,hour:l,minute:o,minutesOfDay:60*l+o}}function c(e){return new Intl.DateTimeFormat("en-US",{timeZone:s,hour:"numeric",minute:"2-digit",hour12:!0}).format(new Date(e))+" PT"}function g(e){let t=e.getUTCFullYear(),r=String(e.getUTCMonth()+1).padStart(2,"0"),a=String(e.getUTCDate()).padStart(2,"0");return`${t}${r}${a}`}async function b(e=40){let t,r=new Date,a=new Date(r.getTime()-24*e*36e5),l=`${g(a)}000000`,o=`${g(new Date(r.getTime()+864e5))}235959`,i=`https://ts-api.cnbc.com/harmony/app/bars/US10Y/5M/${l}/${o}/adjusted/EST5EDT.json`,n=new AbortController,s=setTimeout(()=>n.abort(),12e3);try{t=await fetch(i,{signal:n.signal})}finally{clearTimeout(s)}if(!t.ok)throw Error(`CNBC US10Y bars HTTP ${t.status}`);let p=await t.json();return function(e,t=Date.now()){let r=d(t),a=new Map;for(let t of e){let e=Number(t.tradeTimeinMills);if(!Number.isFinite(e))continue;let r=parseFloat(t.open),l=parseFloat(t.high),o=parseFloat(t.low),i=parseFloat(t.close);if([r,l,o,i].some(e=>!Number.isFinite(e)))continue;let n=d(e);"Sat"!==n.weekday&&"Sun"!==n.weekday&&(n.minutesOfDay<300||n.minutesOfDay>750||(a.has(n.dateKey)||a.set(n.dateKey,[]),a.get(n.dateKey).push({ms:e,minutesOfDay:n.minutesOfDay,open:r,high:l,low:o,close:i})))}let l=Array.from(a.keys()).sort(),o=[];for(let e of l){let t=a.get(e).sort((e,t)=>e.ms-t.ms);if(t.length<3)continue;let l=Number(t[0].open.toFixed(3)),i=t.find(e=>750===e.minutesOfDay),n=t[t.length-1],s=Number((i?i.open:n.close).toFixed(3)),d=t.filter(e=>e.minutesOfDay<750),g=d.length>0?d:t,b=g[0],m=g[0];for(let e of g)e.high>b.high&&(b=e),e.low<m.low&&(m=e);let p=Number(b.high.toFixed(3)),h=c(b.ms);s>p&&(p=s,h=i?"12:30 PM PT":c(n.ms));let u=Number(m.low.toFixed(3)),x=c(m.ms);if(s<u&&(u=s,x=i?"12:30 PM PT":c(n.ms)),p===u&&l===s&&e!==r.dateKey)continue;let f=e===r.dateKey&&r.minutesOfDay<750,y=Number(((s-l)*100).toFixed(1)),F=Number(((p-u)*100).toFixed(1));o.push({date:e,openingYield:l,intradayHigh:p,timeOfHigh:h,intradayLow:u,timeOfLow:x,closingYield:s,openToCloseBp:y,dailyChangeBp:null,intradayRangeBp:F,isLiveSession:f})}return m(o)}(p?.barData?.priceBars||[],r.getTime())}function m(e){let t=[...e].sort((e,t)=>e.date.localeCompare(t.date));for(let e=0;e<t.length;e++)if(0===e)t[e]={...t[e],dailyChangeBp:null};else{let r=t[e-1].closingYield,a=Number(((t[e].closingYield-r)*100).toFixed(1));t[e]={...t[e],dailyChangeBp:a}}return t.reverse()}function p(e){return null!=e&&Number.isFinite(e)?`${e>0?"+":e<0?"−":""}${Math.abs(e).toFixed(1)} bp`:"—"}function h({isOpen:e,onClose:a}){let[n,s]=(0,r.useState)([]),[d,c]=(0,r.useState)(!1),[g,u]=(0,r.useState)(!1),[x,f]=(0,r.useState)(""),[y,F]=(0,r.useState)(null),w=(0,r.useCallback)(async(e=!1)=>{e?u(!0):c(!0),f("");let t=[],r=(0,l.doc)(i.db,"marketWatch","us10yrDailyLog");try{let e=await (0,o.getDoc)(r);if(e.exists()){let r=e.data();Array.isArray(r.rows)&&r.rows.length>0&&(t=r.rows,s(t),r.updatedAt&&F(new Date(r.updatedAt)))}}catch(e){console.warn("Firestore daily log read warning:",e)}try{let e=await b(45);if(e.length>0){let r=function(e=[],t=[]){let r=new Map;for(let t of e)t&&t.date&&r.set(t.date,{...t});for(let e of t)e&&e.date&&r.set(e.date,{...e});return m(Array.from(r.values()))}(t,e);s(r);let a=new Date().toISOString();F(new Date(a))}}catch(e){console.warn("CNBC US10Y 5m bar fetch warning:",e),0===t.length&&f("Unable to load US 10-Year T-Note session log right now. Please try refreshing.")}finally{c(!1),u(!1)}},[]);if((0,r.useEffect)(()=>{e&&w(!1)},[e,w]),(0,r.useEffect)(()=>{if(!e)return;let t=document.body.style.overflow;document.body.style.overflow="hidden";let r=e=>{"Escape"===e.key&&a()};return window.addEventListener("keydown",r),()=>{document.body.style.overflow=t,window.removeEventListener("keydown",r)}},[e,a]),!e)return null;let v=e=>null==e||0===e?"tlog-bp-flat":e<0?"tlog-bp-favorable":"tlog-bp-pressure";return(0,t.jsxs)("div",{className:"tlog-backdrop",role:"dialog","aria-modal":"true","aria-labelledby":"tlog-modal-title",onClick:e=>{e.target===e.currentTarget&&a()},children:[(0,t.jsxs)("div",{className:"tlog-modal",children:[(0,t.jsxs)("div",{className:"tlog-header",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"tlog-kicker",children:"TRADEWEB US10Y • REFERENCE SESSION LOG"}),(0,t.jsx)("h2",{id:"tlog-modal-title",className:"tlog-title",children:"US 10-Year T-Note — Daily Trading Facts"}),(0,t.jsx)("p",{className:"tlog-subtitle",children:"5:00 AM Pacific open through 12:30 PM Pacific reference close • Most recent trading date on top"})]}),(0,t.jsxs)("div",{className:"tlog-header-actions",children:[(0,t.jsx)("button",{type:"button",className:"tlog-btn tlog-btn-ghost",onClick:()=>w(!0),disabled:g||d,children:g?"Refreshing...":"↻ Refresh"}),(0,t.jsx)("button",{type:"button",className:"tlog-btn tlog-btn-gold",onClick:()=>{if(!n.length)return;let e=new Blob([function(e){let t=e=>{let t=String(e??"");return t.includes(",")||t.includes('"')?`"${t.replace(/"/g,'""')}"`:t},r=[["Date","Opening Yield (5:00 AM PT)","Intraday High","Time of High","Intraday Low","Time of Low","Closing Yield (12:30 PM PT)","Open-to-Close Change (bp)","Daily Change vs Prev Close (bp)","Intraday Range (bp)"].map(t).join(",")];for(let a of e)r.push([a.date,`${a.openingYield.toFixed(3)}%`,`${a.intradayHigh.toFixed(3)}%`,a.timeOfHigh,`${a.intradayLow.toFixed(3)}%`,a.timeOfLow,`${a.closingYield.toFixed(3)}%${a.isLiveSession?" (Live)":""}`,a.openToCloseBp>0?`+${a.openToCloseBp.toFixed(1)}`:a.openToCloseBp.toFixed(1),null===a.dailyChangeBp?"":a.dailyChangeBp>0?`+${a.dailyChangeBp.toFixed(1)}`:a.dailyChangeBp.toFixed(1),a.intradayRangeBp.toFixed(1)].map(t).join(","));return r.join("\n")}(n)],{type:"text/csv;charset=utf-8;"}),t=URL.createObjectURL(e),r=document.createElement("a");r.href=t,r.download=`us-10yr-tnote-daily-log-${n[0]?.date||"export"}.csv`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(t)},disabled:!n.length,children:"⬇ Export CSV"}),(0,t.jsx)("button",{type:"button",className:"tlog-close-btn",onClick:a,"aria-label":"Close US 10-Year T-Note Daily Log",children:"✕"})]})]}),(0,t.jsxs)("div",{className:"tlog-meta-strip",children:[(0,t.jsxs)("div",{className:"tlog-meta-left",children:[(0,t.jsxs)("span",{className:"tlog-count-pill",children:[n.length," Trading ",1===n.length?"Day":"Days"," Logged"]}),y&&(0,t.jsxs)("span",{className:"tlog-synced-text",children:["Synced"," ",y.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})]})]}),(0,t.jsxs)("div",{className:"tlog-legend",children:[(0,t.jsxs)("span",{className:"tlog-legend-item",children:[(0,t.jsx)("span",{className:"tlog-dot tlog-dot-green"}),"−bp Yield Fell (Helps Rates)"]}),(0,t.jsxs)("span",{className:"tlog-legend-item",children:[(0,t.jsx)("span",{className:"tlog-dot tlog-dot-red"}),"+bp Yield Rose (Pressures Rates)"]})]})]}),(0,t.jsx)("div",{className:"tlog-table-wrap",children:d&&0===n.length?(0,t.jsx)("div",{className:"tlog-state-box",children:"Loading US 10-Year T-Note daily session history..."}):x&&0===n.length?(0,t.jsx)("div",{className:"tlog-state-box tlog-state-error",children:x}):(0,t.jsxs)("table",{className:"tlog-table",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{children:[(0,t.jsxs)("th",{className:"tlog-col-date",children:["Date",(0,t.jsx)("span",{className:"tlog-th-sub",children:"Trading date"})]}),(0,t.jsxs)("th",{children:["Opening Yield",(0,t.jsx)("span",{className:"tlog-th-sub",children:"5:00 AM Pacific"})]}),(0,t.jsxs)("th",{children:["Intraday High",(0,t.jsx)("span",{className:"tlog-th-sub",children:"Session high"})]}),(0,t.jsxs)("th",{children:["Time of High",(0,t.jsx)("span",{className:"tlog-th-sub",children:"Pacific time"})]}),(0,t.jsxs)("th",{children:["Intraday Low",(0,t.jsx)("span",{className:"tlog-th-sub",children:"Session low"})]}),(0,t.jsxs)("th",{children:["Time of Low",(0,t.jsx)("span",{className:"tlog-th-sub",children:"Pacific time"})]}),(0,t.jsxs)("th",{children:["Closing Yield",(0,t.jsx)("span",{className:"tlog-th-sub",children:"12:30 PM PT"})]}),(0,t.jsxs)("th",{children:["Open-to-Close",(0,t.jsx)("span",{className:"tlog-th-sub",children:"Change (bp)"})]}),(0,t.jsxs)("th",{children:["Daily Change",(0,t.jsx)("span",{className:"tlog-th-sub",children:"vs. Prev Close"})]}),(0,t.jsxs)("th",{children:["Intraday Range",(0,t.jsx)("span",{className:"tlog-th-sub",children:"High − Low (bp)"})]})]})}),(0,t.jsx)("tbody",{children:n.map(e=>(0,t.jsxs)("tr",{className:e.isLiveSession?"tlog-row-live":"",children:[(0,t.jsxs)("td",{className:"tlog-cell-date",children:[(0,t.jsx)("span",{children:function(e){if(!e||!/^\d{4}-\d{2}-\d{2}$/.test(e))return e||"—";let[t,r,a]=e.split("-").map(Number),l=new Date(Date.UTC(t,r-1,a,18,0,0));return new Intl.DateTimeFormat("en-US",{timeZone:"UTC",weekday:"short",month:"short",day:"numeric",year:"numeric"}).format(l)}(e.date)}),e.isLiveSession&&(0,t.jsx)("span",{className:"tlog-live-badge",children:"LIVE"})]}),(0,t.jsxs)("td",{className:"tlog-num",children:[e.openingYield.toFixed(3),"%"]}),(0,t.jsxs)("td",{className:"tlog-num tlog-high",children:[e.intradayHigh.toFixed(3),"%"]}),(0,t.jsx)("td",{className:"tlog-time",children:e.timeOfHigh}),(0,t.jsxs)("td",{className:"tlog-num tlog-low",children:[e.intradayLow.toFixed(3),"%"]}),(0,t.jsx)("td",{className:"tlog-time",children:e.timeOfLow}),(0,t.jsxs)("td",{className:"tlog-num tlog-close",children:[e.closingYield.toFixed(3),"%"]}),(0,t.jsx)("td",{className:`tlog-num tlog-bp ${v(e.openToCloseBp)}`,children:p(e.openToCloseBp)}),(0,t.jsx)("td",{className:`tlog-num tlog-bp ${v(e.dailyChangeBp)}`,children:p(e.dailyChangeBp)}),(0,t.jsxs)("td",{className:"tlog-num tlog-range",children:[e.intradayRangeBp.toFixed(1)," bp"]})]},e.date))})]})}),(0,t.jsx)("div",{className:"tlog-footer",children:"Derived from 5-minute Tradeweb US10Y intraday yield snapshots (1 basis point = 0.01% yield). Reference session spans 5:00 AM PT open to 12:30 PM PT close on active U.S. bond trading days."})]}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        .tlog-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(3, 16, 34, 0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
        }

        .tlog-modal {
          width: min(1240px, 96vw);
          max-height: 88vh;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 30px 70px rgba(3, 16, 34, 0.45);
          border: 1px solid rgba(15, 23, 42, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .tlog-header {
          background: linear-gradient(135deg, #061A33 0%, #0E2F59 100%);
          color: #FFFFFF;
          padding: 1.35rem 1.6rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          border-bottom: 2px solid #F2C230;
        }

        .tlog-kicker {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.1px;
          color: #F2C230;
          margin-bottom: 0.25rem;
        }

        .tlog-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.45rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 0.25rem 0;
          line-height: 1.2;
        }

        .tlog-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: rgba(241, 245, 249, 0.82);
        }

        .tlog-header-actions {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }

        .tlog-btn {
          padding: 0.48rem 0.9rem;
          border-radius: 9px;
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tlog-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .tlog-btn-ghost {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.24);
        }

        .tlog-btn-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .tlog-btn-gold {
          background: #F2C230;
          color: #061A33;
          border: 1px solid #F2C230;
        }

        .tlog-btn-gold:hover:not(:disabled) {
          background: #FAD152;
        }

        .tlog-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tlog-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tlog-meta-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 0.7rem 1.6rem;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          font-size: 0.8rem;
        }

        .tlog-meta-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tlog-count-pill {
          background: #061A33;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
        }

        .tlog-synced-text {
          color: #64748B;
          font-weight: 500;
        }

        .tlog-legend {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          color: #475569;
          font-weight: 600;
          font-size: 0.76rem;
        }

        .tlog-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .tlog-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .tlog-dot-green {
          background: #15803D;
        }

        .tlog-dot-red {
          background: #DC2626;
        }

        .tlog-table-wrap {
          flex: 1;
          overflow: auto;
          background: #FFFFFF;
        }

        .tlog-state-box {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #475569;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .tlog-state-error {
          color: #DC2626;
        }

        .tlog-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          min-width: 980px;
        }

        .tlog-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #F1F5F9;
          color: #0F172A;
          font-weight: 700;
          text-align: right;
          padding: 0.75rem 0.85rem;
          border-bottom: 2px solid #CBD5E1;
          white-space: nowrap;
          line-height: 1.25;
        }

        .tlog-table thead th.tlog-col-date {
          text-align: left;
          padding-left: 1.4rem;
        }

        .tlog-th-sub {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748B;
          margin-top: 0.15rem;
        }

        .tlog-table tbody tr {
          border-bottom: 1px solid #EEF2F7;
          transition: background 0.12s ease;
        }

        .tlog-table tbody tr:nth-child(even) {
          background: #FAFBFD;
        }

        .tlog-table tbody tr:hover {
          background: #EFF6FF;
        }

        .tlog-row-live {
          background: #FEFCE8 !important;
        }

        .tlog-table tbody td {
          padding: 0.68rem 0.85rem;
          white-space: nowrap;
        }

        .tlog-cell-date {
          text-align: left;
          padding-left: 1.4rem !important;
          font-weight: 700;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .tlog-live-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 0.12rem 0.42rem;
          border-radius: 4px;
          background: #F2C230;
          color: #061A33;
        }

        .tlog-num {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: #1E293B;
        }

        .tlog-time {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-variant-numeric: tabular-nums;
          font-size: 0.78rem;
          color: #64748B;
        }

        .tlog-close {
          font-weight: 700;
          color: #061A33;
        }

        .tlog-bp {
          font-weight: 700;
        }

        .tlog-bp-favorable {
          color: #15803D;
        }

        .tlog-bp-pressure {
          color: #DC2626;
        }

        .tlog-bp-flat {
          color: #64748B;
        }

        .tlog-range {
          color: #334155;
        }

        .tlog-footer {
          padding: 0.75rem 1.6rem;
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          font-size: 0.76rem;
          color: #64748B;
        }
      `}})]})}let u={"umbs-65":"Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower.","umbs-70":"Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates.","umbs-60":"Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing.","us-10yr":"U.S. 10-Year Treasury Note Yield (Tradeweb US10Y). A falling yield (-%) is typically favorable for mortgage interest rates."};e.s(["default",0,function(){let[e,s]=(0,r.useState)([]),[d,c]=(0,r.useState)(!0),[g,b]=(0,r.useState)(""),[m,p]=(0,r.useState)(null),[x,f]=(0,r.useState)("Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)"),[y,F]=(0,r.useState)("after-hours"),[w,v]=(0,r.useState)("Connecting..."),[j,k]=(0,r.useState)(null),[N,S]=(0,r.useState)("Prior Day Close"),[B,C]=(0,r.useState)(null),[E,T]=(0,r.useState)(!1),[A,D]=(0,r.useState)(()=>Date.now()),[M,U]=(0,r.useState)(null),[Y,z]=(0,r.useState)(!1),[R,L]=(0,r.useState)(!1);(0,r.useEffect)(()=>{let e=setInterval(()=>D(Date.now()),3e4);return()=>clearInterval(e)},[]),(0,r.useEffect)(()=>{let e=(0,l.doc)(i.db,"marketWatch","liveQuotes"),t=(0,o.onSnapshot)(e,e=>{if(z(!0),c(!1),e.exists()){var t;let r=e.data(),a=!!r.manualLock;T(a);let l=(t=r.instruments,Array.isArray(t)&&0!==t.length?t.map(e=>{let t="umbs-55"===e.id,r=t?"umbs-70":e.id,l="us-10yr"===r?a?"desk":"live":a?"desk":"modeled";return t?{...e,id:"umbs-70",title:"UMBS 30YR 7.0",subtitle:"30-Year 7.0% Coupon",type:"mbs",pricingType:e.pricingType||l,tooltip:u["umbs-70"]}:{...e,pricingType:e.pricingType||l,tooltip:e.tooltip||u[r]||""}}):[]);if(l.length>0?(s(l),b("")):(s([]),b("Market feed initialized without active instruments. Check back shortly.")),r.updatedAt){let e=new Date(r.updatedAt);p(isNaN(e.getTime())?null:e)}else p(null);f(r.sourceLabel||"Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)"),F(r.marketStatus||"after-hours"),v(r.marketStatusLabel||("open"===r.marketStatus?"Bond Market Open":"After Hours • Prior Close")),k(r.anchorDate||r.tradingDate||null),S(r.anchorSource||"Prior Day Close"),C(r.modelTelemetry||null)}else s([]),b("Live market feed has not been populated yet. Quotes appear automatically once the scheduled feed runs.")},e=>{console.warn("Firestore read-only listener error:",e),z(!1),c(!1),b("Unable to connect to the live market feed right now. Please refresh in a moment.")});return()=>t()},[]);let P=(e,t)=>{let r=Number(t)||0;return"yield"===e.type?`${r.toFixed(2)}%`:r.toFixed(2)},{dateStr:$,timeStr:O}=function(e){if(!e||isNaN(e.getTime()))return{dateStr:"—",timeStr:"—"};let t=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0"),a=e.getFullYear();return{dateStr:`${t}/${r}/${a}`,timeStr:e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}(m),I="open"===y&&m instanceof Date&&!isNaN(m.getTime())&&A-m.getTime()>6e5,H="lb-dot-slate",J=w;!Y&&d?(H="lb-dot-amber",J="Connecting..."):Y?I?(H="lb-dot-amber",J="Feed Delayed"):"open"===y?(H="",J=w||"Bond Market Open"):"holiday"===y&&(H="lb-dot-amber",J=w||"SIFMA Bond Holiday"):(H="lb-dot-amber",J="Disconnected");let K=e.find(e=>"umbs-60"===e.id)||e[0],W=(K?Math.round((K.last-K.open)*100):0)>=0,G=function(e){if(!e||!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let[t,r,a]=e.split("-");return`${r}/${a}/${t}`}(j),V=G?`Anchored to ${N} • ${G}`:`Anchored to ${N}`;return(0,t.jsxs)("main",{className:"lb-mbs-page",children:[(0,t.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@500;600;700&family=Montserrat:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",rel:"stylesheet"}),(0,t.jsxs)("section",{className:"lb-mbs-hero",children:[(0,t.jsx)("div",{className:"lb-glow lb-glow-gold"}),(0,t.jsx)("div",{className:"lb-glow lb-glow-blue"}),(0,t.jsx)("div",{className:"lb-container",children:(0,t.jsxs)("div",{className:"lb-hero-split",children:[(0,t.jsxs)("div",{className:"lb-hero-copy",children:[(0,t.jsxs)("h1",{className:"lb-hero-title",children:["Mortgage-Backed Securities &"," ",(0,t.jsx)("em",{children:"10-Year Treasury Watch"})]}),(0,t.jsxs)("p",{className:"lb-hero-sub",children:["Track live ",(0,t.jsx)("strong",{children:"Tradeweb U.S. 10-Year Treasury"})," yields alongside intraday ",(0,t.jsx)("strong",{children:"UMBS 30-Year (6.0%, 6.5%, 7.0%)"})," ","pricing modeled from 5Y/7Y/10Y key-rate moves and"," ",(0,t.jsx)("strong",{children:"MTBA"})," MBS spread action, anchored daily to prior closing levels."]}),(0,t.jsxs)("div",{className:"lb-controls-cluster",children:[(0,t.jsxs)("div",{className:"lb-live-status-pill",children:[(0,t.jsx)("span",{className:`lb-pulse-dot ${H}`}),(0,t.jsx)("span",{children:J}),Y&&"open"===y&&!I&&(0,t.jsx)("span",{className:"lb-countdown-tag",children:"Server 3m Sync"})]}),B?.isRollWindow&&(0,t.jsx)("div",{className:"lb-roll-pill",title:B.rollNote||"Monthly Class A UMBS TBA delivery-month roll window",children:(0,t.jsx)("span",{children:"⇄ Class A TBA Roll Window"})}),E&&(0,t.jsx)("div",{className:"lb-desk-lock-pill",children:(0,t.jsx)("span",{children:"Desk Override Active"})})]})]}),(0,t.jsxs)("div",{className:"lb-telemetry-card",children:[(0,t.jsxs)("div",{className:"lb-telemetry-row",children:[(0,t.jsx)("span",{className:"lb-telemetry-label",children:"LAST UPDATED"}),(0,t.jsxs)("div",{className:"lb-telemetry-datetime",children:[(0,t.jsx)("span",{className:"lb-date-badge",children:$}),(0,t.jsx)("span",{className:"lb-time-badge",children:O})]})]}),(0,t.jsx)("div",{className:"lb-telemetry-divider"}),(0,t.jsxs)("div",{className:"lb-telemetry-row",children:[(0,t.jsx)("span",{className:"lb-telemetry-label",children:"INTRADAY RATE BIAS"}),(0,t.jsx)("span",{className:`lb-sentiment-pill ${0===e.length?"lb-sent-neutral":W?"lb-sent-good":"lb-sent-defensive"}`,children:0===e.length?"Awaiting Market Snapshot":W?"▼ Favorable for Mortgage Rates (+bp)":"▲ Upward Rate Pressure (-bp)"})]}),(0,t.jsx)("div",{className:"lb-telemetry-divider"}),(0,t.jsxs)("div",{className:"lb-telemetry-row",children:[(0,t.jsx)("span",{className:"lb-telemetry-label",children:"DATA SOURCE"}),(0,t.jsx)("span",{className:"lb-source-value",children:x})]})]})]})})]}),(0,t.jsx)("section",{className:"lb-board-section",children:(0,t.jsxs)("div",{className:"lb-container",children:[B?.isRollWindow&&B?.rollNote&&(0,t.jsxs)("div",{className:"lb-roll-banner",role:"status",children:[(0,t.jsx)("strong",{children:"TBA Roll Notice:"})," ",B.rollNote]}),d?(0,t.jsxs)("div",{className:"lb-state-banner",children:[(0,t.jsx)("div",{className:"lb-state-spinner"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Connecting to live market watch..."}),(0,t.jsx)("p",{children:"Loading latest Tradeweb Treasury & UMBS benchmark quotes."})]})]}):g||0===e.length?(0,t.jsx)("div",{className:"lb-state-banner lb-state-warning",role:"alert",children:(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Market Feed Temporarily Unavailable"}),(0,t.jsx)("p",{children:g||"Live benchmark quotes are unavailable at the moment. Please check back shortly."})]})}):(0,t.jsx)("div",{className:"lb-bento-grid",children:e.map(e=>{let r,a=(e=>{if("mbs"===e.type){let t=Math.round((e.last-e.open)*100);return{sign:t>0?"+":t<0?"-":"",number:Math.abs(t).toString(),unit:"bp",isPositive:t>=0,isFavorableForRates:t>=0,rawDiff:t}}let t=e.last-e.open,r=Math.abs(t).toFixed(2).replace(/^0/,"");return{sign:t>0?"+":t<0?"-":"",number:r,unit:"%",isPositive:t>=0,isFavorableForRates:t<=0,rawDiff:t}})(e),l=a.isPositive?"lb-green":"lb-red",o=(r=(e.high||0)-(e.low||0))<=0?50:Math.max(6,Math.min(94,Math.round(((e.last||0)-(e.low||0))/r*100))),i="us-10yr"===e.id,n=e.pricingType||(i?"live":E?"desk":"modeled");return(0,t.jsxs)("article",{className:`lb-instrument-card${i?" lb-instrument-card-clickable":""}`,onClick:i?()=>L(!0):void 0,onKeyDown:i?e=>{("Enter"===e.key||" "===e.key)&&(e.preventDefault(),L(!0))}:void 0,role:i?"button":void 0,tabIndex:i?0:void 0,title:i?"Click to view US 10-Year T-Note Daily Session Log":void 0,children:[(0,t.jsxs)("header",{className:"lb-card-topbar",children:[(0,t.jsxs)("div",{className:"lb-card-title-group",children:[(0,t.jsx)("h2",{className:"lb-card-title",children:e.title}),(0,t.jsx)("span",{className:"lb-card-subtitle",children:e.subtitle}),(0,t.jsx)("span",{className:`lb-pricing-badge ${"live"===n?"lb-badge-live":"desk"===n?"lb-badge-desk":"lb-badge-modeled"}`,children:"live"===n?"Live Benchmark":"desk"===n?"Desk Override":"Intraday Model"})]}),(0,t.jsxs)("div",{className:"lb-card-topbar-right",children:[(0,t.jsx)("span",{className:"lb-card-last-pill",children:P(e,e.last)}),(0,t.jsx)("button",{type:"button",className:"lb-info-btn",title:e.tooltip,onClick:t=>{t.stopPropagation(),U(M===e.id?null:e.id)},"aria-label":`About ${e.title}`,children:"?"})]})]}),M===e.id&&(0,t.jsx)("div",{className:"lb-tooltip-banner",children:e.tooltip}),(0,t.jsxs)("div",{className:"lb-card-body",children:[(0,t.jsxs)("div",{className:"lb-change-column",children:[(0,t.jsxs)("span",{className:"lb-Updated-mini",children:["As of ",$," • ",O]}),!i&&(0,t.jsx)("span",{className:"lb-anchor-mini",children:V}),(0,t.jsxs)("div",{className:`lb-hero-metric ${l}`,children:[(0,t.jsxs)("span",{className:"lb-metric-number",children:[a.sign,a.number]}),(0,t.jsx)("span",{className:"lb-metric-unit",children:a.unit})]}),(0,t.jsx)("div",{className:"lb-impact-tag-wrap",children:(0,t.jsx)("span",{className:`lb-impact-tag ${a.isFavorableForRates?"lb-impact-favorable":"lb-impact-unfavorable"}`,children:"mbs"===e.type?a.isPositive?"Bond Price Up • Helps Rates":"Bond Price Down • Pressures Rates":a.isPositive?"Yield Up • Pressures Rates":"Yield Down • Helps Rates"})}),(0,t.jsxs)("div",{className:"lb-range-meter",children:[(0,t.jsxs)("div",{className:"lb-range-labels",children:[(0,t.jsxs)("span",{children:["Day Low: ",P(e,e.low)]}),(0,t.jsxs)("span",{children:["Day High: ",P(e,e.high)]})]}),(0,t.jsxs)("div",{className:"lb-range-track",children:[(0,t.jsx)("div",{className:`lb-range-fill ${l}`,style:{width:`${o}%`}}),(0,t.jsx)("div",{className:`lb-range-thumb ${l}`,style:{left:`${o}%`}})]})]})]}),(0,t.jsxs)("div",{className:"lb-stats-matrix",children:[(0,t.jsxs)("div",{className:"lb-stat-box",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"Open"}),(0,t.jsx)("span",{className:"lb-stat-val",children:P(e,e.open)})]}),(0,t.jsxs)("div",{className:"lb-stat-box lb-stat-highlight",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"Last"}),(0,t.jsx)("span",{className:"lb-stat-val",children:P(e,e.last)})]}),(0,t.jsxs)("div",{className:"lb-stat-box",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"High"}),(0,t.jsx)("span",{className:"lb-stat-val",children:P(e,e.high)})]}),(0,t.jsxs)("div",{className:"lb-stat-box",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"Low"}),(0,t.jsx)("span",{className:"lb-stat-val",children:P(e,e.low)})]})]}),(0,t.jsx)("div",{className:`lb-corner-wedge ${l}`})]}),i&&(0,t.jsxs)("div",{className:"lb-card-log-footer",children:[(0,t.jsx)("span",{children:"Daily Trading Session Log (5:00 AM – 12:30 PM PT)"}),(0,t.jsx)("span",{className:"lb-card-log-cta",children:"View Table →"})]})]},e.id)})}),(0,t.jsxs)("div",{className:"lb-explainer-bento",children:[(0,t.jsxs)("div",{className:"lb-explainer-card",children:[(0,t.jsx)("div",{className:"lb-exp-icon lb-exp-green",children:"bp"}),(0,t.jsx)("h3",{children:"How to Read UMBS Basis Points"}),(0,t.jsxs)("p",{children:["Mortgage rates and MBS bond prices move in"," ",(0,t.jsx)("strong",{children:"opposite directions"}),". When UMBS prices rise (",(0,t.jsx)("strong",{style:{color:"#00A804"},children:"+bp Green"}),"), bond investors pay a higher premium for mortgage-backed bonds, pushing retail mortgage rates ",(0,t.jsx)("strong",{children:"lower"}),". When UMBS falls by ",(0,t.jsx)("strong",{children:"-15bp to -25bp"})," intraday, lenders often reprice for the worse."]})]}),(0,t.jsxs)("div",{className:"lb-explainer-card",children:[(0,t.jsx)("div",{className:"lb-exp-icon lb-exp-gold",children:"10Y"}),(0,t.jsx)("h3",{children:"Why the 10-Year Treasury Matters"}),(0,t.jsxs)("p",{children:["Although 30-year mortgages have a 30-year term, the average mortgage is paid off or refinanced in 7–10 years. As a result, the ",(0,t.jsx)("strong",{children:"U.S. 10-Year T-Note Yield"})," serves as the primary benchmark competing for fixed-income capital alongside UMBS 6.0%, 6.5%, and 7.0% coupons."]})]}),(0,t.jsxs)("div",{className:"lb-explainer-card",children:[(0,t.jsx)("div",{className:"lb-exp-icon lb-exp-navy",children:"6.0–7.0"}),(0,t.jsx)("h3",{children:"Understanding the Coupon Stack"}),(0,t.jsxs)("p",{children:["Secondary market desks bundle loans into security coupons in 0.50% increments (",(0,t.jsx)("strong",{children:"UMBS 6.0, 6.5, and 7.0"}),"). A borrower’s note rate is typically 0.50%–1.125% above the underlying UMBS coupon to account for servicing fees and Fannie/Freddie guaranty fees."]})]})]}),(0,t.jsxs)("div",{className:"lb-advisory-banner",children:[(0,t.jsxs)("div",{className:"lb-advisory-text",children:[(0,t.jsx)("span",{className:"lb-advisory-kicker",children:"LOCK VS. FLOAT STRATEGY • TEAM INSIDER"}),(0,t.jsx)("h3",{children:"Wondering whether to lock your rate today or float into upcoming economic data?"}),(0,t.jsx)("p",{children:"David and Rakesh monitor intraday UMBS repricing thresholds and Treasury auctions directly to help you time your rate lock with confidence."})]}),(0,t.jsxs)("div",{className:"lb-advisory-actions",children:[(0,t.jsx)(a.default,{href:"/#contact",className:"lb-btn-gold",children:"Request a Rate Lock Review →"}),(0,t.jsx)(a.default,{href:"/geek-out/yield-curve",className:"lb-btn-outline",children:"Explore Yield Curve"})]})]}),(0,t.jsxs)("p",{className:"lb-compliance-footnote",children:["US 10-Year T-Note reflects live Tradeweb benchmark quotes. UMBS 30YR 6.0%, 6.5%, and 7.0% prices reflect server-side intraday models driven by 5Y/7Y/10Y Treasury key-rate duration, negative convexity, and live MTBA MBS spread movements anchored to prior closes (or desk overrides when active). Last Updated: ",(0,t.jsx)("strong",{children:$})," at"," ",(0,t.jsx)("strong",{children:O}),". Educational & informational use only; does not constitute a retail rate sheet or commitment to lend."]})]})}),(0,t.jsx)(n.default,{calculatorId:"calc-mbs",title:"Lock vs. Float & Loan Estimate Strategy Breakdowns",subtitle:"How MBS pricing, points, and lender credits work in practice.",background:"#FFFFFF"}),(0,t.jsx)(h,{isOpen:R,onClose:()=>L(!1)}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        .lb-mbs-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F4F7FB;
          color: #0F172A;
          min-height: 88vh;
          padding-bottom: 4.5rem;
        }

        .lb-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 4%;
          position: relative;
          z-index: 2;
        }

        /* =========================================================
           1. LAND-BOOK EDITORIAL COMMAND HERO
           ========================================================= */
        .lb-mbs-hero {
          position: relative;
          background: radial-gradient(circle at 85% 18%, #133B6E 0%, #061A33 55%, #031022 100%);
          color: #FFFFFF;
          padding: 2.5rem 0 5.25rem 0;
          overflow: hidden;
          border-bottom: 1px solid rgba(242, 194, 48, 0.22);
        }

        .lb-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 1;
        }

        .lb-glow-gold {
          width: 440px;
          height: 440px;
          background: rgba(242, 194, 48, 0.14);
          top: -120px;
          right: 6%;
        }

        .lb-glow-blue {
          width: 420px;
          height: 420px;
          background: rgba(56, 189, 248, 0.12);
          bottom: -140px;
          left: -80px;
        }

        .lb-controls-cluster {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .lb-live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.42rem 0.85rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.8rem;
          font-weight: 600;
          color: #E2E8F0;
        }

        .lb-roll-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: rgba(242, 194, 48, 0.14);
          border: 1px solid rgba(242, 194, 48, 0.4);
          font-size: 0.78rem;
          font-weight: 700;
          color: #F2C230;
          cursor: help;
        }

        .lb-desk-lock-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: rgba(56, 189, 248, 0.16);
          border: 1px solid rgba(56, 189, 248, 0.4);
          font-size: 0.78rem;
          font-weight: 700;
          color: #BAE6FD;
        }

        .lb-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 10px #22C55E;
          animation: lbPulse 2s infinite;
        }

        .lb-dot-amber {
          background: #F59E0B;
          box-shadow: none;
          animation: none;
        }

        .lb-dot-slate {
          background: #94A3B8;
          box-shadow: none;
          animation: none;
        }

        @keyframes lbPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .lb-countdown-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #F2C230;
          background: rgba(242, 194, 48, 0.14);
          padding: 0.1rem 0.45rem;
          border-radius: 6px;
        }

        /* Editorial Split Hero */
        .lb-hero-split {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 2.5rem;
          align-items: center;
        }

        .lb-hero-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2rem, 3.2vw, 2.95rem);
          font-weight: 700;
          line-height: 1.15;
          color: #FFFFFF;
          margin: 0 0 0.9rem 0;
          letter-spacing: -0.5px;
        }

        .lb-hero-title em {
          font-style: italic;
          color: #F2C230;
          font-weight: 600;
        }

        .lb-hero-sub {
          font-size: 1.04rem;
          line-height: 1.65;
          color: rgba(241, 245, 249, 0.86);
          margin: 0 0 1.35rem 0;
          max-width: 650px;
        }

        .lb-hero-sub strong {
          color: #FFFFFF;
        }

        /* Right Glassmorphic Telemetry Summary Card */
        .lb-telemetry-card {
          background: rgba(15, 32, 60, 0.76);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          padding: 1.35rem 1.5rem;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
        }

        .lb-telemetry-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .lb-telemetry-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94A3B8;
        }

        .lb-telemetry-datetime {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lb-date-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.92rem;
          font-weight: 700;
          color: #061A33;
          background: #F2C230;
          padding: 0.22rem 0.65rem;
          border-radius: 7px;
        }

        .lb-time-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.22rem 0.6rem;
          border-radius: 7px;
        }

        .lb-telemetry-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.85rem 0;
        }

        .lb-sentiment-pill {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.28rem 0.75rem;
          border-radius: 999px;
        }

        .lb-sent-good {
          background: rgba(34, 197, 94, 0.18);
          color: #4ADE80;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }

        .lb-sent-defensive {
          background: rgba(248, 113, 113, 0.18);
          color: #FCA5A5;
          border: 1px solid rgba(252, 165, 165, 0.35);
        }

        .lb-sent-neutral {
          background: rgba(148, 163, 184, 0.18);
          color: #CBD5E1;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }

        .lb-source-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: #E2E8F0;
          text-align: right;
        }

        /* =========================================================
           2. BENTO INSTRUMENT BOARD (OVERLAPPING HERO)
           ========================================================= */
        .lb-board-section {
          margin-top: -2.9rem;
          position: relative;
          z-index: 5;
        }

        .lb-roll-banner {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-left: 4px solid #F2C230;
          color: #78350F;
          border-radius: 12px;
          padding: 0.8rem 1.15rem;
          font-size: 0.86rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .lb-state-banner {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 2.25rem 1.75rem;
          margin-bottom: 2.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
        }

        .lb-state-banner strong {
          display: block;
          font-size: 1.05rem;
          color: #061A33;
          margin-bottom: 0.25rem;
        }

        .lb-state-banner p {
          margin: 0;
          font-size: 0.92rem;
          color: #475569;
        }

        .lb-state-warning {
          border-color: #FDE68A;
          background: #FFFBEB;
        }

        .lb-state-warning strong {
          color: #92400E;
        }

        .lb-state-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #E2E8F0;
          border-top-color: #061A33;
          border-radius: 50%;
          animation: lbSpin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes lbSpin {
          to { transform: rotate(360deg); }
        }

        /* 2x2 Bento Grid */
        .lb-bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.25rem;
        }

        .lb-instrument-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .lb-instrument-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 44px rgba(15, 23, 42, 0.11);
        }

        .lb-instrument-card-clickable {
          cursor: pointer;
          border-color: #CBD5E1;
        }

        .lb-instrument-card-clickable:hover,
        .lb-instrument-card-clickable:focus-visible {
          border-color: #F2C230;
          box-shadow: 0 22px 46px rgba(6, 26, 51, 0.16);
          outline: none;
        }

        .lb-card-log-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.6rem 1.35rem;
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
        }

        .lb-card-log-cta {
          color: #061A33;
          font-weight: 700;
          white-space: nowrap;
        }

        .lb-instrument-card-clickable:hover .lb-card-log-footer {
          background: #FFFBEB;
          border-top-color: #FDE68A;
          color: #061A33;
        }

        /* Card Header Bar */
        .lb-card-topbar {
          background: linear-gradient(90deg, #1E293B 0%, #334155 100%);
          color: #FFFFFF;
          padding: 0.9rem 1.35rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .lb-card-title-group {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }

        .lb-card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #FFFFFF;
          letter-spacing: -0.2px;
        }

        .lb-card-subtitle {
          font-size: 0.76rem;
          color: #CBD5E1;
          font-weight: 500;
        }

        .lb-pricing-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          padding: 0.16rem 0.5rem;
          border-radius: 999px;
          white-space: nowrap;
        }

        .lb-badge-live {
          background: rgba(34, 197, 94, 0.18);
          color: #86EFAC;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }

        .lb-badge-modeled {
          background: rgba(242, 194, 48, 0.15);
          color: #FDE68A;
          border: 1px solid rgba(242, 194, 48, 0.35);
        }

        .lb-badge-desk {
          background: rgba(56, 189, 248, 0.18);
          color: #BAE6FD;
          border: 1px solid rgba(56, 189, 248, 0.4);
        }

        .lb-card-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-shrink: 0;
        }

        .lb-card-last-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.05rem;
          font-weight: 700;
          color: #F2C230;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.22rem 0.65rem;
          border-radius: 8px;
          border: 1px solid rgba(242, 194, 48, 0.3);
        }

        .lb-info-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .lb-info-btn:hover {
          background: #F2C230;
          color: #061A33;
          border-color: #F2C230;
        }

        .lb-tooltip-banner {
          background: #0F172A;
          color: #F8FAFC;
          font-size: 0.82rem;
          line-height: 1.5;
          padding: 0.75rem 1.35rem;
          border-bottom: 1px solid #334155;
        }

        /* Card Body */
        .lb-card-body {
          position: relative;
          padding: 1.45rem 1.45rem 1.55rem 1.45rem;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 1.25rem;
          align-items: center;
          flex: 1;
        }

        .lb-change-column {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 0.75rem;
          border-right: 1px solid #E2E8F0;
        }

        .lb-Updated-mini {
          font-size: 0.73rem;
          font-weight: 600;
          color: #64748B;
          margin-bottom: 0.1rem;
        }

        .lb-anchor-mini {
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.25rem;
        }

        .lb-hero-metric {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
          line-height: 1;
          margin: 0.15rem 0 0.55rem 0;
        }

        .lb-metric-number {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(3rem, 4.3vw, 4.1rem);
          font-weight: 800;
          letter-spacing: -2px;
          font-variant-numeric: tabular-nums;
        }

        .lb-metric-unit {
          font-size: clamp(1.35rem, 2vw, 1.75rem);
          font-weight: 700;
        }

        .lb-green {
          color: #00B805;
        }

        .lb-red {
          color: #E11D48;
        }

        .lb-impact-tag-wrap {
          margin-bottom: 0.85rem;
        }

        .lb-impact-tag {
          display: inline-block;
          font-size: 0.73rem;
          font-weight: 700;
          padding: 0.22rem 0.6rem;
          border-radius: 6px;
        }

        .lb-impact-favorable {
          background: #DCFCE7;
          color: #15803D;
        }

        .lb-impact-unfavorable {
          background: #FFE4E6;
          color: #BE123C;
        }

        /* Intraday Low-to-High Range Bar */
        .lb-range-meter {
          width: 100%;
          max-width: 260px;
        }

        .lb-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748B;
          margin-bottom: 0.3rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .lb-range-track {
          position: relative;
          height: 6px;
          background: #E2E8F0;
          border-radius: 999px;
        }

        .lb-range-fill {
          height: 100%;
          border-radius: 999px;
        }

        .lb-range-fill.lb-green {
          background: linear-gradient(90deg, #86EFAC, #00B805);
        }

        .lb-range-fill.lb-red {
          background: linear-gradient(90deg, #FDA4AF, #E11D48);
        }

        .lb-range-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }

        .lb-range-thumb.lb-green {
          background: #00B805;
        }

        .lb-range-thumb.lb-red {
          background: #E11D48;
        }

        /* Right 2x2 Stats Matrix */
        .lb-stats-matrix {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .lb-stat-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 0.65rem 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .lb-stat-highlight {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .lb-stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #64748B;
          margin-bottom: 0.2rem;
        }

        .lb-stat-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.18rem;
          font-weight: 700;
          color: #0F172A;
          font-variant-numeric: tabular-nums;
        }

        /* Bottom-Right Directional Corner Triangle */
        .lb-corner-wedge {
          position: absolute;
          bottom: 7px;
          right: 7px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 18px 18px;
        }

        .lb-corner-wedge.lb-green {
          border-color: transparent transparent #00B805 transparent;
        }

        .lb-corner-wedge.lb-red {
          border-color: transparent transparent #E11D48 transparent;
        }

        /* =========================================================
           3. LAND-BOOK 3-COLUMN EXPLAINER BENTO & ADVISORY STRIP
           ========================================================= */
        .lb-explainer-bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.35rem;
          margin-bottom: 2rem;
        }

        .lb-explainer-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .lb-exp-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.75rem;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.9rem;
        }

        .lb-exp-green {
          background: #DCFCE7;
          color: #15803D;
        }

        .lb-exp-gold {
          background: #FEF3C7;
          color: #B45309;
        }

        .lb-exp-navy {
          background: #E0E7FF;
          color: #1D4ED8;
        }

        .lb-explainer-card h3 {
          font-size: 1.08rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.55rem 0;
        }

        .lb-explainer-card p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #475569;
          margin: 0;
        }

        /* Advisory Callout Banner */
        .lb-advisory-banner {
          background: linear-gradient(125deg, #061A33 0%, #0F294A 100%);
          border: 1px solid rgba(242, 194, 48, 0.35);
          border-radius: 22px;
          padding: 2rem 2.25rem;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          box-shadow: 0 18px 42px rgba(6, 26, 51, 0.18);
          margin-bottom: 1.5rem;
        }

        .lb-advisory-text {
          max-width: 680px;
        }

        .lb-advisory-kicker {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1.3px;
          color: #F2C230;
          margin-bottom: 0.4rem;
        }

        .lb-advisory-text h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.3rem, 2vw, 1.65rem);
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 0.45rem 0;
        }

        .lb-advisory-text p {
          font-size: 0.94rem;
          color: rgba(241, 245, 249, 0.85);
          margin: 0;
          line-height: 1.55;
        }

        .lb-advisory-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .lb-btn-gold {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.45rem;
          border-radius: 12px;
          background: #F2C230;
          color: #061A33;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 0.92rem;
          text-decoration: none;
          transition: transform 0.18s ease, background-color 0.18s ease;
        }

        .lb-btn-gold:hover {
          background: #FFCF40;
          transform: translateY(-2px);
        }

        .lb-btn-outline {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
        }

        .lb-btn-outline:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .lb-compliance-footnote {
          font-size: 0.78rem;
          color: #64748B;
          text-align: center;
          line-height: 1.55;
          margin: 0;
        }

        @media (max-width: 992px) {
          .lb-hero-split {
            grid-template-columns: 1fr;
          }
          .lb-bento-grid {
            grid-template-columns: 1fr;
          }
          .lb-explainer-bento {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 580px) {
          .lb-card-body {
            grid-template-columns: 1fr;
          }
          .lb-change-column {
            border-right: none;
            border-bottom: 1px solid #E2E8F0;
            padding-right: 0;
            padding-bottom: 1rem;
          }
        }
      `}})]})}],36429)}]);