import Modal from "../modal/Modal";

import React, { useEffect, useState } from "react";
const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};
export default function CreatePdfModal({
  isOpen,
  closeModal,
  chapitreId,
}: any) {
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");

  async function handleAddPdf() {
    if (!pdf || !pdfTitle || !chapitreId) {
      alert("Please fill all fields");
      return;
    }
    const checksum = await computeSHA256(pdf);
    const formData = new FormData();
    formData.append("file", pdf);
    formData.append("title", pdfTitle);
    formData.append("chapitreId", chapitreId);
    formData.append("fileType", pdf.type);
    formData.append("fileSize", pdf.size.toString());
    formData.append("checksum", checksum);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/pdf`, {
      method: "POST",

      body: formData,
    });
    if (response.ok) {
      location.reload();
    } else {
      alert("Reesayer plus tard");
      console.log(response);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Ajouter un pdf au cours"
      footer={
        <div className="flex justify-end">
          <button
            onMouseDown={closeModal}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Fermer
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onMouseDown={handleAddPdf}
          >
            Confirmer
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5.5 p-6.5 overflow-auto">
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Titre du pdf
          </label>
          <input
            onChange={(e) => setPdfTitle(e.target.value)}
            type="text"
            id="video-title"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter le titre du pdf"
            required
          />

          <label className="my-3 block text-sm font-medium text-black dark:text-white">
            Importer un PDF
          </label>
          <input
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
            type="file"
            id="pdf"
            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
          />
        </div>
      </div>
    </Modal>
  );
}
