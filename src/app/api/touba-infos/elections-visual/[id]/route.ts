import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VISUALS = [
  { lines:["ÉLECTIONS 2027 :","PEUT-ON VRAIMENT","COUPLER LES","LÉGISLATIVES ET","LES LOCALES ?"], tag:"COUPLAGE • DROIT • CALENDRIER", art:"ballot" },
  { lines:["DISSOLUTION","EN DÉCEMBRE :","CE QUE DIT","L’ARTICLE 87"], tag:"CONSTITUTION • 60 À 90 JOURS", art:"parliament" },
  { lines:["LOCALES 2027 :","POURQUOI LE","23 JANVIER 2022","RESTE LA DATE","DE RÉFÉRENCE"], tag:"MANDATS LOCAUX • 5 ANS", art:"calendar" },
  { lines:["LE PRÉSIDENT","PEUT-IL REPORTER","LES ÉLECTIONS","LOCALES PAR","SIMPLE DÉCRET ?"], tag:"DÉCRET • LOI • ARTICLE 67", art:"gavel" },
  { lines:["PROROGER LES","MANDATS LOCAUX :","POURQUOI UNE LOI","SERAIT LA VOIE","LA PLUS SOLIDE"], tag:"LOI • PROROGATION • 2027", art:"law" },
  { lines:["ET SI","L’ASSEMBLÉE","REFUSE LA","PROROGATION","DES LOCALES ?"], tag:"PARLEMENT • BLOCAGE • SCÉNARIOS", art:"vote" },
  { lines:["RÉFÉRENDUM :","L’ARTICLE 51","PEUT-IL DÉBLOQUER","LE CALENDRIER","ÉLECTORAL ?"], tag:"RÉFÉRENDUM • CONSTITUTION", art:"referendum" },
  { lines:["ORDONNANCES :","POURQUOI","L’ARTICLE 77","NE SUFFIT PAS À","CONTOURNER L’ASSEMBLÉE"], tag:"HABILITATION • PARLEMENT", art:"lock" },
  { lines:["PEUT-ON DISSOUDRE","TOUS LES CONSEILS","MUNICIPAUX POUR","REFAIRE LE","CALENDRIER ?"], tag:"COLLECTIVITÉS • DISSOLUTION", art:"municipal" },
  { lines:["LOCALES EN JANVIER,","LÉGISLATIVES","EN FÉVRIER :","DEUX ÉLECTIONS À","QUELQUES SEMAINES ?"], tag:"JANVIER • FÉVRIER 2027", art:"two" },
  { lines:["CRISE ÉLECTORALE","DE 2024 :","QUELLE LEÇON","POUR LE CALENDRIER","DE 2027 ?"], tag:"CONSEIL CONSTITUTIONNEL • 2024", art:"court" },
  { lines:["QUI ORGANISE","ET QUI CONTRÔLE","LES ÉLECTIONS","AU SÉNÉGAL ?"], tag:"CENA • ADMINISTRATION • JURIDICTIONS", art:"control" },
  { lines:["APRÈS LA","DISSOLUTION :","QUI PEUT ENCORE","LÉGIFÉRER AVANT","LA NOUVELLE ASSEMBLÉE ?"], tag:"ARTICLE 87 • CONTINUITÉ DE L’ÉTAT", art:"empty" },
  { lines:["DÉCEMBRE 2026","– MARS 2027 :","COMMENT CALCULER","LA FENÊTRE DES","LÉGISLATIVES ?"], tag:"60 JOURS • 90 JOURS", art:"clock" },
  { lines:["ÉLECTIONS 2027 :","QUI A LE POUVOIR","DE CHANGER QUOI ?","LA CARTE DES","COMPÉTENCES"], tag:"PRÉSIDENT • ASSEMBLÉE • CONSEIL", art:"map" },
  { lines:["COUPLAGE OU","DEUX SCRUTINS :","LE VRAI CHOIX","INSTITUTIONNEL","POUR 2027"], tag:"AVANTAGES • RISQUES • SÉCURITÉ JURIDIQUE", art:"paths" },
] as const;

function esc(s:string){return s.replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));}

function electionArt(kind:string){
  const flag = `
    <g transform="translate(915 78)">
      <rect width="210" height="126" rx="8" fill="#fff" opacity=".98"/>
      <rect x="0" width="70" height="126" fill="#00853f"/>
      <rect x="70" width="70" height="126" fill="#fdef42"/>
      <rect x="140" width="70" height="126" fill="#e31b23"/>
      <path d="M105 34l8 24h25l-20 15 8 24-21-15-20 15 8-24-20-15h25z" fill="#00853f"/>
    </g>`;
  const box = `
    <g transform="translate(785 350)">
      <rect x="25" y="70" width="300" height="215" rx="18" fill="#ffffff" fill-opacity=".92" stroke="#d8dde3" stroke-width="7"/>
      <rect x="70" y="35" width="210" height="54" rx="12" fill="#d9dee5" stroke="#fff" stroke-width="5"/>
      <rect x="105" y="15" width="140" height="20" rx="10" fill="#182531"/>
      <g transform="rotate(-9 190 15)">
        <rect x="145" y="-80" width="120" height="120" rx="6" fill="#fff"/>
        <path d="M171 -31l18 18 38-43" fill="none" stroke="#00853f" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="175" y="170" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="32" font-weight="900" fill="#0b3427">VOTE</text>
      <text x="175" y="207" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="23" font-weight="800" fill="#27333c">SÉNÉGAL 2027</text>
    </g>`;
  const parliament = `
    <g transform="translate(760 245)" opacity=".96">
      <path d="M40 115h390v235H40z" fill="#e7dcc9"/>
      <path d="M10 115L235 20l225 95z" fill="#d4c09e"/>
      <rect x="65" y="145" width="42" height="165" fill="#bca684"/>
      <rect x="135" y="145" width="42" height="165" fill="#bca684"/>
      <rect x="205" y="145" width="42" height="165" fill="#bca684"/>
      <rect x="275" y="145" width="42" height="165" fill="#bca684"/>
      <rect x="345" y="145" width="42" height="165" fill="#bca684"/>
      <text x="235" y="92" text-anchor="middle" font-family="Arial" font-size="25" font-weight="900" fill="#27333c">ASSEMBLÉE NATIONALE</text>
    </g>`;
  const calendar = `
    <g transform="translate(805 300)">
      <rect width="320" height="300" rx="22" fill="#fff" stroke="#d7dce2" stroke-width="6"/>
      <rect width="320" height="72" rx="22" fill="#00853f"/>
      <text x="160" y="48" text-anchor="middle" font-family="Arial" font-size="31" font-weight="900" fill="#fff">2027</text>
      <g font-family="Arial" font-weight="800" fill="#27333c" font-size="20">
       <text x="36" y="120">JAN</text><text x="122" y="120">FÉV</text><text x="208" y="120">MAR</text>
       <text x="36" y="168">23</text><text x="122" y="168">60</text><text x="208" y="168">90</text>
      </g>
      <path d="M45 225h230" stroke="#e31b23" stroke-width="10" stroke-linecap="round"/>
      <circle cx="105" cy="225" r="15" fill="#fdef42"/><circle cx="220" cy="225" r="15" fill="#00853f"/>
    </g>`;
  const scales = `
    <g transform="translate(840 345)" stroke="#f7d77b" stroke-width="10" fill="none">
      <path d="M145 0v225M55 55h180M80 55l-55 100h110zM210 55l-55 100h110zM80 225h130" />
    </g>`;
  const lock = `
    <g transform="translate(870 370)">
      <rect x="0" y="85" width="220" height="170" rx="24" fill="#d9a930" stroke="#f8db83" stroke-width="8"/>
      <path d="M50 85V55a60 60 0 01120 0v30" fill="none" stroke="#f8db83" stroke-width="22"/>
      <circle cx="110" cy="165" r="20" fill="#27333c"/><rect x="101" y="165" width="18" height="55" fill="#27333c"/>
    </g>`;
  const gavel = `
    <g transform="translate(820 410) rotate(-18)">
      <rect x="90" y="0" width="220" height="58" rx="20" fill="#8d5b2b"/>
      <rect x="135" y="-65" width="90" height="190" rx="24" fill="#7a4b22"/>
      <rect x="0" y="160" width="420" height="40" rx="20" fill="#b17939"/>
    </g>`;
  const municipal = `
    <g transform="translate(810 290)">
      <rect x="0" y="115" width="320" height="235" fill="#dfd3bf"/>
      <path d="M-25 115L160 25l185 90z" fill="#c2ad8b"/>
      <rect x="55" y="160" width="45" height="150" fill="#aa9576"/><rect x="137" y="160" width="45" height="150" fill="#aa9576"/><rect x="220" y="160" width="45" height="150" fill="#aa9576"/>
      <text x="160" y="95" text-anchor="middle" font-family="Arial" font-size="25" font-weight="900" fill="#26323b">HÔTEL DE VILLE</text>
    </g>`;
  if(kind==="parliament"||kind==="empty"||kind==="vote"||kind==="court") return parliament+flag+box;
  if(kind==="calendar"||kind==="clock") return calendar+flag+box;
  if(kind==="gavel"||kind==="law") return gavel+scales+flag+box;
  if(kind==="lock") return lock+parliament+flag;
  if(kind==="municipal") return municipal+flag+box;
  if(kind==="two"||kind==="paths") return municipal+parliament+flag+box;
  if(kind==="map"||kind==="control") return scales+parliament+flag+box;
  return flag+box+parliament;
}

function makeSvg(v: typeof VISUALS[number], idx:number){
  const startY = v.lines.length>=5 ? 205 : 235;
  const size = v.lines.some(x=>x.length>23) ? 52 : 60;
  const tspans = v.lines.map((line,i)=>`<tspan x="70" dy="${i===0?0:72}" fill="${i===0?'#fdef42':(i===2?'#6fd49c':'#ffffff')}">${esc(line)}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#061b18"/><stop offset=".58" stop-color="#0b3d2c"/><stop offset="1" stop-color="#08131d"/></linearGradient>
      <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" opacity=".08"/></pattern>
    </defs>
    <rect width="1200" height="750" fill="url(#bg)"/><rect width="1200" height="750" fill="url(#dots)"/>
    <path d="M0 655C260 590 480 730 760 660s440-20 440-20v110H0z" fill="#00853f"/>
    <path d="M350 750c250-145 425-95 850-95v95z" fill="#fdef42"/><path d="M760 750c165-90 295-85 440-70v70z" fill="#e31b23"/>
    <rect x="45" y="38" width="320" height="70" rx="12" fill="#fff"/>
    <text x="68" y="87" font-family="Arial,Helvetica,sans-serif" font-size="43" font-weight="900" fill="#101820">TOUBA</text>
    <rect x="205" y="38" width="160" height="70" rx="0" fill="#e31b23"/><text x="222" y="87" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="900" fill="#fff">INFOS</text>
    <rect x="70" y="132" width="280" height="42" rx="8" fill="#b31217"/><text x="88" y="161" font-family="Arial" font-size="22" font-weight="900" fill="#fff">SÉRIE SPÉCIALE • ÉLECTIONS 2027</text>
    <text x="70" y="${startY}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="900" letter-spacing="-1.5">${tspans}</text>
    <rect x="70" y="600" width="560" height="54" rx="10" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".22"/>
    <text x="95" y="636" font-family="Arial" font-size="24" font-weight="800" fill="#fff">${esc(v.tag)}</text>
    <text x="70" y="696" font-family="Arial" font-size="21" font-weight="700" fill="#d8e9e1">ANALYSE INSTITUTIONNELLE • TOUBA INFOS</text>
    ${electionArt(v.art)}
    <circle cx="1140" cy="690" r="34" fill="#00853f"/><text x="1140" y="700" text-anchor="middle" font-family="Arial" font-size="30" font-weight="900" fill="#fdef42">${idx}</text>
  </svg>`;
}

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const n=Number(id);
  if(!Number.isInteger(n)||n<1||n>VISUALS.length) return NextResponse.json({error:"Visuel introuvable"},{status:404});
  const svg=makeSvg(VISUALS[n-1],n);
  return new NextResponse(svg,{headers:{"Content-Type":"image/svg+xml; charset=utf-8","Cache-Control":"public, max-age=31536000, immutable"}});
}
