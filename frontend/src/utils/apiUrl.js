// Get API base URL based on current hostname
export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
};

export default getApiBaseUrl;
