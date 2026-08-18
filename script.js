document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     MERGE PDF
  ========================== */

  const mergeFilesInput =
    document.getElementById("mergeFiles");

  const mergeBtn =
    document.getElementById("mergeBtn");

  const mergePdfBtn =
    document.getElementById("mergePdfBtn");

  const mergeArea =
    document.getElementById("mergeArea");

  const mergeStatus =
    document.getElementById("mergeStatus");

  const mergeFileList =
    document.getElementById("mergeFileList");


  let selectedFiles = [];


  /* =========================
     SELECT FILES
  ========================== */

  if (mergeBtn) {

    mergeBtn.addEventListener("click", () => {

      mergeFilesInput.click();

    });

  }


  /* =========================
     FILE CHANGE
  ========================== */

  if (mergeFilesInput) {

    mergeFilesInput.addEventListener(
      "change",
      () => {

        selectedFiles =
          Array.from(
            mergeFilesInput.files
          );


        selectedFiles =
          selectedFiles.filter(
            file =>
              file.type === "application/pdf" ||
              file.name
                .toLowerCase()
                .endsWith(".pdf")
          );


        if (selectedFiles.length === 0) {

          mergeArea.style.display =
            "block";

          mergeStatus.textContent =
            "Please select PDF files only.";

          mergeFileList.innerHTML =
            "";

          return;
        }


        mergeArea.style.display =
          "block";


        updateStatus();

        showSelectedFiles();

      }
    );

  }


  /* =========================
     UPDATE STATUS
  ========================== */

  function updateStatus() {

    const count =
      selectedFiles.length;

    mergeStatus.textContent =
      count +
      " PDF file" +
      (count > 1 ? "s" : "") +
      " selected.";

  }


  /* =========================
     SHOW FILES
  ========================== */

  function showSelectedFiles() {

    mergeFileList.innerHTML =
      "";


    selectedFiles.forEach(
      (file, index) => {

        const fileItem =
          document.createElement(
            "div"
          );


        fileItem.className =
          "merge-file-item";


        fileItem.innerHTML = `

          <span>
            ${index + 1}.
            ${escapeHtml(file.name)}
          </span>

          <button
            type="button"
            class="remove-file"
            data-index="${index}"
            title="Remove file">

            ×

          </button>

        `;


        mergeFileList.appendChild(
          fileItem
        );

      }
    );


    document
      .querySelectorAll(
        ".remove-file"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );


            selectedFiles.splice(
              index,
              1
            );


            updateInputFiles();


            if (
              selectedFiles.length ===
              0
            ) {

              mergeArea.style.display =
                "none";

              mergeFileList.innerHTML =
                "";

              return;

            }


            updateStatus();

            showSelectedFiles();

          }
        );

      });

  }


  /* =========================
     UPDATE FILE INPUT
  ========================== */

  function updateInputFiles() {

    const dataTransfer =
      new DataTransfer();


    selectedFiles.forEach(
      file => {

        dataTransfer.items.add(
          file
        );

      }
    );


    mergeFilesInput.files =
      dataTransfer.files;

  }


  /* =========================
     MERGE PDF
  ========================== */

  if (mergePdfBtn) {

    mergePdfBtn.addEventListener(
      "click",
      async () => {


        if (
          selectedFiles.length <
          2
        ) {

          mergeStatus.textContent =
            "Please select at least 2 PDF files.";

          return;

        }


        try {

          mergePdfBtn.disabled =
            true;

          mergePdfBtn.textContent =
            "Merging...";


          mergeStatus.textContent =
            "Preparing PDF files...";


          if (
            typeof PDFLib ===
            "undefined"
          ) {

            throw new Error(
              "PDF library failed to load."
            );

          }


          const {
            PDFDocument
          } = PDFLib;


          /* Create new PDF */

          const mergedPdf =
            await PDFDocument.create();


          /* Process files */

          for (
            let i = 0;
            i < selectedFiles.length;
            i++
          ) {

            const file =
              selectedFiles[i];


            mergeStatus.textContent =
              `Processing ${i + 1} of ${selectedFiles.length}: ${file.name}`;


            const arrayBuffer =
              await file.arrayBuffer();


            const sourcePdf =
              await PDFDocument.load(
                arrayBuffer
              );


            const pageIndexes =
              sourcePdf.getPageIndices();


            const copiedPages =
              await mergedPdf.copyPages(
                sourcePdf,
                pageIndexes
              );


            copiedPages.forEach(
              page => {

                mergedPdf.addPage(
                  page
                );

              }
            );

          }


          /* Save PDF */

          mergeStatus.textContent =
            "Creating merged PDF...";


          const pdfBytes =
            await mergedPdf.save();


          /* Download */

          const blob =
            new Blob(
              [pdfBytes],
              {
                type:
                  "application/pdf"
              }
            );


          const downloadUrl =
            URL.createObjectURL(
              blob
            );


          const link =
            document.createElement(
              "a"
            );


          link.href =
            downloadUrl;


          link.download =
            "merged-pdf.pdf";


          document.body.appendChild(
            link
          );


          link.click();


          link.remove();


          URL.revokeObjectURL(
            downloadUrl
          );


          mergeStatus.textContent =
            "✓ PDF merged successfully! Download started.";


          mergePdfBtn.disabled =
            false;


          mergePdfBtn.textContent =
            "Merge & Download PDF";


        }

        catch (error) {

          console.error(
            "Merge PDF error:",
            error
          );


          mergeStatus.textContent =
            "❌ Could not merge the PDF. Please make sure the files are valid and not password protected.";


          mergePdfBtn.disabled =
            false;


          mergePdfBtn.textContent =
            "Merge & Download PDF";

        }

      }
    );

  }


  /* =========================
     COMING SOON BUTTONS
  ========================== */

  document
    .querySelectorAll(
      ".coming-soon"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const toolName =
            button.dataset.tool ||
            "This tool";


          alert(
            toolName +
            " is coming soon."
          );

        }
      );

    });


  /* =========================
     HTML ESCAPE
  ========================== */

  function escapeHtml(text) {

    const div =
      document.createElement(
        "div"
      );


    div.textContent =
      text;


    return div.innerHTML;

  }

});
