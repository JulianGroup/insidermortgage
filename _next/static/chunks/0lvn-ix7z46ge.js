(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,6310,52186,96616,e=>{"use strict";var s=e.i(43476),i=e.i(71645),t=e.i(22016);let r=[{id:"self-employed",title:"Self-Employed Borrowers",description:"We understand that your tax returns don't always tell the whole story. Leverage our alternative documentation programs designed for entrepreneurs.",icon:"💼",highlights:["Bank Statement Loans","P&L Only Programs","1099 Expense Ratio Loans"],route:"/self-employed"},{id:"retiree",title:"Retirees",description:"Unlock the equity in your home or qualify for a new purchase using your hard-earned retirement assets, even without traditional employment income.",icon:"🌅",highlights:["Asset Depletion Programs","Reverse Mortgages","Retirement Account Qualifying"],route:"/retirees"},{id:"investor",title:"Rental Property Financing",description:"Expand your real estate portfolio without the red tape. Qualify strictly based on the cash flow of the property, not your personal income.",icon:"🏢",highlights:["DSCR Loans","No Personal Income Limits","Portfolio Expansion"],route:"/dscr-loans"},{id:"first-time",title:"First-Time Home Buyers",description:"Navigate the home buying process with confidence. We provide a step-by-step roadmap and low-down-payment options to get you into your first home.",icon:"🔑",highlights:["Low Down Payment","Down Payment Assistance","Educational Roadmap"],route:"/first-time"}];e.s(["default",0,()=>(0,s.jsx)("section",{className:"section solutions-section",id:"solutions",children:(0,s.jsxs)("div",{className:"container",children:[(0,s.jsxs)("div",{className:"solutions-header",children:[(0,s.jsx)("h2",{children:"Who We Serve"}),(0,s.jsx)("p",{children:"We believe mortgage solutions shouldn't be one-size-fits-all. We specialize in tailoring programs to fit your unique financial picture."})]}),(0,s.jsx)("div",{className:"solutions-grid",children:r.map(e=>(0,s.jsxs)("div",{className:"solution-card",children:[(0,s.jsx)("div",{className:"solution-icon",children:e.icon}),(0,s.jsx)("h3",{children:e.title}),(0,s.jsx)("p",{children:e.description}),(0,s.jsx)("ul",{className:"solution-features",children:e.highlights.map((e,i)=>(0,s.jsx)("li",{children:e},i))}),(0,s.jsx)(t.default,{href:e.route,className:"btn btn-outline",style:{width:"100%",textAlign:"center",display:"inline-block"},children:"Learn More"})]},e.id))})]})})],6310),e.s(["default",0,()=>((0,i.useEffect)(()=>{if(!document.getElementById("jotform-widget-script")){let e=document.createElement("script");e.id="jotform-widget-script",e.src="https://www.jotform.com/website-widgets/embed/019e8576208670b48ce5b752598ff8e0e156",e.async=!0,document.body.appendChild(e)}},[]),(0,s.jsx)("section",{className:"testimonials-section",id:"reviews",children:(0,s.jsxs)("div",{className:"container",children:[(0,s.jsxs)("div",{className:"testimonials-header",children:[(0,s.jsx)("h2",{children:"Client Success Stories"}),(0,s.jsx)("p",{children:"Don't just take our word for it. Here is what our clients have to say about working with Insider Mortgage."})]}),(0,s.jsx)("div",{id:"JFWebsiteWidget-019e8576208670b48ce5b752598ff8e0e156",style:{width:"100%",margin:"var(--space-8) 0"}})]})}))],52186),e.s(["default",0,()=>{let[e,t]=(0,i.useState)({name:"",email:"",phone:"",category:""}),[r,a]=(0,i.useState)(null),o=s=>{t({...e,[s.target.name]:s.target.value})},n=async s=>{s.preventDefault(),a("submitting");try{await fetch("https://script.google.com/macros/s/AKfycbz_YOUR_SCRIPT_ID/exec",{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),a("success"),t({name:"",email:"",phone:"",category:""})}catch(e){console.error("Submission Error:",e),a("error")}};return(0,s.jsx)("section",{className:"lead-capture-section",id:"contact",children:(0,s.jsxs)("div",{className:"container lead-capture-container",children:[(0,s.jsxs)("div",{className:"lead-content",children:[(0,s.jsx)("h2",{children:"Ready to Take the Next Step?"}),(0,s.jsx)("p",{children:"Whether you're just starting to explore your options or you're ready to get pre-approved, our team is here to provide expert guidance tailored to your scenario."}),(0,s.jsxs)("div",{className:"trust-badges",children:[(0,s.jsx)("span",{className:"trust-badge",children:"🔒 Secure Data"}),(0,s.jsx)("span",{className:"trust-badge",children:"⚡ Fast Pre-Approvals"}),(0,s.jsx)("span",{className:"trust-badge",children:"🤝 Expert Guidance"})]})]}),(0,s.jsxs)("div",{className:"card lead-form-card",children:[(0,s.jsx)("h3",{style:{marginBottom:"1.5rem"},children:"Request a Consultation"}),(0,s.jsxs)("form",{onSubmit:n,children:[(0,s.jsxs)("div",{className:"form-group",children:[(0,s.jsx)("label",{className:"form-label",children:"Full Name"}),(0,s.jsx)("input",{type:"text",name:"name",className:"form-input",required:!0,value:e.name,onChange:o,placeholder:"John Doe"})]}),(0,s.jsxs)("div",{className:"form-group",children:[(0,s.jsx)("label",{className:"form-label",children:"Email Address"}),(0,s.jsx)("input",{type:"email",name:"email",className:"form-input",required:!0,value:e.email,onChange:o,placeholder:"john@example.com"})]}),(0,s.jsxs)("div",{className:"form-group",children:[(0,s.jsx)("label",{className:"form-label",children:"Phone Number"}),(0,s.jsx)("input",{type:"tel",name:"phone",className:"form-input",value:e.phone,onChange:o,placeholder:"(555) 123-4567"})]}),(0,s.jsxs)("div",{className:"form-group",children:[(0,s.jsx)("label",{className:"form-label",children:"I am best described as a..."}),(0,s.jsxs)("select",{name:"category",className:"form-select",required:!0,value:e.category,onChange:o,children:[(0,s.jsx)("option",{value:"",disabled:!0,children:"Select a profile..."}),(0,s.jsx)("option",{value:"Self-Employed",children:"Self-Employed Borrower"}),(0,s.jsx)("option",{value:"Retiree",children:"Retiree"}),(0,s.jsx)("option",{value:"Real Estate Investor",children:"Real Estate Investor (Rental Property)"}),(0,s.jsx)("option",{value:"First-Time Home Buyer",children:"First-Time Home Buyer"}),(0,s.jsx)("option",{value:"Other",children:"Other / Standard Refinance"})]})]}),(0,s.jsx)("button",{type:"submit",className:"btn btn-primary submit-btn",disabled:"submitting"===r,children:"submitting"===r?"Sending...":"Get Started"}),"success"===r&&(0,s.jsx)("div",{className:"form-status status-success",children:"Thank you! Your information has been received. We will be in touch shortly."}),"error"===r&&(0,s.jsx)("div",{className:"form-status status-error",children:"There was an error sending your request. Please try again later."})]})]})]})})}],96616)},36159,(e,s,i)=>{"use strict";function t(){return null}Object.defineProperty(i,"__esModule",{value:!0}),Object.defineProperty(i,"default",{enumerable:!0,get:function(){return t}}),("function"==typeof i.default||"object"==typeof i.default&&null!==i.default)&&void 0===i.default.__esModule&&(Object.defineProperty(i.default,"__esModule",{value:!0}),Object.assign(i.default,i),s.exports=i.default)},80039,e=>{"use strict";var s=e.i(43476),i=e.i(71645),t=e.i(36159),r=e.i(22016);let a=()=>{let e=[{label:"Self-Employed",href:"#self-employed",twoLine:!1,icon:(0,s.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,s.jsx)("circle",{cx:"15",cy:"11",r:"4.5"}),(0,s.jsx)("path",{d:"M7 26c0-4.2 3.6-7.5 8-7.5 2.4 0 4.5.9 6 2.3"}),(0,s.jsx)("path",{d:"M18 21h10l-2 7H16z"}),(0,s.jsx)("path",{d:"M6 28h24"})]})},{label:"Investors",href:"#investors",twoLine:!1,icon:(0,s.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,s.jsx)("path",{d:"M5 17L18 6l13 11"}),(0,s.jsx)("path",{d:"M9 14.5V29h18V14.5"}),(0,s.jsx)("rect",{x:"15",y:"20",width:"6",height:"9"})]})},{label:"First Time Buyers",href:"#first-time-buyers",twoLine:!1,icon:(0,s.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,s.jsx)("path",{d:"M5 17L18 6l13 11"}),(0,s.jsx)("path",{d:"M9 14.5V29h18V14.5"}),(0,s.jsx)("rect",{x:"15",y:"20",width:"6",height:"9"})]})},{label:"Retirees",href:"#retirees",twoLine:!1,icon:(0,s.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,s.jsx)("path",{d:"M18 28V13"}),(0,s.jsx)("path",{d:"M18 13c-3-4-8-4-10-1 3 0 6 1 10 1z"}),(0,s.jsx)("path",{d:"M18 13c3-4 8-4 10-1-3 0-6 1-10 1z"}),(0,s.jsx)("path",{d:"M18 13c-5-1-9 2-10 5 3-1 6-2 10-5z"}),(0,s.jsx)("path",{d:"M18 13c5-1 9 2 10 5-3-1-6-2-10-5z"}),(0,s.jsx)("path",{d:"M11 29c2.2-1.8 4.6-2.5 7-2.5s4.8.7 7 2.5"})]})},{label:(0,s.jsxs)(s.Fragment,{children:["Borrowers with",(0,s.jsx)("br",{}),"Complicated Scenarios"]}),key:"Borrowers with Complicated Scenarios",href:"#complicated-scenarios",twoLine:!0,icon:(0,s.jsxs)("svg",{viewBox:"0 0 40 36",width:"34",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,s.jsx)("path",{d:"M23 27H9a2.5 2.5 0 0 1-2.5-2.5v-17A2.5 2.5 0 0 1 9 5h13a2.5 2.5 0 0 1 2.5 2.5v9"}),(0,s.jsx)("line",{x1:"11",y1:"11",x2:"19",y2:"11"}),(0,s.jsx)("line",{x1:"11",y1:"15.5",x2:"19",y2:"15.5"}),(0,s.jsx)("line",{x1:"11",y1:"20",x2:"16",y2:"20"}),(0,s.jsx)("circle",{cx:"27",cy:"24",r:"3.2"}),(0,s.jsx)("path",{d:"M27 18.2v1.6M27 28.2v1.6M21.2 24h1.6M31.2 24h1.6M22.9 19.9l1.1 1.1M30 27l1.1 1.1M31.1 19.9L30 21M24 27l-1.1 1.1"})]})}];return(0,s.jsxs)(i.default.Fragment,{children:[(0,s.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@500;600;700;800&display=swap",rel:"stylesheet"}),(0,s.jsxs)("div",{className:"hero-v6-wrapper",children:[(0,s.jsxs)("section",{className:"hero-v6-stage",children:[(0,s.jsx)("img",{src:"/insidermortgage/splash-bg.jpg",alt:"Surfing dog riding the interest rate wave",className:"hero-v6-bg-img"}),(0,s.jsxs)("div",{className:"hero-v6-header",children:[(0,s.jsx)("h1",{className:"hero-v6-title-h1",children:(0,s.jsx)("img",{src:"/insidermortgage/headline-graphic.png",alt:"TRUSTED MORTGAGE EXPERTS",className:"hero-v6-headline-img"})}),(0,s.jsxs)("p",{className:"hero-v6-subtitle",children:["Recommended by"," ",(0,s.jsx)("span",{className:"hero-v6-subtitle-accent",children:"Professionals, Friends & Family."})]})]}),(0,s.jsx)("div",{className:"hero-v6-wave-callout",children:(0,s.jsx)("img",{src:"/insidermortgage/wave-quote-graphic.png",alt:"I'm riding the interest rate wave",className:"hero-v6-wave-quote-img"})}),(0,s.jsx)("div",{className:"hero-v6-wave-divider",children:(0,s.jsxs)("svg",{viewBox:"0 0 1440 110",preserveAspectRatio:"none",className:"hero-v6-wave-svg",children:[(0,s.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65 L1440,110 L0,110 Z",fill:"#041E3A"}),(0,s.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65",fill:"none",stroke:"#F2C230",strokeWidth:"4.5"})]})})]}),(0,s.jsx)("section",{className:"hero-v6-specializations-band",children:(0,s.jsxs)("div",{className:"hero-v6-spec-inner",children:[(0,s.jsxs)("h2",{className:"hero-v6-spec-heading",children:[(0,s.jsx)("strong",{children:"Team Insider"})," specializes in loans for:"]}),(0,s.jsx)("div",{className:"hero-v6-spec-pills",children:e.map(e=>(0,s.jsxs)("a",{href:e.href,className:`hero-v6-spec-pill ${e.twoLine?"hero-v6-spec-pill-twoline":""}`,children:[(0,s.jsx)("span",{className:"hero-v6-spec-pill-icon",children:e.icon}),(0,s.jsx)("span",{className:"hero-v6-spec-pill-label",children:e.label}),(0,s.jsx)("span",{className:"hero-v6-spec-pill-chevron",children:(0,s.jsx)("svg",{viewBox:"0 0 24 24",width:"18",height:"18",fill:"none",stroke:"#0A2342",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,s.jsx)("polyline",{points:"9 6 15 12 9 18"})})})]},e.key||e.label))})]})})]}),(0,s.jsx)("section",{className:"hero",style:{padding:"4rem 1rem",background:"var(--primary)",position:"relative",zIndex:2},children:(0,s.jsxs)("div",{className:"container hero-container animate-fade-in",style:{padding:0},children:[(0,s.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:"2.5rem",fontFamily:"'Montserrat', sans-serif",color:"#FFFFFF"},children:[(0,s.jsx)("h2",{style:{margin:0,fontFamily:"'Montserrat', sans-serif",fontWeight:800,fontSize:"clamp(2.4rem, 5vw, 3.8rem)",lineHeight:1.05,letterSpacing:"-0.5px",color:"#FFFFFF"},children:"Team Insider"}),(0,s.jsx)("svg",{viewBox:"0 0 420 26",preserveAspectRatio:"none",style:{width:"clamp(240px, 44vw, 390px)",height:"clamp(14px, 2.2vw, 22px)",margin:"0.2rem 0 0.25rem 0",display:"block"},children:(0,s.jsx)("path",{d:"M6,20 Q205,2 414,15 Q210,11 18,24 Z",fill:"#F2C230"})}),(0,s.jsxs)("p",{style:{margin:0,fontFamily:"'Montserrat', sans-serif",fontWeight:500,fontSize:"clamp(1.25rem, 2.6vw, 2rem)",lineHeight:1.2,color:"#FFFFFF"},children:["led by ",(0,s.jsx)("strong",{style:{fontWeight:700},children:"David & Rakesh"})]})]}),(0,s.jsxs)("div",{className:"partners-section",style:{marginTop:"0"},children:[(0,s.jsxs)("div",{className:"partner-card",children:[(0,s.jsx)("img",{src:"/insidermortgage/rakesh-jain.jpg",alt:"Rakesh Jain",className:"partner-bg-image"}),(0,s.jsxs)("div",{className:"partner-info",children:[(0,s.jsx)("h3",{children:"Rakesh Jain"}),(0,s.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,s.jsx)(r.default,{href:"/bio-rakesh",className:"partner-bio-btn",children:"Bio"})]})]}),(0,s.jsxs)("div",{className:"partner-card",children:[(0,s.jsx)("img",{src:"/insidermortgage/david-sider.jpg",alt:"David Sider",className:"partner-bg-image"}),(0,s.jsxs)("div",{className:"partner-info",children:[(0,s.jsx)("h3",{children:"David Sider"}),(0,s.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,s.jsx)(r.default,{href:"/bio-david",className:"partner-bio-btn",children:"Bio"})]})]})]})]})}),(0,s.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        .hero-v6-wrapper {
          width: 100%;
          background-color: #041E3A;
          overflow: hidden;
        }

        .hero-v6-stage {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background-color: #041E3A;
        }

        .hero-v6-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          z-index: 1;
        }

        .hero-v6-header {
          position: absolute;
          top: 6.5%;
          left: 3.6%;
          width: 76%;
          z-index: 3;
          text-align: left;
        }

        .hero-v6-title-h1 {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        .hero-v6-headline-img {
          width: 100%;
          max-width: 1050px;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
        }

        .hero-v6-subtitle {
          margin: 0.35vw 0 0 0.2vw;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 2.05vw, 2.05rem);
          color: #FFFFFF;
          letter-spacing: -0.3px;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.95);
        }

        .hero-v6-subtitle-accent {
          color: #F2C230;
        }

        .hero-v6-wave-callout {
          position: absolute;
          top: 57.5%;
          left: 77%;
          width: 21%;
          z-index: 3;
          pointer-events: none;
        }

        .hero-v6-wave-quote-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 1px 6px rgba(255, 255, 255, 0.45));
        }

        .hero-v6-wave-divider {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 2;
          pointer-events: none;
        }

        .hero-v6-wave-svg {
          display: block;
          width: 100%;
          height: clamp(45px, 6.8vw, 98px);
        }

        .hero-v6-specializations-band {
          background-color: #041E3A;
          padding: 0.25rem 3.8% 2.5rem 3.8%;
          position: relative;
          z-index: 3;
        }

        .hero-v6-spec-inner {
          max-width: 1520px;
          margin: 0 auto;
        }

        .hero-v6-spec-heading {
          margin: 0 0 1.1rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 2.1vw, 1.95rem);
          color: #F4F7FB;
        }

        .hero-v6-spec-heading strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .hero-v6-spec-pills {
          display: grid;
          grid-template-columns: 1fr 0.88fr 1.12fr 0.86fr 1.32fr;
          gap: 1rem;
          width: 100%;
        }

        .hero-v6-spec-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #F2C230;
          color: #0A2342;
          padding: 0.75rem 1rem;
          border-radius: 15px;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(0.9rem, 1.15vw, 1.15rem);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, background-color 0.2s ease;
          gap: 0.5rem;
          min-height: 64px;
        }

        .hero-v6-spec-pill:hover {
          background-color: #D6A414;
          transform: translateY(-2px);
        }

        .hero-v6-spec-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-v6-spec-pill-label {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          letter-spacing: -0.2px;
        }

        .hero-v6-spec-pill-twoline .hero-v6-spec-pill-label {
          text-align: left;
          line-height: 1.18;
          font-size: clamp(0.82rem, 1vw, 1.02rem);
          padding-left: 0.2rem;
        }

        .hero-v6-spec-pill-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 1180px) {
          .hero-v6-spec-pills {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-v6-stage {
            aspect-ratio: auto;
            min-height: 440px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.75rem 5% 4.5rem 5%;
          }

          .hero-v6-bg-img {
            object-position: 63% center;
          }

          .hero-v6-header {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            text-align: center;
          }

          .hero-v6-subtitle {
            margin-top: 0.5rem;
          }

          .hero-v6-wave-callout {
            position: relative;
            top: auto;
            left: auto;
            width: 200px;
            margin: 12rem auto 0 auto;
          }

          .hero-v6-spec-heading {
            text-align: center;
          }

          .hero-v6-spec-pills {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .hero-v6-spec-pills {
            grid-template-columns: 1fr;
          }
        }
      `}})]})};var o=e.i(6310),n=e.i(52186),l=e.i(96616);e.s(["default",0,()=>(0,s.jsxs)("main",{children:[(0,s.jsxs)(t.default,{children:[(0,s.jsx)("title",{children:"Insider Mortgage | Trusted Experts"}),(0,s.jsx)("meta",{name:"description",content:"Insider Mortgage - Specializing in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors"})]}),(0,s.jsx)(a,{}),(0,s.jsx)(o.default,{}),(0,s.jsx)(n.default,{}),(0,s.jsx)(l.default,{})]})],80039)}]);