(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,6310,52186,96616,e=>{"use strict";var r=e.i(43476),s=e.i(71645),t=e.i(22016);let i=[{id:"self-employed",title:"Self-Employed Borrowers",description:"We understand that your tax returns don't always tell the whole story. Leverage our alternative documentation programs designed for entrepreneurs.",icon:"💼",highlights:["Bank Statement Loans","P&L Only Programs","1099 Expense Ratio Loans"],route:"/self-employed"},{id:"retiree",title:"Retirees",description:"Unlock the equity in your home or qualify for a new purchase using your hard-earned retirement assets, even without traditional employment income.",icon:"🌅",highlights:["Asset Depletion Programs","Reverse Mortgages","Retirement Account Qualifying"],route:"/retirees"},{id:"investor",title:"Rental Property Financing",description:"Expand your real estate portfolio without the red tape. Qualify strictly based on the cash flow of the property, not your personal income.",icon:"🏢",highlights:["DSCR Loans","No Personal Income Limits","Portfolio Expansion"],route:"/dscr-loans"},{id:"first-time",title:"First-Time Home Buyers",description:"Navigate the home buying process with confidence. We provide a step-by-step roadmap and low-down-payment options to get you into your first home.",icon:"🔑",highlights:["Low Down Payment","Down Payment Assistance","Educational Roadmap"],route:"/first-time"}];e.s(["default",0,()=>(0,r.jsx)("section",{className:"section solutions-section",id:"solutions",children:(0,r.jsxs)("div",{className:"container",children:[(0,r.jsxs)("div",{className:"solutions-header",children:[(0,r.jsx)("h2",{children:"Who We Serve"}),(0,r.jsx)("p",{children:"We believe mortgage solutions shouldn't be one-size-fits-all. We specialize in tailoring programs to fit your unique financial picture."})]}),(0,r.jsx)("div",{className:"solutions-grid",children:i.map(e=>(0,r.jsxs)("div",{className:"solution-card",children:[(0,r.jsx)("div",{className:"solution-icon",children:e.icon}),(0,r.jsx)("h3",{children:e.title}),(0,r.jsx)("p",{children:e.description}),(0,r.jsx)("ul",{className:"solution-features",children:e.highlights.map((e,s)=>(0,r.jsx)("li",{children:e},s))}),(0,r.jsx)(t.default,{href:e.route,className:"btn btn-outline",style:{width:"100%",textAlign:"center",display:"inline-block"},children:"Learn More"})]},e.id))})]})})],6310),e.s(["default",0,()=>((0,s.useEffect)(()=>{if(!document.getElementById("jotform-widget-script")){let e=document.createElement("script");e.id="jotform-widget-script",e.src="https://www.jotform.com/website-widgets/embed/019e8576208670b48ce5b752598ff8e0e156",e.async=!0,document.body.appendChild(e)}},[]),(0,r.jsx)("section",{className:"testimonials-section",id:"reviews",children:(0,r.jsxs)("div",{className:"container",children:[(0,r.jsxs)("div",{className:"testimonials-header",children:[(0,r.jsx)("h2",{children:"Client Success Stories"}),(0,r.jsx)("p",{children:"Don't just take our word for it. Here is what our clients have to say about working with Insider Mortgage."})]}),(0,r.jsx)("div",{id:"JFWebsiteWidget-019e8576208670b48ce5b752598ff8e0e156",style:{width:"100%",margin:"var(--space-8) 0"}})]})}))],52186),e.s(["default",0,()=>{let[e,t]=(0,s.useState)({name:"",email:"",phone:"",category:""}),[i,a]=(0,s.useState)(null),o=r=>{t({...e,[r.target.name]:r.target.value})},n=async r=>{r.preventDefault(),a("submitting");try{await fetch("https://script.google.com/macros/s/AKfycbz_YOUR_SCRIPT_ID/exec",{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),a("success"),t({name:"",email:"",phone:"",category:""})}catch(e){console.error("Submission Error:",e),a("error")}};return(0,r.jsx)("section",{className:"lead-capture-section",id:"contact",children:(0,r.jsxs)("div",{className:"container lead-capture-container",children:[(0,r.jsxs)("div",{className:"lead-content",children:[(0,r.jsx)("h2",{children:"Ready to Take the Next Step?"}),(0,r.jsx)("p",{children:"Whether you're just starting to explore your options or you're ready to get pre-approved, our team is here to provide expert guidance tailored to your scenario."}),(0,r.jsxs)("div",{className:"trust-badges",children:[(0,r.jsx)("span",{className:"trust-badge",children:"🔒 Secure Data"}),(0,r.jsx)("span",{className:"trust-badge",children:"⚡ Fast Pre-Approvals"}),(0,r.jsx)("span",{className:"trust-badge",children:"🤝 Expert Guidance"})]})]}),(0,r.jsxs)("div",{className:"card lead-form-card",children:[(0,r.jsx)("h3",{style:{marginBottom:"1.5rem"},children:"Request a Consultation"}),(0,r.jsxs)("form",{onSubmit:n,children:[(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{className:"form-label",children:"Full Name"}),(0,r.jsx)("input",{type:"text",name:"name",className:"form-input",required:!0,value:e.name,onChange:o,placeholder:"John Doe"})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{className:"form-label",children:"Email Address"}),(0,r.jsx)("input",{type:"email",name:"email",className:"form-input",required:!0,value:e.email,onChange:o,placeholder:"john@example.com"})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{className:"form-label",children:"Phone Number"}),(0,r.jsx)("input",{type:"tel",name:"phone",className:"form-input",value:e.phone,onChange:o,placeholder:"(555) 123-4567"})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{className:"form-label",children:"I am best described as a..."}),(0,r.jsxs)("select",{name:"category",className:"form-select",required:!0,value:e.category,onChange:o,children:[(0,r.jsx)("option",{value:"",disabled:!0,children:"Select a profile..."}),(0,r.jsx)("option",{value:"Self-Employed",children:"Self-Employed Borrower"}),(0,r.jsx)("option",{value:"Retiree",children:"Retiree"}),(0,r.jsx)("option",{value:"Real Estate Investor",children:"Real Estate Investor (Rental Property)"}),(0,r.jsx)("option",{value:"First-Time Home Buyer",children:"First-Time Home Buyer"}),(0,r.jsx)("option",{value:"Other",children:"Other / Standard Refinance"})]})]}),(0,r.jsx)("button",{type:"submit",className:"btn btn-primary submit-btn",disabled:"submitting"===i,children:"submitting"===i?"Sending...":"Get Started"}),"success"===i&&(0,r.jsx)("div",{className:"form-status status-success",children:"Thank you! Your information has been received. We will be in touch shortly."}),"error"===i&&(0,r.jsx)("div",{className:"form-status status-error",children:"There was an error sending your request. Please try again later."})]})]})]})})}],96616)},36159,(e,r,s)=>{"use strict";function t(){return null}Object.defineProperty(s,"__esModule",{value:!0}),Object.defineProperty(s,"default",{enumerable:!0,get:function(){return t}}),("function"==typeof s.default||"object"==typeof s.default&&null!==s.default)&&void 0===s.default.__esModule&&(Object.defineProperty(s.default,"__esModule",{value:!0}),Object.assign(s.default,s),r.exports=s.default)},26706,e=>{"use strict";var r=e.i(43476),s=e.i(71645),t=e.i(36159),i=e.i(22016);let a=()=>{let e=[{label:"Self-Employed",href:"#self-employed",icon:(0,r.jsxs)("svg",{viewBox:"0 0 36 36",width:"32",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("circle",{cx:"15",cy:"11",r:"4.5"}),(0,r.jsx)("path",{d:"M7 26c0-4.2 3.6-7.5 8-7.5 2.4 0 4.5.9 6 2.3"}),(0,r.jsx)("path",{d:"M18 21h10l-2 7H16z"}),(0,r.jsx)("path",{d:"M6 28h24"})]})},{label:"Investors",href:"#investors",icon:(0,r.jsxs)("svg",{viewBox:"0 0 36 36",width:"32",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"M5 17L18 6l13 11"}),(0,r.jsx)("path",{d:"M9 14.5V29h18V14.5"}),(0,r.jsx)("rect",{x:"15",y:"20",width:"6",height:"9"})]})},{label:"First Time Buyers",href:"#first-time-buyers",icon:(0,r.jsxs)("svg",{viewBox:"0 0 36 36",width:"32",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"M5 17L18 6l13 11"}),(0,r.jsx)("path",{d:"M9 14.5V29h18V14.5"}),(0,r.jsx)("rect",{x:"15",y:"20",width:"6",height:"9"})]})},{label:"Seniors",href:"#seniors",icon:(0,r.jsxs)("svg",{viewBox:"0 0 40 36",width:"34",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("circle",{cx:"20",cy:"12",r:"4"}),(0,r.jsx)("circle",{cx:"11",cy:"14",r:"3.2"}),(0,r.jsx)("circle",{cx:"29",cy:"14",r:"3.2"}),(0,r.jsx)("path",{d:"M13 28c0-3.8 3.1-7 7-7s7 3.2 7 7"}),(0,r.jsx)("path",{d:"M5 28c0-3.2 2.5-5.8 5.8-5.8 1.2 0 2.3.4 3.2 1"}),(0,r.jsx)("path",{d:"M35 28c0-3.2-2.5-5.8-5.8-5.8-1.2 0-2.3.4-3.2 1"})]})},{label:"Retirees",href:"#retirees",icon:(0,r.jsxs)("svg",{viewBox:"0 0 36 36",width:"32",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"M18 28V13"}),(0,r.jsx)("path",{d:"M18 13c-3-4-8-4-10-1 3 0 6 1 10 1z"}),(0,r.jsx)("path",{d:"M18 13c3-4 8-4 10-1-3 0-6 1-10 1z"}),(0,r.jsx)("path",{d:"M18 13c-5-1-9 2-10 5 3-1 6-2 10-5z"}),(0,r.jsx)("path",{d:"M18 13c5-1 9 2 10 5-3-1-6-2-10-5z"}),(0,r.jsx)("path",{d:"M11 29c2.2-1.8 4.6-2.5 7-2.5s4.8.7 7 2.5"})]})}];return(0,r.jsxs)(s.default.Fragment,{children:[(0,r.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@700&family=Montserrat:wght@500;600;700;800&family=Permanent+Marker&display=swap",rel:"stylesheet"}),(0,r.jsxs)("div",{className:"hero-v5-wrapper",children:[(0,r.jsxs)("section",{className:"hero-v5-main",children:[(0,r.jsxs)("div",{className:"hero-v5-container",children:[(0,r.jsxs)("div",{className:"hero-v5-header",children:[(0,r.jsxs)("h1",{className:"hero-v5-title",children:[(0,r.jsx)("span",{className:"hero-v5-title-block",children:"TRUSTED MORTGAGE "}),(0,r.jsxs)("span",{className:"hero-v5-title-script",children:["EXPERTS",(0,r.jsx)("svg",{className:"hero-v5-experts-swoosh",viewBox:"0 0 300 28",preserveAspectRatio:"none",children:(0,r.jsx)("path",{d:"M8,22 Q155,4 294,18 Q160,12 18,25 Z",fill:"#F2C230"})})]})]}),(0,r.jsxs)("p",{className:"hero-v5-subtitle",children:["Recommended by"," ",(0,r.jsx)("span",{className:"hero-v5-subtitle-accent",children:"Professionals, Friends & Family."})]})]}),(0,r.jsxs)("div",{className:"hero-v5-middle",children:[(0,r.jsxs)("div",{className:"hero-v5-left-cta",children:[(0,r.jsx)("p",{className:"hero-v5-learn-label",children:"Learn why a mortgage is a:"}),(0,r.jsxs)("div",{className:"hero-v5-cards",children:[(0,r.jsxs)("a",{href:"#tool",className:"hero-v5-card hero-v5-card-tool",children:[(0,r.jsx)("span",{className:"hero-v5-card-icon",children:(0,r.jsxs)("svg",{viewBox:"0 0 36 36",width:"34",height:"34",fill:"none",children:[(0,r.jsx)("path",{d:"M25.5 6.5c-2.2 0-4 1.5-4.4 3.6L9.6 21.6c-2.1.4-3.6 2.2-3.6 4.4 0 2.5 2 4.5 4.5 4.5 2.2 0 4-1.5 4.4-3.6l11.5-11.5c2.1-.4 3.6-2.2 3.6-4.4 0-1-.3-1.9-.9-2.6l-2.6 2.6-2.2-.6-.6-2.2 2.6-2.6c-.7-.6-1.6-.9-2.6-.9z",fill:"#FFFFFF"}),(0,r.jsx)("path",{d:"M8.5 6.5l-2 2 4.5 5.5 2.5-2.5-5-5zm8.5 8.5l-2.5 2.5 11 11c1 1 2.5 1 3.5 0s1-2.5 0-3.5l-11-11z",fill:"#FFFFFF"})]})}),(0,r.jsx)("span",{className:"hero-v5-card-label",children:"TOOL"}),(0,r.jsx)("span",{className:"hero-v5-card-chevron",children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,r.jsx)("polyline",{points:"9 6 15 12 9 18"})})})]}),(0,r.jsxs)("a",{href:"#strategy",className:"hero-v5-card hero-v5-card-strategy",children:[(0,r.jsx)("span",{className:"hero-v5-card-icon",children:(0,r.jsxs)("svg",{viewBox:"0 0 42 36",width:"38",height:"34",fill:"none",children:[(0,r.jsx)("rect",{x:"4",y:"21",width:"4.5",height:"11",rx:"1",fill:"#0A2342"}),(0,r.jsx)("rect",{x:"11",y:"16",width:"4.5",height:"16",rx:"1",fill:"#0A2342"}),(0,r.jsx)("rect",{x:"18",y:"19",width:"4.5",height:"13",rx:"1",fill:"#0A2342"}),(0,r.jsx)("rect",{x:"25",y:"13",width:"4.5",height:"19",rx:"1",fill:"#0A2342"}),(0,r.jsx)("path",{d:"M4 17L15 8L21 12L31 4",stroke:"#15803D",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("path",{d:"M25 4H31V10",stroke:"#15803D",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("path",{d:"M6 19L16 26L22 23L31 31",stroke:"#DC2626",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("path",{d:"M25 31H31V25",stroke:"#DC2626",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round"})]})}),(0,r.jsx)("span",{className:"hero-v5-card-label",children:"STRATEGY"}),(0,r.jsx)("span",{className:"hero-v5-card-chevron",children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,r.jsx)("polyline",{points:"9 6 15 12 9 18"})})})]})]})]}),(0,r.jsxs)("div",{className:"hero-v5-wave-callout",children:[(0,r.jsxs)("p",{className:"hero-v5-wave-text",children:["I'm riding the",(0,r.jsx)("br",{}),"interest rate wave"]}),(0,r.jsx)("svg",{className:"hero-v5-wave-underline",viewBox:"0 0 260 28",preserveAspectRatio:"none",children:(0,r.jsx)("path",{d:"M6,22 Q130,3 254,17 Q135,13 14,26 Z",fill:"#041E3A"})})]})]})]}),(0,r.jsx)("div",{className:"hero-v5-wave-divider",children:(0,r.jsxs)("svg",{viewBox:"0 0 1440 110",preserveAspectRatio:"none",className:"hero-v5-wave-svg",children:[(0,r.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65 L1440,110 L0,110 Z",fill:"#041E3A"}),(0,r.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65",fill:"none",stroke:"#F2C230",strokeWidth:"4.5"})]})})]}),(0,r.jsx)("section",{className:"hero-v5-specializations-band",children:(0,r.jsxs)("div",{className:"hero-v5-container",children:[(0,r.jsxs)("h2",{className:"hero-v5-spec-heading",children:[(0,r.jsx)("strong",{children:"Team Insider"})," specializes in:"]}),(0,r.jsx)("div",{className:"hero-v5-spec-pills",children:e.map(e=>(0,r.jsxs)("a",{href:e.href,className:"hero-v5-spec-pill",children:[(0,r.jsx)("span",{className:"hero-v5-spec-pill-icon",children:e.icon}),(0,r.jsx)("span",{className:"hero-v5-spec-pill-label",children:e.label}),(0,r.jsx)("span",{className:"hero-v5-spec-pill-chevron",children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",width:"18",height:"18",fill:"none",stroke:"#0A2342",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,r.jsx)("polyline",{points:"9 6 15 12 9 18"})})})]},e.label))})]})})]}),(0,r.jsx)("section",{className:"hero",style:{padding:"4rem 1rem",background:"var(--primary)",position:"relative",zIndex:2},children:(0,r.jsxs)("div",{className:"container hero-container animate-fade-in",style:{padding:0},children:[(0,r.jsx)("h2",{style:{color:"white",marginBottom:"2rem",fontSize:"clamp(1.5rem, 4vw, 2.5rem)",lineHeight:"1.2",fontFamily:"Tahoma, sans-serif"},children:"Rakesh & David– specialize in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors"}),(0,r.jsxs)("div",{className:"partners-section",style:{marginTop:"0"},children:[(0,r.jsxs)("div",{className:"partner-card",children:[(0,r.jsx)("img",{src:"/insidermortgage/rakesh-jain.jpg",alt:"Rakesh Jain",className:"partner-bg-image"}),(0,r.jsxs)("div",{className:"partner-info",children:[(0,r.jsx)("h3",{children:"Rakesh Jain"}),(0,r.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,r.jsx)(i.default,{href:"/bio-rakesh",className:"partner-bio-btn",children:"Bio"})]})]}),(0,r.jsxs)("div",{className:"partner-card",children:[(0,r.jsx)("img",{src:"/insidermortgage/david-sider.jpg",alt:"David Sider",className:"partner-bg-image"}),(0,r.jsxs)("div",{className:"partner-info",children:[(0,r.jsx)("h3",{children:"David Sider"}),(0,r.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,r.jsx)(i.default,{href:"/bio-david",className:"partner-bio-btn",children:"Bio"})]})]})]})]})}),(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        .hero-v5-wrapper {
          width: 100%;
          background-color: #041E3A;
          overflow: hidden;
        }

        .hero-v5-main {
          position: relative;
          width: 100%;
          min-height: 740px;
          background-image: url('/insidermortgage/splash-bg.jpg');
          background-size: cover;
          background-position: center 35%;
          background-repeat: no-repeat;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.75rem 4.5% 7.5rem 4.5%;
        }

        .hero-v5-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-v5-header {
          max-width: 1320px;
          text-align: left;
        }

        .hero-v5-title {
          margin: 0;
          line-height: 1.02;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.35em;
        }

        .hero-v5-title-block {
          font-family: 'Anton', Impact, sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          color: #F7F7F7;
          font-size: clamp(3.2rem, 6.8vw, 6.2rem);
          letter-spacing: 1.5px;
          text-shadow: 0 5px 14px rgba(0, 0, 0, 0.75), 0 2px 4px rgba(0, 0, 0, 0.85);
        }

        .hero-v5-title-script {
          position: relative;
          display: inline-block;
          font-family: 'Permanent Marker', cursive;
          font-weight: 400;
          color: #F2C230;
          font-size: clamp(3.1rem, 6.6vw, 6rem);
          letter-spacing: 2px;
          transform: rotate(-2deg) translateY(-4px);
          text-shadow: 0 6px 14px rgba(0, 0, 0, 0.8), 2px 3px 0px rgba(10, 35, 66, 0.9);
          padding-bottom: 0.15em;
        }

        .hero-v5-experts-swoosh {
          position: absolute;
          left: 2%;
          bottom: -6px;
          width: 98%;
          height: 22px;
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.65));
          pointer-events: none;
        }

        .hero-v5-subtitle {
          margin: 0.6rem 0 0 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.25rem, 2.5vw, 2.2rem);
          color: #F7F7F7;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.85), 0 1px 3px rgba(0, 0, 0, 0.95);
        }

        .hero-v5-subtitle-accent {
          color: #F2C230;
        }

        .hero-v5-middle {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 5.5rem;
          width: 100%;
        }

        .hero-v5-left-cta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 440px;
        }

        .hero-v5-learn-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.25rem, 2vw, 1.85rem);
          color: #F4F7FB;
          margin: 0 0 1rem 0;
          text-shadow: 0 3px 8px rgba(0, 0, 0, 0.85);
        }

        .hero-v5-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 280px;
        }

        .hero-v5-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          border-radius: 16px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
        }

        .hero-v5-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6);
        }

        .hero-v5-card-tool {
          background: rgba(18, 62, 105, 0.88);
          border: 2.5px solid #D8E3F0;
          color: #FFFFFF;
          backdrop-filter: blur(4px);
        }

        .hero-v5-card-tool:hover {
          background: rgba(18, 62, 105, 0.98);
          border-color: #FFFFFF;
        }

        .hero-v5-card-strategy {
          background: #F2C230;
          border: 2.5px solid #F2C230;
          color: #0A2342;
        }

        .hero-v5-card-strategy:hover {
          background: #D6A414;
          border-color: #D6A414;
        }

        .hero-v5-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
        }

        .hero-v5-card-label {
          font-family: 'Anton', Impact, sans-serif;
          font-size: 2rem;
          letter-spacing: 1px;
          line-height: 1;
          text-transform: uppercase;
          flex: 1;
          text-align: center;
        }

        .hero-v5-card-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-v5-wave-callout {
          margin-right: 2%;
          margin-bottom: 1.5rem;
          text-align: center;
          transform: rotate(-3deg);
        }

        .hero-v5-wave-text {
          margin: 0;
          font-family: 'Caveat', 'Permanent Marker', cursive;
          font-weight: 700;
          font-size: clamp(2.1rem, 3.3vw, 3.1rem);
          line-height: 1.05;
          color: #041E3A;
          text-shadow: 0 1px 8px rgba(255, 255, 255, 0.75), 0 0 18px rgba(255, 255, 255, 0.65);
        }

        .hero-v5-wave-underline {
          width: 240px;
          height: 22px;
          margin-top: -2px;
          filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.4));
        }

        .hero-v5-wave-divider {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 1;
          pointer-events: none;
        }

        .hero-v5-wave-svg {
          display: block;
          width: 100%;
          height: 95px;
        }

        .hero-v5-specializations-band {
          background-color: #041E3A;
          padding: 0.5rem 4.5% 2.75rem 4.5%;
          position: relative;
          z-index: 3;
        }

        .hero-v5-spec-heading {
          margin: 0 0 1.25rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.35rem, 2.2vw, 2rem);
          color: #F4F7FB;
        }

        .hero-v5-spec-heading strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .hero-v5-spec-pills {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1.15rem;
          width: 100%;
        }

        .hero-v5-spec-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #F2C230;
          color: #0A2342;
          padding: 0.9rem 1.1rem;
          border-radius: 16px;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(0.95rem, 1.25vw, 1.2rem);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, background-color 0.2s ease;
          gap: 0.6rem;
        }

        .hero-v5-spec-pill:hover {
          background-color: #D6A414;
          transform: translateY(-2px);
        }

        .hero-v5-spec-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-v5-spec-pill-label {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          letter-spacing: -0.2px;
        }

        .hero-v5-spec-pill-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 1150px) {
          .hero-v5-spec-pills {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-v5-main {
            min-height: 640px;
            background-position: 62% center;
            padding: 2rem 5% 6rem 5%;
          }

          .hero-v5-header {
            text-align: center;
          }

          .hero-v5-title {
            justify-content: center;
          }

          .hero-v5-middle {
            flex-direction: column;
            align-items: center;
            margin-top: 2.5rem;
            gap: 2rem;
          }

          .hero-v5-left-cta {
            align-items: center;
            width: 100%;
          }

          .hero-v5-cards {
            width: 100%;
            max-width: 320px;
          }

          .hero-v5-wave-callout {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }

          .hero-v5-spec-heading {
            text-align: center;
          }

          .hero-v5-spec-pills {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .hero-v5-spec-pills {
            grid-template-columns: 1fr;
          }
        }
      `}})]})};var o=e.i(6310),n=e.i(52186),l=e.i(96616);e.s(["default",0,()=>(0,r.jsxs)("main",{children:[(0,r.jsxs)(t.default,{children:[(0,r.jsx)("title",{children:"Insider Mortgage | Trusted Experts"}),(0,r.jsx)("meta",{name:"description",content:"Insider Mortgage - Specializing in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors"})]}),(0,r.jsx)(a,{}),(0,r.jsx)(o.default,{}),(0,r.jsx)(n.default,{}),(0,r.jsx)(l.default,{})]})],26706)}]);