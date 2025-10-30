"use client";
import Modal from "../modal/Modal";
import React, { useState } from "react";
import { apiUrl } from "@/helpers/publicApi"

const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export default function CreateNotificationModal({ isOpen, closeModal }: any) {
  const [file, setFile] = useState<File | null>(null);

  async function handleAddNotification() {
    if (!file) {
      alert("Please fill all fields");
      return;
    }

    const checksum = await computeSHA256(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", file.type);
    formData.append("fileSize", file.size.toString());
    formData.append("checksum", checksum);

    try {
      const response = await fetch(apiUrl("/api/notification"), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Notification created successfully");
        location.reload();
      } else {
        console.log(response);
        alert("Failed to create notification");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the notification");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Create Notification"
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
            onMouseDown={handleAddNotification}
          >
            Confirmer
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5.5 p-6.5 overflow-auto">
        <div>
          <label className="my-3 block text-sm font-medium text-black dark:text-white">
            Upload File
          </label>
          <input
            accept="image/jpeg,image/png,video/mp4,video/quicktime,application/pdf,application/x-pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            type="file"
            id="file"
            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
          />
        </div>
      </div>
    </Modal>
  );
}
