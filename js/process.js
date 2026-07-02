<script>
    const steps = [
      {
        title: "Scans uploaded to the cloud",
        text: "The clinical scans are securely completed and uploaded to the cloud so the case can move quickly into specialist review.",
        art: "upload"
      },
      {
        title: "Radiologist review",
        text: "A qualified radiologist reviews the submitted case, studies the clinical context, and marks the findings that need priority attention.",
        art: "review"
      },
      {
        title: "Reports optimized",
        text: "Each report is organized into the required structure so the findings, impression, and next steps are easy for the care team to read.",
        art: "format"
      },
      {
        title: "Final quality control",
        text: "A senior radiologist completes the final quality review, confirming accuracy, clarity, and consistency before the report is released.",
        art: "quality"
      },
      {
        title: "Final report submitted",
        text: "The completed report is delivered back to the clinical team for confident next action.",
        art: "report"
      }
    ];

    const art = {
      upload: `<svg viewBox="0 0 160 150" aria-hidden="true"><rect x="31" y="52" width="96" height="69" rx="6" fill="#e9eef6" transform="rotate(13 79 86)"/><rect x="43" y="37" width="86" height="73" rx="6" fill="#fff"/><path d="M55 67h53M55 78h45M55 89h37" stroke="#4a8bb5" stroke-width="5" stroke-linecap="round"/><path d="M73 48c8-8 22-3 22 10 8 0 14 5 14 13 0 9-7 14-16 14H71c-10 0-17-6-17-15 0-8 6-14 14-14 0-3 2-6 5-8Z" fill="#f55f61"/><path d="M82 75V55M72 64l10-10 10 10" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 81 8 97l21 26 30-44" fill="#a7deeb"/></svg>`,
      review: `<svg viewBox="0 0 160 150" aria-hidden="true"><rect x="82" y="23" width="54" height="40" rx="4" fill="#4e4aa9"/><path d="M91 34h31M91 44h22M91 54h16" stroke="#c8f1ff" stroke-width="4" stroke-linecap="round"/><circle cx="55" cy="78" r="15" fill="#f0b282"/><path d="M42 73c8-16 27-10 29 2-8 5-19 5-29-2Z" fill="#123360"/><path d="M46 95h22l8 34H36l10-34Z" fill="#fff"/><path d="M68 96 100 66" stroke="#2d85d7" stroke-width="8" stroke-linecap="round"/><circle cx="103" cy="64" r="9" fill="#21d7f2"/></svg>`,
      format: `<svg viewBox="0 0 160 150" aria-hidden="true"><rect x="35" y="19" width="90" height="112" rx="8" fill="#fff"/><rect x="52" y="39" width="56" height="10" rx="3" fill="#2e84d7"/><path d="M52 64h56M52 78h42M52 92h56M52 106h35" stroke="#7da4be" stroke-width="5" stroke-linecap="round"/><rect x="29" y="30" width="24" height="24" rx="4" fill="#21d7f2"/><path d="m35 42 5 5 9-12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="101" y="87" width="30" height="30" rx="5" fill="#312a9b"/><path d="M109 103h14M116 96v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
      quality: `<svg viewBox="0 0 160 150" aria-hidden="true"><path d="M80 18c17 18 35 21 48 26v25c0 29-16 48-48 60-32-12-48-31-48-60V44c13-5 31-8 48-26Z" fill="#e7f8ff" stroke="#2e84d7" stroke-width="6"/><path d="M60 74l14 15 29-36" stroke="#21d7f2" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="118" cy="34" r="11" fill="#f55f61"/><path d="M112 34h12M118 28v12" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
      report: `<svg viewBox="0 0 160 150" aria-hidden="true"><rect x="36" y="28" width="88" height="97" rx="8" fill="#fff"/><path d="M56 52h46M56 68h52M56 84h39M56 100h49" stroke="#5d94b1" stroke-width="5" stroke-linecap="round"/><path d="M70 36c5-14 25-14 30 0" stroke="#ff6c6c" stroke-width="6" stroke-linecap="round"/><path d="M66 40h38v18H66z" fill="#ff6c6c"/><path d="m73 49 7 7 14-17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 93 9 109l22 25 30-43" fill="#a7deeb"/></svg>`
    };

    const processScroll = document.getElementById("processScroll");
    const segments = [...document.querySelectorAll(".segment")];
    const labels = [...document.querySelectorAll(".segment-label")];
    const title = document.getElementById("stageTitle");
    const text = document.getElementById("stageText");
    const photo = document.getElementById("stagePhoto");
    const panel = document.getElementById("processPanel");
    const dots = document.getElementById("processDots");
    let active = -1;

    steps.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to step ${index + 1}`);
      dot.addEventListener("click", () => {
        const start = processScroll.offsetTop;
        const max = processScroll.offsetHeight - window.innerHeight;
        window.scrollTo({ top: start + (index / (steps.length - 1)) * max, behavior: "smooth" });
      });
      dots.appendChild(dot);
    });

    function setStep(index) {
      if (index === active) return;
      active = index;
      const step = steps[index];
      segments.forEach((segment, i) => segment.classList.toggle("is-active", i === index));
      labels.forEach((label, i) => label.classList.toggle("label-active", i === index));
      [...dots.children].forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      title.textContent = step.title;
      text.textContent = step.text;
      photo.innerHTML = art[step.art];
      panel.style.animation = "none";
      void panel.offsetWidth;
      panel.style.animation = "";
    }

   let targetProgress = 0;
let smoothProgress = 0;
let ticking = false;

function readScrollProgress() {
  const rect = processScroll.getBoundingClientRect();
  const total = processScroll.offsetHeight - window.innerHeight;
  targetProgress = Math.min(1, Math.max(0, -rect.top / total));

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateByScroll);
  }
}

function updateByScroll() {
  smoothProgress += (targetProgress - smoothProgress) * 0.08;
  const index = Math.min(steps.length - 1, Math.round(smoothProgress * (steps.length - 1)));
  setStep(index);

  if (Math.abs(targetProgress - smoothProgress) > 0.001) {
    requestAnimationFrame(updateByScroll);
  } else {
    smoothProgress = targetProgress;
    ticking = false;
  }
}
   window.addEventListener("scroll", readScrollProgress, { passive: true });
   window.addEventListener("resize", readScrollProgress);
    document.getElementById("year").textContent = new Date().getFullYear();
    setStep(0);
    readScrollProgress();
  </script>
