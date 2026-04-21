import hotToast from 'react-hot-toast';

// Central handler for toast messages
// Ensures no duplicates by using the message itself as the toast id
const toast = {
  success: (message) => hotToast.success(message, { id: message }),
  error: (message) => hotToast.error(message, { id: message }),
  loading: (message) => hotToast.loading(message, { id: message }),
  dismiss: (id) => hotToast.dismiss(id),
};

export default toast;
