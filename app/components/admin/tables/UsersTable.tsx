"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Modal from "../modal/Modal";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";

const UsersTable = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const fetchCoursesCalled = useRef(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleOpenRevokeModal = (rowData: any) => {
    setSelectedUser(rowData);
    setIsRevokeModalOpen(true);
  };
  const handleCloseRevokeModal = () => setIsRevokeModalOpen(false);

  const handleOpenModal = (rowData: any) => {
    setSelectedUser(rowData);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const fetchUsers = async (
    cursor: string | null = null,
    emailParam: string | null = null,
    nameParam: string | null = null,
  ) => {
    setLoading(true);
    let url = "/api/users?pageSize=6";
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    if (emailParam) {
      url += `&email=${emailParam}`;
    }
    if (nameParam) {
      url += `&name=${nameParam}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      const filteredUsers = data.users.filter(
        (user: User) => user.role !== "ADMIN",
      );

      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!fetchCoursesCalled.current) {
      if (emailParam) {
        fetchUsers(null, emailParam); // Pass email as a parameter
      } else {
        fetchUsers();
      }
      fetchCoursesCalled.current = true;
    }
  }, []);
  const upgradeUser = async (userId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/users/upgrade`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      },
    );

    if (response.ok) {
      handleCloseModal();
      window.location.reload();
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  };
  const revokeSubscription = async (userId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/users/revoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      },
    );

    if (response.ok) {
      handleCloseRevokeModal();
      window.location.reload();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Resaayer plus tard!",
      });
    }
  };
  const handleSearch = () => {
    setUsers([]);
    fetchUsers(null, email, name);
  };
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <div className="mb-4 flex justify-between items-center space-x-4">
          <div className="flex-1">
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Filtrer par nom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="search"
                id="name-search"
                className="block w-full p-4 ps-10 rounded-lg border-[1.5px] border-stroke bg-transparent text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Filtrer par nom"
                required
              />
              <button
                onMouseDown={handleSearch}
                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Filtrer par Nom
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Filtrer par email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="search"
                id="email-search"
                className="block w-full p-4 ps-10 rounded-lg border-[1.5px] border-stroke bg-transparent text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Filtrer par email"
                required
              />
              <button
                onMouseDown={handleSearch}
                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Filtrer par email
              </button>
            </div>
          </div>
        </div>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Nom Complet
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Inscrit le
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Téléphone
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <div className="flex-shrink-0">
                      <Image
                        src={user.image}
                        alt="Brand"
                        width={48}
                        height={48}
                      />
                    </div>
                    <p className="hidden text-black dark:text-white sm:block">
                      {user.name}
                    </p>
                  </div>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(user.date_created).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                      user.premium_start === null && user.premium_end === null
                        ? "bg-danger text-danger"
                        : user.premium_start !== null &&
                            user.premium_end !== null &&
                            new Date() >= new Date(user.premium_start) &&
                            new Date() <= new Date(user.premium_end)
                          ? "bg-success text-success"
                          : "bg-warning text-warning"
                    }`}
                  >
                    {user.premium_start === null && user.premium_end === null
                      ? "Free tier"
                      : user.premium_start !== null &&
                          user.premium_end !== null &&
                          new Date() >= new Date(user.premium_start) &&
                          new Date() <= new Date(user.premium_end)
                        ? "Premium"
                        : "Premium expired"}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {user.phone
                      ? user.phone
                      : "Numéro de téléphone pas ajouter"}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button
                      onMouseDown={() => handleOpenRevokeModal(user)}
                      className="hover:text-primary"
                    >
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onMouseDown={() => handleOpenModal(user)}
                      className="hover:text-primary"
                    >
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.575 13.729C4.501 15.033 5.43 17 7.12 17h9.762c1.69 0 2.618-1.967 1.544-3.271l-4.881-5.927a2 2 0 0 0-3.088 0l-4.88 5.927Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <Modal
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                      title="Passer à la version premium"
                      footer={
                        <div className="flex justify-end">
                          <button
                            onMouseDown={handleCloseModal}
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                          >
                            Fermer
                          </button>
                          {selectedUser && (
                            <button
                              onMouseDown={() => upgradeUser(selectedUser.id)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              Confirmer
                            </button>
                          )}
                        </div>
                      }
                    >
                      <div className="p-4 md:p-5 text-center">
                        <svg
                          className="mx-auto mb- text-gray-400 w-12 h-12 dark:text-gray-200"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          êtes-vous sûr de vouloir mettre à jour le statut de{" "}
                          {selectedUser?.name} vers premium ?
                          {selectedUser && (
                            <>
                              <br />
                              le plan premium durera de{" "}
                              {new Date().toLocaleDateString()} au{" "}
                              {new Date(
                                new Date().setFullYear(
                                  new Date().getFullYear() + 1,
                                ),
                              ).toLocaleDateString()}
                              .
                            </>
                          )}
                        </h3>
                      </div>
                    </Modal>
                    <Modal
                      isOpen={isRevokeModalOpen}
                      onClose={handleCloseRevokeModal}
                      title="Revoke Subscription"
                      footer={
                        <div className="flex justify-end">
                          <button
                            onMouseDown={handleCloseRevokeModal}
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                          >
                            Fermer
                          </button>
                          {selectedUser && (
                            <button
                              onMouseDown={() =>
                                revokeSubscription(selectedUser.id)
                              }
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              Confirmer
                            </button>
                          )}
                        </div>
                      }
                    >
                      <div className="p-4 md:p-5 text-center">
                        <svg
                          className="mx-auto mb- text-gray-400 w-12 h-12 dark:text-gray-200"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          etes vous sûr de vouloir révoquer l'abonnement de{" "}
                          {selectedUser?.name} ?
                        </h3>
                      </div>
                    </Modal>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {nextCursor && (
          <div className="flex justify-center pt-4 items-center">
            <button
              onMouseDown={() => fetchUsers(nextCursor)}
              disabled={loading}
              type="button"
              className="text-white bg-blue-700  hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Afficher plus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;

type User = {
  id: string;
  email: string;
  name: string;
  image: string;
  role: string;
  date_created: Date;
  date_updated: Date;
  premium_start: Date | null;
  premium_end: Date | null;
  phone: string | null;
};
