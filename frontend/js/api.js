window.ApiClient = {
  baseUrl: "/api",
  getToken(role = "user") {
    return role === "admin"
      ? sessionStorage.getItem("sfds_admin_token") || ""
      : sessionStorage.getItem("sfds_user_token") || "";
  }
};

