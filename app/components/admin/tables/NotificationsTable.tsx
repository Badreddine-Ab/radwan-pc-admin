"use client";
import React, { useEffect, useRef, useState } from "react";
import CreateNotificationModal from "@/app/components/admin/createNotificationModal/createNotificationModal";
const NotificationsTable = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotificationsCalled = useRef(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (cursor: string | null = null) => {
    setLoading(true);
    let url = "/api/notification?pageSize=6";
    if (cursor) {
      url += `&cursor=${cursor}`;
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
      fetchNotifications();
      fetchNotificationsCalled.current = true;
    }
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <div
          onMouseDown={openModal}
          className="text-sm cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-500"
        >
          Ajouter un pdf au cours
        </div>

        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Image
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                From User Email
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <div className="flex-shrink-0">
                      <img
                        src={notification.image}
                        alt="Notification"
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    </div>
                  </div>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {notification.from_user_email}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </div>
    </div>
  );
};

export default NotificationsTable;
interface Notification {
  id: string;
  image: string;
  from_user_email: string;
  created_at: Date;
}
