"use client";
import React, { useEffect, useRef, useState } from "react";
import CreateNotificationModal from "@/app/components/admin/createNotificationModal/createNotificationModal";
import moment from "moment";
import "moment/locale/fr"; // Import the French locale
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useSearchParams } from "next/navigation";
moment.locale("fr"); // Set the locale to French

const NotificationsTable = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchNotificationsCalled = useRef(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const fetchNotifications = async (
    cursor: string | null = null,
    emailParam: string | null = null,
  ) => {
    setLoading(true);
    let url = "/api/notification?pageSize=6";
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    if (emailParam) {
      url += `&email=${emailParam}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      setNotifications((prevNotifs) => [...prevNotifs, ...data.notifications]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchNotificationsCalled.current) {
      if (email) {
        fetchNotifications(null, email);
      } else {
        fetchNotifications();
      }
      fetchNotificationsCalled.current = true;
    }
  }, []);

  const formatDate = (dateString: string) => {
    return moment(dateString).fromNow();
  };

  const handleFigureClick = (image: string) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const handleOpenUser = (userEmail: string) => {
    window.location.href = `/admin/users?email=${userEmail}`;
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <div
          onMouseDown={openModal}
          className="text-sm cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-500"
        >
          Ajouter un pdf au cours
        </div>

        <div className="flex flex-wrap min-h-[200px] justify-center gap-4">
          {notifications.map((notification) => (
            <figure
              key={notification.id}
              className="relative max-w-sm h-[200px] transition-all duration-300 cursor-pointer filter grayscale hover:grayscale-0 flex-shrink-0"
              onClick={() => handleFigureClick(notification.image)}
            >
              <img
                className="rounded-lg w-full h-full object-cover"
                src={notification.image}
                alt="image description"
              />
              <figcaption className="absolute px-4 text-lg text-white bottom-6">
                <p>{notification.from_user_email}</p>
                <p>{formatDate(notification.date_created)}</p>
              </figcaption>
              <div className="absolute bottom-2 right-2">
                <svg
                  onMouseDown={() =>
                    handleOpenUser(notification.from_user_email)
                  }
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white hover:text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-2.667 0-8 1.333-8 4v3h16v-3c0-2.667-5.333-4-8-4z"
                  />
                </svg>
              </div>
            </figure>
          ))}
        </div>

        {nextCursor && (
          <div className="flex justify-center pt-4 items-center">
            <button
              onMouseDown={() => fetchNotifications(nextCursor)}
              disabled={loading}
              type="button"
              className="text-white bg-blue-700  hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Afficher plus
            </button>
          </div>
        )}

        {isModalOpen && (
          <CreateNotificationModal
            isOpen={isModalOpen}
            closeModal={closeModal}
          />
        )}

        {lightboxOpen && (
          <Lightbox
            open={lightboxOpen}
            slides={[{ src: lightboxImage }]}
            close={() => setLightboxOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsTable;

interface Notification {
  id: string;
  image: string;
  from_user_email: string;
  date_created: string; // Ensure this is a string
}
