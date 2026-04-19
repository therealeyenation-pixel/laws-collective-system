import{b as J,t as T,j as e,L as X,B as j,d as f}from"./index-YasavcTA.js";import{a4 as l}from"./vendor-charts-aHHJ_5FL.js";import{C as c,b as x,c as N,a as h}from"./card-CixmRFPa.js";import{S as L,a as k,b as R,c as I,d as V}from"./select-CJpW7QY-.js";import{I as G}from"./input-Bm5wfPRn.js";import{T as Z}from"./textarea-Cg8cZyox.js";import{T as ee,a as te,b as W,c as Q}from"./tabs-_9mpvSQR.js";import{t as u}from"./vendor-react-B_RGRDu7.js";import{L as ne}from"./LazyStreamdown-BdpOij2B.js";import{aV as ae,l as y,y as ie,F as M,B as le,bB as se,dF as oe,a4 as re,bg as ue,m as P,au as ce,j as me}from"./vendor-icons-NeKP93ct.js";import"./vendor-trpc-wnUC-qIV.js";import"./vendor-radix-CVGGCPXs.js";import"./vendor-diagrams-Dz2nWOB_.js";import"./dialog-CVR0ksSO.js";import"./useComposition-C0TKgE2j.js";const F=[{value:"lesson",label:"Lesson",icon:le,description:"Structured learning module with objectives and key takeaways"},{value:"quiz",label:"Quiz",icon:se,description:"Assessment questions to test knowledge retention"},{value:"exercise",label:"Exercise",icon:oe,description:"Hands-on practice activity with step-by-step guidance"},{value:"resource",label:"Resource",icon:re,description:"Reference material, links, and supplementary content"},{value:"video_script",label:"Video Script",icon:ue,description:"Script for training video or presentation"}];function Se(){const{user:t,isAuthenticated:i}=J(),[a,z]=l.useState(""),[g,C]=l.useState(""),[o,w]=l.useState(""),[m,B]=l.useState(""),[r,S]=l.useState(""),[d,p]=l.useState(""),[A,$]=l.useState(!1),[H,K]=l.useState("create"),{data:_}=T.departmentDashboard.getRegistry.useQuery(),v=T.departmentDashboard.saveTrainingContent.useMutation(),D=l.useMemo(()=>_?_.departments.filter(n=>n.simulators.length>0||n.id==="education"||n.id==="health"):[],[_]),s=l.useMemo(()=>D.find(n=>n.id===a),[D,a]),q=async()=>{if(!a||!o||!r){u.error("Please fill in department, content type, and topic");return}$(!0),p("");try{const n=s,b=n?.simulators.find(E=>E.type===g)?.label||"General Training",O=F.find(E=>E.value===o)?.label||o,xe=pe({departmentName:n?.name||a,entity:n?.entity||"The L.A.W.S. Collective LLC",managerName:n?.manager.name||"Department Manager",simulatorLabel:b,contentType:O,topic:r,title:m}),U=be({contentType:o,topic:r,title:m||r,departmentName:n?.name||"",simulatorLabel:b});p(U),m||B(`${O}: ${r}`),u.success("Content template generated. Customize it below.")}catch{u.error("Failed to generate content")}finally{$(!1)}},Y=async()=>{if(!a||!o||!m||!d){u.error("Please complete all fields before saving");return}try{const n=await v.mutateAsync({departmentId:a,title:m,contentType:o,content:d,simulatorType:g||void 0,metadata:{topic:r,generatedBy:t?.name||"Manager",generatedAt:new Date().toISOString()}});n.success?(u.success(n.message||"Training content saved!"),B(""),S(""),p(""),w(""),C("")):u.error(n.error||"Failed to save content")}catch{u.error("Failed to save training content")}};return i?e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:182",className:"min-h-screen bg-background",children:[e.jsxDEV("header",{"data-loc":"client/src/pages/ContentBuilder.tsx:184",className:"border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50",children:e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:185",className:"container max-w-6xl mx-auto px-4 py-4",children:e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:186",className:"flex items-center justify-between",children:[e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:187",className:"flex items-center gap-3",children:[e.jsxDEV(X,{"data-loc":"client/src/pages/ContentBuilder.tsx:188",href:"/dashboard",children:e.jsxDEV(j,{"data-loc":"client/src/pages/ContentBuilder.tsx:189",variant:"ghost",size:"sm",children:[e.jsxDEV(ae,{"data-loc":"client/src/pages/ContentBuilder.tsx:190",className:"w-4 h-4 mr-1"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:190,columnNumber:19},this),"Dashboard"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:189,columnNumber:17},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:188,columnNumber:15},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:194",children:[e.jsxDEV("h1",{"data-loc":"client/src/pages/ContentBuilder.tsx:195",className:"text-xl font-bold text-foreground flex items-center gap-2",children:[e.jsxDEV(y,{"data-loc":"client/src/pages/ContentBuilder.tsx:196",className:"w-5 h-5 text-amber-500"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:196,columnNumber:19},this),"AI Content Builder"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:195,columnNumber:17},this),e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:199",className:"text-xs text-muted-foreground",children:"Create training content for department simulators and academy courses"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:199,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:194,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:187,columnNumber:13},this),s&&e.jsxDEV(f,{"data-loc":"client/src/pages/ContentBuilder.tsx:205",variant:"outline",className:"text-xs",children:s.entity},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:205,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:186,columnNumber:11},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:185,columnNumber:9},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:184,columnNumber:7},this),e.jsxDEV("main",{"data-loc":"client/src/pages/ContentBuilder.tsx:213",className:"container max-w-6xl mx-auto px-4 py-8",children:e.jsxDEV(ee,{"data-loc":"client/src/pages/ContentBuilder.tsx:214",value:H,onValueChange:K,className:"w-full",children:[e.jsxDEV(te,{"data-loc":"client/src/pages/ContentBuilder.tsx:215",className:"grid w-full grid-cols-2 mb-8",children:[e.jsxDEV(W,{"data-loc":"client/src/pages/ContentBuilder.tsx:216",value:"create",children:"Create Content"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:216,columnNumber:13},this),e.jsxDEV(W,{"data-loc":"client/src/pages/ContentBuilder.tsx:217",value:"library",children:"Content Library"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:217,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:215,columnNumber:11},this),e.jsxDEV(Q,{"data-loc":"client/src/pages/ContentBuilder.tsx:221",value:"create",children:e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:222",className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:224",className:"space-y-4",children:[e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:225",children:[e.jsxDEV(x,{"data-loc":"client/src/pages/ContentBuilder.tsx:226",children:e.jsxDEV(N,{"data-loc":"client/src/pages/ContentBuilder.tsx:227",className:"text-sm flex items-center gap-2",children:[e.jsxDEV(ie,{"data-loc":"client/src/pages/ContentBuilder.tsx:228",className:"w-4 h-4"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:228,columnNumber:23},this),"Department & Simulator"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:227,columnNumber:21},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:226,columnNumber:19},this),e.jsxDEV(h,{"data-loc":"client/src/pages/ContentBuilder.tsx:232",className:"space-y-4",children:[e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:234",children:[e.jsxDEV("label",{"data-loc":"client/src/pages/ContentBuilder.tsx:235",className:"text-xs font-medium text-muted-foreground mb-1 block",children:"Department"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:235,columnNumber:23},this),e.jsxDEV(L,{"data-loc":"client/src/pages/ContentBuilder.tsx:238",value:a,onValueChange:n=>{z(n),C("")},children:[e.jsxDEV(k,{"data-loc":"client/src/pages/ContentBuilder.tsx:245",children:e.jsxDEV(R,{"data-loc":"client/src/pages/ContentBuilder.tsx:246",placeholder:"Select department"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:246,columnNumber:27},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:245,columnNumber:25},this),e.jsxDEV(I,{"data-loc":"client/src/pages/ContentBuilder.tsx:248",children:D.map(n=>e.jsxDEV(V,{"data-loc":"client/src/pages/ContentBuilder.tsx:250",value:n.id,children:e.jsxDEV("span",{"data-loc":"client/src/pages/ContentBuilder.tsx:251",className:"flex items-center gap-2",children:[e.jsxDEV("span",{"data-loc":"client/src/pages/ContentBuilder.tsx:252",className:"w-2 h-2 rounded-full",style:{backgroundColor:n.color}},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:252,columnNumber:33},this),n.name]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:251,columnNumber:31},this)},n.id,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:250,columnNumber:29},this))},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:248,columnNumber:25},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:238,columnNumber:23},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:234,columnNumber:21},this),s&&s.simulators.length>0&&e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:266",children:[e.jsxDEV("label",{"data-loc":"client/src/pages/ContentBuilder.tsx:267",className:"text-xs font-medium text-muted-foreground mb-1 block",children:"Target Simulator (optional)"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:267,columnNumber:25},this),e.jsxDEV(L,{"data-loc":"client/src/pages/ContentBuilder.tsx:270",value:g,onValueChange:C,children:[e.jsxDEV(k,{"data-loc":"client/src/pages/ContentBuilder.tsx:274",children:e.jsxDEV(R,{"data-loc":"client/src/pages/ContentBuilder.tsx:275",placeholder:"General training"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:275,columnNumber:29},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:274,columnNumber:27},this),e.jsxDEV(I,{"data-loc":"client/src/pages/ContentBuilder.tsx:277",children:[e.jsxDEV(V,{"data-loc":"client/src/pages/ContentBuilder.tsx:278",value:"general",children:"General Training"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:278,columnNumber:29},this),s.simulators.map(n=>e.jsxDEV(V,{"data-loc":"client/src/pages/ContentBuilder.tsx:280",value:n.type,children:n.label},n.type,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:280,columnNumber:31},this))]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:277,columnNumber:27},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:270,columnNumber:25},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:266,columnNumber:23},this),s&&e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:291",className:"p-3 bg-muted/50 rounded-lg",children:[e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:292",className:"text-xs text-muted-foreground",children:"Department Manager"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:292,columnNumber:25},this),e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:293",className:"text-sm font-medium",children:s.manager.name},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:293,columnNumber:25},this),e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:294",className:"text-xs text-muted-foreground",children:s.manager.title},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:294,columnNumber:25},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:291,columnNumber:23},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:232,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:225,columnNumber:17},this),e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:300",children:[e.jsxDEV(x,{"data-loc":"client/src/pages/ContentBuilder.tsx:301",children:e.jsxDEV(N,{"data-loc":"client/src/pages/ContentBuilder.tsx:302",className:"text-sm flex items-center gap-2",children:[e.jsxDEV(M,{"data-loc":"client/src/pages/ContentBuilder.tsx:303",className:"w-4 h-4"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:303,columnNumber:23},this),"Content Type"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:302,columnNumber:21},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:301,columnNumber:19},this),e.jsxDEV(h,{"data-loc":"client/src/pages/ContentBuilder.tsx:307",className:"space-y-2",children:F.map(n=>{const b=n.icon;return e.jsxDEV("button",{"data-loc":"client/src/pages/ContentBuilder.tsx:311",onClick:()=>w(n.value),className:`w-full text-left p-3 rounded-lg border transition-colors ${o===n.value?"border-primary bg-primary/5":"border-border hover:border-primary/50"}`,children:[e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:320",className:"flex items-center gap-2",children:[e.jsxDEV(b,{"data-loc":"client/src/pages/ContentBuilder.tsx:321",className:"w-4 h-4 text-muted-foreground"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:321,columnNumber:29},this),e.jsxDEV("span",{"data-loc":"client/src/pages/ContentBuilder.tsx:322",className:"text-sm font-medium",children:n.label},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:322,columnNumber:29},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:320,columnNumber:27},this),e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:324",className:"text-xs text-muted-foreground mt-1",children:n.description},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:324,columnNumber:27},this)]},n.value,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:311,columnNumber:25},this)})},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:307,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:300,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:224,columnNumber:15},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:335",className:"lg:col-span-2 space-y-4",children:[e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:336",children:[e.jsxDEV(x,{"data-loc":"client/src/pages/ContentBuilder.tsx:337",children:e.jsxDEV(N,{"data-loc":"client/src/pages/ContentBuilder.tsx:338",className:"text-sm flex items-center gap-2",children:[e.jsxDEV(y,{"data-loc":"client/src/pages/ContentBuilder.tsx:339",className:"w-4 h-4 text-amber-500"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:339,columnNumber:23},this),"Generate Content"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:338,columnNumber:21},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:337,columnNumber:19},this),e.jsxDEV(h,{"data-loc":"client/src/pages/ContentBuilder.tsx:343",className:"space-y-4",children:[e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:344",children:[e.jsxDEV("label",{"data-loc":"client/src/pages/ContentBuilder.tsx:345",className:"text-xs font-medium text-muted-foreground mb-1 block",children:"Topic / Subject"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:345,columnNumber:23},this),e.jsxDEV(G,{"data-loc":"client/src/pages/ContentBuilder.tsx:348",value:r,onChange:n=>S(n.target.value),placeholder:"e.g., LLC Formation Steps, Grant Budget Preparation, Contract Negotiation Basics"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:348,columnNumber:23},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:344,columnNumber:21},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:354",children:[e.jsxDEV("label",{"data-loc":"client/src/pages/ContentBuilder.tsx:355",className:"text-xs font-medium text-muted-foreground mb-1 block",children:"Title (auto-generated if left blank)"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:355,columnNumber:23},this),e.jsxDEV(G,{"data-loc":"client/src/pages/ContentBuilder.tsx:358",value:m,onChange:n=>B(n.target.value),placeholder:"Custom title for this content piece"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:358,columnNumber:23},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:354,columnNumber:21},this),e.jsxDEV(j,{"data-loc":"client/src/pages/ContentBuilder.tsx:364",onClick:q,disabled:!a||!o||!r||A,className:"w-full",children:A?e.jsxDEV(e.Fragment,{children:[e.jsxDEV(P,{"data-loc":"client/src/pages/ContentBuilder.tsx:371",className:"w-4 h-4 mr-2 animate-spin"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:371,columnNumber:27},this),"Generating..."]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:370,columnNumber:25},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV(y,{"data-loc":"client/src/pages/ContentBuilder.tsx:376",className:"w-4 h-4 mr-2"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:376,columnNumber:27},this),"Generate Content Template"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:375,columnNumber:25},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:364,columnNumber:21},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:343,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:336,columnNumber:17},this),d&&e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:386",children:[e.jsxDEV(x,{"data-loc":"client/src/pages/ContentBuilder.tsx:387",children:e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:388",className:"flex items-center justify-between",children:[e.jsxDEV(N,{"data-loc":"client/src/pages/ContentBuilder.tsx:389",className:"text-sm",children:"Content Editor"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:389,columnNumber:25},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:390",className:"flex gap-2",children:e.jsxDEV(j,{"data-loc":"client/src/pages/ContentBuilder.tsx:391",variant:"outline",size:"sm",onClick:Y,disabled:v.isPending,children:[v.isPending?e.jsxDEV(P,{"data-loc":"client/src/pages/ContentBuilder.tsx:398",className:"w-4 h-4 mr-1 animate-spin"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:398,columnNumber:31},this):e.jsxDEV(ce,{"data-loc":"client/src/pages/ContentBuilder.tsx:400",className:"w-4 h-4 mr-1"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:400,columnNumber:31},this),"Save to Library"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:391,columnNumber:27},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:390,columnNumber:25},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:388,columnNumber:23},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:387,columnNumber:21},this),e.jsxDEV(h,{"data-loc":"client/src/pages/ContentBuilder.tsx:407",children:[e.jsxDEV(Z,{"data-loc":"client/src/pages/ContentBuilder.tsx:408",value:d,onChange:n=>p(n.target.value),className:"min-h-[400px] font-mono text-sm",placeholder:"Generated content will appear here..."},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:408,columnNumber:23},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:415",className:"mt-4 p-4 bg-muted/30 rounded-lg",children:[e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:416",className:"text-xs font-medium text-muted-foreground mb-2",children:"Preview"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:416,columnNumber:25},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:417",className:"prose prose-sm max-w-none dark:prose-invert",children:e.jsxDEV(ne,{"data-loc":"client/src/pages/ContentBuilder.tsx:418",children:d},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:418,columnNumber:27},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:417,columnNumber:25},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:415,columnNumber:23},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:407,columnNumber:21},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:386,columnNumber:19},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:335,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:222,columnNumber:13},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:221,columnNumber:11},this),e.jsxDEV(Q,{"data-loc":"client/src/pages/ContentBuilder.tsx:429",value:"library",children:e.jsxDEV(de,{"data-loc":"client/src/pages/ContentBuilder.tsx:430",departmentId:a},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:430,columnNumber:13},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:429,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:214,columnNumber:9},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:213,columnNumber:7},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:182,columnNumber:5},this):e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:171",className:"min-h-screen flex items-center justify-center bg-background",children:e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:172",className:"p-8 max-w-md",children:e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:173",className:"text-center text-muted-foreground",children:"Please sign in to access the Content Builder."},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:173,columnNumber:11},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:172,columnNumber:9},this)},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:171,columnNumber:7},this)}function de({departmentId:t}){const{data:i}=T.departmentDashboard.getTrainingContent.useQuery({departmentId:t||"education"},{enabled:!0});return!i||i.content.length===0?e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:449",className:"p-12 text-center",children:[e.jsxDEV(M,{"data-loc":"client/src/pages/ContentBuilder.tsx:450",className:"w-12 h-12 mx-auto text-muted-foreground/30 mb-4"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:450,columnNumber:9},this),e.jsxDEV("h3",{"data-loc":"client/src/pages/ContentBuilder.tsx:451",className:"text-lg font-medium text-foreground mb-2",children:"No Content Yet"},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:451,columnNumber:9},this),e.jsxDEV("p",{"data-loc":"client/src/pages/ContentBuilder.tsx:452",className:"text-sm text-muted-foreground",children:"Start creating training content using the Create tab. Content saved here will be available for department simulators and academy courses."},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:452,columnNumber:9},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:449,columnNumber:7},this):e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:461",className:"space-y-3",children:[i.department&&e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:463",className:"flex items-center gap-2 mb-4",children:[e.jsxDEV("h3",{"data-loc":"client/src/pages/ContentBuilder.tsx:464",className:"text-lg font-bold",children:[i.department.name," Department"]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:464,columnNumber:11},this),e.jsxDEV(f,{"data-loc":"client/src/pages/ContentBuilder.tsx:465",variant:"outline",children:i.department.manager.name},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:465,columnNumber:11},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:463,columnNumber:9},this),i.content.map(a=>e.jsxDEV(c,{"data-loc":"client/src/pages/ContentBuilder.tsx:469",className:"p-4",children:e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:470",className:"flex items-start justify-between",children:[e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:471",children:[e.jsxDEV("h4",{"data-loc":"client/src/pages/ContentBuilder.tsx:472",className:"font-medium text-sm",children:a.title},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:472,columnNumber:15},this),e.jsxDEV("div",{"data-loc":"client/src/pages/ContentBuilder.tsx:473",className:"flex items-center gap-2 mt-1",children:[e.jsxDEV(f,{"data-loc":"client/src/pages/ContentBuilder.tsx:474",variant:"secondary",className:"text-xs",children:a.contentType},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:474,columnNumber:17},this),a.simulatorType&&e.jsxDEV(f,{"data-loc":"client/src/pages/ContentBuilder.tsx:478",variant:"outline",className:"text-xs",children:a.simulatorType},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:478,columnNumber:19},this),e.jsxDEV("span",{"data-loc":"client/src/pages/ContentBuilder.tsx:482",className:"text-xs text-muted-foreground",children:a.status},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:482,columnNumber:17},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:473,columnNumber:15},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:471,columnNumber:13},this),e.jsxDEV(me,{"data-loc":"client/src/pages/ContentBuilder.tsx:487",className:`w-4 h-4 ${a.status==="published"?"text-green-500":"text-muted-foreground/30"}`},void 0,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:487,columnNumber:13},this)]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:470,columnNumber:11},this)},a.id,!1,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:469,columnNumber:9},this))]},void 0,!0,{fileName:"/home/ubuntu/financial_automation_map/client/src/pages/ContentBuilder.tsx",lineNumber:461,columnNumber:5},this)}function pe(t){return`You are creating training content for the ${t.departmentName} department of ${t.entity}.

Department Manager: ${t.managerName}
Target Simulator: ${t.simulatorLabel}
Content Type: ${t.contentType}
Topic: ${t.topic}
${t.title?`Title: ${t.title}`:""}

Create a comprehensive ${t.contentType.toLowerCase()} that:
1. Is relevant to the ${t.departmentName} department's focus
2. Aligns with the L.A.W.S. Collective's mission of multi-generational wealth building
3. Is practical and actionable for members going through the ${t.simulatorLabel}
4. Uses clear, accessible language
5. Includes real-world examples relevant to the community`}function be(t){const i={lesson:`# ${t.title}

## Learning Objectives
- Understand the fundamentals of ${t.topic}
- Apply key concepts to real-world scenarios within ${t.departmentName}
- Build practical skills for ${t.simulatorLabel}

## Introduction
[Introduce the topic and its relevance to the L.A.W.S. Collective mission]

## Key Concepts

### 1. [First Key Concept]
[Explanation with examples]

### 2. [Second Key Concept]
[Explanation with examples]

### 3. [Third Key Concept]
[Explanation with examples]

## Practical Application
[How this applies to the member's journey through ${t.simulatorLabel}]

## Key Takeaways
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## Next Steps
[What the member should do after completing this lesson]

---
*${t.departmentName} Department | ${t.simulatorLabel}*`,quiz:`# Quiz: ${t.title}

## Instructions
Answer the following questions to test your understanding of ${t.topic}.
You need 80% or higher to pass.

---

### Question 1
[Question about ${t.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 2
[Question about ${t.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 3
[Question about ${t.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 4
[Question about ${t.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---

### Question 5
[Question about ${t.topic}]

- A) [Option A]
- B) [Option B]
- C) [Option C]
- D) [Option D]

**Correct Answer:** [Letter]
**Explanation:** [Why this is correct]

---
*${t.departmentName} Department Assessment | ${t.simulatorLabel}*`,exercise:`# Exercise: ${t.title}

## Overview
This hands-on exercise will help you practice ${t.topic} in a real-world context.

## Prerequisites
- Completed the lesson on ${t.topic}
- Access to ${t.simulatorLabel}

## Instructions

### Step 1: [Setup]
[Detailed instructions for the first step]

### Step 2: [Core Activity]
[Detailed instructions for the main exercise]

### Step 3: [Application]
[Apply what you've learned to a scenario]

### Step 4: [Review]
[Self-assessment and reflection]

## Expected Outcomes
- [What the member should have accomplished]
- [Skills they should have practiced]

## Submission
[How to submit or record completion]

---
*${t.departmentName} Department | Hands-On Exercise*`,resource:`# Resource Guide: ${t.title}

## Overview
This resource guide provides supplementary materials for ${t.topic}.

## Essential Reading
1. [Resource Title] — [Brief description and link]
2. [Resource Title] — [Brief description and link]
3. [Resource Title] — [Brief description and link]

## Tools & Templates
- [Tool/Template Name] — [Description and access instructions]
- [Tool/Template Name] — [Description and access instructions]

## Video Resources
- [Video Title] — [Duration, description]
- [Video Title] — [Duration, description]

## Community Resources
- L.A.W.S. Collective Internal Resources
- Department-specific guides and documentation

## Glossary
| Term | Definition |
|------|-----------|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |
| [Term 3] | [Definition] |

---
*${t.departmentName} Department | Reference Materials*`,video_script:`# Video Script: ${t.title}

## Production Details
- **Department:** ${t.departmentName}
- **Simulator:** ${t.simulatorLabel}
- **Estimated Duration:** 5-8 minutes
- **Target Audience:** L.A.W.S. Collective Members

---

## INTRO (30 seconds)

**[ON SCREEN: Title Card — "${t.title}"]**

**NARRATOR:** "Welcome to the ${t.departmentName} training series. Today we're covering ${t.topic} — an essential skill for your journey through ${t.simulatorLabel}."

---

## SECTION 1: Foundation (2 minutes)

**[ON SCREEN: Key concept visual]**

**NARRATOR:** "[Introduce the first key concept of ${t.topic}]"

**[ON SCREEN: Example or demonstration]**

**NARRATOR:** "[Explain with a real-world example]"

---

## SECTION 2: Application (2 minutes)

**[ON SCREEN: Step-by-step walkthrough]**

**NARRATOR:** "[Walk through how to apply this in the simulator]"

---

## SECTION 3: Key Takeaways (1 minute)

**[ON SCREEN: Summary bullet points]**

**NARRATOR:** "Let's recap what we've covered today..."

---

## OUTRO (30 seconds)

**NARRATOR:** "Great work! You're one step closer to completing your ${t.simulatorLabel}. Head back to the simulator to put this into practice."

**[ON SCREEN: L.A.W.S. Collective logo + Next Steps]**

---
*Script by ${t.departmentName} Department | Real-Eye-Nation Production*`};return i[t.contentType]||i.lesson}export{Se as default};
