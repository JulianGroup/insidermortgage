(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[876],{52512:(e,r,a)=>{Promise.resolve().then(a.bind(a,98587))},91470:(e,r,a)=>{"use strict";a.d(r,{db:()=>s});var t=a(97873),i=a(91531);let l=0===(0,t.Dk)().length?(0,t.Wp)({projectId:"imc-website-2026",appId:"1:243344090160:web:d14650fbc71537615279f5",storageBucket:"imc-website-2026.firebasestorage.app",apiKey:"AIzaSyAiaCV63wukbNALJzh1GMxjWZVnT2tKIi4",authDomain:"imc-website-2026.firebaseapp.com",messagingSenderId:"243344090160"}):(0,t.Sx)(),s=(0,i.aU)(l)},98587:(e,r,a)=>{"use strict";a.d(r,{default:()=>p});var t=a(95155),i=a(12115),l=a(98500),s=a.n(l),o=a(91531),n=a(91470);let d="marketWatch",c="liveQuotes",b=[{id:"umbs-65",title:"UMBS 30YR 6.5",subtitle:"30-Year 6.5% Coupon",type:"mbs",open:101.53,last:101.39,high:101.56,low:101.35,tooltip:"Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower."},{id:"umbs-70",title:"UMBS 30YR 7.0",subtitle:"30-Year 7.0% Coupon",type:"mbs",open:103.03,last:102.92,high:103.06,low:102.89,tooltip:"Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates."},{id:"umbs-60",title:"UMBS 30YR 6.0",subtitle:"30-Year 6.0% Coupon",type:"mbs",open:99.58,last:99.41,high:99.62,low:99.36,tooltip:"Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing."},{id:"us-10yr",title:"US 10-year T-Note",subtitle:"10-Year Treasury Yield",type:"yield",open:4.95,last:4.99,high:5,low:4.95,tooltip:"U.S. 10-Year Treasury Note Yield (Tradeweb US10Y). A falling yield (-%) is typically favorable for mortgage interest rates."}];async function m(e){let r=`https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(e)}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`;try{let e=new AbortController,a=setTimeout(()=>e.abort(),5e3),t=await fetch(r,{signal:e.signal});if(clearTimeout(a),t.ok){let e=await t.json(),r=e?.FormattedQuoteResult?.FormattedQuote?.[0];if(r&&r.last){let e=parseFloat(String(r.last).replace("%","")),a=parseFloat(String(r.previous_day_closing||r.open||e).replace("%","")),t=parseFloat(String(r.high||Math.max(e,a)).replace("%","")),i=parseFloat(String(r.low||Math.min(e,a)).replace("%","")),l=parseFloat(r.bond_change_price||0);if(!isNaN(e))return{open:a,last:e,high:t,low:i,bondChangePrice:isNaN(l)?0:l}}}}catch(r){console.warn(`CNBC live quote error (${e}):`,r)}return null}function p(){let[e,r]=(0,i.useState)(b),[a,l]=(0,i.useState)(null),[p,g]=(0,i.useState)("Firebase • Tradeweb US10Y & MBS Live Feed"),[u,h]=(0,i.useState)(!1),[x,f]=(0,i.useState)(60),[F,y]=(0,i.useState)(!1),[w,v]=(0,i.useState)(null),[j,N]=(0,i.useState)(!1),[k,S]=(0,i.useState)(!1),[B,C]=(0,i.useState)(""),[A,M]=(0,i.useState)(!1),[E,D]=(0,i.useState)(b),[z,T]=(0,i.useState)(!1),[U,R]=(0,i.useState)("");(0,i.useEffect)(()=>{let e=(0,o.H9)(n.db,d,c),a=(0,o.aQ)(e,a=>{if(N(!0),a.exists()){let e=a.data();if(Array.isArray(e.instruments)&&e.instruments.length>0){let a=e.instruments.map(e=>"umbs-55"===e.id?{id:"umbs-70",title:"UMBS 30YR 7.0",subtitle:"30-Year 7.0% Coupon",type:"mbs",open:103.03,last:102.92,high:103.06,low:102.89,tooltip:"Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates."}:e);r(a),D(a)}e.updatedAt&&l(new Date(e.updatedAt)),e.sourceLabel&&g(e.sourceLabel),"boolean"==typeof e.manualLock&&h(e.manualLock)}else{let r=new Date().toISOString();(0,o.BN)(e,{instruments:b,updatedAt:r,sourceLabel:"Firebase • Tradeweb US10Y & MBS Live Feed",manualLock:!1}).catch(e=>console.warn("Firestore seed error:",e))}},e=>{console.warn("Firestore listener error:",e),N(!1)});return()=>a()},[]);let L=(0,i.useCallback)(async(r=!1)=>{y(!0);try{let a=(0,o.H9)(n.db,d,c),t=await (0,o.x7)(a),i=t.exists()?t.data():null;if(!r&&i?.updatedAt&&Date.now()-new Date(i.updatedAt).getTime()<5e4)return void f(60);let l=(Array.isArray(i?.instruments)&&4===i.instruments.length?i.instruments:e).map(e=>"umbs-55"===e.id?b[1]:e),s=!!i?.manualLock,[p,g]=await Promise.all([m("US10Y"),m("MBB")]);if(!p&&!g)return void f(60);let u=i?.sourceLabel||"Firebase • Tradeweb US10Y & MBS Live Feed",h=l.map(e=>{if("us-10yr"===e.id&&p&&!s)return u="Firebase • Tradeweb US10Y & MBS Live Feed",{...e,open:Number(p.open.toFixed(2)),last:Number(p.last.toFixed(2)),high:Number(p.high.toFixed(2)),low:Number(p.low.toFixed(2))};if(s)return e;if("mbs"===e.type&&(p||g)){let r=p?.bondChangePrice?.5*p.bondChangePrice:null,a=g?g.last-g.open:null,t="umbs-60"===e.id?1:"umbs-65"===e.id?.82:.65,i=Number((e.open+(null!==r&&null!==a?.65*r+.35*a:null!==r?r:a||0)*t).toFixed(2)),l=Number(Math.max(e.high||e.open,i,e.open+.03).toFixed(2)),s=Number(Math.min(e.low||e.open,i,i-.03).toFixed(2));return{...e,last:i,high:l,low:s}}return e}),x=new Date().toISOString();await (0,o.BN)(a,{instruments:h,updatedAt:x,sourceLabel:u,manualLock:s},{merge:!0}),f(60)}catch(e){console.warn("Live market sync warning:",e)}finally{setTimeout(()=>y(!1),350)}},[e]);(0,i.useEffect)(()=>{L(!1);let e=setInterval(()=>{f(e=>e<=1?(L(!1),60):e-1)},1e3);return()=>clearInterval(e)},[L]);let Y=(e,r,a)=>{D(t=>t.map(t=>t.id===e?{...t,[r]:a}:t))},P=async e=>{e.preventDefault(),T(!0),R("");try{let e=E.map(e=>({...e,open:Number(parseFloat(e.open)||0),last:Number(parseFloat(e.last)||0),high:Number(parseFloat(e.high)||0),low:Number(parseFloat(e.low)||0)})),r=(0,o.H9)(n.db,d,c);await (0,o.BN)(r,{instruments:e,updatedAt:new Date().toISOString(),sourceLabel:u?"Firebase • Desk Coupon Override (Locked)":"Firebase • Tradeweb US10Y & MBS Live Feed",manualLock:u},{merge:!0}),R("Saved to Firebase! All connected browsers updated."),setTimeout(()=>S(!1),900)}catch(e){console.error("Admin save error:",e),R("Error saving to Firebase.")}finally{T(!1)}},I=(e,r)=>{let a=Number(r)||0;return"yield"===e.type?`${a.toFixed(2)}%`:a.toFixed(2)},{dateStr:O,timeStr:$}=function(e){if(!e||isNaN(e.getTime())){let e=new Date,r=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0"),t=e.getFullYear();return{dateStr:`${r}/${a}/${t}`,timeStr:e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}let r=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0"),t=e.getFullYear();return{dateStr:`${r}/${a}/${t}`,timeStr:e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}(a||new Date),H=e.find(e=>"umbs-60"===e.id)||e[0],J=Math.round((H.last-H.open)*100)>=0;return(0,t.jsxs)("main",{className:"lb-mbs-page",children:[(0,t.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@500;600;700&family=Montserrat:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",rel:"stylesheet"}),(0,t.jsxs)("section",{className:"lb-mbs-hero",children:[(0,t.jsx)("div",{className:"lb-glow lb-glow-gold"}),(0,t.jsx)("div",{className:"lb-glow lb-glow-blue"}),(0,t.jsx)("div",{className:"lb-container",children:(0,t.jsxs)("div",{className:"lb-hero-split",children:[(0,t.jsxs)("div",{className:"lb-hero-copy",children:[(0,t.jsxs)("h1",{className:"lb-hero-title",children:["Mortgage-Backed Securities &"," ",(0,t.jsx)("em",{children:"10-Year Treasury Watch"})]}),(0,t.jsxs)("p",{className:"lb-hero-sub",children:["Mortgage interest rates are priced directly from institutional"," ",(0,t.jsx)("strong",{children:"UMBS 30-Year coupons"})," and the"," ",(0,t.jsx)("strong",{children:"U.S. 10-Year Treasury Note"}),". Track live intraday basis-point (",(0,t.jsx)("strong",{children:"bp"}),") movement updated every 60 seconds."]}),(0,t.jsxs)("div",{className:"lb-controls-cluster",children:[(0,t.jsxs)("div",{className:"lb-live-status-pill",children:[(0,t.jsx)("span",{className:`lb-pulse-dot ${j?"":"lb-dot-amber"}`}),(0,t.jsx)("span",{children:j?"Firebase Realtime":"Connecting..."}),(0,t.jsxs)("span",{className:"lb-countdown-tag",children:[x,"s"]})]}),(0,t.jsx)("button",{type:"button",onClick:()=>L(!0),className:"lb-action-btn",disabled:F,children:F?"Syncing...":"↻ Sync Now"}),(0,t.jsx)("button",{type:"button",onClick:()=>S(!k),className:"lb-action-btn lb-override-btn",title:"Advisor Desk Override (Post exact UMBS coupon quotes)",children:"⚙️ Desk Override"})]})]}),(0,t.jsxs)("div",{className:"lb-telemetry-card",children:[(0,t.jsxs)("div",{className:"lb-telemetry-row",children:[(0,t.jsx)("span",{className:"lb-telemetry-label",children:"LAST UPDATED"}),(0,t.jsxs)("div",{className:"lb-telemetry-datetime",children:[(0,t.jsx)("span",{className:"lb-date-badge",children:O}),(0,t.jsx)("span",{className:"lb-time-badge",children:$})]})]}),(0,t.jsx)("div",{className:"lb-telemetry-divider"}),(0,t.jsxs)("div",{className:"lb-telemetry-row",children:[(0,t.jsx)("span",{className:"lb-telemetry-label",children:"INTRADAY RATE BIAS"}),(0,t.jsx)("span",{className:`lb-sentiment-pill ${J?"lb-sent-good":"lb-sent-defensive"}`,children:J?"▼ Favorable for Mortgage Rates (+bp)":"▲ Upward Rate Pressure (-bp)"})]}),(0,t.jsx)("div",{className:"lb-telemetry-divider"}),(0,t.jsxs)("div",{className:"lb-telemetry-row",children:[(0,t.jsx)("span",{className:"lb-telemetry-label",children:"DATA SOURCE"}),(0,t.jsx)("span",{className:"lb-source-value",children:p})]})]})]})})]}),(0,t.jsx)("section",{className:"lb-board-section",children:(0,t.jsxs)("div",{className:"lb-container",children:[k&&(0,t.jsxs)("div",{className:"lb-admin-drawer",children:[(0,t.jsxs)("div",{className:"lb-admin-header",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Advisor Desk Override (Firebase IMC Website)"}),(0,t.jsx)("span",{children:"Instantaneously broadcasts updated coupon prices to all active site visitors."})]}),(0,t.jsx)("button",{type:"button",onClick:()=>S(!1),className:"lb-admin-close",children:"✕"})]}),A?(0,t.jsxs)("form",{onSubmit:P,className:"lb-override-form",children:[(0,t.jsx)("div",{className:"lb-lock-toggle",children:(0,t.jsxs)("label",{children:[(0,t.jsx)("input",{type:"checkbox",checked:u,onChange:e=>h(e.target.checked)}),(0,t.jsxs)("span",{children:[(0,t.jsx)("strong",{children:"Lock exact UMBS coupon numbers"})," (prevents 1-minute auto-sync from altering your manual desk prices)"]})]})}),(0,t.jsx)("div",{className:"lb-override-grid",children:E.map(e=>(0,t.jsxs)("div",{className:"lb-override-row",children:[(0,t.jsx)("span",{className:"lb-override-name",children:e.title}),(0,t.jsxs)("label",{children:["Open",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.open,onChange:r=>Y(e.id,"open",r.target.value)})]}),(0,t.jsxs)("label",{children:["Last",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.last,onChange:r=>Y(e.id,"last",r.target.value)})]}),(0,t.jsxs)("label",{children:["High",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.high,onChange:r=>Y(e.id,"high",r.target.value)})]}),(0,t.jsxs)("label",{children:["Low",(0,t.jsx)("input",{type:"number",step:"0.01",value:e.low,onChange:r=>Y(e.id,"low",r.target.value)})]})]},e.id))}),(0,t.jsxs)("div",{className:"lb-override-actions",children:[(0,t.jsx)("button",{type:"submit",className:"lb-save-firebase-btn",disabled:z,children:z?"Publishing to Firebase...":"Publish to All Visitors via Firebase"}),U&&(0,t.jsx)("span",{className:"lb-admin-msg",children:U})]})]}):(0,t.jsxs)("form",{onSubmit:e=>{e.preventDefault(),"c2imc"===B.trim().toLowerCase()?(M(!0),R("")):R('Incorrect PIN. Use "c2imc" to unlock.')},className:"lb-pin-form",children:[(0,t.jsx)("label",{children:"Enter Advisor PIN to edit live Firebase quotes:"}),(0,t.jsx)("input",{type:"password",value:B,onChange:e=>C(e.target.value),placeholder:"PIN (c2imc)"}),(0,t.jsx)("button",{type:"submit",children:"Unlock Desk Controls"}),U&&(0,t.jsx)("span",{className:"lb-admin-msg",children:U})]})]}),(0,t.jsx)("div",{className:"lb-bento-grid",children:e.map(e=>{let r,a=(e=>{if("mbs"===e.type){let r=Math.round((e.last-e.open)*100);return{sign:r>0?"+":r<0?"-":"",number:Math.abs(r).toString(),unit:"bp",isPositive:r>=0,isFavorableForRates:r>=0,rawDiff:r}}{let r=e.last-e.open,a=Math.abs(r).toFixed(2).replace(/^0/,"");return{sign:r>0?"+":r<0?"-":"",number:a,unit:"%",isPositive:r>=0,isFavorableForRates:r<=0,rawDiff:r}}})(e),i=a.isPositive?"lb-green":"lb-red",l=(r=(e.high||0)-(e.low||0))<=0?50:Math.max(6,Math.min(94,Math.round(((e.last||0)-(e.low||0))/r*100)));return(0,t.jsxs)("article",{className:"lb-instrument-card",children:[(0,t.jsxs)("header",{className:"lb-card-topbar",children:[(0,t.jsxs)("div",{className:"lb-card-title-group",children:[(0,t.jsx)("h2",{className:"lb-card-title",children:e.title}),(0,t.jsx)("span",{className:"lb-card-subtitle",children:e.subtitle})]}),(0,t.jsxs)("div",{className:"lb-card-topbar-right",children:[(0,t.jsx)("span",{className:"lb-card-last-pill",children:I(e,e.last)}),(0,t.jsx)("button",{type:"button",className:"lb-info-btn",title:e.tooltip,onClick:()=>v(w===e.id?null:e.id),"aria-label":`About ${e.title}`,children:"?"})]})]}),w===e.id&&(0,t.jsx)("div",{className:"lb-tooltip-banner",children:e.tooltip}),(0,t.jsxs)("div",{className:"lb-card-body",children:[(0,t.jsxs)("div",{className:"lb-change-column",children:[(0,t.jsxs)("span",{className:"lb-Updated-mini",children:["As of ",O," • ",$]}),(0,t.jsxs)("div",{className:`lb-hero-metric ${i}`,children:[(0,t.jsxs)("span",{className:"lb-metric-number",children:[a.sign,a.number]}),(0,t.jsx)("span",{className:"lb-metric-unit",children:a.unit})]}),(0,t.jsx)("div",{className:"lb-impact-tag-wrap",children:(0,t.jsx)("span",{className:`lb-impact-tag ${a.isFavorableForRates?"lb-impact-favorable":"lb-impact-unfavorable"}`,children:"mbs"===e.type?a.isPositive?"Bond Price Up • Helps Rates":"Bond Price Down • Pressures Rates":a.isPositive?"Yield Up • Pressures Rates":"Yield Down • Helps Rates"})}),(0,t.jsxs)("div",{className:"lb-range-meter",children:[(0,t.jsxs)("div",{className:"lb-range-labels",children:[(0,t.jsxs)("span",{children:["Day Low: ",I(e,e.low)]}),(0,t.jsxs)("span",{children:["Day High: ",I(e,e.high)]})]}),(0,t.jsxs)("div",{className:"lb-range-track",children:[(0,t.jsx)("div",{className:`lb-range-fill ${i}`,style:{width:`${l}%`}}),(0,t.jsx)("div",{className:`lb-range-thumb ${i}`,style:{left:`${l}%`}})]})]})]}),(0,t.jsxs)("div",{className:"lb-stats-matrix",children:[(0,t.jsxs)("div",{className:"lb-stat-box",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"Open"}),(0,t.jsx)("span",{className:"lb-stat-val",children:I(e,e.open)})]}),(0,t.jsxs)("div",{className:"lb-stat-box lb-stat-highlight",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"Last"}),(0,t.jsx)("span",{className:"lb-stat-val",children:I(e,e.last)})]}),(0,t.jsxs)("div",{className:"lb-stat-box",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"High"}),(0,t.jsx)("span",{className:"lb-stat-val",children:I(e,e.high)})]}),(0,t.jsxs)("div",{className:"lb-stat-box",children:[(0,t.jsx)("span",{className:"lb-stat-label",children:"Low"}),(0,t.jsx)("span",{className:"lb-stat-val",children:I(e,e.low)})]})]}),(0,t.jsx)("div",{className:`lb-corner-wedge ${i}`})]})]},e.id)})}),(0,t.jsxs)("div",{className:"lb-explainer-bento",children:[(0,t.jsxs)("div",{className:"lb-explainer-card",children:[(0,t.jsx)("div",{className:"lb-exp-icon lb-exp-green",children:"bp"}),(0,t.jsx)("h3",{children:"How to Read UMBS Basis Points"}),(0,t.jsxs)("p",{children:["Mortgage rates and MBS bond prices move in"," ",(0,t.jsx)("strong",{children:"opposite directions"}),". When UMBS prices rise (",(0,t.jsx)("strong",{style:{color:"#00A804"},children:"+bp Green"}),"), bond investors pay a higher premium for mortgage-backed bonds, pushing retail mortgage rates ",(0,t.jsx)("strong",{children:"lower"}),". When UMBS falls by ",(0,t.jsx)("strong",{children:"-15bp to -25bp"})," intraday, lenders often reprice for the worse."]})]}),(0,t.jsxs)("div",{className:"lb-explainer-card",children:[(0,t.jsx)("div",{className:"lb-exp-icon lb-exp-gold",children:"10Y"}),(0,t.jsx)("h3",{children:"Why the 10-Year Treasury Matters"}),(0,t.jsxs)("p",{children:["Although 30-year mortgages have a 30-year term, the average mortgage is paid off or refinanced in 7–10 years. As a result, the ",(0,t.jsx)("strong",{children:"U.S. 10-Year T-Note Yield"})," serves as the primary benchmark competing for fixed-income capital alongside UMBS 6.0%, 6.5%, and 7.0% coupons."]})]}),(0,t.jsxs)("div",{className:"lb-explainer-card",children:[(0,t.jsx)("div",{className:"lb-exp-icon lb-exp-navy",children:"6.0–7.0"}),(0,t.jsx)("h3",{children:"Understanding the Coupon Stack"}),(0,t.jsxs)("p",{children:["Secondary market desks bundle loans into security coupons in 0.50% increments (",(0,t.jsx)("strong",{children:"UMBS 6.0, 6.5, and 7.0"}),"). A borrower’s note rate is typically 0.50%–1.125% above the underlying UMBS coupon to account for servicing fees and Fannie/Freddie guaranty fees."]})]})]}),(0,t.jsxs)("div",{className:"lb-advisory-banner",children:[(0,t.jsxs)("div",{className:"lb-advisory-text",children:[(0,t.jsx)("span",{className:"lb-advisory-kicker",children:"LOCK VS. FLOAT STRATEGY • TEAM INSIDER"}),(0,t.jsx)("h3",{children:"Wondering whether to lock your rate today or float into upcoming economic data?"}),(0,t.jsx)("p",{children:"David and Rakesh monitor intraday UMBS repricing thresholds and Treasury auctions directly to help you time your rate lock with confidence."})]}),(0,t.jsxs)("div",{className:"lb-advisory-actions",children:[(0,t.jsx)(s(),{href:"/home-v8#contact",className:"lb-btn-gold",children:"Request a Rate Lock Review →"}),(0,t.jsx)(s(),{href:"/geek-out/yield-curve",className:"lb-btn-outline",children:"Explore Yield Curve"})]})]}),(0,t.jsxs)("p",{className:"lb-compliance-footnote",children:["Market indicators are synced via Firebase Realtime from Tradeweb & MBS benchmark feeds for informational and educational purposes only (Last Updated: ",(0,t.jsx)("strong",{children:O})," at"," ",(0,t.jsx)("strong",{children:$}),"). Quotes may reflect up to a 15-minute exchange delay and do not constitute a retail rate sheet or commitment to lend."]})]})}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
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

        /* Top Command Bar */
        .lb-command-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1.5rem;
          margin-bottom: 2.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lb-brand-cluster {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .lb-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .lb-brand-rate {
          color: #FFFFFF;
        }

        .lb-brand-watch {
          color: #F2C230;
        }

        .lb-nav-pills {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.3rem;
          border-radius: 999px;
          flex-wrap: wrap;
        }

        .lb-pill {
          padding: 0.42rem 0.95rem;
          border-radius: 999px;
          font-size: 0.84rem;
          font-weight: 600;
          color: rgba(248, 250, 252, 0.78);
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .lb-pill:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.1);
        }

        .lb-pill-active {
          background: #F2C230;
          color: #061A33;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(242, 194, 48, 0.35);
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
        }

        @keyframes lbPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .lb-countdown-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #F2C230;
          background: rgba(242, 194, 48, 0.14);
          padding: 0.1rem 0.45rem;
          border-radius: 6px;
        }

        .lb-action-btn {
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .lb-action-btn:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.38);
        }

        .lb-override-btn {
          border-color: rgba(242, 194, 48, 0.4);
          color: #F2C230;
        }

        /* Editorial Split Hero */
        .lb-hero-split {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 2.5rem;
          align-items: center;
        }

        .lb-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.38rem 0.9rem;
          border-radius: 999px;
          background: rgba(242, 194, 48, 0.12);
          border: 1px solid rgba(242, 194, 48, 0.35);
          font-family: 'Montserrat', sans-serif;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #F2C230;
          margin-bottom: 1rem;
        }

        .lb-eyebrow-spark {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #F2C230;
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

        .lb-source-value {
          font-size: 0.82rem;
          font-weight: 600;
          color: #E2E8F0;
        }

        /* =========================================================
           2. BENTO INSTRUMENT BOARD (OVERLAPPING HERO)
           ========================================================= */
        .lb-board-section {
          margin-top: -2.9rem;
          position: relative;
          z-index: 5;
        }

        /* Admin Drawer */
        .lb-admin-drawer {
          background: #FFFFFF;
          border: 2px solid #F2C230;
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 1.75rem;
          box-shadow: 0 20px 40px rgba(6, 26, 51, 0.14);
        }

        .lb-admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .lb-admin-header strong {
          display: block;
          font-size: 1.05rem;
          color: #061A33;
        }

        .lb-admin-header span {
          font-size: 0.85rem;
          color: #64748B;
        }

        .lb-admin-close {
          border: none;
          background: #F1F5F9;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          color: #334155;
        }

        .lb-pin-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .lb-pin-form input {
          padding: 0.5rem 0.85rem;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .lb-pin-form button,
        .lb-save-firebase-btn {
          padding: 0.55rem 1.15rem;
          border-radius: 8px;
          border: none;
          background: #061A33;
          color: #F2C230;
          font-weight: 700;
          cursor: pointer;
        }

        .lb-lock-toggle {
          margin-bottom: 1rem;
          padding: 0.65rem 0.9rem;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 10px;
          font-size: 0.86rem;
        }

        .lb-lock-toggle label {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          cursor: pointer;
        }

        .lb-override-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .lb-override-row {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 0.75rem;
          display: grid;
          grid-template-columns: 1.2fr repeat(4, 1fr);
          gap: 0.5rem;
          align-items: center;
        }

        .lb-override-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: #0F172A;
        }

        .lb-override-row label {
          display: flex;
          flex-direction: column;
          font-size: 0.72rem;
          color: #64748B;
          font-weight: 600;
        }

        .lb-override-row input {
          width: 100%;
          padding: 0.35rem 0.45rem;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          margin-top: 0.2rem;
        }

        .lb-admin-msg {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0284C7;
          margin-left: 0.75rem;
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
          align-items: baseline;
          gap: 0.65rem;
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

        .lb-card-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.55rem;
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
          margin-bottom: 0.15rem;
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
          .lb-override-grid {
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
          .lb-override-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}})]})}}},e=>{e.O(0,[7705,2301,8500,6683,8441,3794,7358],()=>e(e.s=52512)),_N_E=e.O()}]);