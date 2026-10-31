(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,36159,(e,t,s)=>{"use strict";function i(){return null}Object.defineProperty(s,"__esModule",{value:!0}),Object.defineProperty(s,"default",{enumerable:!0,get:function(){return i}}),("function"==typeof s.default||"object"==typeof s.default&&null!==s.default)&&void 0===s.default.__esModule&&(Object.defineProperty(s.default,"__esModule",{value:!0}),Object.assign(s.default,s),t.exports=s.default)},21623,e=>{"use strict";var t=e.i(47167);e.i(36180);var s=e.i(91304),s=s,i=e.i(63802),r=s,a=e.i(21052);let n="rjain@insidermtg.com",o="dsider@insidermtg.com",l=`https://formsubmit.co/ajax/${n}`,c=t.default.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL||"",d={"/":"Homepage (Home V6)","/home-v2":"Home V2","/home-v4":"Home V4","/home-v5":"Home V5","/home-v6":"Home V6","/home-v7":"Home V7","/home-v8":"Home V8","/home-with-dog":"Home (Surfing Dog)","/home-backup":"Home (Backup)","/refinance":"Refinance Consultation Page","/pre-approval":"Purchase Pre-Approval Page","/retirees":"Mortgages for Retirees","/self-employed-programs":"Self-Employed Programs","/bank-statement-loans":"Bank Statement Loans","/1099-loans":"1099 Loans","/dscr-loans":"DSCR Investor Loans","/first-time":"First-Time Home Buyers","/mortgage-for-contractors":"Mortgages for Contractors","/mortgage-for-gig-workers":"Mortgages for Gig Workers","/mortgage-for-llc":"Mortgages for LLCs","/mortgage-for-realtors":"Mortgages for Realtors","/mortgage-for-scorp":"Mortgages for S-Corps","/mortgage-for-small-business":"Mortgages for Small Business Owners","/CAprop-19-calculator":"CA Prop 19 Calculator"},h={propertyAddress:"Property Address",propertyValue:"Estimated Property Value",loanBalance:"Current Loan Balance",interestRate:"Current Interest Rate",piPayment:"Monthly P&I Payment",miAmount:"Monthly Mortgage Insurance",impounds:"Taxes & Insurance Impounded",occupancy:"Property Occupancy",notes:"Borrower Notes / Goals",firstTimeBuyer:"First-Time Home Buyer?",vaEligible:"VA Loan Eligible?",movingHomes:"Selling Current Home?"};async function p(e,t="Website Form"){let m,u,g,x,f=Array.isArray(e.preferredDays)||!!e.preferredTime,v=Array.isArray(e.preferredDays)&&e.preferredDays.length>0?e.preferredDays.join(", "):f?"Flexible":"",{pageName:y,shortPageName:j,pathname:w,pageUrl:b}=(u=(m=window.location?.pathname||"/").length>1&&m.endsWith("/")?m.slice(0,-1):m,g="u">typeof document?document.title:"",x=d[u]||g||t||u,{pageName:`${x} (${m})`,shortPageName:x,pathname:m,pageUrl:window.location?.href||m}),N=new Date().toISOString(),k=new Date().toLocaleString("en-US",{timeZone:"America/Los_Angeles",dateStyle:"medium",timeStyle:"short"}),S=String(e.name||"").trim(),C=String(e.email||"").trim(),M=String(e.phone||"").trim(),L=String(e.category||t).trim(),P={};for(let[t,s]of Object.entries(h)){let i=e[t];void 0!==i&&""!==String(i).trim()&&(P[s]=String(i).trim())}let F=(0,i.addDoc)((0,s.aS)(a.db,"leads"),{...e,notifyEmails:[n,o],...v?{preferredDay:v}:{},pageName:y,pathname:w,pageUrl:b,source:y,submittedAt:(0,r.b7)(),submittedAtIso:N}),T={name:S,email:C,phone:M,category:L,preferredDay:v,preferredTime:f?e.preferredTime||"I'm flexible":"",..."boolean"==typeof e.smsConsent?{smsConsent:e.smsConsent}:{},shortPageName:j,pageName:y,pageUrl:b,source:y,extraFields:P,submittedAtPacific:k,notifyEmails:[n,o]},A=[F,fetch("/send-lead.php",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(T)}).then(async e=>{if(!e.ok)throw Error(`DreamHost mail HTTP ${e.status}`);return e.json()})];if(c)A.push(fetch(c,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(T)}));else{let t={_subject:`New Lead [${j}]: ${S}${L?` (${L})`:""}`,_cc:o,_replyto:C,_template:"table",_captcha:"false","Submitted From Page":y,"Page URL":b,"Full Name":S,"Email Address":C,"Phone Number":M||"Not provided","Borrower Profile / Form":L,...f?{"Preferred Day(s)":v,"Preferred Time (Pacific Time)":e.preferredTime||"I'm flexible"}:{},..."boolean"==typeof e.smsConsent?{"SMS Text Consent":e.smsConsent?"Yes, you may text me":"No"}:{},...P,"Submitted At (PT)":`${k} PT`};A.push(fetch(l,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(t)}).then(async e=>{if(!e.ok)throw Error(`FormSubmit HTTP ${e.status}`);return e.json()}))}if(!(await Promise.allSettled(A)).some(e=>"fulfilled"===e.status))throw Error("Submission failed across all channels")}e.s(["submitConsultationLead",0,p],21623)},95995,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(21623);let r=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],a=["Morning (9 AM–12 PM)","Afternoon (12 PM–4 PM)","Late afternoon (4 PM–6 PM)","I'm flexible"],n={name:"",email:"",phone:"",category:"",preferredDays:[],preferredTime:"I'm flexible",smsConsent:!1},o={name:"",email:"",phone:"",category:""};e.s(["default",0,({source:e="Schedule a Call Form",title:l="Request a Consultation"})=>{let[c,d]=(0,s.useState)(n),[h,p]=(0,s.useState)(o),[m,u]=(0,s.useState)(!1),[g,x]=(0,s.useState)(null),f=(0,s.useRef)(null),v=(0,s.useRef)(null),y=(0,s.useRef)(null),j=(0,s.useRef)(null),w=e=>{let t,s,{name:i,value:r,type:a,checked:n}=e.target,o="checkbox"===a?n:"phone"===i?0===(s=(11===(t=r.replace(/\D/g,"")).length&&t.startsWith("1")?t.slice(1):t).slice(0,10)).length?"":s.length<4?`(${s}`:s.length<7?`(${s.slice(0,3)}) ${s.slice(3)}`:`(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6,10)}`:r;d(e=>({...e,[i]:o})),h[i]&&p(e=>({...e,[i]:""}))},b=async t=>{if(t.preventDefault(),(()=>{let e={...o};if(c.name.trim()||(e.name="Please enter your full name."),c.email.trim()){var t;t=c.email,/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(t||"").trim())||(e.email="Please enter a valid email address (e.g., you@example.com).")}else e.email="Please enter your email address.";if(c.phone.trim()){let t,s;s=11===(t=String(c.phone||"").replace(/\D/g,"")).length&&t.startsWith("1")?t.slice(1):t,/^[2-9]\d{9}$/.test(s)||(e.phone="Please enter a valid 10-digit US phone number, e.g., (555) 123-4567.")}else e.phone="Please enter a 10-digit US phone number.";return(c.category||(e.category="Please select a profile option."),p(e),e.name)?(f.current?.focus(),!1):e.email?(v.current?.focus(),!1):e.phone?(y.current?.focus(),!1):!e.category||(j.current?.focus(),!1)})()){x("submitting");try{await (0,i.submitConsultationLead)(c,e),x("success"),d(n),p(o),u(!1)}catch(e){console.error("Submission Error:",e),x("error")}}};return(0,t.jsxs)("div",{className:"consult-mockup-card",children:[(0,t.jsx)("h3",{className:"consult-card-title",children:l}),(0,t.jsxs)("form",{onSubmit:b,className:"consult-mockup-form",noValidate:!0,children:[(0,t.jsx)("h4",{className:"consult-schedule-heading",children:"When is a good time to connect?"}),(0,t.jsx)("p",{className:"consult-schedule-subtext",children:"Let us know what works best for you."}),(0,t.jsxs)("div",{className:"consult-radio-section",children:[(0,t.jsx)("span",{className:"consult-radio-group-title",children:"Preferred day"}),(0,t.jsx)("div",{className:"consult-options-grid consult-days-grid",children:r.map(e=>(0,t.jsxs)("label",{className:"consult-radio-option",children:[(0,t.jsx)("input",{type:"checkbox",name:"preferredDays",value:e,checked:c.preferredDays.includes(e),onChange:()=>{d(t=>{let s=t.preferredDays.includes(e)?t.preferredDays.filter(t=>t!==e):[...t.preferredDays,e];return{...t,preferredDays:s}})},className:"consult-multi-radio-input"}),(0,t.jsx)("span",{children:e})]},e))})]}),(0,t.jsxs)("div",{className:"consult-radio-section",children:[(0,t.jsx)("span",{className:"consult-radio-group-title",children:"Preferred time (Pacific Time)"}),(0,t.jsx)("div",{className:"consult-options-grid consult-times-grid",children:a.map(e=>(0,t.jsxs)("label",{className:"consult-radio-option",children:[(0,t.jsx)("input",{type:"radio",name:"preferredTime",value:e,checked:c.preferredTime===e,onChange:w}),(0,t.jsx)("span",{children:e})]},e))})]}),(0,t.jsx)("button",{type:"button",className:"consult-dark-pill-btn",onClick:()=>{u(!0),setTimeout(()=>{f.current?.focus()},100)},children:"Schedule Time"}),m&&(0,t.jsxs)("div",{className:"consult-schedule-drawer",children:[(0,t.jsx)("p",{className:"consult-card-subtitle",style:{margin:"0 0 0.25rem 0"},children:"Tell us a little about yourself, and we'll help you take the next step."}),(0,t.jsxs)("div",{className:"consult-field-group",children:[(0,t.jsx)("label",{className:"consult-label",children:"Full Name"}),(0,t.jsx)("input",{ref:f,type:"text",name:"name",className:`consult-pill-input ${h.name?"consult-input-error":""}`,required:!0,value:c.name,onChange:w,placeholder:"Your full name"}),h.name&&(0,t.jsx)("span",{className:"consult-error-text",children:h.name})]}),(0,t.jsxs)("div",{className:"consult-field-group",children:[(0,t.jsx)("label",{className:"consult-label",children:"Email Address"}),(0,t.jsx)("input",{ref:v,type:"email",name:"email",className:`consult-pill-input ${h.email?"consult-input-error":""}`,required:!0,value:c.email,onChange:w,placeholder:"you@example.com"}),h.email&&(0,t.jsx)("span",{className:"consult-error-text",children:h.email})]}),(0,t.jsxs)("div",{className:"consult-field-group",children:[(0,t.jsx)("label",{className:"consult-label",children:"Phone Number"}),(0,t.jsx)("input",{ref:y,type:"tel",name:"phone",className:`consult-pill-input ${h.phone?"consult-input-error":""}`,required:!0,value:c.phone,onChange:w,placeholder:"(555) 123-4567"}),h.phone?(0,t.jsx)("span",{className:"consult-error-text",children:h.phone}):(0,t.jsx)("span",{className:"consult-helper-text",children:"We'll use this to follow up on your consultation request."})]}),(0,t.jsxs)("div",{className:"consult-field-group",children:[(0,t.jsx)("label",{className:"consult-label",children:"I am best described as a..."}),(0,t.jsxs)("select",{ref:j,name:"category",className:`consult-pill-select ${h.category?"consult-input-error":""}`,required:!0,value:c.category,onChange:w,children:[(0,t.jsx)("option",{value:"",disabled:!0,children:"Select a profile..."}),(0,t.jsx)("option",{value:"Self-Employed",children:"Self-Employed Borrower"}),(0,t.jsx)("option",{value:"Retiree",children:"Retiree"}),(0,t.jsx)("option",{value:"Real Estate Investor",children:"Real Estate Investor (Rental Property)"}),(0,t.jsx)("option",{value:"First-Time Home Buyer",children:"First-Time Home Buyer"}),(0,t.jsx)("option",{value:"Other",children:"Other / Standard Refinance"})]}),h.category&&(0,t.jsx)("span",{className:"consult-error-text",children:h.category})]}),(0,t.jsxs)("div",{className:"consult-sms-consent",children:[(0,t.jsxs)("label",{className:"consult-sms-label",children:[(0,t.jsx)("input",{type:"checkbox",name:"smsConsent",checked:c.smsConsent,onChange:w}),(0,t.jsx)("strong",{children:"Yes, you may text me."})]}),(0,t.jsx)("p",{className:"consult-sms-disclaimer",children:"I agree to receive text messages from Insider Mortgage about my consultation request and scheduling. Consent is not a condition of purchasing services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out."})]}),(0,t.jsx)("button",{type:"submit",className:"consult-dark-pill-btn consult-final-submit",disabled:"submitting"===g,children:"submitting"===g?"Sending...":"Request a Call"})]}),"success"===g&&(0,t.jsx)("div",{className:"form-status status-success",children:"Thank you! Your consultation request has been received. We will be in touch shortly."}),"error"===g&&(0,t.jsx)("div",{className:"form-status status-error",children:"There was an error sending your request. Please try again later."})]})]})}])},12700,e=>{"use strict";var t=e.i(43476),s=e.i(71645);function i(e,t,s){let i={event:"trust_chip_click",chip_id:e,chip_headline:t,chip_placement:s,timestamp:new Date().toISOString()};Array.isArray(window.dataLayer)&&window.dataLayer.push(i),"function"==typeof window.gtag&&window.gtag("event","trust_chip_click",{chip_id:e,chip_headline:t,chip_placement:s}),window.dispatchEvent(new CustomEvent("insider:trust_chip_click",{detail:i}))}e.s(["default",0,({placement:e="lead-capture",compact:r=!1,layout:a="row"})=>{let[n,o]=(0,s.useState)({rating:"5.0",count:61});(0,s.useEffect)(()=>{let e=!0,t=["/google-reviews/data/reviews.json"];return(async()=>{for(let s of t)try{let t=await fetch(s,{cache:"no-cache"});if(!t.ok)continue;let i=await t.json();if(e&&i){let e=Number(i.averageRating||5),t=Number(i.totalReviewCount||i.reviews&&i.reviews.length||61);o({rating:e.toFixed(1),count:t})}break}catch{}})(),()=>{e=!1}},[]);let l=[{id:"chip_1_google_rating",headline:`★ ${n.rating} on Google`,subline:`${n.count} client reviews`,href:"https://search.google.com/local/reviews?placeid=ChIJveC1LxQH3IARnyqTS4mmz80",external:!0,icon:(0,t.jsx)("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"currentColor","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M12 2l2.92 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21 7 14.14 2 9.27l7.08-1.01L12 2z"})})},{id:"chip_2_referred_by_trust",headline:"Referred by people you trust",subline:"Clients, CPAs & financial planners",href:"#reviews",external:!1,scrollTarget:"reviews",icon:(0,t.jsxs)("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,t.jsx)("path",{d:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}),(0,t.jsx)("circle",{cx:"9",cy:"7",r:"4"}),(0,t.jsx)("path",{d:"M23 21v-2a4 4 0 0 0-3-3.87"}),(0,t.jsx)("path",{d:"M16 3.13a4 4 0 0 1 0 7.75"})]})},{id:"chip_3_nmls_verified",headline:"Licensed in AZ, CA, FL, UT & WA",subline:"C2 Financial NMLS #135622 • Look us up",title:"NMLS IDs: 135622 (C2 Financial), 240594 (Rakesh Jain), 254108 (David Sider — CA)",href:"https://www.nmlsconsumeraccess.org/",external:!0,icon:(0,t.jsxs)("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,t.jsx)("path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"}),(0,t.jsx)("polyline",{points:"9 12 11 14 15 10"})]})},{id:"chip_4_work_directly",headline:"You work directly with us",subline:"David and Rakesh handle your loan personally",href:"tel:8588485653",external:!1,directAction:!0,icon:(0,t.jsx)("svg",{viewBox:"0 0 24 24",width:"22",height:"22",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"})})}],c=r?l.filter(e=>"chip_1_google_rating"===e.id||"chip_4_work_directly"===e.id):l;return(0,t.jsx)("div",{className:`tc-chips-grid ${"grid-2x2"===a?"tc-layout-2x2":"tc-layout-row"} ${r?"tc-layout-compact":""}`,role:"region","aria-label":"Verified Trust Credentials",children:c.map(s=>s.external?(0,t.jsxs)("a",{href:s.href,target:"_blank",rel:"noopener noreferrer",title:s.title,className:"tc-chip-card","data-analytics-event":s.id,onClick:()=>i(s.id,s.headline,e),children:[(0,t.jsx)("span",{className:"tc-chip-icon","aria-hidden":"true",children:s.icon}),(0,t.jsxs)("span",{className:"tc-chip-text",children:[(0,t.jsx)("span",{className:"tc-chip-headline",children:s.headline}),(0,t.jsx)("span",{className:"tc-chip-subline",children:s.subline})]})]},s.id):s.scrollTarget?(0,t.jsxs)("a",{href:s.href,className:"tc-chip-card","data-analytics-event":s.id,onClick:t=>{var r,a,n;let o;return r=s.scrollTarget,a=s.id,n=s.headline,t.preventDefault(),i(a,n,e),void((o=document.getElementById(r))?o.scrollIntoView({behavior:"smooth"}):window.location.hash=r)},children:[(0,t.jsx)("span",{className:"tc-chip-icon","aria-hidden":"true",children:s.icon}),(0,t.jsxs)("span",{className:"tc-chip-text",children:[(0,t.jsx)("span",{className:"tc-chip-headline",children:s.headline}),(0,t.jsx)("span",{className:"tc-chip-subline",children:s.subline})]})]},s.id):(0,t.jsxs)("a",{href:s.href,className:"tc-chip-card","data-analytics-event":s.id,onClick:t=>((t,s,r)=>{if(i(s,r,e),window.innerWidth<768)return;t.preventDefault();let a=document.getElementById("contact");a&&a.scrollIntoView({behavior:"smooth"})})(t,s.id,s.headline),children:[(0,t.jsx)("span",{className:"tc-chip-icon","aria-hidden":"true",children:s.icon}),(0,t.jsxs)("span",{className:"tc-chip-text",children:[(0,t.jsx)("span",{className:"tc-chip-headline",children:s.headline}),(0,t.jsx)("span",{className:"tc-chip-subline",children:s.subline})]})]},s.id))})}])},6310,52186,96616,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(22016);let r=[{id:"self-employed",title:"Self-Employed Borrowers",description:"We understand that your tax returns don't always tell the whole story. Leverage our alternative documentation programs designed for entrepreneurs.",icon:"💼",highlights:["Bank Statement Loans","P&L Only Programs","1099 Expense Ratio Loans"],route:"/self-employed-programs"},{id:"retiree",title:"Retirees",description:"Unlock the equity in your home or qualify for a new purchase using your hard-earned retirement assets, even without traditional employment income.",icon:"🌅",highlights:["Asset Depletion Programs","Reverse Mortgages","Retirement Account Qualifying"],route:"/retirees"},{id:"investor",title:"Rental Property Financing",description:"Expand your real estate portfolio without the red tape. Qualify strictly based on the cash flow of the property, not your personal income.",icon:"🏢",highlights:["DSCR Loans","No Personal Income Limits","Portfolio Expansion"],route:"/dscr-loans"},{id:"first-time",title:"First-Time Home Buyers",description:"Navigate the home buying process with confidence. We provide a step-by-step roadmap and low-down-payment options to get you into your first home.",icon:"🔑",highlights:["Low Down Payment","Down Payment Assistance","Educational Roadmap"],route:"/first-time"}];e.s(["default",0,()=>(0,t.jsx)("section",{className:"section solutions-section",id:"solutions",children:(0,t.jsxs)("div",{className:"container",children:[(0,t.jsxs)("div",{className:"solutions-header",children:[(0,t.jsx)("h2",{children:"Who We Serve"}),(0,t.jsx)("p",{children:"We believe mortgage solutions shouldn't be one-size-fits-all. We specialize in tailoring programs to fit your unique financial picture."})]}),(0,t.jsx)("div",{className:"solutions-grid",children:r.map(e=>(0,t.jsxs)("div",{className:"solution-card",children:[(0,t.jsx)("div",{className:"solution-icon",children:e.icon}),(0,t.jsx)("h3",{children:e.title}),(0,t.jsx)("p",{children:e.description}),(0,t.jsx)("ul",{className:"solution-features",children:e.highlights.map((e,s)=>(0,t.jsx)("li",{children:e},s))}),(0,t.jsx)(i.default,{href:e.route,className:"btn btn-outline",style:{width:"100%",textAlign:"center",display:"inline-block"},children:"Learn More"})]},e.id))})]})})],6310),e.s(["default",0,()=>((0,s.useEffect)(()=>{let e=document.querySelector("script[data-igr-script]"),t=()=>{window.InsiderGoogleReviews&&window.InsiderGoogleReviews.init()};if(e)t();else{let e=document.createElement("script");e.src="/google-reviews/google-reviews-widget.js",e.async=!0,e.setAttribute("data-igr-script","true"),e.onload=t,document.body.appendChild(e)}},[]),(0,t.jsx)("section",{className:"testimonials-section",id:"reviews",children:(0,t.jsx)("div",{className:"container",children:(0,t.jsx)("div",{id:"insider-google-reviews","data-reviews-url":"/google-reviews/data/reviews.json","data-heading":"The Word on the Street","data-show-heading":"true","data-expand-mode":"inline",style:{width:"100%","--igr-bg":"transparent","--igr-padding":"0"}})})}))],52186);var a=e.i(12700),n=e.i(95995);e.s(["default",0,()=>(0,t.jsx)("section",{className:"lead-capture-section",id:"contact",children:(0,t.jsxs)("div",{className:"container lead-capture-container",children:[(0,t.jsxs)("div",{className:"lead-content",children:[(0,t.jsx)("h2",{children:"Ready to Take the Next Step?"}),(0,t.jsx)("p",{children:"Whether you're just starting to explore your options or you're ready to get pre-approved, our team is here to provide expert guidance tailored to your scenario."}),(0,t.jsx)(a.default,{placement:"lead-capture",layout:"row"})]}),(0,t.jsx)(n.default,{source:"LeadCapture"})]})})],96616)},80039,e=>{"use strict";var t=e.i(43476),s=e.i(71645),i=e.i(36159),r=e.i(22016);let a=()=>{let e=[{label:"Self-Employed",href:"#self-employed",twoLine:!1,icon:(0,t.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("circle",{cx:"15",cy:"11",r:"4.5"}),(0,t.jsx)("path",{d:"M7 26c0-4.2 3.6-7.5 8-7.5 2.4 0 4.5.9 6 2.3"}),(0,t.jsx)("path",{d:"M18 21h10l-2 7H16z"}),(0,t.jsx)("path",{d:"M6 28h24"})]})},{label:"Investors",href:"#investors",twoLine:!1,icon:(0,t.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M5 17L18 6l13 11"}),(0,t.jsx)("path",{d:"M9 14.5V29h18V14.5"}),(0,t.jsx)("rect",{x:"15",y:"20",width:"6",height:"9"})]})},{label:"First Time Buyers",href:"#first-time-buyers",twoLine:!1,icon:(0,t.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M5 17L18 6l13 11"}),(0,t.jsx)("path",{d:"M9 14.5V29h18V14.5"}),(0,t.jsx)("rect",{x:"15",y:"20",width:"6",height:"9"})]})},{label:"Retirees",href:"#retirees",twoLine:!1,icon:(0,t.jsxs)("svg",{viewBox:"0 0 36 36",width:"30",height:"30",fill:"none",stroke:"#0A2342",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M18 28V13"}),(0,t.jsx)("path",{d:"M18 13c-3-4-8-4-10-1 3 0 6 1 10 1z"}),(0,t.jsx)("path",{d:"M18 13c3-4 8-4 10-1-3 0-6 1-10 1z"}),(0,t.jsx)("path",{d:"M18 13c-5-1-9 2-10 5 3-1 6-2 10-5z"}),(0,t.jsx)("path",{d:"M18 13c5-1 9 2 10 5-3-1-6-2-10-5z"}),(0,t.jsx)("path",{d:"M11 29c2.2-1.8 4.6-2.5 7-2.5s4.8.7 7 2.5"})]})},{label:(0,t.jsxs)(t.Fragment,{children:["Borrowers with",(0,t.jsx)("br",{}),"Complicated Scenarios"]}),key:"Borrowers with Complicated Scenarios",href:"#complicated-scenarios",twoLine:!0,icon:(0,t.jsxs)("svg",{viewBox:"0 0 40 36",width:"34",height:"32",fill:"none",stroke:"#0A2342",strokeWidth:"2.3",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M23 27H9a2.5 2.5 0 0 1-2.5-2.5v-17A2.5 2.5 0 0 1 9 5h13a2.5 2.5 0 0 1 2.5 2.5v9"}),(0,t.jsx)("line",{x1:"11",y1:"11",x2:"19",y2:"11"}),(0,t.jsx)("line",{x1:"11",y1:"15.5",x2:"19",y2:"15.5"}),(0,t.jsx)("line",{x1:"11",y1:"20",x2:"16",y2:"20"}),(0,t.jsx)("circle",{cx:"27",cy:"24",r:"3.2"}),(0,t.jsx)("path",{d:"M27 18.2v1.6M27 28.2v1.6M21.2 24h1.6M31.2 24h1.6M22.9 19.9l1.1 1.1M30 27l1.1 1.1M31.1 19.9L30 21M24 27l-1.1 1.1"})]})}];return(0,t.jsxs)(s.default.Fragment,{children:[(0,t.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@500;600;700;800&display=swap",rel:"stylesheet"}),(0,t.jsxs)("div",{className:"hero-v6-wrapper",children:[(0,t.jsxs)("section",{className:"hero-v6-stage",children:[(0,t.jsx)("img",{src:"/splash-bg.jpg",alt:"Surfing dog riding the interest rate wave",className:"hero-v6-bg-img"}),(0,t.jsxs)("div",{className:"hero-v6-header",children:[(0,t.jsx)("h1",{className:"hero-v6-title-h1",children:(0,t.jsx)("img",{src:"/headline-graphic.png",alt:"TRUSTED MORTGAGE EXPERTS",className:"hero-v6-headline-img"})}),(0,t.jsxs)("p",{className:"hero-v6-subtitle",children:["Recommended by"," ",(0,t.jsx)("span",{className:"hero-v6-subtitle-accent",children:"Professionals, Friends & Family."})]})]}),(0,t.jsx)("div",{className:"hero-v6-wave-callout",children:(0,t.jsx)("img",{src:"/wave-quote-graphic.png",alt:"I'm riding the interest rate wave",className:"hero-v6-wave-quote-img"})}),(0,t.jsx)("div",{className:"hero-v6-wave-divider",children:(0,t.jsxs)("svg",{viewBox:"0 0 1440 110",preserveAspectRatio:"none",className:"hero-v6-wave-svg",children:[(0,t.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65 L1440,110 L0,110 Z",fill:"#041E3A"}),(0,t.jsx)("path",{d:"M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65",fill:"none",stroke:"#F2C230",strokeWidth:"4.5"})]})})]}),(0,t.jsx)("section",{className:"hero-v6-specializations-band",children:(0,t.jsxs)("div",{className:"hero-v6-spec-inner",children:[(0,t.jsxs)("h2",{className:"hero-v6-spec-heading",children:[(0,t.jsx)("strong",{children:"Team Insider"})," specializes in loans for:"]}),(0,t.jsx)("div",{className:"hero-v6-spec-pills",children:e.map(e=>(0,t.jsxs)("a",{href:e.href,className:`hero-v6-spec-pill ${e.twoLine?"hero-v6-spec-pill-twoline":""}`,children:[(0,t.jsx)("span",{className:"hero-v6-spec-pill-icon",children:e.icon}),(0,t.jsx)("span",{className:"hero-v6-spec-pill-label",children:e.label}),(0,t.jsx)("span",{className:"hero-v6-spec-pill-chevron",children:(0,t.jsx)("svg",{viewBox:"0 0 24 24",width:"18",height:"18",fill:"none",stroke:"#0A2342",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("polyline",{points:"9 6 15 12 9 18"})})})]},e.key||e.label))})]})})]}),(0,t.jsx)("section",{className:"hero",style:{padding:"4rem 1rem",background:"var(--primary)",position:"relative",zIndex:2},children:(0,t.jsxs)("div",{className:"container hero-container animate-fade-in",style:{padding:0},children:[(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:"2.5rem",fontFamily:"'Montserrat', sans-serif",color:"#FFFFFF"},children:[(0,t.jsx)("h2",{style:{margin:0,fontFamily:"'Montserrat', sans-serif",fontWeight:800,fontSize:"clamp(2.4rem, 5vw, 3.8rem)",lineHeight:1.05,letterSpacing:"-0.5px",color:"#FFFFFF"},children:"Team Insider"}),(0,t.jsx)("svg",{viewBox:"0 0 420 26",preserveAspectRatio:"none",style:{width:"clamp(240px, 44vw, 390px)",height:"clamp(14px, 2.2vw, 22px)",margin:"0.2rem 0 0.25rem 0",display:"block"},children:(0,t.jsx)("path",{d:"M6,20 Q205,2 414,15 Q210,11 18,24 Z",fill:"#F2C230"})}),(0,t.jsxs)("p",{style:{margin:0,fontFamily:"'Montserrat', sans-serif",fontWeight:500,fontSize:"clamp(1.25rem, 2.6vw, 2rem)",lineHeight:1.2,color:"#FFFFFF"},children:["led by ",(0,t.jsx)("strong",{style:{fontWeight:700},children:"David & Rakesh"})]})]}),(0,t.jsxs)("div",{className:"partners-section",style:{marginTop:"0"},children:[(0,t.jsxs)("div",{className:"partner-card",children:[(0,t.jsx)("img",{src:"/rakesh-jain.jpg",alt:"Rakesh Jain",className:"partner-bg-image"}),(0,t.jsxs)("div",{className:"partner-info",children:[(0,t.jsx)("h3",{children:"Rakesh Jain"}),(0,t.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,t.jsx)(r.default,{href:"/bio-rakesh",className:"partner-bio-btn",children:"Bio"})]})]}),(0,t.jsxs)("div",{className:"partner-card",children:[(0,t.jsx)("img",{src:"/david-sider.jpg",alt:"David Sider",className:"partner-bg-image"}),(0,t.jsxs)("div",{className:"partner-info",children:[(0,t.jsx)("h3",{children:"David Sider"}),(0,t.jsx)("p",{className:"partner-title",children:"Managing Partner / Broker"}),(0,t.jsx)(r.default,{href:"/bio-david",className:"partner-bio-btn",children:"Bio"})]})]})]})]})}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
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
      `}})]})};var n=e.i(6310),o=e.i(52186),l=e.i(96616);e.s(["default",0,()=>(0,t.jsxs)("main",{children:[(0,t.jsxs)(i.default,{children:[(0,t.jsx)("title",{children:"Insider Mortgage | Trusted Experts"}),(0,t.jsx)("meta",{name:"description",content:"Insider Mortgage - Specializing in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors"})]}),(0,t.jsx)(a,{}),(0,t.jsx)(n.default,{}),(0,t.jsx)(o.default,{}),(0,t.jsx)(l.default,{})]})],80039)}]);