document.addEventListener("DOMContentLoaded", () => {

  const { PDFDocument, degrees } = PDFLib;

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadBytes(bytes, filename) {
    const blob = new Blob([bytes], {
      type: "application/pdf"
    });

    downloadBlob(blob, filename);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }


  /* =========================================
     MERGE PDF
  ========================================= */

  const mergeFiles =
    document.getElementById("mergeFiles");

  const mergeBtn =
    document.getElementById("mergeBtn");

  const mergeArea =
    document.getElementById("mergeArea");

  const mergeStatus =
    document.getElementById("mergeStatus");

  const mergeFileList =
    document.getElementById("mergeFileList");

  const mergePdfBtn =
    document.getElementById("mergePdfBtn");

  let mergeSelected = [];


  mergeBtn.addEventListener("click", () => {
    mergeFiles.click();
  });


  mergeFiles.addEventListener("change", () => {

    mergeSelected = Array.from(mergeFiles.files);

    if (!mergeSelected.length) return;

    mergeArea.hidden = false;

    renderMergeFiles();
  });


  function renderMergeFiles() {

    mergeFileList.innerHTML = "";

    mergeStatus.textContent =
      `${mergeSelected.length} PDF file(s) selected.`;


    mergeSelected.forEach((file, index) => {

      const div = document.createElement("div");

      div.className = "merge-file-item";

      div.innerHTML = `
        <span>${index + 1}. ${escapeHtml(file.name)}</span>
        <button class="remove-file" data-index="${index}">×</button>
      `;

      mergeFileList.appendChild(div);
    });


    document.querySelectorAll(".remove-file").forEach(button => {

      button.addEventListener("click", () => {

        mergeSelected.splice(
          Number(button.dataset.index),
          1
        );

        if (!mergeSelected.length) {
          mergeArea.hidden = true;
          return;
        }

        renderMergeFiles();
      });

    });
  }


  mergePdfBtn.addEventListener("click", async () => {

    if (mergeSelected.length < 2) {
      mergeStatus.textContent =
        "Please select at least 2 PDF files.";
      return;
    }

    try {

      mergePdfBtn.disabled = true;
      mergePdfBtn.textContent = "Merging...";

      const mergedPdf =
        await PDFDocument.create();


      for (let i = 0; i < mergeSelected.length; i++) {

        mergeStatus.textContent =
          `Processing ${i + 1} of ${mergeSelected.length}...`;

        const bytes =
          await mergeSelected[i].arrayBuffer();

        const sourcePdf =
          await PDFDocument.load(bytes);

        const pages =
          await mergedPdf.copyPages(
            sourcePdf,
            sourcePdf.getPageIndices()
          );

        pages.forEach(page => {
          mergedPdf.addPage(page);
        });
      }


      const output =
        await mergedPdf.save();

      downloadBytes(
        output,
        "merged-pdf.pdf"
      );

      mergeStatus.textContent =
        "✓ Merge completed. Download started.";

    } catch (error) {

      console.error(error);

      mergeStatus.textContent =
        "❌ Unable to merge this PDF.";

    } finally {

      mergePdfBtn.disabled = false;
      mergePdfBtn.textContent =
        "Merge & Download PDF";
    }

  });


  /* =========================================
     SPLIT PDF
  ========================================= */

  const splitFile =
    document.getElementById("splitFile");

  const splitBtn =
    document.getElementById("splitBtn");

  const splitArea =
    document.getElementById("splitArea");

  const splitStatus =
    document.getElementById("splitStatus");

  const splitPage =
    document.getElementById("splitPage");

  const splitPdfBtn =
    document.getElementById("splitPdfBtn");

  let splitSelectedFile = null;


  splitBtn.addEventListener("click", () => {
    splitFile.click();
  });


  splitFile.addEventListener("change", () => {

    splitSelectedFile =
      splitFile.files[0];

    if (!splitSelectedFile) return;

    splitArea.hidden = false;

    splitStatus.textContent =
      `Selected: ${splitSelectedFile.name}`;
  });


  splitPdfBtn.addEventListener("click", async () => {

    if (!splitSelectedFile) {
      splitStatus.textContent =
        "Please select a PDF first.";
      return;
    }

    try {

      splitPdfBtn.disabled = true;
      splitPdfBtn.textContent = "Processing...";


      const sourceBytes =
        await splitSelectedFile.arrayBuffer();

      const sourcePdf =
        await PDFDocument.load(sourceBytes);

      const pageNumber =
        Number(splitPage.value);

      if (
        pageNumber < 1 ||
        pageNumber > sourcePdf.getPageCount()
      ) {

        splitStatus.textContent =
          `Please enter a page between 1 and ${sourcePdf.getPageCount()}.`;

        return;
      }


      const newPdf =
        await PDFDocument.create();

      const [page] =
        await newPdf.copyPages(
          sourcePdf,
          [pageNumber - 1]
        );

      newPdf.addPage(page);


      const output =
        await newPdf.save();


      downloadBytes(
        output,
        `split-page-${pageNumber}.pdf`
      );


      splitStatus.textContent =
        "✓ Page extracted. Download started.";

    } catch (error) {

      console.error(error);

      splitStatus.textContent =
        "❌ Could not split this PDF.";

    } finally {

      splitPdfBtn.disabled = false;
      splitPdfBtn.textContent =
        "Extract Page & Download";
    }

  });


  /* =========================================
     COMPRESS / OPTIMIZE PDF
  ========================================= */

  const compressFile =
    document.getElementById("compressFile");

  const compressBtn =
    document.getElementById("compressBtn");

  const compressArea =
    document.getElementById("compressArea");

  const compressStatus =
    document.getElementById("compressStatus");

  const compressPdfBtn =
    document.getElementById("compressPdfBtn");

  let compressSelectedFile = null;


  compressBtn.addEventListener("click", () => {
    compressFile.click();
  });


  compressFile.addEventListener("change", () => {

    compressSelectedFile =
      compressFile.files[0];

    if (!compressSelectedFile) return;

    compressArea.hidden = false;

    compressStatus.textContent =
      `Selected: ${compressSelectedFile.name}`;
  });


  compressPdfBtn.addEventListener("click", async () => {

    if (!compressSelectedFile) {
      compressStatus.textContent =
        "Please select a PDF first.";
      return;
    }

    try {

      compressPdfBtn.disabled = true;
      compressPdfBtn.textContent =
        "Optimizing...";


      const bytes =
        await compressSelectedFile.arrayBuffer();


      const pdf =
        await PDFDocument.load(bytes);


      const output =
        await pdf.save({
          useObjectStreams: true,
          addDefaultPage: false
        });


      const oldSize =
        compressSelectedFile.size;

      const newSize =
        output.length;


      downloadBytes(
        output,
        "compressed-pdf.pdf"
      );


      compressStatus.textContent =
        `✓ Optimization completed. Original: ${formatBytes(oldSize)}, Output: ${formatBytes(newSize)}.`;

    } catch (error) {

      console.error(error);

      compressStatus.textContent =
        "❌ Could not optimize this PDF.";

    } finally {

      compressPdfBtn.disabled = false;

      compressPdfBtn.textContent =
        "Compress & Download";
    }

  });


  function formatBytes(bytes) {

    if (bytes === 0) return "0 Bytes";

    const units =
      ["Bytes", "KB", "MB", "GB"];

    const i =
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      );

    return (
      (bytes /
        Math.pow(1024, i))
        .toFixed(2) +
      " " +
      units[i]
    );
  }


  /* =========================================
     PDF TO IMAGE
  ========================================= */

  const pdfImageFile =
    document.getElementById("pdfImageFile");

  const pdfImageBtn =
    document.getElementById("pdfImageBtn");

  const pdfImageArea =
    document.getElementById("pdfImageArea");

  const pdfImageStatus =
    document.getElementById("pdfImageStatus");

  const imageDownloads =
    document.getElementById("imageDownloads");


  pdfImageBtn.addEventListener("click", () => {
    pdfImageFile.click();
  });


  pdfImageFile.addEventListener("change", async () => {

    const file =
      pdfImageFile.files[0];

    if (!file) return;

    pdfImageArea.hidden = false;

    imageDownloads.innerHTML = "";

    pdfImageStatus.textContent =
      "Loading PDF...";


    try {

      const bytes =
        await file.arrayBuffer();


      /*
       PDF.js is loaded as an ES module.
       Use dynamic import so the page works
       with GitHub Pages.
      */

      const pdfjsLib =
        await import(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs"
        );


      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


      const loadingTask =
        pdfjsLib.getDocument({
          data: bytes
        });


      const pdf =
        await loadingTask.promise;


      pdfImageStatus.textContent =
        `Converting ${pdf.numPages} page(s)...`;


      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {

        const page =
          await pdf.getPage(pageNumber);


        const scale = 1.5;

        const viewport =
          page.getViewport({
            scale
          });


        const canvas =
          document.createElement("canvas");

        const context =
          canvas.getContext("2d");


        canvas.width =
          Math.floor(viewport.width);

        canvas.height =
          Math.floor(viewport.height);


        await page.render({
          canvasContext: context,
          viewport
        }).promise;


        const blob =
          await new Promise(resolve => {
            canvas.toBlob(
              resolve,
              "image/png"
            );
          });


        const url =
          URL.createObjectURL(blob);


        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          `page-${pageNumber}.png`;

        link.className =
          "download-link";

        link.textContent =
          `Download Page ${pageNumber}`;


        imageDownloads.appendChild(link);
      }


      pdfImageStatus.textContent =
        "✓ Conversion completed. Download the pages below.";

    } catch (error) {

      console.error(error);

      pdfImageStatus.textContent =
        "❌ Could not convert this PDF.";

    }

  });


  /* =========================================
     IMAGE TO PDF
  ========================================= */

  const imagePdfFiles =
    document.getElementById("imagePdfFiles");

  const imagePdfBtn =
    document.getElementById("imagePdfBtn");

  const imagePdfArea =
    document.getElementById("imagePdfArea");

  const imagePdfStatus =
    document.getElementById("imagePdfStatus");

  const createImagePdfBtn =
    document.getElementById("createImagePdfBtn");


  let imageFiles = [];


  imagePdfBtn.addEventListener("click", () => {
    imagePdfFiles.click();
  });


  imagePdfFiles.addEventListener("change", () => {

    imageFiles =
      Array.from(imagePdfFiles.files);

    if (!imageFiles.length) return;

    imagePdfArea.hidden = false;

    imagePdfStatus.textContent =
      `${imageFiles.length} image(s) selected.`;
  });


  createImagePdfBtn.addEventListener(
    "click",
    async () => {

      if (!imageFiles.length) {
        imagePdfStatus.textContent =
          "Please select images first.";
        return;
      }


      try {

        createImagePdfBtn.disabled = true;

        createImagePdfBtn.textContent =
          "Creating PDF...";


        const pdf =
          await PDFDocument.create();


        for (const file of imageFiles) {

          const bytes =
            await file.arrayBuffer();


          let image;


          if (
            file.type === "image/png" ||
            file.name.toLowerCase().endsWith(".png")
          ) {

            image =
              await pdf.embedPng(bytes);

          } else {

            image =
              await pdf.embedJpg(bytes);
          }


          const width =
            image.width;

          const height =
            image.height;


          const maxWidth = 595;

          const maxHeight = 842;


          const scale =
            Math.min(
              maxWidth / width,
              maxHeight / height,
              1
            );


          const page =
            pdf.addPage([
              width * scale,
              height * scale
            ]);


          page.drawImage(image, {
            x: 0,
            y: 0,
            width: width * scale,
            height: height * scale
          });

        }


        const output =
          await pdf.save();


        downloadBytes(
          output,
          "images-to-pdf.pdf"
        );


        imagePdfStatus.textContent =
          "✓ PDF created successfully. Download started.";

      } catch (error) {

        console.error(error);

        imagePdfStatus.textContent =
          "❌ Could not create PDF. Please use JPG or PNG images.";

      } finally {

        createImagePdfBtn.disabled = false;

        createImagePdfBtn.textContent =
          "Create & Download PDF";
      }

    }
  );


  /* =========================================
     ROTATE PDF
  ========================================= */

  const rotateFile =
    document.getElementById("rotateFile");

  const rotateBtn =
    document.getElementById("rotateBtn");

  const rotateArea =
    document.getElementById("rotateArea");

  const rotateStatus =
    document.getElementById("rotateStatus");

  const rotationAmount =
    document.getElementById("rotationAmount");

  const rotatePdfBtn =
    document.getElementById("rotatePdfBtn");


  let rotateSelectedFile = null;


  rotateBtn.addEventListener("click", () => {
    rotateFile.click();
  });


  rotateFile.addEventListener("change", () => {

    rotateSelectedFile =
      rotateFile.files[0];

    if (!rotateSelectedFile) return;

    rotateArea.hidden = false;

    rotateStatus.textContent =
      `Selected: ${rotateSelectedFile.name}`;
  });


  rotatePdfBtn.addEventListener("click", async () => {

    if (!rotateSelectedFile) {
      rotateStatus.textContent =
        "Please select a PDF first.";
      return;
    }


    try {

      rotatePdfBtn.disabled = true;

      rotatePdfBtn.textContent =
        "Rotating...";


      const bytes =
        await rotateSelectedFile.arrayBuffer();


      const pdf =
        await PDFDocument.load(bytes);


      const angle =
        Number(rotationAmount.value);


      pdf.getPages().forEach(page => {

        const current =
          page.getRotation().angle;

        page.setRotation(
          degrees(
            (current + angle) % 360
          )
        );

      });


      const output =
        await pdf.save();


      downloadBytes(
        output,
        "rotated-pdf.pdf"
      );


      rotateStatus.textContent =
        "✓ PDF rotated successfully. Download started.";

    } catch (error) {

      console.error(error);

      rotateStatus.textContent =
        "❌ Could not rotate this PDF.";

    } finally {

      rotatePdfBtn.disabled = false;

      rotatePdfBtn.textContent =
        "Rotate & Download";
    }

  });

});
