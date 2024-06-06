"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../breadcrumbs/Breadcrumb";
import SwitcherOne from "../switcher/SwitcherOne";
import InputSearch from "../inputSearch/InputSearch";
import SwitcherTwo from "../switcher/SwitcherTwo";
import Modal from "../modal/Modal";
import CreatePdfModal from "../createPdf/CreatePdfModal";
import CreateVideoModal from "../createVideoModal/CreateVideoModal";
import DeletePdfModal from "../deletePdfModal/DeletePdfModal";
import DeleteVideoModal from "../deleteVideoModal/DeleteVideoModal";

import { useEdgeStore } from "@/lib/edgestore";
import LoadingSpinner from "../LoadingSpinner";

function EditCourse() {
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [isDeletePdfOpen, setIsDeletePdfOpen] = useState(false);
  const [isDeleteVideoOpen, setIsDeleteVideoOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isAddPdfOpen, setIsAddPdfOpen] = useState(false);
  const [modules, setModule] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [pdfId, setPdfId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [pdfs, setPdfs] = useState<Pdf[]>([]);

  const { edgestore } = useEdgeStore();
  // Edit course states
  const [courseImage, setCourseImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [premium, setPremium] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [superieur, setSuperieur] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [image, setImage] = useState("");
  // toggle disable edit state buttons
  const [isFileDisabled, setFileDisabled] = useState(true);
  const [isCourseDisabled, setCourseDisabled] = useState(true);
  const [isSuperieurDisabled, setSuperieurDisabled] = useState(true);
  const [isPremiumDisabled, setPremiumDisabled] = useState(true);
  const [isLanguagesDisabled, setLanguagesDisabled] = useState(true);
  const [isModuleDisabled, setModuleDisabled] = useState(true);
  const [isDescriptionDisabled, setDescriptionDisabled] = useState(true);
  const [isLevelDisabled, setLevelDisabled] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  function handleDeletePdfModal(pdfId: string) {
    setIsDeletePdfOpen(true);
    setPdfId(pdfId);
  }

  function handleDeleteVideoModal(videoId: string) {
    setIsDeleteVideoOpen(true);
    setVideoId(videoId);
    console.log(videoId);
  }

  async function handleUpdateCourse() {
    if (file) {
      const res = await edgestore.myPublicImages.upload({ file });
      setImage(res.url);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/course`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id[0],
          name: courseName,
          description,
          is_sup: superieur,
          level: selectedLevel,
          language: selectedLanguage,
          is_premium: premium,
          module: selectedModule,
          image,
        }),
      },
    );
    if (response.ok) {
      console.log(response.body);
    }
  }
  useEffect(() => {
    const fetchCourse = fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/course?id=${id}`,
    )
      .then((response) => response.json())
      .then((data) => {
        const course = data.courses[0];
        setDescription(course.description);
        setSuperieur(course.is_sup);
        setSelectedLanguage(course.language);
        setSelectedModule(course.module);
        setCourseName(course.name);
        setPremium(course.is_premium);
        setCourseImage(course.image);
        setPdfs(course.PDFs);
        setVideos(course.videos);
        setImage(course.image);
        setSelectedLevel(course.level);
      })
      .catch((error) => {
        console.error("Error fetching course:", error);
      });

    const fetchModule = fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/filters?module=true`,
    )
      .then((response) => response.json())
      .then((data) => setModule(data.uniqueModules))
      .catch((error) => console.error("Error fetching modules:", error));

    const fetchLanguage = fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/filters?language=true`,
    )
      .then((response) => response.json())
      .then((data) => setLanguages(data.uniqueLanguages))
      .catch((error) => console.error("Error fetching languages:", error));

    const fetchLevel = fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/filters?level=true`,
    )
      .then((response) => response.json())
      .then((data) => setLevels(data.uniqueLevels))
      .catch((error) => console.error("Error fetching levels:", error));

    Promise.all([fetchCourse, fetchModule, fetchLanguage, fetchLevel]).then(
      () => {
        setPageLoading(false); // Set loading state to false after all fetches are complete
      },
    );
  }, [id]);
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white bg-opacity-80 z-50">
        <LoadingSpinner />
      </div>
    );
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
  };
  return (
    <div>
      <Breadcrumb pageName="Modifier Cours" />
      <div className="flex flex-col border-custom-gray-400 shadow-lg rounded-lg gap-5.5 p-6.5">
        <div className="flex justify-center">
          <img
            className="h-auto max-w-xl rounded-lg shadow-xl dark:shadow-gray-800"
            src={courseImage}
            alt="image description"
          />
        </div>
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Attach file
          </label>
          <div className="flex items-center gap-2">
            <input
              onChange={handleFileChange}
              type="file"
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              disabled={isFileDisabled}
            />
            <svg
              onMouseDown={() => setFileDisabled(!isFileDisabled)}
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
              />
            </svg>
          </div>
          <div className="flex justify-between">
            <div className="w-1/2">
              <label className="my-3 block text-sm font-medium text-black dark:text-white">
                Cours
              </label>
              <div className="flex items-center gap-2">
                <input
                  onChange={(e) => setCourseName(e.target.value)}
                  type="text"
                  id="course-name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="John"
                  required
                  value={courseName}
                  disabled={isCourseDisabled}
                />
                <svg
                  onMouseDown={() => setCourseDisabled(!isCourseDisabled)}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <div className="w-1/2">
              <label className="my-3 block text-sm font-medium text-black dark:text-white">
                Level
              </label>
              <div className="flex items-center gap-2">
                <InputSearch
                  input={levels}
                  propvalue={selectedLevel}
                  setSelectedValue={setSelectedLevel}
                  isDisabled={isLevelDisabled}
                />
                <svg
                  onClick={() => setLevelDisabled(!isLevelDisabled)}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/2">
              <label className="my-3 block text-sm font-medium text-black dark:text-white">
                Superieure
              </label>
              <div className="flex items-center gap-2">
                <SwitcherOne
                  enabled={superieur}
                  setEnabled={setSuperieur}
                  isDisabled={isSuperieurDisabled}
                />
                <svg
                  onClick={() => setSuperieurDisabled(!isSuperieurDisabled)}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <div className="w-1/2">
              <label className="my-3 block text-sm font-medium text-black dark:text-white">
                Langues
              </label>
              <div className="flex items-center gap-2">
                <InputSearch
                  input={languages}
                  propvalue={selectedLanguage}
                  setSelectedValue={setSelectedLanguage}
                  isDisabled={isLanguagesDisabled}
                />
                <svg
                  onClick={() => setLanguagesDisabled(!isLanguagesDisabled)}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="w-1/2">
              <label className="my-3 block text-sm font-medium text-black dark:text-white">
                Premium
              </label>
              <div className="flex items-center gap-2">
                <SwitcherTwo
                  enabled={premium}
                  setEnabled={setPremium}
                  isDisabled={isPremiumDisabled}
                />
                <svg
                  onClick={() => setPremiumDisabled(!isPremiumDisabled)}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <div className="w-1/2">
              <label className="my-3 block text-sm font-medium text-black dark:text-white">
                Module
              </label>
              <div className="flex items-center gap-2">
                <InputSearch
                  input={modules}
                  propvalue={selectedModule}
                  setSelectedValue={setSelectedModule}
                  isDisabled={isModuleDisabled}
                />
                <svg
                  onClick={() => setModuleDisabled(!isModuleDisabled)}
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <label className="my-3 block text-sm font-medium text-black dark:text-white">
            Description
          </label>
          <div className="flex items-center gap-2">
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows={6}
              placeholder="Description du cours"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              disabled={isDescriptionDisabled}
            ></textarea>
            <svg
              onClick={() => setDescriptionDisabled(!isDescriptionDisabled)}
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-1.5a2.828 2.828 0 01-4 4L6 18H4v-2l6.732-6.732a2.828 2.828 0 014-4z"
              />
            </svg>
          </div>
          <div className="flex justify-center items-center pt-4">
            <button
              onMouseDown={handleUpdateCourse}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Modifier le cours
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-1/2 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                PDF du cours
              </h5>
              <div
                onMouseDown={() => {
                  setIsAddPdfOpen(true);
                }}
                className="text-sm cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Ajouter un pdf au cours
              </div>
            </div>
            <div className="flow-root">
              <ul
                role="list"
                className="divide-y divide-gray-200 dark:divide-gray-700"
              >
                {pdfs.map((pdf, index) => (
                  <li key={index} className="py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0 ms-4">
                        <p className="text-sm font-bold text-custom-gray-900 truncate dark:text-white">
                          {pdf.title}
                        </p>
                        <a href={pdf.url} target="_blank">
                          <p className="text-sm text-custom-gray-400 truncate dark:text-custom-gray-200">
                            {pdf.url}
                          </p>
                        </a>
                      </div>
                      <div className="inline-flex cursor-pointer items-center text-base font-semibold text-gray-900 dark:text-white">
                        <svg
                          onMouseDown={() => handleDeletePdfModal(pdf.id)}
                          className="w-6 h-6 text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full sm:w-1/2 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                Vidéo du cours
              </h5>
              <div
                onMouseDown={() => {
                  setIsAddVideoOpen(true);
                }}
                className="text-sm cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Ajouter une vidéo au cours
              </div>
            </div>
            <div className="flow-root">
              <ul
                role="list"
                className="divide-y divide-gray-200 dark:divide-gray-700"
              >
                {videos.map((video, index) => (
                  <li key={index} className="py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0 ms-4">
                        <p className="text-sm font-bold text-custom-gray-900 truncate dark:text-white">
                          {video.title}
                        </p>
                        <a href={video.url} target="_blank">
                          <p className="text-sm text-custom-gray-400 truncate dark:text-custom-dark-color">
                            {video.url}
                          </p>
                        </a>
                      </div>
                      <div
                        onMouseDown={() => handleDeleteVideoModal(video.id)}
                        className="inline-flex cursor-pointer items-center text-base font-semibold text-gray-900 dark:text-white"
                      >
                        <svg
                          className="w-6 h-6 text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isAddVideoOpen && (
        <CreateVideoModal
          isOpen={isAddVideoOpen}
          closeModal={() => {
            setIsAddVideoOpen(false);
          }}
          courseId={id}
        />
      )}
      {isAddPdfOpen && (
        <CreatePdfModal
          isOpen={isAddPdfOpen}
          closeModal={() => {
            setIsAddPdfOpen(false);
          }}
          courseId={id}
        />
      )}
      {isDeletePdfOpen && (
        <DeletePdfModal
          isOpen={isDeletePdfOpen}
          closeModal={() => {
            setIsDeletePdfOpen(false);
          }}
          pdfId={pdfId}
        />
      )}
      {isDeleteVideoOpen && (
        <DeleteVideoModal
          isOpen={isDeleteVideoOpen}
          closeModal={() => {
            setIsDeleteVideoOpen(false);
          }}
          videoId={videoId}
        />
      )}
    </div>
  );
}
export default EditCourse;

interface Course {
  id: string;
  name: string;
  description: string;
  is_sup: boolean;
  level: string;
  language: string;
  module: string;
  is_premium: boolean;
  date_created: string;
  date_updated: string;
  image: string;
  videos: any[];
  PDFs: any[];
}
interface Pdf {
  id: string;
  url: string;
  title: string;
}
interface Video {
  id: string;
  url: string;
  title: string;
}
