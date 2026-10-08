const KEY="animforge_mappings_v1";
let data=JSON.parse(localStorage.getItem(KEY)||"[]");
const $=id=>document.getElementById(id);
const esc=s=>String(s).replaceAll("\\","\\\\").replaceAll('"','\\"');
function cleanId(v){return String(v).trim().replace(/^rbxassetid:\/\//i,"").replace(/\D/g,"")}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function generate(){
 let lines=[
 "-- AnimForge — Roblox Animation ID Mapping",
 "-- Generated for use in your own Roblox experience.",
 "local AnimationMap = {"
 ];
 data.forEach(x=>lines.push(`    ["${esc(x.old)}"] = "${esc(x.new)}", -- ${esc(x.name)}`));
 lines.push("}","","local function SpoofAnimationId(animationId)","    local id = tostring(animationId):match(\"%d+\") or tostring(animationId)","    return AnimationMap[id] or id","end","","-- Example:","-- local animation = script.Parent","-- animation.AnimationId = \"rbxassetid://\" .. SpoofAnimationId(animation.AnimationId)");
 $("output").value=lines.join("\n");
}
function render(){
 $("count").textContent=`${data.length} ITEM${data.length===1?"":"S"}`;
 $("list").innerHTML=data.length?data.map((x,i)=>`<div class="item"><div><div class="itemName">${escHtml(x.name||"Untitled")}</div><div class="ids"><b>${escHtml(x.old)}</b> → <b>${escHtml(x.new)}</b></div>${x.note?`<div class="note">${escHtml(x.note)}</div>`:""}</div><button class="remove" data-i="${i}">Delete</button></div>`).join(""):`<div class="empty">Belum ada mapping. Tambahkan Animation ID di atas.</div>`;
 document.querySelectorAll(".remove").forEach(b=>b.onclick=()=>{data.splice(+b.dataset.i,1);save();toast("Mapping deleted")});
 generate();
}
function escHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("addBtn").onclick=()=>{
 const name=$("name").value.trim()||"Untitled",old=cleanId($("oldId").value),nu=cleanId($("newId").value),note=$("note").value.trim();
 if(!old||!nu)return toast("Isi Original ID dan Replacement ID");
 data.push({name,old,new:nu,note});save();
 ["name","oldId","newId","note"].forEach(id=>$(id).value="");toast("Animation added");
};
$("copyBtn").onclick=async()=>{await navigator.clipboard.writeText($("output").value);toast("Lua copied")};
$("clearBtn").onclick=()=>{if(confirm("Hapus semua mapping?")){data=[];save();toast("All mappings cleared")}};
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="animforge-mappings.json";a.click();URL.revokeObjectURL(a.href)};
$("importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x))throw 0;data=x.map(a=>({name:String(a.name||"Untitled"),old:cleanId(a.old),new:cleanId(a.new),note:String(a.note||"")})).filter(a=>a.old&&a.new);save();toast("Import complete")}catch{toast("Invalid JSON")}};r.readAsText(f);e.target.value=""};
let deferred;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;$("installBtn").classList.add("hidden")};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();