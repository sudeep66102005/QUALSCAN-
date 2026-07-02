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
      upload: <img src="assets/upload.jpeg" alt="Upload process">,
      review: <img src="assets/review.jpeg" alt="Review process">,
      format: <img src="assets/format.jpeg" alt="Format process">,
      quality: <img src="assets/quality.jpeg" alt="Quality process">,
      report: <img src="assets/report.jpeg" alt="Submit process">
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
 const bottomCue = document.querySelector(".scroll-down-cue--bottom");

  function hideCueAtBottom() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 20;
    bottomCue?.classList.toggle("is-hidden", atBottom);
  }

  window.addEventListener("scroll", hideCueAtBottom, { passive: true });
  window.addEventListener("resize", hideCueAtBottom);
  hideCueAtBottom();
</script>
