function getBaseUrl(): string {
  if (typeof window !== "undefined") return ""; // client: relative
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  );
}

export async function getActivePremiumUsersCount() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/users/premiumcount`);
    return response.json();
  } catch (error) {
    console.error("Error fetching active premium users count:", error);
    throw error;
  }
}

export async function getMonthlyPremiumSubscriptions() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/users/monthlysubs`);
    return response.json();
  } catch (error) {
    console.error("Error fetching monthly premium subscriptions:", error);
    throw error;
  }
}

export async function getWeeklyPremiumSubscriptions() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/users/dailysubs`);
    return response.json();
  } catch (error) {
    console.error("Error fetching weekly premium subscriptions:", error);
    throw error;
  }
}

export async function getCoursesCount() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/course/count`);
    return response.json();
  } catch (error) {
    console.error("Error fetching courses count:", error);
    throw error;
  }
}

export async function getUsersCount() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/users/count`);
    return response.json();
  } catch (error) {
    console.error("Error fetching users count:", error);
    throw error;
  }
}
