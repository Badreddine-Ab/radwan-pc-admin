import { useEdgeStore } from "@/lib/edgestore";
import React, { useEffect, useState } from "react";
import SwitcherOne from "../switcher/SwitcherOne";
import InputSearch from "../inputSearch/InputSearch";
import SwitcherTwo from "../switcher/SwitcherTwo";
import Modal from "../modal/Modal";

export default function CreateCourse({
  isOpen,
  closeModal,
  level,
}: CourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [firstStep, setFirstStep] = useState(true);
  const [modules, setModule] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [superieur, setSuperieur] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [premium, setPremium] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");

  const [chapitreStep, setChapitreStep] = useState(false);
  const [chapitreName, setChapitreName] = useState("");
  const [courseId, setCourseId] = useState("");

  const [secondStep, setSecondStep] = useState(false);
  const [chapitreId, setChapitreId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [thirdStep, setThirdStep] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");

  const { edgestore } = useEdgeStore();
  const [file, setFile] = useState<File | null>(null);

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };
  const [description, setDescription] = useState("");
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
  };
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?module=true`)
      .then((response) => response.json())
      .then((data) => setModule(data.uniqueModules))
      .catch((error) => console.error("Error:", error));
    fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?language=true`)
      .then((response) => response.json())
      .then((data) => setLanguages(data.uniqueLanguages))
      .catch((error) => console.error("Error:", error));
  }, []);
  async function createCourse() {
    if (firstStep) {
      if (!file) {
        return;
      }
      setLoading(true);
      const res = await edgestore.myPublicImages.upload({ file });

      const body = JSON.stringify({
        module: selectedModule,
        is_sup: superieur,
        is_premium: premium,
        level: decodeURIComponent(level[0]),
        name: courseName,
        language: selectedLanguage,
        description: description,
        image: res.url,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}api/course`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        },
      );
      const course = await response.json();
      setCourseId(course.newCourse.id);
      setFirstStep(false);
      setLoading(false);
      setChapitreStep(true);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } else if (chapitreStep) {
      setLoading(true);
      const body = JSON.stringify({
        name: chapitreName,
        courseId,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}api/chapitre`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        },
      );
      if (!response.ok) {
        throw new Error(`Echec de creation d echapitre : ${response.status}`);
      }
      const chapitre = await response.json();
      setChapitreId(chapitre.newChapitre.id);
      setChapitreStep(false);
      setLoading(false);
      setSecondStep(true);
    } else if (secondStep) {
      setLoading(true);
      const body = JSON.stringify({
        title: videoTitle,
        url: videoUrl,
        chapitreId,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}api/video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSecondStep(false);
      setLoading(false);
      setThirdStep(true);
    } else if (thirdStep) {
      setLoading(true);
      console.log(pdf, pdfTitle, courseId);
      if (!pdf || !pdfTitle || !courseId) {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}api/pdf`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        setThirdStep(true);
        setLoading(false);
        closeModal();
        location.reload();
      } else {
        alert("reessayer plus tard");
        console.log(response);
      }
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Cree un cours"
      footer={
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Fermer
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onMouseDown={createCourse}
          >
            Confirmer
          </button>
        </div>
      }
    >
      <nav
        className="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 justify-center items-center"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center justify-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <a
              href="#"
              className={`inline-flex items-center text-sm font-medium ${firstStep ? "text-blue-600" : "text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"}`}
            >
              <svg
                className="w-3 h-3 me-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              Details du cours
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <a
                href="#"
                className={`ms-1 text-sm font-medium ${chapitreStep ? "text-blue-600" : "text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"}`}
              >
                Chapitre
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <a
                href="#"
                className={`ms-1 text-sm font-medium ${secondStep ? "text-blue-600" : "text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"}`}
              >
                Video
              </a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 mx-1 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span
                className={`ms-1 text-sm font-medium ${thirdStep ? "text-blue-600" : "text-gray-500 md:ms-2 dark:text-gray-400"}`}
              >
                PDF
              </span>
            </div>
          </li>
        </ol>
      </nav>
      {firstStep && (
        <div className="flex flex-col gap-5.5 p-6.5 h-[300px] overflow-auto">
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Clicker ici pour importer
            </label>
            <input
              onChange={handleFileChange}
              type="file"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
            />

            <label className="my-3 block text-sm font-medium text-black dark:text-white">
              Cours
            </label>
            <input
              onChange={(e) => setCourseName(e.target.value)}
              type="text"
              id="course-name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="John"
              required
            />
            <div className="flex justify-between">
              <div className="w-1/2">
                <label className="my-3 block text-sm font-medium text-black dark:text-white">
                  Préparation de concours
                </label>
                <SwitcherOne enabled={superieur} setEnabled={setSuperieur} />
              </div>
              <div className="w-1/2">
                <label className="my-3 block text-sm font-medium text-black dark:text-white">
                  Langues
                </label>
                <InputSearch
                  input={languages}
                  propvalue={selectedLanguage}
                  setSelectedValue={setSelectedLanguage}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="w-1/2">
                <label className="my-3 block text-sm font-medium text-black dark:text-white">
                  Premium
                </label>
                <SwitcherTwo enabled={premium} setEnabled={setPremium} />
              </div>
              <div className="w-1/2">
                <label className="my-3 block text-sm font-medium text-black dark:text-white">
                  Module
                </label>
                <InputSearch
                  input={modules}
                  propvalue={selectedModule}
                  setSelectedValue={setSelectedModule}
                />
              </div>
            </div>
            <label className="my-3 block text-sm font-medium text-black dark:text-white">
              Description
            </label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Description du cours"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            ></textarea>
          </div>
        </div>
      )}
      {chapitreStep && (
        <div className="flex flex-col gap-5.5 p-6.5 h-[300px] overflow-auto">
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Nom du Chapitre
            </label>
            <input
              onChange={(e) => setChapitreName(e.target.value)}
              type="text"
              id="chapitre-name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter chapitre name"
              required
            />
          </div>
        </div>
      )}
      {secondStep && (
        <div className="flex flex-col gap-5.5 p-6.5 h-[300px] overflow-auto">
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Titre du vide
            </label>
            <input
              onChange={(e) => setVideoTitle(e.target.value)}
              type="text"
              id="video-title"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter video title"
              required
            />

            <label className="my-3 block text-sm font-medium text-black dark:text-white">
              Video URL
            </label>
            <input
              onChange={(e) => setVideoUrl(e.target.value)}
              type="text"
              id="video-url"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter video URL"
              required
            />
          </div>
        </div>
      )}
      {thirdStep && (
        <div className="flex flex-col gap-5.5 p-6.5 h-[300px] overflow-auto">
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              PDF Title
            </label>
            <input
              onChange={(e) => setPdfTitle(e.target.value)}
              type="text"
              id="pdf-title"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter PDF title"
              required
            />

            <label className="my-3 block text-sm font-medium text-black dark:text-white">
              Attach PDF
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
      )}
    </Modal>
  );
}
interface CourseModalProps {
  isOpen: boolean;
  closeModal: () => void;
  level: string[] | string;
}
