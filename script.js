const toast = document.getElementById("toast");
const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("toast--on");
  setTimeout(()=>toast.classList.remove("toast--on"), 1400);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("복사 완료 ✔");
  }catch(e){
    showToast("복사 실패 (브라우저 권한 확인)");
  }
}

document.getElementById("copyEmail").addEventListener("click", ()=>{
  const t = document.getElementById("emailText").textContent.trim();
  copyText(t);
});
document.getElementById("copyTelegram").addEventListener("click", ()=>{
  const t = document.getElementById("tgText").textContent.trim();
  copyText(t);
});

const navToggle = document.getElementById("navToggle");
const nav = document.querySelector(".nav");
navToggle.addEventListener("click", ()=>{
  nav.classList.toggle("nav--open");
});

// 메뉴 클릭 시 모바일 메뉴 닫기
document.querySelectorAll(".nav a").forEach(a=>{
  a.addEventListener("click", ()=>{
    nav.classList.remove("nav--open");
  });
});

// ===== RegiMax Dashboard Polling (Public) =====
const DASHBOARD_BASE = "http://46.250.252.77:8001";

function fmtMoney(x){
  if (x === null || x === undefined) return "-";
  const n = Number(x);
  if (Number.isNaN(n)) return String(x);
  return n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function fmtPct(x){
  if (x === null || x === undefined) return "-";
  const n = Number(x);
  if (Number.isNaN(n)) return String(x);
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(2) + "%";
}

function setText(id, v){
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = v;
}

function renderFeed(items){
  const box = document.getElementById("db_feed");
  if (!box) return;
  if (!Array.isArray(items) || items.length === 0){
    box.textContent = "표시할 알림이 없습니다.";
    return;
  }
  box.innerHTML = items.slice(0,10).map(x => {
    const t = (x.time || x.ts || x.updated_at || "");
    const title = (x.title || x.type || "알림");
    const text = (x.text || x.message || "");
    return `
      <div style="margin:10px 0; padding-top:10px; border-top:1px solid rgba(255,255,255,.08)">
        <div style="font-weight:900">${title}</div>
        <div style="font-size:12px; color: rgba(231,236,255,.75)">${t}</div>
        <pre class="code" style="margin-top:8px">${text}</pre>
      </div>
    `;
  }).join("");
}

function parseUpdatedAtKST(str){
  if (!str) return null;
  const m = String(str).match(/(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/);
  if (!m) return null;
  const iso = `${m[1]}T${m[2]}+09:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function loadDashboard(){
  const statusUrl = `${DASHBOARD_BASE}/status`;
  const feedUrl = `${DASHBOARD_BASE}/feed`;
  setText("db_api_status", statusUrl);
  setText("db_api_feed", feedUrl);

  try{
    const res = await fetch(statusUrl, {cache: "no-store"});
    const s = await res.json();

    setText("db_symbol", s.symbol ?? "-");
    setText("db_mode", s.mode ?? "-");

    setText("db_balance", fmtMoney(s.balance) + " USDT");
    setText("db_baseline", fmtMoney(s.baseline) + " USDT");

    const pnlLine = `${fmtMoney(s.pnl_usdt)} USDT (${fmtPct(s.pnl_pct)})`;
    setText("db_pnl", pnlLine);

    const pos = s.position || {};
    const posLine = `${pos.side ?? "NONE"} | qty ${pos.qty ?? 0}`;
    setText("db_pos", posLine);
    const entrySl = `${pos.entry ?? "-"} / ${pos.sl ?? "-"}`;
    setText("db_entry_sl", entrySl);

    setText("db_last_signal", s.last_signal ?? "-");
    setText("db_updated", s.updated_at ?? "-");

    const d = parseUpdatedAtKST(s.updated_at);
    if (d){
      const lagSec = Math.max(0, (Date.now() - d.getTime())/1000);
      const lagTxt = lagSec < 120 ? `${Math.round(lagSec)}초` : `${Math.round(lagSec/60)}분`;
      setText("db_lag", lagTxt);
    } else {
      setText("db_lag", "-");
    }
  }catch(e){
    setText("db_feed", "상태 데이터를 불러오지 못했습니다. (API 접속/포트 확인)");
  }

  try{
    const res2 = await fetch(feedUrl, {cache: "no-store"});
    const items = await res2.json();
    renderFeed(items);
  }catch(e){
    // feed optional
  }
}

loadDashboard();
setInterval(loadDashboard, 5000);
