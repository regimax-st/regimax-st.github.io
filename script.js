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
