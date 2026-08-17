document.querySelectorAll(".tool-btn").forEach(button => {
  button.addEventListener("click", () => {
    alert(button.dataset.tool + " is coming soon. The Android app already contains PDF tools.");
  });
});
