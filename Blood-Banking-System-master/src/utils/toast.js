/**
 * Triggers a custom global toast notification
 * @param {string} message - Message to display
 * @param {'success' | 'error' | 'info'} type - Type of toast notification
 */
export const showToast = (message, type = "success") => {
  const event = new CustomEvent("show-toast", {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};
