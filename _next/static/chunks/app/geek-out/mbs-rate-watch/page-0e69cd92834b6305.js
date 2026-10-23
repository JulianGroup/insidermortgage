(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[876],{52512:(e,s,r)=>{Promise.resolve().then(r.bind(r,98587))},91470:(e,s,r)=>{"use strict";r.d(s,{db:()=>n});var t=r(97873),a=r(91531);let i=0===(0,t.Dk)().length?(0,t.Wp)({projectId:"imc-website-2026",appId:"1:243344090160:web:d14650fbc71537615279f5",storageBucket:"imc-website-2026.firebasestorage.app",apiKey:"AIzaSyAiaCV63wukbNALJzh1GMxjWZVnT2tKIi4",authDomain:"imc-website-2026.firebaseapp.com",messagingSenderId:"243344090160"}):(0,t.Sx)(),n=(0,a.aU)(i)},98587:(e,s,r)=>{"use strict";r.d(s,{default:()=>p});var t=r(95155),a=r(12115),i=r(98500),n=r.n(i),o=r(91531),l=r(91470);let d="marketWatch",m="liveQuotes",c=[{id:"umbs-65",title:"UMBS 30YR 6.5",subtitle:"30-Year 6.5% Coupon",type:"mbs",open:101.53,last:101.42,high:101.56,low:101.38,tooltip:"Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower."},{id:"umbs-60",title:"UMBS 30YR 6.0",subtitle:"30-Year 6.0% Coupon",type:"mbs",open:99.57,last:99.44,high:99.61,low:99.39,tooltip:"Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing."},{id:"umbs-55",title:"UMBS 30YR 5.5",subtitle:"30-Year 5.5% Coupon",type:"mbs",open:97.19,last:97.04,high:97.23,low:96.99,tooltip:"Uniform Mortgage-Backed Security 30-Year 5.5% Coupon. Higher price (+bp) is favorable for mortgage rates."},{id:"us-10yr",title:"US 10-year T-Note",subtitle:"10-Year Treasury Yield",type:"yield",open:4.95,last:4.99,high:5,low:4.95,tooltip:"U.S. 10-Year Treasury Note Yield (Tradeweb US10Y). A falling yield (-%) is typically favorable for mortgage interest rates."}];async function b(e){let s=`https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(e)}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`;try{let e=new AbortController,r=setTimeout(()=>e.abort(),5e3),t=await fetch(s,{signal:e.signal});if(clearTimeout(r),t.ok){let e=await t.json(),s=e?.FormattedQuoteResult?.FormattedQuote?.[0];if(s&&s.last){let e=parseFloat(String(s.last).replace("%","")),r=parseFloat(String(s.previous_day_closing||s.open||e).replace("%","")),t=parseFloat(String(s.high||Math.max(e,r)).replace("%","")),a=parseFloat(String(s.low||Math.min(e,r)).replace("%","")),i=parseFloat(s.bond_change_price||0);if(!isNaN(e))return{open:r,last:e,high:t,low:a,bondChangePrice:isNaN(i)?0:i}}}}catch(s){console.warn(`CNBC live quote error (${e}):`,s)}return null}function p(){let[e,s]=(0,a.useState)(c),[r,i]=(0,a.useState)(null),[p,g]=(0,a.useState)("Firebase Live Sync"),[u,h]=(0,a.useState)(!1),[x,f]=(0,a.useState)(60),[F,v]=(0,a.useState)(!1),[w,y]=(0,a.useState)(null),[j,N]=(0,a.useState)(!1),[k,S]=(0,a.useState)(!1),[B,C]=(0,a.useState)(""),[E,M]=(0,a.useState)(!1),[A,L]=(0,a.useState)(c),[z,D]=(0,a.useState)(!1),[U,T]=(0,a.useState)("");(0,a.useEffect)(()=>{let e=(0,o.H9)(l.db,d,m),r=(0,o.aQ)(e,r=>{if(N(!0),r.exists()){let e=r.data();Array.isArray(e.instruments)&&e.instruments.length>0&&(s(e.instruments),L(e.instruments)),e.updatedAt&&i(new Date(e.updatedAt)),e.sourceLabel&&g(e.sourceLabel),"boolean"==typeof e.manualLock&&h(e.manualLock)}else{let s=new Date().toISOString();(0,o.BN)(e,{instruments:c,updatedAt:s,sourceLabel:"Firebase Initialized",manualLock:!1}).catch(e=>console.warn("Firestore seed error:",e))}},e=>{console.warn("Firestore listener error:",e),N(!1)});return()=>r()},[]);let I=(0,a.useCallback)(async(s=!1)=>{v(!0);try{let r=(0,o.H9)(l.db,d,m),t=await (0,o.x7)(r),a=t.exists()?t.data():null;if(!s&&a?.updatedAt&&Date.now()-new Date(a.updatedAt).getTime()<5e4)return void f(60);let i=Array.isArray(a?.instruments)&&4===a.instruments.length?a.instruments:e,n=!!a?.manualLock,[c,p]=await Promise.all([b("US10Y"),b("MBB")]);if(!c&&!p)return void f(60);let g=a?.sourceLabel||"Firebase • Tradeweb US10Y & MBS Live Feed",u=i.map(e=>{if("us-10yr"===e.id&&c&&!n)return g="Firebase • Tradeweb US10Y & MBS Live Feed",{...e,open:Number(c.open.toFixed(2)),last:Number(c.last.toFixed(2)),high:Number(c.high.toFixed(2)),low:Number(c.low.toFixed(2))};if(n)return e;if("mbs"===e.type&&(c||p)){let s=c?.bondChangePrice?.5*c.bondChangePrice:null,r=p?p.last-p.open:null,t="umbs-55"===e.id?1.12:"umbs-60"===e.id?1:.82,a=Number((e.open+(null!==s&&null!==r?.65*s+.35*r:null!==s?s:r||0)*t).toFixed(2)),i=Number(Math.max(e.high||e.open,a,e.open+.03).toFixed(2)),n=Number(Math.min(e.low||e.open,a,a-.03).toFixed(2));return{...e,last:a,high:i,low:n}}return e}),h=new Date().toISOString();await (0,o.BN)(r,{instruments:u,updatedAt:h,sourceLabel:g,manualLock:n},{merge:!0}),f(60)}catch(e){console.warn("Live market sync warning:",e)}finally{setTimeout(()=>v(!1),350)}},[e]);(0,a.useEffect)(()=>{I(!1);let e=setInterval(()=>{f(e=>e<=1?(I(!1),60):e-1)},1e3);return()=>clearInterval(e)},[I]);let P=(e,s,r)=>{L(t=>t.map(t=>t.id===e?{...t,[s]:r}:t))},Y=async e=>{e.preventDefault(),D(!0),T("");try{let e=A.map(e=>({...e,open:Number(parseFloat(e.open)||0),last:Number(parseFloat(e.last)||0),high:Number(parseFloat(e.high)||0),low:Number(parseFloat(e.low)||0)})),s=(0,o.H9)(l.db,d,m);await (0,o.BN)(s,{instruments:e,updatedAt:new Date().toISOString(),sourceLabel:u?"Firebase • Desk Coupon Override (Locked)":"Firebase • Live Market Feed (^TNX & MBS)",manualLock:u},{merge:!0}),T("Saved to Firebase! All connected browsers updated."),setTimeout(()=>S(!1),900)}catch(e){console.error("Admin save error:",e),T("Error saving to Firebase.")}finally{D(!1)}},_=(e,s)=>{let r=Number(s)||0;return"yield"===e.type?`${r.toFixed(2)}%`:r.toFixed(2)};return(0,t.jsxs)("main",{className:"mbs-watch-page",children:[(0,t.jsx)("div",{className:"mbs-topbar",children:(0,t.jsxs)("div",{className:"mbs-topbar-inner",children:[(0,t.jsxs)("div",{className:"mbs-brand",children:[(0,t.jsxs)("svg",{viewBox:"0 0 36 36",width:"32",height:"32",fill:"none",children:[(0,t.jsx)("path",{d:"M9 8c4.5-3.5 13.5-3.5 18 0",stroke:"#1E293B",strokeWidth:"2.5",strokeLinecap:"round"}),(0,t.jsx)("path",{d:"M12.5 12c3-2.2 8-2.2 11 0",stroke:"#1E293B",strokeWidth:"2.5",strokeLinecap:"round"}),(0,t.jsx)("circle",{cx:"18",cy:"17.5",r:"3",fill:"#1E293B"}),(0,t.jsx)("path",{d:"M11 29c1.5-4.5 4-7 7-7s5.5 2.5 7 7",stroke:"#1E293B",strokeWidth:"2.8",strokeLinecap:"round"}),(0,t.jsx)("path",{d:"M11 20l7 3.5L25 20",stroke:"#1E293B",strokeWidth:"2.4",strokeLinecap:"round"})]}),(0,t.jsx)("span",{className:"mbs-brand-rate",children:"Rate"}),(0,t.jsx)("span",{className:"mbs-brand-alert",children:"Watch"})]}),(0,t.jsxs)("div",{className:"mbs-tabs",children:[(0,t.jsx)("span",{className:"mbs-tab mbs-tab-active",children:"MBS Tracker"}),(0,t.jsx)(n(),{href:"/geek-out/yield-curve",className:"mbs-tab",children:"Yield Curve"}),(0,t.jsx)(n(),{href:"/big-picture",className:"mbs-tab",children:"Big Picture"}),(0,t.jsx)(n(),{href:"/geek-out/weighted-average",className:"mbs-tab",children:"Weighted Avg"})]}),(0,t.jsxs)("div",{className:"mbs-status-box",children:[(0,t.jsx)("span",{className:`mbs-live-dot ${j?"":"mbs-dot-offline"}`}),(0,t.jsxs)("span",{className:"mbs-status-text",children:[j?"Firebase Realtime":"Connecting..."," •"," ",x,"s"]}),(0,t.jsx)("button",{type:"button",onClick:()=>I(!0),className:"mbs-refresh-btn",disabled:F,children:F?"Syncing...":"Sync Now"}),(0,t.jsx)("button",{type:"button",onClick:()=>S(!k),className:"mbs-admin-toggle-btn",title:"Advisor Desk Override (Post exact UMBS coupon quotes)",children:"⚙️ Desk Override"})]})]})}),(0,t.jsx)("section",{className:"mbs-board-section",children:(0,t.jsxs)("div",{className:"mbs-board-container",children:[k&&(0,t.jsxs)("div",{className:"mbs-admin-panel",children:[(0,t.jsxs)("div",{className:"mbs-admin-header",children:[(0,t.jsx)("strong",{children:"Advisor Desk Override (Firebase IMC Website)"}),(0,t.jsx)("button",{type:"button",onClick:()=>S(!1),className:"mbs-admin-close",children:"✕"})]}),E?(0,t.jsxs)("form",{onSubmit:Y,className:"mbs-override-form",children:[(0,t.jsx)("div",{className:"mbs-lock-toggle",children:(0,t.jsxs)("label",{children:[(0,t.jsx)("input",{type:"checkbox",checked:u,onChange:e=>h(e.target.checked)}),(0,t.jsxs)("span",{children:[(0,t.jsx)("strong",{children:"Lock exact UMBS coupon numbers"})," (prevents 1-minute ETF proxy from altering your manual UMBS prices)"]})]})}),(0,t.jsx)("div",{className:"mbs-override-grid",children:A.map(e=>(0,t.jsxs)("div",{className:"mbs-override-row",children:[(0,t.jsx)("span",{className:"mbs-override-name",children:e.title}),(0,t.jsxs)("label",{children:["Open",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.open,onChange:s=>P(e.id,"open",s.target.value)})]}),(0,t.jsxs)("label",{children:["Last",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.last,onChange:s=>P(e.id,"last",s.target.value)})]}),(0,t.jsxs)("label",{children:["High",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.high,onChange:s=>P(e.id,"high",s.target.value)})]}),(0,t.jsxs)("label",{children:["Low",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.low,onChange:s=>P(e.id,"low",s.target.value)})]})]},e.id))}),(0,t.jsxs)("div",{className:"mbs-override-actions",children:[(0,t.jsx)("button",{type:"submit",className:"mbs-save-firebase-btn",disabled:z,children:z?"Publishing to Firebase...":"Publish to All Visitors via Firebase"}),U&&(0,t.jsx)("span",{className:"mbs-admin-msg",children:U})]})]}):(0,t.jsxs)("form",{onSubmit:e=>{e.preventDefault(),"c2imc"===B.trim().toLowerCase()?(M(!0),T("")):T('Incorrect PIN. Use "c2imc" to unlock.')},className:"mbs-pin-form",children:[(0,t.jsx)("label",{children:"Enter Advisor PIN to edit live Firebase quotes:"}),(0,t.jsx)("input",{type:"password",value:B,onChange:e=>C(e.target.value),placeholder:"PIN (c2imc)"}),(0,t.jsx)("button",{type:"submit",children:"Unlock"}),U&&(0,t.jsx)("span",{className:"mbs-admin-msg",children:U})]})]}),(0,t.jsxs)("div",{className:"mbs-board-meta",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{children:"Mortgage-Backed Securities (MBS) & Treasury Watch"}),(0,t.jsxs)("p",{children:["Real-time coupon pricing in basis points (",(0,t.jsx)("strong",{children:"bp"}),") and U.S. 10-Year Treasury Note movement synced via"," ",(0,t.jsx)("strong",{children:p}),"."]})]}),r&&(0,t.jsxs)("div",{className:"mbs-timestamp",children:["Last Update:"," ",(0,t.jsx)("strong",{children:r.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})})]})]}),(0,t.jsx)("div",{className:"mbs-cards-grid",children:e.map(e=>{let s=(e=>{if("mbs"===e.type){let s=Math.round((e.last-e.open)*100);return{sign:s>0?"+":s<0?"-":"",number:Math.abs(s).toString(),unit:"bp",isPositive:s>=0}}{let s=e.last-e.open;return{sign:s>0?"+":s<0?"-":"",number:Math.abs(s).toFixed(2).replace(/^0/,""),unit:"%",isPositive:s>=0}}})(e),r=s.isPositive?"mbs-green":"mbs-red";return(0,t.jsxs)("div",{className:"mbs-card",children:[(0,t.jsxs)("div",{className:"mbs-card-header",children:[(0,t.jsx)("span",{className:"mbs-card-title",children:e.title}),(0,t.jsx)("span",{className:"mbs-card-last-top",children:_(e,e.last)})]}),(0,t.jsxs)("div",{className:"mbs-card-body",children:[(0,t.jsx)("button",{type:"button",className:"mbs-help-btn",title:e.tooltip,onClick:()=>y(w===e.id?null:e.id),"aria-label":"Coupon Information",children:"?"}),w===e.id&&(0,t.jsx)("div",{className:"mbs-tooltip-popover",children:e.tooltip}),(0,t.jsxs)("div",{className:`mbs-big-change ${r}`,children:[(0,t.jsxs)("span",{className:"mbs-change-val",children:[s.sign,s.number]}),(0,t.jsx)("span",{className:"mbs-change-unit",children:s.unit})]}),(0,t.jsxs)("div",{className:"mbs-stats-grid",children:[(0,t.jsxs)("div",{className:"mbs-stat-cell",children:[(0,t.jsx)("span",{className:"mbs-stat-label",children:"Open"}),(0,t.jsx)("span",{className:"mbs-stat-value",children:_(e,e.open)})]}),(0,t.jsxs)("div",{className:"mbs-stat-cell",children:[(0,t.jsx)("span",{className:"mbs-stat-label",children:"Last"}),(0,t.jsx)("span",{className:"mbs-stat-value",children:_(e,e.last)})]}),(0,t.jsxs)("div",{className:"mbs-stat-cell",children:[(0,t.jsx)("span",{className:"mbs-stat-label",children:"High"}),(0,t.jsx)("span",{className:"mbs-stat-value",children:_(e,e.high)})]}),(0,t.jsxs)("div",{className:"mbs-stat-cell",children:[(0,t.jsx)("span",{className:"mbs-stat-label",children:"Low"}),(0,t.jsx)("span",{className:"mbs-stat-value",children:_(e,e.low)})]})]}),(0,t.jsx)("div",{className:`mbs-corner-triangle ${r}`})]})]},e.id)})}),(0,t.jsxs)("div",{className:"mbs-legend-bar",children:[(0,t.jsxs)("div",{className:"mbs-legend-item",children:[(0,t.jsx)("span",{className:"mbs-legend-swatch mbs-swatch-green"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("strong",{children:"UMBS (+bp Green):"})," Bond prices are up since market open — puts downward (favorable) pressure on mortgage rates."]})]}),(0,t.jsxs)("div",{className:"mbs-legend-item",children:[(0,t.jsx)("span",{className:"mbs-legend-swatch mbs-swatch-red"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("strong",{children:"US 10-Year T-Note (-% Red):"})," Treasury yields are down since open — also favorable for mortgage rates."]})]}),(0,t.jsx)("p",{className:"mbs-compliance-note",children:"Market indicators are provided for informational and educational purposes only and may be delayed up to 15 minutes. Not a rate sheet or commitment to lend."})]})]})}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .mbs-watch-page {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F8FAFC;
          min-height: 82vh;
          color: #333333;
          padding-bottom: 4rem;
        }

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
          gap: 0.55rem;
          font-size: 0.8rem;
          color: #64748B;
          flex-wrap: wrap;
        }

        .mbs-live-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #00C805;
          box-shadow: 0 0 8px rgba(0, 200, 5, 0.65);
          animation: mbsPulse 2s infinite;
        }

        .mbs-dot-offline {
          background-color: #F59E0B;
          box-shadow: none;
        }

        @keyframes mbsPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .mbs-refresh-btn,
        .mbs-admin-toggle-btn {
          padding: 0.36rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #1E293B;
          font-family: inherit;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .mbs-refresh-btn:hover,
        .mbs-admin-toggle-btn:hover {
          background: #F1F5F9;
        }

        /* Admin Panel */
        .mbs-admin-panel {
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .mbs-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
          color: #0F172A;
        }

        .mbs-admin-close {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #64748B;
        }

        .mbs-pin-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.88rem;
        }

        .mbs-pin-form input {
          padding: 0.4rem 0.7rem;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          font-size: 0.88rem;
        }

        .mbs-pin-form button,
        .mbs-save-firebase-btn {
          padding: 0.45rem 1rem;
          border-radius: 6px;
          border: none;
          background: #0F172A;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.84rem;
          cursor: pointer;
        }

        .mbs-lock-toggle {
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #1E293B;
        }

        .mbs-lock-toggle label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .mbs-override-grid {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }

        .mbs-override-row {
          display: grid;
          grid-template-columns: 160px repeat(4, 1fr);
          gap: 0.75rem;
          align-items: center;
          background: #FFFFFF;
          padding: 0.6rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }

        .mbs-override-name {
          font-weight: 600;
          font-size: 0.88rem;
          color: #0F172A;
        }

        .mbs-override-row label {
          display: flex;
          flex-direction: column;
          font-size: 0.72rem;
          color: #64748B;
          gap: 0.2rem;
        }

        .mbs-override-row input {
          padding: 0.35rem 0.5rem;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          font-size: 0.88rem;
          width: 100%;
        }

        .mbs-override-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mbs-admin-msg {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0369A1;
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

        .mbs-legend-bar {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid #F1F5F9;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 2rem;
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

        .mbs-compliance-note {
          width: 100%;
          margin: 0.25rem 0 0 0;
          font-size: 0.76rem;
          color: #94A3B8;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .mbs-cards-grid {
            grid-template-columns: 1fr;
          }

          .mbs-board-container {
            padding: 1.25rem;
          }

          .mbs-override-row {
            grid-template-columns: 1fr 1fr;
          }

          .mbs-override-name {
            grid-column: span 2;
          }
        }
      `}})]})}}},e=>{e.O(0,[7705,2301,8500,6683,8441,3794,7358],()=>e(e.s=52512)),_N_E=e.O()}]);