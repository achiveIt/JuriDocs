import { SERVER_URL } from '../constants';

export const deletePDFById = async (pdfId) => {
  try {
    const res = await fetch(`${SERVER_URL}/api/pdf/${pdfId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete PDF.');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return { success: false, message: error.message };
  }
};
