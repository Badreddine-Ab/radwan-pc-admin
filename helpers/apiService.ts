export async function getActivePremiumUsersCount() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/users/premiumcount`,
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching active premium users count:", error);
    throw error;
  }
}

export async function getMonthlyPremiumSubscriptions() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/users/monthlysubs`,
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching monthly premium subscriptions:", error);
    throw error;
  }
}

export async function getWeeklyPremiumSubscriptions() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/users/dailysubs`,
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching weekly premium subscriptions:", error);
    throw error;
  }
}

export async function getCoursesCount() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/course/count`,
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching courses count:", error);
    throw error;
  }
}

export async function getUsersCount() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/users/count`,
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching users count:", error);
    throw error;
  }
}
