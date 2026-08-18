const { PDFDocument, degrees } = PDFLib;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

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

function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}


// =====================================================
// MERGE PDF
// =====================================================

const mergeFiles = document.getElementById("mergeFiles");
const mergeBtn = document.getElementById("mergeBtn");
const mergeArea = document.getElementById("mergeArea");
const mergeStatus = document.getElementById("mergeStatus");
const mergeFileList = document.getElementById("mergeFileList");
const mergePdfBtn = document.getElementById("mergePdfBtn");

let selectedMergeFiles = [];

if (mergeBtn) {
  mergeBtn.addEventListener("click", () => {
    mergeFiles.click();
  });
}

if (mergeFiles) {
  mergeFiles.addEventListener("change", () => {

    selectedMergeFiles = Array.from(mergeFiles.files);

    if (selectedMergeFiles.length < 2) {
      mergeStatus.textContent =
        "Please select at least 2 PDF files.";

      mergeFileList.innerHTML = "";
      mergeArea.hidden = false;

      return;
    }

    mergeArea.hidden = false;

    mergeStatus.textContent =
      selectedMergeFiles.length + " PDF files selected.";

    mergeFileList.innerHTML = "";

    selectedMergeFiles.forEach((file, index) => {

      const div = document.createElement("div");

      div.textContent =
        (index + 1) + ". " + file.name;

      div.style.marginBottom = "6px";

      mergeFileList.appendChild(div);
    });
  });
}

if (mergePdfBtn) {
  mergePdfBtn.addEventListener("click", async () => {

    if (selectedMergeFiles.length < 2) {
      alert("Please select at least 2 PDF files.");
      return;
    }

    try {

      mergePdfBtn.disabled = true;
      mergePdfBtn.textContent = "Merging...";

      const mergedPdf = await PDFDocument.create();

      for (const file of selectedMergeFiles) {

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await PDFDocument.load(arrayBuffer);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach(page => {
          mergedPdf.addPage(page);
        });
      }

      const mergedBytes = await mergedPdf.save({
        useObjectStreams: true
      });

      downloadBytes(
        mergedBytes,
        "merged-pdf.pdf"
      );

      mergeStatus.textContent =
        "PDF merged successfully!";

    } catch (error) {

      console.error(error);

      alert(
        "Unable to merge PDF files. Please make sure the PDFs are valid."
      );

    } finally {

      mergePdfBtn.disabled = false;
      mergePdfBtn.textContent = "Merge & Download PDF";

    }
  });
}


// =====================================================
// SPLIT PDF
// =====================================================

const splitFile = document.getElementById("splitFile");
const splitBtn = document.getElementById("splitBtn");
const splitArea = document.getElementById("splitArea");
const splitStatus = document.getElementById("splitStatus");
const splitPage = document.getElementById("splitPage");
const splitPdfBtn = document.getElementById("splitPdfBtn");

let selectedSplitFile = null;

if (splitBtn) {
  splitBtn.addEventListener("click", () => {
    splitFile.click();
  });
}

if (splitFile) {
  splitFile.addEventListener("change", async () => {

    selectedSplitFile = splitFile.files[0];

    if (!selectedSplitFile) {
      return;
    }

    try {

      const buffer =
        await selectedSplitFile.arrayBuffer();

      const pdf =
        await PDFDocument.load(buffer);

      const pageCount =
        pdf.getPageCount();

      splitArea.hidden = false;

      splitPage.max = pageCount;

      splitStatus.textContent =
        selectedSplitFile.name +
        " loaded. Total pages: " +
        pageCount;

    } catch (error) {

      console.error(error);

      alert("Unable to open this PDF.");

    }
  });
}

if (splitPdfBtn) {
  splitPdfBtn.addEventListener("click", async () => {

    if (!selectedSplitFile) {
      alert("Please select a PDF first.");
      return;
    }

    try {

      const pageNumber =
        parseInt(splitPage.value);

      const buffer =
        await selectedSplitFile.arrayBuffer();

      const sourcePdf =
        await PDFDocument.load(buffer);

      const pageCount =
        sourcePdf.getPageCount();

      if (
        isNaN(pageNumber) ||
        pageNumber < 1 ||
        pageNumber > pageCount
      ) {

        alert(
          "Please enter a valid page number between 1 and " +
          pageCount
        );

        return;
      }

      splitPdfBtn.disabled = true;
      splitPdfBtn.textContent = "Processing...";

      const newPdf =
        await PDFDocument.create();

      const [page] =
        await newPdf.copyPages(
          sourcePdf,
          [pageNumber - 1]
        );

      newPdf.addPage(page);

      const bytes =
        await newPdf.save({
          useObjectStreams: true
        });

      downloadBytes(
        bytes,
        "split-page-" + pageNumber + ".pdf"
      );

      splitStatus.textContent =
        "Page " + pageNumber +
        " extracted successfully.";

    } catch (error) {

      console.error(error);

      alert(
        "Unable to split this PDF."
      );

    } finally {

      splitPdfBtn.disabled = false;
      splitPdfBtn.textContent =
        "Extract Page & Download";

    }
  });
}


// =====================================================
// COMPRESS PDF
// =====================================================

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

let selectedCompressFile = null;

if (compressBtn) {

  compressBtn.addEventListener("click", () => {
    compressFile.click();
  });

}

if (compressFile) {

  compressFile.addEventListener("change", async () => {

    selectedCompressFile =
      compressFile.files[0];

    if (!selectedCompressFile) {
      return;
    }

    compressArea.hidden = false;

    compressStatus.textContent =
      selectedCompressFile.name +
      " selected. Size: " +
      formatFileSize(selectedCompressFile.size);

  });

}

if (compressPdfBtn) {

  compressPdfBtn.addEventListener("click", async () => {

    if (!selectedCompressFile) {
      alert("Please select a PDF first.");
      return;
    }

    try {

      compressPdfBtn.disabled = true;
      compressPdfBtn.textContent =
        "Compressing...";

      const buffer =
        await selectedCompressFile.arrayBuffer();

      const pdf =
        await PDFDocument.load(buffer);

      const bytes =
        await pdf.save({
          useObjectStreams: true,
          addDefaultPage: false
        });

      downloadBytes(
        bytes,
        "compressed-pdf.pdf"
      );

      const oldSize =
        selectedCompressFile.size;

      const newSize =
        bytes.length;

      compressStatus.textContent =
        "Compression completed. Original: " +
        formatFileSize(oldSize) +
        " → New: " +
        formatFileSize(newSize);

    } catch (error) {

      console.error(error);

      alert(
        "Unable to compress this PDF."
      );

    } finally {

      compressPdfBtn.disabled = false;
      compressPdfBtn.textContent =
        "Compress & Download";

    }

  });

}


// =====================================================
// PDF TO IMAGE
// =====================================================

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

let selectedPdfImageFile = null;

if (pdfImageBtn) {

  pdfImageBtn.addEventListener("click", () => {
    pdfImageFile.click();
  });

}

if (pdfImageFile) {

  pdfImageFile.addEventListener("change", async () => {

    selectedPdfImageFile =
      pdfImageFile.files[0];

    if (!selectedPdfImageFile) {
      return;
    }

    pdfImageArea.hidden = false;

    imageDownloads.innerHTML = "";

    pdfImageStatus.textContent =
      "Loading PDF...";

    try {

      if (typeof pdfjsLib === "undefined") {

        throw new Error(
          "PDF.js library did not load."
        );

      }

      const buffer =
        await selectedPdfImageFile.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: buffer
        }).promise;

      pdfImageStatus.textContent =
        "Converting " +
        pdf.numPages +
        " page(s)...";

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {

        const page =
          await pdf.getPage(pageNumber);

        const viewport =
          page.getViewport({
            scale: 2
          });

        const canvas =
          document.createElement("canvas");

        const context =
          canvas.getContext("2d");

        canvas.width =
          viewport.width;

        canvas.height =
          viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const imageUrl =
          canvas.toDataURL("image/png");

        const wrapper =
          document.createElement("div");

        wrapper.style.marginBottom =
          "20px";

        const title =
          document.createElement("p");

        title.textContent =
          "Page " + pageNumber;

        const image =
          document.createElement("img");

        image.src = imageUrl;

        image.style.maxWidth = "100%";
        image.style.border = "1px solid #ddd";
        image.style.borderRadius = "8px";

        const download =
          document.createElement("a");

        download.href = imageUrl;

        download.download =
          "page-" +
          pageNumber +
          ".png";

        download.textContent =
          "Download Page " +
          pageNumber;

        download.className =
          "tool-btn";

        download.style.display =
          "inline-block";

        download.style.marginTop =
          "8px";

        wrapper.appendChild(title);
        wrapper.appendChild(image);
        wrapper.appendChild(
          document.createElement("br")
        );
        wrapper.appendChild(download);

        imageDownloads.appendChild(
          wrapper
        );

        pdfImageStatus.textContent =
          "Converted " +
          pageNumber +
          " of " +
          pdf.numPages +
          " page(s).";
      }

      pdfImageStatus.textContent =
        "PDF converted successfully!";

    } catch (error) {

      console.error(error);

      pdfImageStatus.textContent =
        "Conversion failed.";

      alert(
        "Unable to convert this PDF to images."
      );

    }

  });

}


// =====================================================
// IMAGE TO PDF
// =====================================================

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

let selectedImages = [];

if (imagePdfBtn) {

  imagePdfBtn.addEventListener("click", () => {
    imagePdfFiles.click();
  });

}

if (imagePdfFiles) {

  imagePdfFiles.addEventListener("change", () => {

    selectedImages =
      Array.from(imagePdfFiles.files);

    if (selectedImages.length === 0) {
      return;
    }

    imagePdfArea.hidden = false;

    imagePdfStatus.textContent =
      selectedImages.length +
      " image(s) selected.";

  });

}

if (createImagePdfBtn) {

  createImagePdfBtn.addEventListener(
    "click",
    async () => {

      if (selectedImages.length === 0) {

        alert(
          "Please select at least one image."
        );

        return;
      }

      try {

        createImagePdfBtn.disabled = true;

        createImagePdfBtn.textContent =
          "Creating PDF...";

        const pdf =
          await PDFDocument.create();

        for (const file of selectedImages) {

          const bytes =
            await file.arrayBuffer();

          let image;

          const type =
            file.type.toLowerCase();

          if (
            type === "image/jpeg" ||
            type === "image/jpg"
          ) {

            image =
              await pdf.embedJpg(bytes);

          } else if (
            type === "image/png"
          ) {

            image =
              await pdf.embedPng(bytes);

          } else {

            continue;

          }

          const imageWidth =
            image.width;

          const imageHeight =
            image.height;

          const page =
            pdf.addPage([
              imageWidth,
              imageHeight
            ]);

          page.drawImage(image, {
            x: 0,
            y: 0,
            width: imageWidth,
            height: imageHeight
          });

        }

        const bytes =
          await pdf.save({
            useObjectStreams: true
          });

        downloadBytes(
          bytes,
          "images-to-pdf.pdf"
        );

        imagePdfStatus.textContent =
          "PDF created successfully!";

      } catch (error) {

        console.error(error);

        alert(
          "Unable to create PDF from images."
        );

      } finally {

        createImagePdfBtn.disabled = false;

        createImagePdfBtn.textContent =
          "Create & Download PDF";

      }

    }
  );

}


// =====================================================
// ROTATE PDF
// =====================================================

const rotateFile =
  document.getElementById("rotateFile");

const rotateBtn =
  document.getElementById("rotateBtn");

const rotateArea =
  document.getElementById("rotateArea");

const rotationAmount =
  document.getElementById("rotationAmount");

const rotateStatus =
  document.getElementById("rotateStatus");

const rotatePdfBtn =
  document.getElementById("rotatePdfBtn");

let selectedRotateFile = null;

if (rotateBtn) {

  rotateBtn.addEventListener("click", () => {
    rotateFile.click();
  });

}

if (rotateFile) {

  rotateFile.addEventListener("change", async () => {

    selectedRotateFile =
      rotateFile.files[0];

    if (!selectedRotateFile) {
      return;
    }

    try {

      const buffer =
        await selectedRotateFile.arrayBuffer();

      const pdf =
        await PDFDocument.load(buffer);

      rotateArea.hidden = false;

      rotateStatus.textContent =
        selectedRotateFile.name +
        " loaded. Pages: " +
        pdf.getPageCount();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to open this PDF."
      );

    }

  });

}

if (rotatePdfBtn) {

  rotatePdfBtn.addEventListener(
    "click",
    async () => {

      if (!selectedRotateFile) {

        alert(
          "Please select a PDF first."
        );

        return;
      }

      try {

        rotatePdfBtn.disabled = true;

        rotatePdfBtn.textContent =
          "Rotating...";

        const buffer =
          await selectedRotateFile.arrayBuffer();

        const pdf =
          await PDFDocument.load(buffer);

        const rotation =
          parseInt(
            rotationAmount.value
          );

        const pages =
          pdf.getPages();

        pages.forEach(page => {

          const currentRotation =
            page.getRotation().angle;

          page.setRotation(
            degrees(
              currentRotation +
              rotation
            )
          );

        });

        const bytes =
          await pdf.save({
            useObjectStreams: true
          });

        downloadBytes(
          bytes,
          "rotated-pdf.pdf"
        );

        rotateStatus.textContent =
          "PDF rotated successfully!";

      } catch (error) {

        console.error(error);

        alert(
          "Unable to rotate this PDF."
        );

      } finally {

        rotatePdfBtn.disabled = false;

        rotatePdfBtn.textContent =
          "Rotate & Download";

      }

    }
  );

}


// =====================================================
// FILE SIZE HELPER
// =====================================================

function formatFileSize(bytes) {

  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return (
    parseFloat(
      (
        bytes /
        Math.pow(1024, index)
      ).toFixed(2)
    ) +
    " " +
    units[index]
  );

}


// =====================================================
// PAGE READY
// =====================================================

console.log(
  "PDFTools loaded successfully."
);
