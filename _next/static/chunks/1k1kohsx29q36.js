(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,6310,52186,96616,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(22016);let r=[{id:"self-employed",title:"Self-Employed Borrowers",description:"We understand that your tax returns don't always tell the whole story. Leverage our alternative documentation programs designed for entrepreneurs.",icon:"💼",highlights:["Bank Statement Loans","P&L Only Programs","1099 Expense Ratio Loans"],route:"/self-employed"},{id:"retiree",title:"Retirees",description:"Unlock the equity in your home or qualify for a new purchase using your hard-earned retirement assets, even without traditional employment income.",icon:"🌅",highlights:["Asset Depletion Programs","Reverse Mortgages","Retirement Account Qualifying"],route:"/retirees"},{id:"investor",title:"Rental Property Financing",description:"Expand your real estate portfolio without the red tape. Qualify strictly based on the cash flow of the property, not your personal income.",icon:"🏢",highlights:["DSCR Loans","No Personal Income Limits","Portfolio Expansion"],route:"/dscr-loans"},{id:"first-time",title:"First-Time Home Buyers",description:"Navigate the home buying process with confidence. We provide a step-by-step roadmap and low-down-payment options to get you into your first home.",icon:"🔑",highlights:["Low Down Payment","Down Payment Assistance","Educational Roadmap"],route:"/first-time"}];e.s(["default",0,()=>(0,t.jsx)("section",{className:"section solutions-section",id:"solutions",children:(0,t.jsxs)("div",{className:"container",children:[(0,t.jsxs)("div",{className:"solutions-header",children:[(0,t.jsx)("h2",{children:"Who We Serve"}),(0,t.jsx)("p",{children:"We believe mortgage solutions shouldn't be one-size-fits-all. We specialize in tailoring programs to fit your unique financial picture."})]}),(0,t.jsx)("div",{className:"solutions-grid",children:r.map(e=>(0,t.jsxs)("div",{className:"solution-card",children:[(0,t.jsx)("div",{className:"solution-icon",children:e.icon}),(0,t.jsx)("h3",{children:e.title}),(0,t.jsx)("p",{children:e.description}),(0,t.jsx)("ul",{className:"solution-features",children:e.highlights.map((e,s)=>(0,t.jsx)("li",{children:e},s))}),(0,t.jsx)(i.default,{href:e.route,className:"btn btn-outline",style:{width:"100%",textAlign:"center",display:"inline-block"},children:"Learn More"})]},e.id))})]})})],6310),e.s(["default",0,()=>((0,s.useEffect)(()=>{if(!document.getElementById("jotform-widget-script")){let e=document.createElement("script");e.id="jotform-widget-script",e.src="https://www.jotform.com/website-widgets/embed/019e8576208670b48ce5b752598ff8e0e156",e.async=!0,document.body.appendChild(e)}},[]),(0,t.jsx)("section",{className:"testimonials-section",id:"reviews",children:(0,t.jsxs)("div",{className:"container",children:[(0,t.jsxs)("div",{className:"testimonials-header",children:[(0,t.jsx)("h2",{children:"Client Success Stories"}),(0,t.jsx)("p",{children:"Don't just take our word for it. Here is what our clients have to say about working with Insider Mortgage."})]}),(0,t.jsx)("div",{id:"JFWebsiteWidget-019e8576208670b48ce5b752598ff8e0e156",style:{width:"100%",margin:"var(--space-8) 0"}})]})}))],52186),e.s(["default",0,()=>{let[e,i]=(0,s.useState)({name:"",email:"",phone:"",category:""}),[r,a]=(0,s.useState)(null),n=t=>{i({...e,[t.target.name]:t.target.value})},o=async t=>{t.preventDefault(),a("submitting");try{await fetch("https://script.google.com/macros/s/AKfycbz_YOUR_SCRIPT_ID/exec",{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),a("success"),i({name:"",email:"",phone:"",category:""})}catch(e){console.error("Submission Error:",e),a("error")}};return(0,t.jsx)("section",{className:"lead-capture-section",id:"contact",children:(0,t.jsxs)("div",{className:"container lead-capture-container",children:[(0,t.jsxs)("div",{className:"lead-content",children:[(0,t.jsx)("h2",{children:"Ready to Take the Next Step?"}),(0,t.jsx)("p",{children:"Whether you're just starting to explore your options or you're ready to get pre-approved, our team is here to provide expert guidance tailored to your scenario."}),(0,t.jsxs)("div",{className:"trust-badges",children:[(0,t.jsx)("span",{className:"trust-badge",children:"🔒 Secure Data"}),(0,t.jsx)("span",{className:"trust-badge",children:"⚡ Fast Pre-Approvals"}),(0,t.jsx)("span",{className:"trust-badge",children:"🤝 Expert Guidance"})]})]}),(0,t.jsxs)("div",{className:"card lead-form-card",children:[(0,t.jsx)("h3",{style:{marginBottom:"1.5rem"},children:"Request a Consultation"}),(0,t.jsxs)("form",{onSubmit:o,children:[(0,t.jsxs)("div",{className:"form-group",children:[(0,t.jsx)("label",{className:"form-label",children:"Full Name"}),(0,t.jsx)("input",{type:"text",name:"name",className:"form-input",required:!0,value:e.name,onChange:n,placeholder:"John Doe"})]}),(0,t.jsxs)("div",{className:"form-group",children:[(0,t.jsx)("label",{className:"form-label",children:"Email Address"}),(0,t.jsx)("input",{type:"email",name:"email",className:"form-input",required:!0,value:e.email,onChange:n,placeholder:"john@example.com"})]}),(0,t.jsxs)("div",{className:"form-group",children:[(0,t.jsx)("label",{className:"form-label",children:"Phone Number"}),(0,t.jsx)("input",{type:"tel",name:"phone",className:"form-input",value:e.phone,onChange:n,placeholder:"(555) 123-4567"})]}),(0,t.jsxs)("div",{className:"form-group",children:[(0,t.jsx)("label",{className:"form-label",children:"I am best described as a..."}),(0,t.jsxs)("select",{name:"category",className:"form-select",required:!0,value:e.category,onChange:n,children:[(0,t.jsx)("option",{value:"",disabled:!0,children:"Select a profile..."}),(0,t.jsx)("option",{value:"Self-Employed",children:"Self-Employed Borrower"}),(0,t.jsx)("option",{value:"Retiree",children:"Retiree"}),(0,t.jsx)("option",{value:"Real Estate Investor",children:"Real Estate Investor (Rental Property)"}),(0,t.jsx)("option",{value:"First-Time Home Buyer",children:"First-Time Home Buyer"}),(0,t.jsx)("option",{value:"Other",children:"Other / Standard Refinance"})]})]}),(0,t.jsx)("button",{type:"submit",className:"btn btn-primary submit-btn",disabled:"submitting"===r,children:"submitting"===r?"Sending...":"Get Started"}),"success"===r&&(0,t.jsx)("div",{className:"form-status status-success",children:"Thank you! Your information has been received. We will be in touch shortly."}),"error"===r&&(0,t.jsx)("div",{className:"form-status status-error",children:"There was an error sending your request. Please try again later."})]})]})]})})}],96616)},36159,(e,t,s)=>{"use strict";function i(){return null}Object.defineProperty(s,"__esModule",{value:!0}),Object.defineProperty(s,"default",{enumerable:!0,get:function(){return i}}),("function"==typeof s.default||"object"==typeof s.default&&null!==s.default)&&void 0===s.default.__esModule&&(Object.defineProperty(s.default,"__esModule",{value:!0}),Object.assign(s.default,s),t.exports=s.default)},82540,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(36159),r=e.i(22016);let a=()=>{let e=["Self-Employed","Investors","First Time Buyers","Retirees","Complicated Scenarios"];return(0,t.jsxs)(s.default.Fragment,{children:[(0,t.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@500;600;700;800&display=swap",rel:"stylesheet"}),(0,t.jsxs)("div",{className:"hero-v7-wrapper",children:[(0,t.jsxs)("section",{className:"hero-v7-stage",children:[(0,t.jsx)("img",{src:"/insidermortgage/splash-bg.jpg",alt:"Surfing dog riding the interest rate wave",className:"hero-v7-bg-img"}),(0,t.jsxs)("div",{className:"hero-v7-header",children:[(0,t.jsx)("h1",{className:"hero-v7-title-h1",children:(0,t.jsx)("img",{src:"/insidermortgage/headline-graphic.png",alt:"TRUSTED MORTGAGE EXPERTS",className:"hero-v7-headline-img"})}),(0,t.jsxs)("p",{className:"hero-v7-subtitle",children:["Recommended by"," ",(0,t.jsx)("span",{className:"hero-v7-subtitle-accent",children:"Professionals, Friends & Family."})]})]}),(0,t.jsx)("div",{className:"hero-v7-wave-callout",children:(0,t.jsx)("img",{src:"/insidermortgage/wave-quote-graphic.png",alt:"I'm riding the interest rate wave",className:"hero-v7-wave-quote-img"})}),(0,t.jsx)("div",{className:"hero-v7-wave-divider",children:(0,t.jsxs)("svg",{viewBox:"0 0 1440 110",preserveAspectRatio:"none",className:"hero-v7-wave-svg",children:[(0,t.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65 L1440,110 L0,110 Z",fill:"#041E3A"}),(0,t.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65",fill:"none",stroke:"#F2C230",strokeWidth:"4.5"})]})})]}),(0,t.jsx)("section",{className:"hero-v7-specializations-band",children:(0,t.jsxs)("div",{className:"hero-v7-spec-inner",children:[(0,t.jsxs)("h2",{className:"hero-v7-spec-heading",children:[(0,t.jsx)("strong",{children:"Team Insider"})," specializes in loans for:"]}),(0,t.jsx)("div",{className:"hero-v7-spec-text-line",children:e.map((i,r)=>(0,t.jsxs)(s.default.Fragment,{children:[(0,t.jsx)("span",{className:"hero-v7-spec-item",children:i}),r<e.length-1&&(0,t.jsx)("span",{className:"hero-v7-spec-bullet","aria-hidden":"true"})]},i))})]})})]}),(0,t.jsx)("section",{className:"hero",style:{padding:"4rem 1rem",background:"var(--primary)",position:"relative",zIndex:2},children:(0,t.jsxs)("div",{className:"container hero-container animate-fade-in",style:{padding:0},children:[(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:"2.5rem",fontFamily:"'Montserrat', sans-serif",color:"#FFFFFF"},children:[(0,t.jsx)("h2",{style:{margin:0,fontFamily:"'Montserrat', sans-serif",fontWeight:800,fontSize:"clamp(2.4rem, 5vw, 3.8rem)",lineHeight:1.05,letterSpacing:"-0.5px",color:"#FFFFFF"},children:"Team Insider"}),(0,t.jsx)("svg",{viewBox:"0 0 420 26",preserveAspectRatio:"none",style:{width:"clamp(240px, 44vw, 390px)",height:"clamp(14px, 2.2vw, 22px)",margin:"0.2rem 0 0.25rem 0",display:"block"},children:(0,t.jsx)("path",{d:"M6,20 Q205,2 414,15 Q210,11 18,24 Z",fill:"#F2C230"})}),(0,t.jsxs)("p",{style:{margin:0,fontFamily:"'Montserrat', sans-serif",fontWeight:500,fontSize:"clamp(1.25rem, 2.6vw, 2rem)",lineHeight:1.2,color:"#FFFFFF"},children:["led by ",(0,t.jsx)("strong",{style:{fontWeight:700},children:"David & Rakesh"})]})]}),(0,t.jsxs)("div",{className:"partners-section",style:{marginTop:"0"},children:[(0,t.jsxs)("div",{className:"partner-card",children:[(0,t.jsx)("img",{src:"/insidermortgage/rakesh-jain.jpg",alt:"Rakesh Jain",className:"partner-bg-image"}),(0,t.jsxs)("div",{className:"partner-info",children:[(0,t.jsx)("h3",{children:"Rakesh Jain"}),(0,t.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,t.jsx)(r.default,{href:"/bio-rakesh",className:"partner-bio-btn",children:"Bio"})]})]}),(0,t.jsxs)("div",{className:"partner-card",children:[(0,t.jsx)("img",{src:"/insidermortgage/david-sider.jpg",alt:"David Sider",className:"partner-bg-image"}),(0,t.jsxs)("div",{className:"partner-info",children:[(0,t.jsx)("h3",{children:"David Sider"}),(0,t.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,t.jsx)(r.default,{href:"/bio-david",className:"partner-bio-btn",children:"Bio"})]})]})]})]})}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        .hero-v7-wrapper {
          width: 100%;
          background-color: #041E3A;
          overflow: hidden;
        }

        .hero-v7-stage {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background-color: #041E3A;
        }

        .hero-v7-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          z-index: 1;
        }

        .hero-v7-header {
          position: absolute;
          top: 6.5%;
          left: 3.6%;
          width: 76%;
          z-index: 3;
          text-align: left;
        }

        .hero-v7-title-h1 {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        .hero-v7-headline-img {
          width: 100%;
          max-width: 1050px;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
        }

        .hero-v7-subtitle {
          margin: 0.35vw 0 0 0.2vw;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 2.05vw, 2.05rem);
          color: #FFFFFF;
          letter-spacing: -0.3px;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.95);
        }

        .hero-v7-subtitle-accent {
          color: #F2C230;
        }

        .hero-v7-wave-callout {
          position: absolute;
          top: 57.5%;
          left: 77%;
          width: 21%;
          z-index: 3;
          pointer-events: none;
        }

        .hero-v7-wave-quote-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 1px 6px rgba(255, 255, 255, 0.45));
        }

        .hero-v7-wave-divider {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 2;
          pointer-events: none;
        }

        .hero-v7-wave-svg {
          display: block;
          width: 100%;
          height: clamp(45px, 6.8vw, 98px);
        }

        .hero-v7-specializations-band {
          background-color: #041E3A;
          padding: 0.4rem 3.8% 2.75rem 3.8%;
          position: relative;
          z-index: 3;
        }

        .hero-v7-spec-inner {
          max-width: 1520px;
          margin: 0 auto;
        }

        .hero-v7-spec-heading {
          margin: 0 0 1.25rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 2.1vw, 1.95rem);
          color: #F4F7FB;
        }

        .hero-v7-spec-heading strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .hero-v7-spec-text-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.9rem 1.25rem;
          max-width: 1420px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.15rem, 1.85vw, 1.75rem);
          color: #F4F7FB;
          letter-spacing: -0.2px;
        }

        .hero-v7-spec-item {
          white-space: nowrap;
        }

        .hero-v7-spec-bullet {
          display: inline-block;
          width: clamp(9px, 0.9vw, 13px);
          height: clamp(9px, 0.9vw, 13px);
          border-radius: 50%;
          background-color: #F2C230;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .hero-v7-spec-text-line {
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .hero-v7-stage {
            aspect-ratio: auto;
            min-height: 440px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.75rem 5% 4.5rem 5%;
          }

          .hero-v7-bg-img {
            object-position: 63% center;
          }

          .hero-v7-header {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            text-align: center;
          }

          .hero-v7-subtitle {
            margin-top: 0.5rem;
          }

          .hero-v7-wave-callout {
            position: relative;
            top: auto;
            left: auto;
            width: 200px;
            margin: 12rem auto 0 auto;
          }

          .hero-v7-spec-heading {
            text-align: center;
          }

          .hero-v7-spec-text-line {
            justify-content: center;
            text-align: center;
          }
        }
      `}})]})};var n=e.i(6310),o=e.i(52186),l=e.i(96616);e.s(["default",0,()=>(0,t.jsxs)("main",{children:[(0,t.jsxs)(i.default,{children:[(0,t.jsx)("title",{children:"Insider Mortgage | Trusted Experts"}),(0,t.jsx)("meta",{name:"description",content:"Insider Mortgage - Specializing in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors"})]}),(0,t.jsx)(a,{}),(0,t.jsx)(n.default,{}),(0,t.jsx)(o.default,{}),(0,t.jsx)(l.default,{})]})],82540)}]);