"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CreateCourse from "../createCourseModal/CreateCourse";
import DeleteCourse from "../deleteCourseModal/DeleteCourse";
import Link from "next/link";
import LoadingSpinner from "../LoadingSpinner";

function Cours() {
  const params = useParams();
  const { level } = params;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const openDeleteModal = (course: any) => {
    setIsDeleteModalOpen(true);
    setSelectedCourse(course);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  const initialfetchCourses = async () => {
    setPageLoading(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_HOST +
          `api/course?level=${level}&pageSize=6`,
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setCourses(data.courses);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Optionally, you might want to set an error state here
      // setError(error.message);
    } finally {
      setPageLoading(false);
    }
  };
  useEffect(() => {
    initialfetchCourses();
  }, [level]);
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white bg-opacity-80 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  const fetchCourses = async (cursor: string | null = null) => {
    setLoading(true);
    let url = `${process.env.NEXT_PUBLIC_API_HOST}api/course?level=${level}&pageSize=6`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      setCourses((prevCourses) => [...prevCourses, ...data.courses]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white bg-opacity-80 z-50">
          <LoadingSpinner />
        </div>
      )}
      <div>
        <div className="flex justify-center mb-4">
          <button
            onMouseDown={openModal}
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="w-3.5 h-3.5 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M18 5.05h1a2 2 0 0 1 2 2v2H3v-2a2 2 0 0 1 2-2h1v-1a1 1 0 1 1 2 0v1h3v-1a1 1 0 1 1 2 0v1h3v-1a1 1 0 1 1 2 0v1Zm-15 6v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8H3ZM11 18a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1Z"
                clipRule="evenodd"
              />
            </svg>
            Create a new course
          </button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-4 justify-center w-full max-w-screen-lg">
            {courses.map((course: Course, index: number) => (
              <Link
                key={index}
                href={`/admin/cours/edit/${course.id}`}
                className="relative flex flex-col items-center bg-white border border-custom-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-custom-gray-100 dark:border-custom-gray-700 dark:bg-custom-gray-800 dark:hover:bg-custom-gray-700 flex-1 min-w-[300px] md:min-w-[400px] basis-[calc(50%-1rem)]"
              >
                <img
                  className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                  src={course.image}
                  alt=""
                />
                <div className="flex flex-col justify-between p-4 leading-normal">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-custom-gray-900 dark:text-white">
                    {course.name}
                  </h5>
                  <p className="mb-3 font-normal text-custom-gray-700 dark:text-custom-gray-400 line-clamp-3">
                    {course.description}
                  </p>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <svg
                    onMouseDown={() => openDeleteModal(course)}
                    className="w-6 h-6 text-custom-gray-700 hover:text-custom-gray-900 cursor-pointer dark:text-white dark:hover:text-custom-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <svg
                    className="w-6 h-6 text-custom-gray-700 hover:text-custom-gray-900 cursor-pointer dark:text-white dark:hover:text-custom-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                    />
                  </svg>
                </div>
              </Link>
            ))}
            {nextCursor && (
              <button
                className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => fetchCourses(nextCursor)}
                disabled={loading || !nextCursor}
              >
                Afficher plus
              </button>
            )}
            {isOpen && (
              <CreateCourse
                isOpen={isOpen}
                closeModal={closeModal}
                level={level}
              />
            )}
            {isDeleteModalOpen && (
              <DeleteCourse
                isOpen={isDeleteModalOpen}
                closeModal={closeDeleteModal}
                selectedCourse={selectedCourse}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Cours;

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
