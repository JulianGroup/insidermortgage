(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[876],{52512:(e,s,r)=>{Promise.resolve().then(r.bind(r,98587))},98587:(e,s,r)=>{"use strict";r.d(s,{default:()=>l});var a=r(95155),t=r(12115),i=r(98500),o=r.n(i);let n=[{id:"umbs-65",title:"UMBS 30YR 6.5",type:"mbs",open:100.96,last:101.55,high:101.64,low:100.96,tooltip:"Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower."},{id:"umbs-70",title:"UMBS 30YR 7.0",type:"mbs",open:103,last:103.46,high:103.59,low:103,tooltip:"Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Higher price (+bp) is favorable for mortgage rates."},{id:"umbs-60",title:"UMBS 30YR 6.0",type:"mbs",open:98.8,last:99.53,high:99.69,low:98.8,tooltip:"Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing."},{id:"us-10yr",title:"US 10-year T-Note",type:"yield",open:5.13,last:4.96,high:5.13,low:4.95,tooltip:"U.S. 10-Year Treasury Note Yield. A falling yield (-%) is typically favorable for mortgage interest rates."}];function l(){let[e,s]=(0,t.useState)(n),[r,i]=(0,t.useState)(null),[l,m]=(0,t.useState)(60),[d,c]=(0,t.useState)(!1),[b,p]=(0,t.useState)(null),h=(0,t.useCallback)(async()=>{c(!0);try{let e=new AbortController,r=setTimeout(()=>e.abort(),4500),a=null;try{let s=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5ETNX?interval=1m&range=1d",{signal:e.signal});if(s.ok){let e=await s.json(),r=e?.chart?.result?.[0]?.meta;r?.regularMarketPrice&&r?.chartPreviousClose&&(a={last:Number(r.regularMarketPrice),open:Number(r.chartPreviousClose),high:Number(r.regularMarketDayHigh||r.regularMarketPrice),low:Number(r.regularMarketDayLow||r.regularMarketPrice)})}}catch{}finally{clearTimeout(r)}s(e=>e.map(e=>{if("us-10yr"===e.id&&a)return{...e,open:Number(a.open.toFixed(2)),last:Number(a.last.toFixed(2)),high:Number(Math.max(a.high,a.last,a.open).toFixed(2)),low:Number(Math.min(a.low,a.last,a.open).toFixed(2))};let s="mbs"===e.type?(Math.floor(5*Math.random())-2)*.01:(Math.floor(3*Math.random())-1)*.01,r=Number((e.last+s).toFixed(2)),t=Number(Math.max(e.high,r).toFixed(2)),i=Number(Math.min(e.low,r).toFixed(2));return{...e,last:r,high:t,low:i}})),i(new Date),m(60)}finally{setTimeout(()=>c(!1),350)}},[]);(0,t.useEffect)(()=>{i(new Date);let e=setInterval(()=>{m(e=>e<=1?(h(),60):e-1)},1e3);return()=>clearInterval(e)},[h]);let g=(e,s)=>"yield"===e.type?`${s.toFixed(2)}%`:s.toFixed(2);return(0,a.jsxs)("main",{className:"mbs-watch-page",children:[(0,a.jsx)("div",{className:"mbs-topbar",children:(0,a.jsxs)("div",{className:"mbs-topbar-inner",children:[(0,a.jsxs)("div",{className:"mbs-brand",children:[(0,a.jsxs)("svg",{viewBox:"0 0 36 36",width:"32",height:"32",fill:"none",children:[(0,a.jsx)("path",{d:"M9 8c4.5-3.5 13.5-3.5 18 0",stroke:"#1E293B",strokeWidth:"2.5",strokeLinecap:"round"}),(0,a.jsx)("path",{d:"M12.5 12c3-2.2 8-2.2 11 0",stroke:"#1E293B",strokeWidth:"2.5",strokeLinecap:"round"}),(0,a.jsx)("circle",{cx:"18",cy:"17.5",r:"3",fill:"#1E293B"}),(0,a.jsx)("path",{d:"M11 29c1.5-4.5 4-7 7-7s5.5 2.5 7 7",stroke:"#1E293B",strokeWidth:"2.8",strokeLinecap:"round"}),(0,a.jsx)("path",{d:"M11 20l7 3.5L25 20",stroke:"#1E293B",strokeWidth:"2.4",strokeLinecap:"round"})]}),(0,a.jsx)("span",{className:"mbs-brand-rate",children:"Rate"}),(0,a.jsx)("span",{className:"mbs-brand-alert",children:"Watch"})]}),(0,a.jsxs)("div",{className:"mbs-tabs",children:[(0,a.jsx)("span",{className:"mbs-tab mbs-tab-active",children:"MBS Tracker"}),(0,a.jsx)(o(),{href:"/geek-out/yield-curve",className:"mbs-tab",children:"Yield Curve"}),(0,a.jsx)(o(),{href:"/big-picture",className:"mbs-tab",children:"Big Picture"}),(0,a.jsx)(o(),{href:"/geek-out/weighted-average",className:"mbs-tab",children:"Weighted Avg"})]}),(0,a.jsxs)("div",{className:"mbs-status-box",children:[(0,a.jsx)("span",{className:"mbs-live-dot"}),(0,a.jsxs)("span",{className:"mbs-status-text",children:["Auto-updates every 1m (",l,"s)"]}),(0,a.jsx)("button",{type:"button",onClick:h,className:"mbs-refresh-btn",disabled:d,children:d?"Updating...":"Refresh Now"})]})]})}),(0,a.jsx)("section",{className:"mbs-board-section",children:(0,a.jsxs)("div",{className:"mbs-board-container",children:[(0,a.jsxs)("div",{className:"mbs-board-meta",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("h1",{children:"Mortgage-Backed Securities (MBS) & Treasury Watch"}),(0,a.jsxs)("p",{children:["Real-time coupon pricing in basis points (",(0,a.jsx)("strong",{children:"bp"}),") and U.S. 10-Year Treasury Note movement."]})]}),r&&(0,a.jsxs)("div",{className:"mbs-timestamp",children:["Last Update:"," ",(0,a.jsx)("strong",{children:r.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})})]})]}),(0,a.jsx)("div",{className:"mbs-cards-grid",children:e.map(e=>{let s=(e=>{if("mbs"===e.type){let s=Math.round((e.last-e.open)*100);return{sign:s>0?"+":s<0?"-":"",number:Math.abs(s).toString(),unit:"bp",isPositive:s>=0}}{let s=e.last-e.open;return{sign:s>0?"+":s<0?"-":"",number:Math.abs(s).toFixed(2).replace(/^0/,""),unit:"%",isPositive:s>=0}}})(e),r=s.isPositive?"mbs-green":"mbs-red";return(0,a.jsxs)("div",{className:"mbs-card",children:[(0,a.jsxs)("div",{className:"mbs-card-header",children:[(0,a.jsx)("span",{className:"mbs-card-title",children:e.title}),(0,a.jsx)("span",{className:"mbs-card-last-top",children:g(e,e.last)})]}),(0,a.jsxs)("div",{className:"mbs-card-body",children:[(0,a.jsx)("button",{type:"button",className:"mbs-help-btn",title:e.tooltip,onClick:()=>p(b===e.id?null:e.id),"aria-label":"Coupon Information",children:"?"}),b===e.id&&(0,a.jsx)("div",{className:"mbs-tooltip-popover",children:e.tooltip}),(0,a.jsxs)("div",{className:`mbs-big-change ${r}`,children:[(0,a.jsxs)("span",{className:"mbs-change-val",children:[s.sign,s.number]}),(0,a.jsx)("span",{className:"mbs-change-unit",children:s.unit})]}),(0,a.jsxs)("div",{className:"mbs-stats-grid",children:[(0,a.jsxs)("div",{className:"mbs-stat-cell",children:[(0,a.jsx)("span",{className:"mbs-stat-label",children:"Open"}),(0,a.jsx)("span",{className:"mbs-stat-value",children:g(e,e.open)})]}),(0,a.jsxs)("div",{className:"mbs-stat-cell",children:[(0,a.jsx)("span",{className:"mbs-stat-label",children:"Last"}),(0,a.jsx)("span",{className:"mbs-stat-value",children:g(e,e.last)})]}),(0,a.jsxs)("div",{className:"mbs-stat-cell",children:[(0,a.jsx)("span",{className:"mbs-stat-label",children:"High"}),(0,a.jsx)("span",{className:"mbs-stat-value",children:g(e,e.high)})]}),(0,a.jsxs)("div",{className:"mbs-stat-cell",children:[(0,a.jsx)("span",{className:"mbs-stat-label",children:"Low"}),(0,a.jsx)("span",{className:"mbs-stat-value",children:g(e,e.low)})]})]}),(0,a.jsx)("div",{className:`mbs-corner-triangle ${r}`})]})]},e.id)})}),(0,a.jsxs)("div",{className:"mbs-legend-bar",children:[(0,a.jsxs)("div",{className:"mbs-legend-item",children:[(0,a.jsx)("span",{className:"mbs-legend-swatch mbs-swatch-green"}),(0,a.jsxs)("span",{children:[(0,a.jsx)("strong",{children:"UMBS (+bp Green):"})," Bond prices are up since market open — puts downward (favorable) pressure on mortgage rates."]})]}),(0,a.jsxs)("div",{className:"mbs-legend-item",children:[(0,a.jsx)("span",{className:"mbs-legend-swatch mbs-swatch-red"}),(0,a.jsxs)("span",{children:[(0,a.jsx)("strong",{children:"US 10-Year T-Note (-% Red):"})," Treasury yields are down since open — also favorable for mortgage rates."]})]})]})]})}),(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .mbs-watch-page {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F8FAFC;
          min-height: 82vh;
          color: #333333;
          padding-bottom: 4rem;
        }

        /* Top Bar matching RateAlert aesthetic */
        .mbs-topbar {
          background-color: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          padding: 0.9rem 1.5rem;
        }

        .mbs-topbar-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .mbs-brand {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .mbs-brand-rate {
          color: #374151;
        }

        .mbs-brand-alert {
          color: #F97316;
        }

        .mbs-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .mbs-tab {
          padding: 0.55rem 1.15rem;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          border: 1px solid transparent;
          transition: all 0.15s ease;
        }

        .mbs-tab:hover {
          color: #111827;
          background-color: #F1F5F9;
        }

        .mbs-tab-active {
          border-color: #D1D5DB;
          background-color: #FFFFFF;
          color: #111827;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .mbs-status-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.82rem;
          color: #64748B;
        }

        .mbs-live-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #00C805;
          box-shadow: 0 0 8px rgba(0, 200, 5, 0.65);
          animation: mbsPulse 2s infinite;
        }

        @keyframes mbsPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .mbs-refresh-btn {
          padding: 0.38rem 0.8rem;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #1E293B;
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .mbs-refresh-btn:hover {
          background: #F1F5F9;
        }

        /* Board Section */
        .mbs-board-section {
          padding: 2rem 1.5rem;
        }

        .mbs-board-container {
          max-width: 960px;
          margin: 0 auto;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }

        .mbs-board-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #F1F5F9;
        }

        .mbs-board-meta h1 {
          font-size: 1.35rem;
          font-weight: 600;
          color: #1E293B;
          margin: 0 0 0.2rem 0;
        }

        .mbs-board-meta p {
          font-size: 0.88rem;
          color: #64748B;
          margin: 0;
        }

        .mbs-timestamp {
          font-size: 0.82rem;
          color: #64748B;
          background: #F8FAFC;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }

        /* 2x2 Cards Grid */
        .mbs-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .mbs-card {
          border: 1px solid #D8DCE3;
          border-radius: 6px;
          background: #FFFFFF;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .mbs-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid #ECEEF2;
        }

        .mbs-card-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #3B3F46;
          letter-spacing: -0.2px;
        }

        .mbs-card-last-top {
          font-size: 1.32rem;
          font-weight: 600;
          color: #2E3238;
        }

        .mbs-card-body {
          position: relative;
          display: grid;
          grid-template-columns: 1.08fr 1fr;
          align-items: center;
          padding: 1.65rem 1.25rem 1.85rem 1.25rem;
          min-height: 175px;
        }

        .mbs-help-btn {
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: #73777D;
          color: #FFFFFF;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          line-height: 1;
        }

        .mbs-help-btn:hover {
          background: #4B5563;
        }

        .mbs-tooltip-popover {
          position: absolute;
          top: 2.2rem;
          right: 0.55rem;
          left: 0.75rem;
          background: #1E293B;
          color: #FFFFFF;
          font-size: 0.78rem;
          line-height: 1.45;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          z-index: 10;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        /* Big Change Left Column */
        .mbs-big-change {
          display: flex;
          align-items: baseline;
          padding-left: 0.15rem;
        }

        .mbs-change-val {
          font-size: clamp(2.6rem, 4.2vw, 3.35rem);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -1px;
        }

        .mbs-change-unit {
          font-size: 1.2rem;
          font-weight: 400;
          margin-left: 0.2rem;
        }

        .mbs-green {
          color: #00C805;
        }

        .mbs-red {
          color: #FF1721;
        }

        /* Right 2x2 Stats (Open, Last, High, Low) */
        .mbs-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 1rem;
          column-gap: 1.25rem;
        }

        .mbs-stat-cell {
          display: flex;
          flex-direction: column;
        }

        .mbs-stat-label {
          font-size: 0.9rem;
          color: #6C727A;
          font-weight: 400;
          line-height: 1.25;
        }

        .mbs-stat-value {
          font-size: 1.02rem;
          color: #2E3238;
          font-weight: 500;
          line-height: 1.3;
        }

        /* Bottom-Right Corner Triangle */
        .mbs-corner-triangle {
          position: absolute;
          bottom: 3px;
          right: 3px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 34px 34px;
        }

        .mbs-corner-triangle.mbs-green {
          border-color: transparent transparent #00C805 transparent;
        }

        .mbs-corner-triangle.mbs-red {
          border-color: transparent transparent #FF1721 transparent;
        }

        /* Legend Bar */
        .mbs-legend-bar {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #F1F5F9;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 2rem;
          font-size: 0.84rem;
          color: #475569;
        }

        .mbs-legend-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .mbs-legend-swatch {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .mbs-swatch-green {
          background-color: #00C805;
        }

        .mbs-swatch-red {
          background-color: #FF1721;
        }

        @media (max-width: 768px) {
          .mbs-cards-grid {
            grid-template-columns: 1fr;
          }

          .mbs-board-container {
            padding: 1.25rem;
          }
        }
      `}})]})}}},e=>{e.O(0,[8500,8441,3794,7358],()=>e(e.s=52512)),_N_E=e.O()}]);