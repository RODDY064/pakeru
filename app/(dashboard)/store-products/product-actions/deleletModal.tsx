import React, { useState } from 'react';
import { ProductAPIService } from './helpers'; 

interface DeleteModalProps {
  productID: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  productID,
  productName,
  isOpen,
  onClose,
  onDeleteSuccess
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isConfirmationValid = confirmationText.trim() === productName.trim();

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setDeleteError('Product name does not match');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await ProductAPIService.deleteProduct(productID);
      
      // Call success callback if provided
      onDeleteSuccess?.();
      
      // Close modal and reset state
      onClose();
      setConfirmationText('');
      
      // You might want to show a success toast here
      console.log('Product deleted successfully');
      
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError(
        error instanceof Error 
          ? 'Failed to delete product. Please try again.'
          : 'Failed to delete product. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while deleting
    
    onClose();
    setConfirmationText('');
    setDeleteError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value);
    if (deleteError) setDeleteError(null); // Clear error when user starts typing
  };

  if (!isOpen) return null;

  return (
    <div className="w-full fixed top-0 left-0 h-full bg-black/90 flex items-center flex-col justify-center z-50">
      <div className="lg:w-[55%] xl:w-[40%] w-[90%] min-h-[450px] bg-white rounded-[26px] p-6 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-avenir text-md font-[500] uppercase text-red-500">
            Delete Product
          </p>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex gap-1 items-center cursor-pointer hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
              <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
            </div>
            <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
          </button>
        </div>

        {/* Warning Message */}
        <p className="font-avenir mt-6 text-lg lg:text-xl">
          Are you sure you want to{" "}
          <span className="text-red-500 font-semibold">delete</span>{" "}
          product <span className="font-semibold">"{productName}"</span>? This
          action cannot be undone, and once deleted, the product will be
          permanently removed from your product list.
        </p>

        {/* Confirmation Input */}
        <div className="mt-8">
          <p className="font-avenir text-lg lg:text-xl font-[500]">
            Enter the product name{" "}
            <span className="font-semibold">"{productName}"</span> to confirm
            delete.
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={handleInputChange}
            disabled={isDeleting}
            placeholder={`Type "${productName}" here`}
            className="w-full h-12 font-avenir text-md border border-black/20 bg-black/5 mt-3 px-3 rounded-[10px] focus:outline-none focus:border-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Error Message */}
          {deleteError && (
            <p className="text-red-500 text-sm mt-2 font-avenir">
              {deleteError}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 lg:mt-10 flex items-center gap-4">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full h-12 cursor-pointer p-2 bg-black/10 flex items-center justify-center hover:bg-black/5 border border-black/20 rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="font-avenir text-lg lg:text-xl">Cancel</p>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="w-full h-12 cursor-pointer p-2 bg-red-200 flex items-center justify-center hover:bg-red-100 border border-red-500 rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-red-100"
          >
            <p className="font-avenir text-lg lg:text-xl text-red-500">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;